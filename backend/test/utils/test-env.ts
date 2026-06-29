import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { sql } from 'drizzle-orm';
import pg from 'pg';
import path from 'path';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import * as schema from '../../src/infrastructure/db/schema';
import { HashtagCategory } from '../../src/domain/entities/hashtag.entity';

export class TestEnvironment {
  public container!: StartedPostgreSqlContainer;
  public app!: INestApplication;
  public pool!: pg.Pool;
  public db!: ReturnType<typeof drizzle<typeof schema>>;

  async start() {
    this.container = await new PostgreSqlContainer('postgres:16-alpine').start();
    const uri = this.container.getConnectionUri();
    
    process.env.DATABASE_URL = uri;
    process.env.JWT_SECRET = 'e2e-test-secret';
    process.env.THROTTLE_LIMIT = '1000'; // high limit for tests
    
    this.pool = new pg.Pool({ connectionString: uri });
    this.db = drizzle(this.pool, { schema });

    await this.db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
    await migrate(this.db, { migrationsFolder: path.join(process.cwd(), 'drizzle') });

    // Seed default hashtags
    const defaultTags = Object.values(HashtagCategory);
    for (const tagName of defaultTags) {
      await this.db.insert(schema.hashtags).values({ name: tagName, usageCount: 0 }).onConflictDoNothing();
    }
    
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = moduleFixture.createNestApplication();
    
    // Set up global pipes just like main.ts usually does
    this.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    
    await this.app.init();
  }

  async stop() {
    await this.app?.close();
    await this.pool?.end();
    await this.container?.stop();
  }

  async wipeDatabase() {
    // Disable constraints and truncate all tables
    const tableQuery = await this.pool.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public' AND tablename != 'drizzle_migrations';
    `);
    
    const tables = tableQuery.rows.map(row => row.tablename);
    if (tables.length > 0) {
      const truncateQuery = tables.map(t => `"${t}"`).join(', ');
      await this.pool.query(`TRUNCATE TABLE ${truncateQuery} CASCADE;`);
    }
    
    // Re-seed default hashtags after truncate
    const defaultTags = Object.values(HashtagCategory);
    for (const tagName of defaultTags) {
      await this.db.insert(schema.hashtags).values({ name: tagName, usageCount: 0 }).onConflictDoNothing();
    }
  }
}
