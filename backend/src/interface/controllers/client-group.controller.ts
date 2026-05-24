import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { DrizzleService } from '../../infrastructure/db/drizzle.service.js';
import { clientGroups } from '../../domain/entities/schema.js';
import { eq, asc, count } from 'drizzle-orm';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard.js';
import { Roles } from '../../infrastructure/auth/decorators/roles.decorator.js';
import { CreateClientGroupDto, UpdateClientGroupDto } from '../dtos/client-group.dto.js';

@ApiTags('client-groups')
@Controller('client-groups')
export class ClientGroupController {
  constructor(private readonly drizzle: DrizzleService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'employee')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Create a new client group' })
  async create(@Body() createClientGroupDto: CreateClientGroupDto) {
    const result = await this.drizzle.db.insert(clientGroups).values(createClientGroupDto).returning();
    return result[0];
  }

  @Get()
  @ApiOperation({ summary: 'Get all client groups' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '100'
  ) {
    const p = parseInt(page);
    const l = parseInt(limit);
    const offset = (p - 1) * l;

    const data = await this.drizzle.db.query.clientGroups.findMany({
      limit: l,
      offset: offset,
      orderBy: [asc(clientGroups.displayOrder), asc(clientGroups.name)],
    });

    const totalCount = await this.drizzle.db.select({ value: count() }).from(clientGroups);

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
  @ApiOperation({ summary: 'Update a client group' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateClientGroupDto: UpdateClientGroupDto) {
    const result = await this.drizzle.db.update(clientGroups)
      .set(updateClientGroupDto)
      .where(eq(clientGroups.groupId, id))
      .returning();
    return result[0];
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'employee')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete a client group' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.drizzle.db.delete(clientGroups)
      .where(eq(clientGroups.groupId, id))
      .returning();
    return result[0];
  }
}
