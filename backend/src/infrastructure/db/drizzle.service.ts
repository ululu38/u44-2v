import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import * as schema from '../../domain/entities/schema.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DrizzleService implements OnModuleInit {
  public db: NodePgDatabase<typeof schema>;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const pool = new Pool({
      connectionString: this.configService.get<string>('database.url'),
    });
    this.db = drizzle(pool, { schema });

    // Enable Trigram Extension for text search
    await this.db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

    // Seed Initial Admin
    await this.seedAdmin();
  }

  private async seedAdmin() {
    const adminUser = await this.db.query.users.findFirst();
    if (!adminUser) {
      console.log('🌱 Seeding initial admin user...');
      const username = this.configService.get<string>('initialAdmin.username')!;
      const password = this.configService.get<string>('initialAdmin.password')!;
      const email = this.configService.get<string>('initialAdmin.email')!;
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await this.db.insert(schema.users).values({
        username,
        password: hashedPassword,
        email,
        role: 'admin',
      });
      console.log(`✅ Admin user "${username}" created successfully.`);
    }
  }
}
