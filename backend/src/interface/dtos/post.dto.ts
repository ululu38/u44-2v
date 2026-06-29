import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, IsIn, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePostDto {
  @ApiProperty({ example: 'My First Post' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: '<p>HTML content of the post...</p>' })
  @IsOptional()
  @IsString()
  contentHtml?: string;

  @ApiPropertyOptional({ example: 'Plain text content of the post...' })
  @IsOptional()
  @IsString()
  contentText?: string;

  @ApiPropertyOptional({ example: 'Content of the post...' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  thumbnailMediaId?: number;

  @ApiPropertyOptional({ example: ['tech', 'news'] })
  @IsOptional()
  tags?: any;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @IsIn([0, 1, 2])
  status?: number;

  @ApiPropertyOptional({ example: [1, 2, 3] })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  sliderImageIds?: number[];

  @ApiPropertyOptional({ example: [1, 2] })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  clientIds?: number[];
}

export class UpdatePostDto {
  @ApiPropertyOptional({ example: 'Updated Title' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({ example: '<p>Updated HTML content...</p>' })
  @IsOptional()
  @IsString()
  contentHtml?: string;

  @ApiPropertyOptional({ example: 'Updated plain text content...' })
  @IsOptional()
  @IsString()
  contentText?: string;

  @ApiPropertyOptional({ example: 'Updated content...' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  thumbnailMediaId?: number;

  @ApiPropertyOptional({ example: ['updated', 'tags'] })
  @IsOptional()
  tags?: any;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  @IsIn([0, 1, 2])
  status?: number;

  @ApiPropertyOptional({ example: [1, 2, 3] })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  sliderImageIds?: number[];

  @ApiPropertyOptional({ example: [1, 2] })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  clientIds?: number[];
}

export class GetPostsQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page limit', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Client ID' })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({ description: 'Tag' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ description: 'Status (0: draft, 1: published, 2: archived)' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Comma-separated fields to select' })
  @IsOptional()
  @IsString()
  fields?: string;

  @ApiPropertyOptional({ description: 'Thumbnail size', enum: ['full', 'thumb', 'mini'], default: 'thumb' })
  @IsOptional()
  @IsString()
  @IsIn(['full', 'thumb', 'mini'])
  thumbSize?: 'full' | 'thumb' | 'mini' = 'thumb';
}

export class SearchPostsQueryDto {
  @ApiPropertyOptional({ description: 'Search query keyword' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page limit', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Comma-separated fields to select' })
  @IsOptional()
  @IsString()
  fields?: string;

  @ApiPropertyOptional({ description: 'Comma-separated tags to filter by' })
  @IsOptional()
  @IsString()
  tags?: string;
}

export class GetProjectsQueryDto {
  @ApiPropertyOptional({ description: 'Search query keyword (tab or title)' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page limit', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Comma-separated client IDs to filter' })
  @IsOptional()
  @IsString()
  clientIds?: string;

  @ApiPropertyOptional({ description: 'Comma-separated client group IDs to filter' })
  @IsOptional()
  @IsString()
  groupIds?: string;

  @ApiPropertyOptional({ description: 'Comma-separated tags to filter by (e.g. Project)' })
  @IsOptional()
  @IsString()
  tags?: string = 'Project';

  @ApiPropertyOptional({ description: 'Comma-separated fields to select' })
  @IsOptional()
  @IsString()
  fields?: string;
}
