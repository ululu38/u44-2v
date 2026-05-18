import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Technology' })
  name: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Updated Technology' })
  name?: string;
}
