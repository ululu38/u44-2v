import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import * as schema from './schema.js';
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
  }

}
