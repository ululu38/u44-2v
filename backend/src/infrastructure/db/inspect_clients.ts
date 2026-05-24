import pg from 'pg';
const { Pool } = pg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../../domain/entities/schema';

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2'
  });
  const db = drizzle(pool, { schema });
  const allClients = await db.select().from(schema.clients);
  console.log("Clients in DB:", allClients);
  await pool.end();
}
main().catch(console.error);
