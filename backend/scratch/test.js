import { Client } from 'pg';

async function run() {
  const client = new Client({ connectionString: 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2' });
  await client.connect();
  try {
    const res = await client.query('SELECT id, filename, url_mini, url_thumb, url_full FROM media LIMIT 5;');
    console.log("First 5:", res.rows);
    const hcu = await client.query('SELECT id, filename, url_mini, url_thumb, url_full FROM media WHERE url_mini LIKE \'%hcu%\' LIMIT 5;');
    console.log("HCU:", hcu.rows);
    const blobs = await client.query('SELECT id FROM media_blobs WHERE data_mini IS NULL LIMIT 5;');
    console.log("Null blobs:", blobs.rows);
  } catch(e) {
    console.error(e);
  }
  await client.end();
}
run();
