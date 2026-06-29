import pg from 'pg';
import * as fs from 'fs/promises';
import * as path from 'path';

async function checkMissing() {
  const pool = new pg.Pool({
    connectionString: 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2',
  });

  const backupDir = path.join(process.cwd(), 'uploads_backup');

  try {
    const dbRes = await pool.query('SELECT id, filename, url_full FROM media;');
    
    let dbMissingCount = 0;
    let diskExistsCount = 0;
    const missingOnDiskList = [];
    const existsOnDiskList = [];

    for (const row of dbRes.rows) {
      const filename = row.url_full.replace(/^\/?uploads\//, '');
      const filePath = path.join(backupDir, filename);

      try {
        await fs.access(filePath);
        // File exists on disk!
        // Check if it exists in media_blobs table
        const blobRes = await pool.query('SELECT id FROM media_blobs WHERE id = $1;', [row.id]);
        if (blobRes.rows.length === 0) {
          diskExistsCount++;
          existsOnDiskList.push({ id: row.id, filename, status: 'Exists on disk but missing in media_blobs!' });
        }
      } catch {
        // File does not exist on disk either!
        dbMissingCount++;
        missingOnDiskList.push({ id: row.id, filename, status: 'Missing on disk and missing in DB (Lost photo)' });
      }
    }

    console.log('========================================');
    console.log(`- Total DB records checked: ${dbRes.rows.length}`);
    console.log(`- Lost Photos (Missing on disk & missing in DB): ${dbMissingCount}`);
    console.log(`- Incomplete Migrations (Exists on disk but missing in DB): ${diskExistsCount}`);
    console.log('========================================');

    if (existsOnDiskList.length > 0) {
      console.log('\n❌ INCOMPLETE MIGRATIONS DETAILS (Need to fix):');
      console.table(existsOnDiskList.slice(0, 10));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkMissing();
