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
  console.log(`🚀 Legacy Thumbnails Reprocessor Script`);
  console.log(`Mode: ${WRITE_MODE ? '✏️  WRITE (บันทึกข้อมูลจริง)' : '🔍 DRY RUN (จำลองการทำงาน)'}`);
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

  console.log(`พบรายการที่ต้องจัดการทั้งหมด: ${records.length} รายการ\n`);

  let ok = 0;
  let skipped = 0;
  let errored = 0;

  for (const row of records) {
    console.log(`------------------------------------------------------------------------`);
    console.log(`[Media ID: ${row.id}] โพสต์ที่เกี่ยวข้อง: "${row.title ?? '(ไม่มีโพสต์เชื่อมโยง)'}" (Post ID: ${row.post_id ?? 'N/A'})`);
    console.log(`  - รูปแบบปัจจุบันใน DB:`);
    console.log(`    filename: "${row.filename}"`);
    console.log(`    urlFull:  "${row.url_full}"`);
    console.log(`    urlThumb: "${row.url_thumb}"`);
    console.log(`    urlMini:  "${row.url_mini}"`);
    console.log(`    blurHash: ${row.blur_hash ? 'มีแล้ว (ยาว ' + row.blur_hash.length + ')' : 'ไม่มี'}`);

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
      console.log(`  📂 ค้นพบไฟล์ต้นฉบับบนดิสก์: "${sourcePath}"`);
    } else {
      console.log(`  ⚠️  ไม่พบไฟล์ต้นฉบับบนดิสก์! จะสร้างรูปภาพ Placeholder สีเทาแทน`);
    }

    if (!WRITE_MODE) {
      console.log(`  [DRY RUN] จำลองการทำงานสำเร็จ (จะแปลงไฟล์และอัปเดต DB)`);
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

      console.log(`  ✅ สำเร็จ! อัปเดต DB และบันทึกไฟล์: "${newFilename}"`);
      ok++;
    } catch (err: any) {
      console.error(`  ❌ ข้อผิดพลาดในการประมวลผล: ${err.message}`);
      errored++;
    }
  }

  console.log('\n========================================================================');
  console.log('สรุปผลการทำงาน (Summary):');
  console.log(`  ✅ จัดการสำเร็จ (Processed) : ${ok}`);
  console.log(`  ⚠️  ข้ามรายการ (Skipped)   : ${skipped}`);
  console.log(`  ❌ ข้อผิดพลาด (Errors)    : ${errored}`);
  console.log(`  รวมทั้งหมด (Total)       : ${records.length}`);
  console.log('========================================================================');

  if (!WRITE_MODE && records.length > 0) {
    console.log('\n[DRY RUN ONLY] หากต้องการบันทึกข้อมูลจริง กรุณารันด้วยคำสั่งนี้:');
    console.log('powershell -ExecutionPolicy Bypass -Command "npx ts-node src/infrastructure/db/reprocess_legacy_thumbnails.ts --write"');
  }

  process.exit(0);
}

main().catch(err => {
  console.error("Fatal Error:", err);
  process.exit(1);
});
