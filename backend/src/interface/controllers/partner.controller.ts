import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { DrizzleService } from '../../infrastructure/db/drizzle.service.js';
import { partners } from '../../domain/entities/schema.js';
import { eq, asc, count } from 'drizzle-orm';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard.js';
import { Roles } from '../../infrastructure/auth/decorators/roles.decorator.js';
import { CreatePartnerDto, UpdatePartnerDto } from '../dtos/partner.dto.js';
import { Query } from '@nestjs/common';

@ApiTags('partners')
@Controller('partners')
export class PartnerController {
  constructor(private readonly drizzle: DrizzleService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'employee')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Create a new partner' })
  async create(@Body() createPartnerDto: CreatePartnerDto) {
    const result = await this.drizzle.db.insert(partners).values(createPartnerDto).returning();
    return result[0];
  }

  @Get()
  @ApiOperation({ summary: 'Get all partners' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    const p = parseInt(page);
    const l = parseInt(limit);
    const offset = (p - 1) * l;

    const data = await this.drizzle.db.query.partners.findMany({
      limit: l,
      offset: offset,
      orderBy: [asc(partners.displayOrder)],
    });

    const totalCount = await this.drizzle.db.select({ value: count() }).from(partners);

    return {
      data,
      meta: {
        total: totalCount[0].value,
        page: p,
        limit: l,
        totalPages: Math.ceil(totalCount[0].value / l),
      }
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'employee')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Update a partner' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updatePartnerDto: UpdatePartnerDto) {
    const result = await this.drizzle.db.update(partners)
      .set(updatePartnerDto)
      .where(eq(partners.partnerId, id))
      .returning();
    return result[0];
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'employee')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete a partner' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.drizzle.db.delete(partners)
      .where(eq(partners.partnerId, id))
      .returning();
    return result[0];
  }
}
