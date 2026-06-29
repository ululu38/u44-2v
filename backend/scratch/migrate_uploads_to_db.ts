import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../src/infrastructure/db/schema.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { eq } from 'drizzle-orm';

async function migrate() {
  const pool = new Pool({
    connectionString: 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2',
  });
  const db = drizzle(pool, { schema });

  const uploadDir = path.join(process.cwd(), 'uploads');

  try {
    await fs.access(uploadDir);
  } catch {
    console.log(`âŒ Uploads directory not found at ${uploadDir}. Nothing to migrate.`);
    await pool.end();
    return;
  }

  console.log(`ðŸ“‚ Scanning uploads directory: ${uploadDir}`);
  const allFiles = await fs.readdir(uploadDir);
  console.log(`ðŸ” Found ${allFiles.length} files in uploads.`);

  // Group files by base name (e.g. filename without suffix/extension)
  // Example files:
  // - sample-image-uuid-full.webp
  // - sample-image-uuid-thumb.webp
  // - sample-image-uuid-mini.webp
  // - sample-image-uuid-original.png
  const groups: Record<string, { full?: string; thumb?: string; mini?: string; original?: string }> = {};

  for (const file of allFiles) {
    // Check full
    if (file.endsWith('-full.webp')) {
      const base = file.replace(/-full\.webp$/, '');
      if (!groups[base]) groups[base] = {};
      groups[base].full = file;
    }
    // Check thumb
    else if (file.endsWith('-thumb.webp')) {
      const base = file.replace(/-thumb\.webp$/, '');
      if (!groups[base]) groups[base] = {};
      groups[base].thumb = file;
    }
    // Check mini
    else if (file.endsWith('-mini.webp')) {
      const base = file.replace(/-mini\.webp$/, '');
      if (!groups[base]) groups[base] = {};
      groups[base].mini = file;
    }
    // Check original
    else if (file.includes('-original.')) {
      const originalMatch = file.match(/^(.+)-original\.[a-zA-Z0-9]+$/);
      if (originalMatch) {
        const base = originalMatch[1];
        if (!groups[base]) groups[base] = {};
        groups[base].original = file;
      }
    }
  }

  const bases = Object.keys(groups);
  console.log(`ðŸ“¦ Found ${bases.length} media groups to migrate.`);

  let successCount = 0;
  let skippedCount = 0;

  for (const base of bases) {
    try {
      // Find matching media record in database
      const mediaRec = await db.query.media.findFirst({
        where: eq(schema.media.filename, base),
      });

      if (!mediaRec) {
        console.warn(`âš ï¸ Warning: No media record in DB for base name: "${base}". Skipping.`);
        skippedCount++;
        continue;
      }

      // Check if it already exists in media_blobs
      const existingBlob = await db.query.mediaBlobs.findFirst({
        where: eq(schema.mediaBlobs.id, mediaRec.id),
      });

      if (existingBlob) {
        console.log(`â„¹ï¸ Media ID ${mediaRec.id} (${base}) already has blob data. Skipping.`);
        skippedCount++;
        continue;
      }

      const files = groups[base];
      const dataFull = files.full ? await fs.readFile(path.join(uploadDir, files.full)) : null;
      const dataThumb = files.thumb ? await fs.readFile(path.join(uploadDir, files.thumb)) : null;
      const dataMini = files.mini ? await fs.readFile(path.join(uploadDir, files.mini)) : null;
      const dataOriginal = files.original ? await fs.readFile(path.join(uploadDir, files.original)) : null;

      // Insert binary data
      await db.insert(schema.mediaBlobs).values({
        id: mediaRec.id,
        dataFull,
        dataThumb,
        dataMini,
        dataOriginal,
      });

      console.log(`âœ… Migrated Media ID ${mediaRec.id} (${base}) to DB.`);
      successCount++;
    } catch (err: any) {
      console.error(`âŒ Failed to migrate media group "${base}":`, err.message);
    }
  }

  console.log('\n========================================');
  console.log(`ðŸŽ‰ Migration Finished!`);
  console.log(`- Successfully migrated: ${successCount}`);
  console.log(`- Skipped: ${skippedCount}`);
  console.log('========================================');

  await pool.end();
}

migrate().catch((err) => {
  console.error('Fatal error during migration:', err);
  process.exit(1);
});
