import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { sql } from 'drizzle-orm';
import * as pg from 'pg';
import * as path from 'path';
import * as schema from '../../src/infrastructure/db/schema';
import { HashtagCategory } from '../../src/domain/entities/hashtag.entity';

let container: StartedPostgreSqlContainer | null = null;
let pool: pg.Pool | null = null;

export class TestDatabaseManager {
  static async startContainer() {
    if (container) return; // Already started in this worker

    console.log('📦 Starting PostgreSQL Testcontainer...');
    container = await new PostgreSqlContainer('postgres:16-alpine')
      .withDatabase('test_db')
      .withUsername('test_user')
      .withPassword('test_password')
      .start();

    const url = container.getConnectionUri();
    process.env.DATABASE_URL = url; // Override for NestJS ConfigService

    pool = new pg.Pool({ connectionString: url });
    const db = drizzle(pool, { schema });

    console.log('📦 Ensuring pg_trgm extension is enabled...');
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

    console.log('🚀 Running migrations on Testcontainer...');
    await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') });
    
    // Seed essential data
    await this.seedEssentialData(db);
  }

  static async stopContainer() {
    if (pool) {
      await pool.end();
      pool = null;
    }
    if (container) {
      console.log('🛑 Stopping PostgreSQL Testcontainer...');
      await container.stop();
      container = null;
    }
  }

  static async truncateAllTables() {
    if (!pool) return;
    const db = drizzle(pool, { schema });
    // Disable constraints temporarily, truncate, then re-enable
    await db.execute(sql`
      DO $$ DECLARE
          r RECORD;
      BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != 'drizzle_migrations') LOOP
              EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE;';
          END LOOP;
      END $$;
    `);
    await this.seedEssentialData(db); // Re-seed after truncate
  }

  static getDb() {
    if (!pool) throw new Error('Database not initialized');
    return drizzle(pool, { schema });
  }

  private static async seedEssentialData(db: any) {
    // Re-seed hashtags
    const defaultTags = Object.values(HashtagCategory);
    for (const tagName of defaultTags) {
      await db.insert(schema.hashtags).values({ name: tagName, usageCount: 0 }).onConflictDoNothing();
    }
  }
}
