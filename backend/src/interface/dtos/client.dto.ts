import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ example: 'Google' })
  name: string;

  @ApiPropertyOptional({ example: 1 })
  logoMediaId?: number;

  @ApiPropertyOptional({ example: 0 })
  displayOrder?: number;

  @ApiPropertyOptional({ type: [Number], example: [1, 2] })
  groupIds?: number[];
}

export class UpdateClientDto {
  @ApiPropertyOptional({ example: 'Google' })
  name?: string;

  @ApiPropertyOptional({ example: 1 })
  logoMediaId?: number;

  @ApiPropertyOptional({ example: 0 })
  displayOrder?: number;

  @ApiPropertyOptional({ type: [Number], example: [1, 2] })
  groupIds?: number[];
}
