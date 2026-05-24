import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';
import { DrizzleService } from '../db/drizzle.service.js';
import { media } from '../../domain/entities/schema.js';
import { eq, desc, count } from 'drizzle-orm';

// Base path prefix for serving uploads.
// Stored in DB as bare filename (e.g. "photo-uuid-full.webp").
// Prepended here so callers always get a usable URL.
const UPLOAD_PREFIX = '/uploads/';

/** Convert a stored bare filename to a full relative URL */
export function toUrl(filename: string): string {
  if (!filename) return '';
  // Already a full URL (e.g. http://...) — leave as-is
  if (filename.startsWith('http://') || filename.startsWith('https://')) return filename;
  // Already has leading slash (legacy data still being cleaned) — strip and re-prefix
  const bare = filename.replace(/^\/+/, '').replace(/^uploads\/(?:thumbnails\/)?/, '');
  return `${UPLOAD_PREFIX}${bare}`;
}

/** Transform a raw media DB row so all URL fields are full relative URLs */
export function transformMedia(row: any) {
  if (!row) return row;
  return {
    ...row,
    urlFull:  toUrl(row.urlFull),
    urlThumb: toUrl(row.urlThumb),
    urlMini:  toUrl(row.urlMini),
  };
}

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly uploadPath = path.join(process.cwd(), 'uploads');

  constructor(private readonly drizzle: DrizzleService) {
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.access(this.uploadPath);
    } catch {
      await fs.mkdir(this.uploadPath, { recursive: true });
    }
  }

  async processAndUpload(file: any) {
    const fileId = crypto.randomUUID();
    const originalExtension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, originalExtension).replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const fileName = `${baseName}-${fileId}`;

    // Physical file paths on disk (always in uploads/)
    const originalPath = path.join(this.uploadPath, `${fileName}-original${originalExtension}`);
    const fullPath     = path.join(this.uploadPath, `${fileName}-full.webp`);
    const thumbPath    = path.join(this.uploadPath, `${fileName}-thumb.webp`);
    const miniPath     = path.join(this.uploadPath, `${fileName}-mini.webp`);

    const image = sharp(file.buffer);
    const metadata = await image.metadata();

    // 1. Save Original
    await fs.writeFile(originalPath, file.buffer);

    // 2. Save Full WebP (max 1920w)
    await image.resize(1920, null, { withoutEnlargement: true }).webp({ quality: 85 }).toFile(fullPath);

    // 3. Save Thumb WebP (max 400w)
    await image.resize(400, null, { withoutEnlargement: true }).webp({ quality: 80 }).toFile(thumbPath);

    // 4. Save Mini WebP (max 150w)
    await image.resize(150, null, { withoutEnlargement: true }).webp({ quality: 75 }).toFile(miniPath);

    // 5. Generate Blur Placeholder (10x10)
    const placeholderBuffer = await image.resize(10, 10, { fit: 'inside' }).blur(5).toBuffer();
    const placeholderBase64 = `data:image/png;base64,${placeholderBuffer.toString('base64')}`;

    // Store ONLY the bare filename — no path prefix
    const [inserted] = await this.drizzle.db.insert(media).values({
      filename: fileName,
      urlFull:  `${fileName}-full.webp`,
      urlThumb: `${fileName}-thumb.webp`,
      urlMini:  `${fileName}-mini.webp`,
      blurHash:  placeholderBase64,
      width:     metadata.width  || 0,
      height:    metadata.height || 0,
      fileSize:  file.size,
    }).returning();

    // Return the transformed row so callers get usable URLs
    return transformMedia(inserted);
  }

  async findAll(page: number, limit: number) {
    const offset = (page - 1) * limit;
    const data = await this.drizzle.db.query.media.findMany({
      limit,
      offset,
      orderBy: [desc(media.createdAt)],
    });

    const totalCount = await this.drizzle.db.select({ value: count() }).from(media);

    return {
      data: data.map(transformMedia),
      meta: {
        total:      totalCount[0].value,
        page,
        limit,
        totalPages: Math.ceil(totalCount[0].value / limit),
      },
    };
  }

  async findOne(id: number) {
    const row = await this.drizzle.db.query.media.findFirst({
      where: eq(media.id, id),
    });
    return transformMedia(row);
  }

  async remove(id: number) {
    const item = await this.drizzle.db.query.media.findFirst({
      where: eq(media.id, id),
    });
    if (!item) return null;

    // Delete physical files using the bare filename (no DB path prefix needed)
    const bare = item.urlFull.replace(/^\/+/, '').replace(/^uploads\/(?:thumbnails\/)?/, '');
    const baseName = bare.replace(/-full\.webp$/, '');
    const ext = path.extname(item.filename || '');

    const filesToDelete = [
      path.join(this.uploadPath, `${baseName}-full.webp`),
      path.join(this.uploadPath, `${baseName}-thumb.webp`),
      path.join(this.uploadPath, `${baseName}-mini.webp`),
      path.join(this.uploadPath, `${baseName}-original${ext}`),
    ];

    for (const f of filesToDelete) {
      try { await fs.unlink(f); } catch { /* file may not exist, ignore */ }
    }

    await this.drizzle.db.delete(media).where(eq(media.id, id));
    return transformMedia(item);
  }
}
