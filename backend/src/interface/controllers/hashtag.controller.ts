import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HashtagsService } from '../../service/hashtags.service.js';
import { SearchHashtagsQueryDto } from '../dtos/hashtag.dto.js';

@ApiTags('hashtags')
@Controller('hashtags')
export class HashtagController {
  constructor(private readonly hashtagsService: HashtagsService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search hashtags via PostgreSQL' })
  @ApiResponse({ status: 200, description: 'Return search results' })
  async search(@Query() query: SearchHashtagsQueryDto) {
    return this.hashtagsService.search(query.q);
  }
}
