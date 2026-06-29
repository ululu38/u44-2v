/**
 * reprocess_orphan_media.ts
 *
 * For media records that have no blur_hash (unprocessed legacy thumbnails
 * whose source files no longer exist), this script:
 *   1. Finds the associated post
 *   2. Tries to find the image on disk via:
 *      a) /uploads/ images referenced in post content HTML
 *      b) src/images/uploads/thumbnails/<post_id>_* (legacy thumbnails)
 *      c) src/images/uploads/<post_id>_*
 *   3. Falls back to a grey placeholder image if nothing is found
 *   4. Generates full / thumb / mini WebP + blur hash via Sharp
 *   5. Updates the media row in Postgres
 *
 * Usage:
 *   dry run : npx ts-node src/infrastructure/db/reprocess_orphan_media.ts
 *   apply   : npx ts-node src/infrastructure/db/reprocess_orphan_media.ts --write
 */

import { Pool } from 'pg';
import * as path from 'path';
import * as fs from 'fs/promises';
import sharp from 'sharp';
import crypto from 'crypto';

const WRITE_MODE = process.argv.includes('--write');
const UPLOAD_DIR = 'C:\\DEV\\u44tech.com\\u44tech.com\\u44tech-v2\\backend\\uploads';
const DB_CONN    = 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2';

const LEGACY_DIRS = [
  'C:\\DEV\\u44tech.com\\u44tech.com\\src\\images\\uploads\\thumbnails',
  'C:\\DEV\\u44tech.com\\u44tech.com\\src\\images\\uploads',
  'C:\\DEV\\u44tech.com\\u44tech.com\\src\\images',
];
const IMG_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

const pool = new Pool({ connectionString: DB_CONN });

// â”€â”€ helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function findByPostIdPrefix(postId: number): Promise<string | null> {
  const prefix = `${postId}_`;
  for (const dir of LEGACY_DIRS) {
    try {
      const files = await fs.readdir(dir);
      const match = files.find(f => f.startsWith(prefix) && IMG_EXTS.some(e => f.toLowerCase().endsWith(e)));
      if (match) return path.join(dir, match);
    } catch {}
  }
  return null;
}

function extractUploadSrcs(html: string): string[] {
  const results: string[] = [];
  const re = /<img[^>]+src="(\/uploads\/[^"]+)"/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) results.push(m[1]);
  return results;
}

async function resolveUploadPath(urlPath: string): Promise<string | null> {
  const bare = urlPath.replace(/^\/uploads\//, '');
  const full = path.join(UPLOAD_DIR, bare);
  try { await fs.access(full); return full; } catch { return null; }
}

async function generatePlaceholder(): Promise<Buffer> {
  return sharp({
    create: { width: 800, height: 450, channels: 3, background: { r: 180, g: 185, b: 190 } }
  }).webp({ quality: 70 }).toBuffer();
}

// â”€â”€ main â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function main() {
  console.log(`Mode: ${WRITE_MODE ? 'âœï¸  WRITE' : 'ðŸ” DRY RUN'}`);
  console.log('â”€'.repeat(70));

  const { rows: orphans } = await pool.query<{
    media_id: number;
    filename: string;
    post_id:  number | null;
    title:    string | null;
    content_html:  string | null;
  }>(`
    SELECT m.id AS media_id, m.filename, p.post_id, p.title, p.content_html AS content_html
    FROM media m
    LEFT JOIN posts p ON p.thumbnail_media_id = m.id
    WHERE m.blur_hash = '' OR m.blur_hash IS NULL OR length(m.blur_hash) < 20
    ORDER BY m.id
  `);

  console.log(`Found ${orphans.length} unprocessed media records\n`);

  let ok = 0, skipped = 0, errored = 0;

  for (const row of orphans) {
    console.log(`\n[media_id=${row.media_id}] "${row.title ?? '(no linked post)'}"`);

    let sourcePath: string | null = null;
    let sourceDesc = '';

    // Strategy 1: first existing image from post content HTML
    if (row.content_html) {
      const srcs = extractUploadSrcs(row.content_html);
      for (const src of srcs) {
        const p = await resolveUploadPath(src);
        if (p) { sourcePath = p; sourceDesc = `content img ${src}`; break; }
      }
    }

    // Strategy 2: legacy thumbnails folder, match by post_id prefix
    if (!sourcePath && row.post_id) {
      const p = await findByPostIdPrefix(row.post_id);
      if (p) { sourcePath = p; sourceDesc = `legacy thumbnail: ${path.basename(p)}`; }
    }

    // Strategy 3: grey placeholder
    if (!sourcePath) {
      sourceDesc = 'PLACEHOLDER (grey 800Ã—450)';
    }

    console.log(`  ðŸ“ Source: ${sourceDesc}`);

    if (!WRITE_MODE) {
      console.log(`  âœ… [DRY RUN] Would process`);
      ok++;
      continue;
    }

    try {
      let buffer: Buffer;
      let width: number, height: number;

      if (sourcePath) {
        buffer = await fs.readFile(sourcePath);
        const meta = await sharp(buffer).metadata();
        width  = meta.width  ?? 800;
        height = meta.height ?? 450;
      } else {
        buffer = await generatePlaceholder();
        width  = 800;
        height = 450;
      }

      const fileId   = crypto.randomUUID();
      const basePart = sourcePath
        ? path.basename(sourcePath, path.extname(sourcePath)).replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 50)
        : `placeholder-post-${row.post_id ?? row.media_id}`;
      const fileName = `${basePart}-${fileId}`;

      const fullPath  = path.join(UPLOAD_DIR, `${fileName}-full.webp`);
      const thumbPath = path.join(UPLOAD_DIR, `${fileName}-thumb.webp`);
      const miniPath  = path.join(UPLOAD_DIR, `${fileName}-mini.webp`);

      const img = sharp(buffer);
      await img.resize(1920, null, { withoutEnlargement: true }).webp({ quality: 85 }).toFile(fullPath);
      await img.resize(400,  null, { withoutEnlargement: true }).webp({ quality: 80 }).toFile(thumbPath);
      await img.resize(150,  null, { withoutEnlargement: true }).webp({ quality: 75 }).toFile(miniPath);

      const blurBuf  = await img.resize(10, 10, { fit: 'inside' }).blur(5).toBuffer();
      const blurHash = `data:image/png;base64,${blurBuf.toString('base64')}`;

      await pool.query(`
        UPDATE media SET
          filename  = $1,
          url_full  = $2,
          url_thumb = $3,
          url_mini  = $4,
          blur_hash = $5,
          width     = $6,
          height    = $7
        WHERE id = $8
      `, [
        fileName,
        `${fileName}-full.webp`,
        `${fileName}-thumb.webp`,
        `${fileName}-mini.webp`,
        blurHash,
        width,
        height,
        row.media_id,
      ]);

      console.log(`  âœ… Done â†’ ${fileName}-full.webp`);
      ok++;
    } catch (err: any) {
      console.error(`  âŒ Error: ${err.message}`);
      errored++;
    }
  }

  console.log('\n' + 'â•'.repeat(70));
  console.log('Summary:');
  console.log(`  âœ… Processed : ${ok}`);
  console.log(`  âš ï¸  Skipped   : ${skipped}`);
  console.log(`  âŒ Errors    : ${errored}`);
  console.log(`  Total       : ${orphans.length}`);

  if (!WRITE_MODE && orphans.length > 0) {
    console.log('\n[DRY RUN] To apply:');
    console.log('  powershell -ExecutionPolicy Bypass -Command "npx ts-node src/infrastructure/db/reprocess_orphan_media.ts --write"');
  }

  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
