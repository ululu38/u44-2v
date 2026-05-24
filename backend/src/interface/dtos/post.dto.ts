import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'My First Post' })
  title: string;

  @ApiPropertyOptional({ example: '<p>HTML content of the post...</p>' })
  contentHtml?: string;

  @ApiPropertyOptional({ example: 'Plain text content of the post...' })
  contentText?: string;

  @ApiPropertyOptional({ example: 'Content of the post...' })
  content?: string;

  @ApiPropertyOptional({ example: 1 })
  thumbnailMediaId?: number;

  @ApiPropertyOptional({ example: ['tech', 'news'] })
  tags?: any;

  @ApiPropertyOptional({ example: 1 })
  status?: number;

  @ApiPropertyOptional({ example: [1, 2, 3] })
  sliderImageIds?: number[];

  @ApiPropertyOptional({ example: [1, 2] })
  clientIds?: number[];
}

export class UpdatePostDto {
  @ApiPropertyOptional({ example: 'Updated Title' })
  title?: string;

  @ApiPropertyOptional({ example: '<p>Updated HTML content...</p>' })
  contentHtml?: string;

  @ApiPropertyOptional({ example: 'Updated plain text content...' })
  contentText?: string;

  @ApiPropertyOptional({ example: 'Updated content...' })
  content?: string;

  @ApiPropertyOptional({ example: 1 })
  thumbnailMediaId?: number;

  @ApiPropertyOptional({ example: ['updated', 'tags'] })
  tags?: any;

  @ApiPropertyOptional({ example: 2 })
  status?: number;

  @ApiPropertyOptional({ example: [1, 2, 3] })
  sliderImageIds?: number[];

  @ApiPropertyOptional({ example: [1, 2] })
  clientIds?: number[];
}

