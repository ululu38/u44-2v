import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';
import { DrizzleService } from '../db/drizzle.service.js';
import { media } from '../../domain/entities/schema.js';
import { eq, desc, count } from 'drizzle-orm';

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

    // Paths
    const originalPath = path.join(this.uploadPath, `${fileName}-original${originalExtension}`);
    const fullPath = path.join(this.uploadPath, `${fileName}-full.webp`);
    const thumbPath = path.join(this.uploadPath, `${fileName}-thumb.webp`);

    const image = sharp(file.buffer);
    const metadata = await image.metadata();

    // 1. Save Original
    await fs.writeFile(originalPath, file.buffer);

    // 2. Save Full WebP (max 1920w)
    await image
      .resize(1920, null, { withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(fullPath);

    // 3. Save Thumb WebP (max 400w)
    await image
      .resize(400, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(thumbPath);

    // 4. Generate Blur Placeholder (10x10)
    const placeholderBuffer = await image
      .resize(10, 10, { fit: 'inside' })
      .blur(5)
      .toBuffer();
    const placeholderBase64 = `data:image/png;base64,${placeholderBuffer.toString('base64')}`;

    // URLs
    const urlFull = `/uploads/${fileName}-full.webp`;
    const urlThumb = `/uploads/${fileName}-thumb.webp`;

    // Save to DB
    const [inserted] = await this.drizzle.db.insert(media).values({
      urlFull,
      urlThumb,
      blurHash: placeholderBase64,
      width: metadata.width || 0,
      height: metadata.height || 0,
      fileSize: file.size,
      filename: fileName,
    }).returning();

    return inserted;
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
      data,
      meta: {
        total: totalCount[0].value,
        page,
        limit,
        totalPages: Math.ceil(totalCount[0].value / limit),
      }
    };
  }

  async findOne(id: number) {
    return this.drizzle.db.query.media.findFirst({
      where: eq(media.id, id),
    });
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    if (!item) return null;

    // Delete files (simplified, assuming we can derive paths from URLs)
    const base = path.join(process.cwd());
    const filesToDelete = [
      path.join(base, item.urlFull),
      path.join(base, item.urlThumb),
      // Original might be trickier without storing extension, 
      // but for this MVP we'll focus on the served versions.
    ];

    for (const f of filesToDelete) {
      try { await fs.unlink(f); } catch (e) {}
    }

    await this.drizzle.db.delete(media).where(eq(media.id, id));
    return item;
  }
}
