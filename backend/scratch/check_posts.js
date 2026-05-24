const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2'
  });
  await client.connect();
  
  const res = await client.query('SELECT post_id, title, status FROM posts');
  console.log('--- DB POSTS ---');
  console.log(res.rows);
  
  await client.end();
}

run().catch(console.error);
