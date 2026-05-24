import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientGroupDto {
  @ApiProperty({ example: 'VIP Clients' })
  name: string;

  @ApiPropertyOptional({ example: 0 })
  displayOrder?: number;
}

export class UpdateClientGroupDto {
  @ApiPropertyOptional({ example: 'VIP Clients' })
  name?: string;

  @ApiPropertyOptional({ example: 1 })
  displayOrder?: number;
}
