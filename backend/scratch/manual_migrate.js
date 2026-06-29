const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2' });
  await client.connect();
  try {
    await client.query(`
      ALTER TABLE partners DROP COLUMN IF EXISTS logo_url;
      ALTER TABLE partners DROP COLUMN IF EXISTS website_url;
      ALTER TABLE partners ADD COLUMN logo_media_id integer REFERENCES media(id) ON DELETE SET NULL;
    `);
    console.log("Migration successful");
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
