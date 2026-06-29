import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBannerDto {
  @ApiProperty({ description: 'Banner name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Media ID for banner image' })
  @IsOptional()
  @IsNumber()
  mediaId?: number;

  @ApiPropertyOptional({ description: 'Link URL when banner is clicked' })
  @IsOptional()
  @IsString()
  linkUrl?: string;

  @ApiPropertyOptional({ description: 'Status: 1 for public, 0 for draft', default: 1 })
  @IsOptional()
  @IsNumber()
  @IsIn([0, 1])
  status?: number;
}

export class UpdateBannerDto {
  @ApiPropertyOptional({ description: 'Banner name' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ description: 'Media ID for banner image' })
  @IsOptional()
  @IsNumber()
  mediaId?: number | null;

  @ApiPropertyOptional({ description: 'Link URL when banner is clicked' })
  @IsOptional()
  @IsString()
  linkUrl?: string | null;

  @ApiPropertyOptional({ description: 'Status: 1 for public, 0 for draft' })
  @IsOptional()
  @IsNumber()
  @IsIn([0, 1])
  status?: number;
}

export class GetBannersQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search term for name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter status (0 = Inactive, 1 = Active, all = All)' })
  @IsOptional()
  @IsString()
  status?: string;
}
