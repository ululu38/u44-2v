// Migration: rebuild tickets table as simple contact form
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2';

async function migrate() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log('Connected...');

  try {
    // Drop old tickets table and recreate clean
    await client.query(`DROP TABLE IF EXISTS tickets`);
    await client.query(`
      CREATE TABLE tickets (
        id SERIAL PRIMARY KEY,
        ticket_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(200) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(100) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT now()
      )
    `);
    console.log('✅ Tickets table recreated as contact form table');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}

migrate();
