import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class SearchHashtagsQueryDto {
  @ApiPropertyOptional({ description: 'Search query for hashtag name', example: 'news' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  q?: string = '';
}
