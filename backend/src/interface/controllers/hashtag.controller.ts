import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DrizzleService } from '../../infrastructure/db/drizzle.service.js';
import { hashtags } from '../../domain/entities/schema.js';
import { ilike, desc } from 'drizzle-orm';

@ApiTags('hashtags')
@Controller('hashtags')
export class HashtagController {
  constructor(private readonly drizzle: DrizzleService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search hashtags via PostgreSQL' })
  @ApiResponse({ status: 200, description: 'Return search results' })
  async search(@Query('q') query: string = '') {
    if (!query) return [];
    
    const results = await this.drizzle.db.query.hashtags.findMany({
      where: ilike(hashtags.name, `%${query}%`),
      limit: 10,
      orderBy: [desc(hashtags.usageCount)]
    });
    
    return results;
  }
}
