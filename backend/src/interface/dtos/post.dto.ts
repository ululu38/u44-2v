import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'article' })
  type?: string;

  @ApiProperty({ example: 'My First Post' })
  title: string;

  @ApiProperty({ example: 'Content of the post...' })
  content: string;

  @ApiPropertyOptional({ example: 1 })
  mediaId?: number;

  @ApiPropertyOptional({ example: 'Description of the image' })
  imageAlt?: string;

  @ApiPropertyOptional({ example: 'Brief summary of the post...' })
  excerpt?: string;

  @ApiPropertyOptional({ example: ['tech', 'news'] })
  tags?: any;

  @ApiPropertyOptional({ example: 'published' })
  status?: string;

  @ApiPropertyOptional({ example: [1, 2, 3] })
  sliderImageIds?: number[];

}

export class UpdatePostDto {
  @ApiPropertyOptional({ example: 'article' })
  type?: string;

  @ApiPropertyOptional({ example: 'Updated Title' })
  title?: string;

  @ApiPropertyOptional({ example: 'Updated content...' })
  content?: string;

  @ApiPropertyOptional({ example: 1 })
  mediaId?: number;

  @ApiPropertyOptional({ example: 'Updated description of the image' })
  imageAlt?: string;

  @ApiPropertyOptional({ example: 'Updated brief summary of the post...' })
  excerpt?: string;

  @ApiPropertyOptional({ example: ['updated', 'tags'] })
  tags?: any;

  @ApiPropertyOptional({ example: 'draft' })
  status?: string;

  @ApiPropertyOptional({ example: [1, 2, 3] })
  sliderImageIds?: number[];

}

