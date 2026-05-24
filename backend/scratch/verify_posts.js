const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2'
  });
  await client.connect();

  const res = await client.query('SELECT post_id, title, content_html, content_text FROM posts LIMIT 3');
  console.log('--- VERIFYING POSTS IN DB ---');
  for (const row of res.rows) {
    console.log(`Post ID: ${row.post_id}`);
    console.log(`Title: ${row.title}`);
    console.log(`Content HTML (first 100 chars): ${row.content_html ? row.content_html.substring(0, 100) : 'null'}`);
    console.log(`Content Text (first 100 chars): ${row.content_text ? row.content_text.substring(0, 100) : 'null'}`);
    console.log('------------------------------');
  }

  await client.end();
}

run().catch(console.error);
