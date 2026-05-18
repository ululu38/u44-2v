import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/domain/entities/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2',
  },
  verbose: true,
  strict: true,
});
