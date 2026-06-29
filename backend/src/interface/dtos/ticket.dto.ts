import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional, IsIn, IsInt, Min, Max, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTicketDto {
  @ApiProperty({ example: 'สมชาย ใจดี' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ example: '0812345678' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone!: string;

  @ApiProperty({ example: 'contact@example.com' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email!: string;

  @ApiProperty({ example: 'ต้องการขอใบเสนอราคา' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  subject!: string;

  @ApiProperty({ example: 'สนใจบริการ IT Outsource ขอรายละเอียดเพิ่มเติม' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message!: string;
}

export class GetTicketsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by read status', enum: ['all', 'unread', 'read'], default: 'all' })
  @IsOptional()
  @IsString()
  @IsIn(['all', 'unread', 'read'])
  filter?: string = 'all';

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
