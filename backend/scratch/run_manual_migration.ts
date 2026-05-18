import pg from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

async function main() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2',
  });

  const sql = fs.readFileSync(path.join(process.cwd(), 'scratch', 'manual_migration.sql'), 'utf8');

  try {
    console.log('🚀 Applying manual migration...');
    await pool.query(sql);
    console.log('✅ Manual migration applied!');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await pool.end();
  }
}

main();
