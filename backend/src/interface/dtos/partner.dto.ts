import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePartnerDto {
  @ApiProperty({ example: 'Google' })
  name: string;

  @ApiProperty({ example: 'https://example.com/logo.png' })
  logoUrl: string;

  @ApiPropertyOptional({ example: 'https://google.com' })
  websiteUrl?: string;

  @ApiPropertyOptional({ example: 'Search Engine Partner' })
  description?: string;

  @ApiPropertyOptional({ example: 0 })
  displayOrder?: number;
}

export class UpdatePartnerDto {
  @ApiPropertyOptional({ example: 'Google Updated' })
  name?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo-updated.png' })
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'https://google.com' })
  websiteUrl?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  displayOrder?: number;
}
