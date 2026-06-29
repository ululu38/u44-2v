import pg from 'pg';
import * as path from 'path';

async function test() {
  const pool = new pg.Pool({
    connectionString: 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2',
  });

  const res = await pool.query('SELECT url_full FROM media LIMIT 3;');
  for (const row of res.rows) {
    const relativeUrl = row.url_full;
    const filename = relativeUrl.replace(/^\/?uploads\//, '');
    const cleanFilename = relativeUrl.replace(/^\/+/, '').replace(/^uploads\//, '');
    console.log(`Original: "${relativeUrl}"`);
    console.log(`replace(/^\/?uploads\\//): "${filename}"`);
    console.log(`cleanFilename: "${cleanFilename}"`);
  }
  await pool.end();
}

test();
