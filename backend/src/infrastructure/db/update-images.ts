import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2',
  });

  const client = await pool.connect();
  try {
    console.log('Updating images table...');
    await client.query(`
      ALTER TABLE images RENAME COLUMN url TO url_full;
      ALTER TABLE images RENAME COLUMN path TO path_full;
      ALTER TABLE images ADD COLUMN url_medium VARCHAR(255);
      ALTER TABLE images ADD COLUMN path_medium VARCHAR(255);
    `);
    
    // Fill url_medium with something for existing rows if any
    await client.query(`
      UPDATE images SET url_medium = url_full, path_medium = path_full WHERE url_medium IS NULL;
    `);

    // Make them NOT NULL after filling
    await client.query(`
      ALTER TABLE images ALTER COLUMN url_medium SET NOT NULL;
      ALTER TABLE images ALTER COLUMN path_medium SET NOT NULL;
    `);

    console.log('✅ Table updated successfully!');
  } catch (error) {
    console.error('❌ Update failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
