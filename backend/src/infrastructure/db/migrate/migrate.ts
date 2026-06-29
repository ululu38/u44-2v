import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { eq, sql } from 'drizzle-orm';
import pg from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';
import * as schema from '../schema.js';
import { HashtagCategory } from '../../../domain/entities/hashtag.entity.js';

dotenv.config();

async function main() {
  console.log('🚀 Running migrations...');
  
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2',
  });

  const db = drizzle(pool, { schema });

  try {
    // Enable Trigram Extension for text search
    console.log('📦 Ensuring pg_trgm extension is enabled...');
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

    await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') });
    console.log('✅ Migrations completed successfully!');

    // Seed Default Hashtags
    console.log('\n🏷️  Seeding default hashtags...');
    const defaultTags = Object.values(HashtagCategory);

    for (const tagName of defaultTags) {
      const existingTag = await db.query.hashtags.findFirst({
        where: eq(schema.hashtags.name, tagName),
      });

      if (!existingTag) {
        await db.insert(schema.hashtags).values({
          name: tagName,
          usageCount: 0,
        });
        console.log(`✅ Hashtag "${tagName}" created.`);
      } else {
        console.log(`ℹ️  Hashtag "${tagName}" already exists.`);
      }
    }
  } catch (error) {
    console.error('❌ Operation failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
