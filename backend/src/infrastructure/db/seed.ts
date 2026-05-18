import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../../domain/entities/schema';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('🌱 Seeding initial admin user...');
  
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2',
  });

  const db = drizzle(pool, { schema });

  try {
    const adminUser = await db.query.users.findFirst();
    if (!adminUser) {
      const username = process.env.INITIAL_ADMIN_USERNAME || 'admin';
      const password = process.env.INITIAL_ADMIN_PASSWORD || 'password123';
      const email = process.env.INITIAL_ADMIN_EMAIL || 'admin@u44tech.com';
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await db.insert(schema.users).values({
        username,
        password: hashedPassword,
        email,
        role: 'admin',
      });
      console.log(`✅ Admin user "${username}" created successfully.`);
    } else {
      console.log('ℹ️ Admin user already exists.');
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
