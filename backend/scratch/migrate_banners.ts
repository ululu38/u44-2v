import { Client } from 'pg';

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2',
  });
  
  await client.connect();
  
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "banners" (
        "id" SERIAL PRIMARY KEY,
        "name" character varying(255) NOT NULL,
        "media_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
        "link_url" character varying(500),
        "status" integer NOT NULL DEFAULT 1,
        "created_at" timestamp without time zone DEFAULT now(),
        "updated_at" timestamp without time zone DEFAULT now()
      );
    `);
    console.log("Created banners table successfully.");
  } catch (error) {
    console.error("Error creating banners table:", error);
  } finally {
    await client.end();
  }
}

main();
