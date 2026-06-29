/**
 * reprocess_legacy_thumbnails.ts
 *
 * This script finds and converts all legacy media records in PostgreSQL
 * that contain 'uploads/thumbnails/' or 'thumbnails/' paths, or have missing/invalid
 * blur hashes. It processes them into standard bare-filename WebP variants with blur hashes.
 *
 * Usage:
 *   Dry run : powershell -ExecutionPolicy Bypass -Command "npx ts-node src/infrastructure/db/reprocess_legacy_thumbnails.ts"
 *   Write   : powershell -ExecutionPolicy Bypass -Command "npx ts-node src/infrastructure/db/reprocess_legacy_thumbnails.ts --write"
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
  'C:\\DEV\\u44tech.com\\u44tech.com\\u44tech-v2\\backend\\uploads'
];

const pool = new Pool({ connectionString: DB_CONN });

// Helper to find a file on disk regardless of case
async function findFileOnDisk(filename: string): Promise<string | null> {
  const cleanName = filename.replace(/^\/+/, '').replace(/^uploads\/(?:thumbnails\/)?/, '').replace(/^images\/(?:uploads\/)?(?:thumbnails\/)?/, '');
  
  for (const dir of LEGACY_DIRS) {
    try {
      const fullPath = path.join(dir, cleanName);
      await fs.access(fullPath);
      return fullPath;
    } catch {}

    // Check case insensitively
    try {
      const files = await fs.readdir(dir);
      const matched = files.find(f => f.toLowerCase() === cleanName.toLowerCase());
      if (matched) {
        return path.join(dir, matched);
      }
    } catch {}
  }
  return null;
}

async function generatePlaceholder(postId: number | null): Promise<Buffer> {
  // Generate a premium grey-ish placeholder image with a modern background
  return sharp({
    create: {
      width: 800,
      height: 450,
      channels: 3,
      background: { r: 190, g: 195, b: 200 }
    }
  })
  .webp({ quality: 70 })
  .toBuffer();
}

async function main() {
  console.log('========================================================================');
  console.log(`ðŸš€ Legacy Thumbnails Reprocessor Script`);
  console.log(`Mode: ${WRITE_MODE ? 'âœï¸  WRITE (à¸šà¸±à¸™à¸—à¸¶à¸à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸ˆà¸£à¸´à¸‡)' : 'ðŸ” DRY RUN (à¸ˆà¸³à¸¥à¸­à¸‡à¸à¸²à¸£à¸—à¸³à¸‡à¸²à¸™)'}`);
  console.log('========================================================================\n');

  // Query legacy or incomplete media records
  const { rows: records } = await pool.query<{
    id: number;
    filename: string;
    url_full: string;
    url_thumb: string;
    url_mini: string;
    blur_hash: string | null;
    post_id: number | null;
    title: string | null;
  }>(`
    SELECT m.id, m.filename, m.url_full, m.url_thumb, m.url_mini, m.blur_hash, p.post_id, p.title
    FROM media m
    LEFT JOIN posts p ON p.thumbnail_media_id = m.id
    WHERE m.filename LIKE '%thumbnails%'
       OR m.url_full LIKE '%thumbnails%'
       OR m.url_thumb LIKE '%thumbnails%'
       OR m.url_mini LIKE '%thumbnails%'
       OR m.filename LIKE '%uploads%'
       OR m.url_full LIKE '%uploads%'
       OR m.url_thumb LIKE '%uploads%'
       OR m.url_mini LIKE '%uploads%'
       OR m.blur_hash IS NULL
       OR m.blur_hash = ''
       OR length(m.blur_hash) < 20
    ORDER BY m.id
  `);

  console.log(`à¸žà¸šà¸£à¸²à¸¢à¸à¸²à¸£à¸—à¸µà¹ˆà¸•à¹‰à¸­à¸‡à¸ˆà¸±à¸”à¸à¸²à¸£à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”: ${records.length} à¸£à¸²à¸¢à¸à¸²à¸£\n`);

  let ok = 0;
  let skipped = 0;
  let errored = 0;

  for (const row of records) {
    console.log(`------------------------------------------------------------------------`);
    console.log(`[Media ID: ${row.id}] à¹‚à¸žà¸ªà¸•à¹Œà¸—à¸µà¹ˆà¹€à¸à¸µà¹ˆà¸¢à¸§à¸‚à¹‰à¸­à¸‡: "${row.title ?? '(à¹„à¸¡à¹ˆà¸¡à¸µà¹‚à¸žà¸ªà¸•à¹Œà¹€à¸Šà¸·à¹ˆà¸­à¸¡à¹‚à¸¢à¸‡)'}" (Post ID: ${row.post_id ?? 'N/A'})`);
    console.log(`  - à¸£à¸¹à¸›à¹à¸šà¸šà¸›à¸±à¸ˆà¸ˆà¸¸à¸šà¸±à¸™à¹ƒà¸™ DB:`);
    console.log(`    filename: "${row.filename}"`);
    console.log(`    urlFull:  "${row.url_full}"`);
    console.log(`    urlThumb: "${row.url_thumb}"`);
    console.log(`    urlMini:  "${row.url_mini}"`);
    console.log(`    blurHash: ${row.blur_hash ? 'à¸¡à¸µà¹à¸¥à¹‰à¸§ (à¸¢à¸²à¸§ ' + row.blur_hash.length + ')' : 'à¹„à¸¡à¹ˆà¸¡à¸µ'}`);

    // Try to find the source file
    let sourcePath: string | null = null;
    
    // Check filename column
    if (row.filename) {
      sourcePath = await findFileOnDisk(row.filename);
    }
    
    // Check url_full column
    if (!sourcePath && row.url_full) {
      sourcePath = await findFileOnDisk(row.url_full);
    }

    // Check post_id prefix if possible (e.g. 100_*)
    if (!sourcePath && row.post_id) {
      const prefix = `${row.post_id}_`;
      for (const dir of LEGACY_DIRS) {
        try {
          const files = await fs.readdir(dir);
          const matched = files.find(f => f.startsWith(prefix));
          if (matched) {
            sourcePath = path.join(dir, matched);
            break;
          }
        } catch {}
      }
    }

    if (sourcePath) {
      console.log(`  ðŸ“‚ à¸„à¹‰à¸™à¸žà¸šà¹„à¸Ÿà¸¥à¹Œà¸•à¹‰à¸™à¸‰à¸šà¸±à¸šà¸šà¸™à¸”à¸´à¸ªà¸à¹Œ: "${sourcePath}"`);
    } else {
      console.log(`  âš ï¸  à¹„à¸¡à¹ˆà¸žà¸šà¹„à¸Ÿà¸¥à¹Œà¸•à¹‰à¸™à¸‰à¸šà¸±à¸šà¸šà¸™à¸”à¸´à¸ªà¸à¹Œ! à¸ˆà¸°à¸ªà¸£à¹‰à¸²à¸‡à¸£à¸¹à¸›à¸ à¸²à¸ž Placeholder à¸ªà¸µà¹€à¸—à¸²à¹à¸—à¸™`);
    }

    if (!WRITE_MODE) {
      console.log(`  [DRY RUN] à¸ˆà¸³à¸¥à¸­à¸‡à¸à¸²à¸£à¸—à¸³à¸‡à¸²à¸™à¸ªà¸³à¹€à¸£à¹‡à¸ˆ (à¸ˆà¸°à¹à¸›à¸¥à¸‡à¹„à¸Ÿà¸¥à¹Œà¹à¸¥à¸°à¸­à¸±à¸›à¹€à¸”à¸• DB)`);
      ok++;
      continue;
    }

    try {
      let buffer: Buffer;
      let width = 800;
      let height = 450;
      let originalExt = '.jpg';

      if (sourcePath) {
        buffer = await fs.readFile(sourcePath);
        originalExt = path.extname(sourcePath);
        const meta = await sharp(buffer).metadata();
        width = meta.width ?? 800;
        height = meta.height ?? 450;
      } else {
        buffer = await generatePlaceholder(row.post_id);
      }

      // Generate a new clean unique filename
      const fileId = crypto.randomUUID();
      const basePart = sourcePath
        ? path.basename(sourcePath, originalExt).replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 50)
        : `placeholder-post-${row.post_id ?? row.id}`;
      const newFilename = `${basePart}-${fileId}`;

      const fullPath  = path.join(UPLOAD_DIR, `${newFilename}-full.webp`);
      const thumbPath = path.join(UPLOAD_DIR, `${newFilename}-thumb.webp`);
      const miniPath  = path.join(UPLOAD_DIR, `${newFilename}-mini.webp`);
      const origPath  = path.join(UPLOAD_DIR, `${newFilename}-original${originalExt}`);

      // Ensure upload directory exists
      await fs.mkdir(UPLOAD_DIR, { recursive: true });

      // Save original file on disk
      if (sourcePath) {
        await fs.writeFile(origPath, buffer);
      }

      // Use sharp to create WebP formats
      const img = sharp(buffer);
      await img.resize(1920, null, { withoutEnlargement: true }).webp({ quality: 85 }).toFile(fullPath);
      await img.resize(400,  null, { withoutEnlargement: true }).webp({ quality: 80 }).toFile(thumbPath);
      await img.resize(150,  null, { withoutEnlargement: true }).webp({ quality: 75 }).toFile(miniPath);

      // Generate blur hash
      const blurBuf = await img.resize(10, 10, { fit: 'inside' }).blur(5).toBuffer();
      const newBlurHash = `data:image/png;base64,${blurBuf.toString('base64')}`;

      // Update Postgres database
      await pool.query(`
        UPDATE media SET
          filename = $1,
          url_full = $2,
          url_thumb = $3,
          url_mini = $4,
          blur_hash = $5,
          width = $6,
          height = $7
        WHERE id = $8
      `, [
        newFilename,
        `${newFilename}-full.webp`,
        `${newFilename}-thumb.webp`,
        `${newFilename}-mini.webp`,
        newBlurHash,
        width,
        height,
        row.id
      ]);

      console.log(`  âœ… à¸ªà¸³à¹€à¸£à¹‡à¸ˆ! à¸­à¸±à¸›à¹€à¸”à¸• DB à¹à¸¥à¸°à¸šà¸±à¸™à¸—à¸¶à¸à¹„à¸Ÿà¸¥à¹Œ: "${newFilename}"`);
      ok++;
    } catch (err: any) {
      console.error(`  âŒ à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”à¹ƒà¸™à¸à¸²à¸£à¸›à¸£à¸°à¸¡à¸§à¸¥à¸œà¸¥: ${err.message}`);
      errored++;
    }
  }

  console.log('\n========================================================================');
  console.log('à¸ªà¸£à¸¸à¸›à¸œà¸¥à¸à¸²à¸£à¸—à¸³à¸‡à¸²à¸™ (Summary):');
  console.log(`  âœ… à¸ˆà¸±à¸”à¸à¸²à¸£à¸ªà¸³à¹€à¸£à¹‡à¸ˆ (Processed) : ${ok}`);
  console.log(`  âš ï¸  à¸‚à¹‰à¸²à¸¡à¸£à¸²à¸¢à¸à¸²à¸£ (Skipped)   : ${skipped}`);
  console.log(`  âŒ à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸” (Errors)    : ${errored}`);
  console.log(`  à¸£à¸§à¸¡à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” (Total)       : ${records.length}`);
  console.log('========================================================================');

  if (!WRITE_MODE && records.length > 0) {
    console.log('\n[DRY RUN ONLY] à¸«à¸²à¸à¸•à¹‰à¸­à¸‡à¸à¸²à¸£à¸šà¸±à¸™à¸—à¸¶à¸à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸ˆà¸£à¸´à¸‡ à¸à¸£à¸¸à¸“à¸²à¸£à¸±à¸™à¸”à¹‰à¸§à¸¢à¸„à¸³à¸ªà¸±à¹ˆà¸‡à¸™à¸µà¹‰:');
    console.log('powershell -ExecutionPolicy Bypass -Command "npx ts-node src/infrastructure/db/reprocess_legacy_thumbnails.ts --write"');
  }

  process.exit(0);
}

main().catch(err => {
  console.error("Fatal Error:", err);
  process.exit(1);
});
