import { Controller, Get, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DrizzleService } from '../../infrastructure/db/drizzle.service.js';
import { tickets } from '../../domain/entities/schema.js';
import { eq, desc } from 'drizzle-orm';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard.js';
import { Roles } from '../../infrastructure/auth/decorators/roles.decorator.js';

@ApiTags('ticket-management')
@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TicketManagementController {
  constructor(private readonly drizzle: DrizzleService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all tickets (Admin only)' })
  async findAll() {
    return this.drizzle.db.query.tickets.findMany({
      orderBy: [desc(tickets.createdAt)],
    });
  }

  @Put(':id/status')
  @Roles('admin')
  @ApiOperation({ summary: 'Update ticket status (Admin only)' })
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.drizzle.db.update(tickets)
      .set({ status })
      .where(eq(tickets.id, parseInt(id)))
      .returning();
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a ticket (Admin only)' })
  async remove(@Param('id') id: string) {
    return this.drizzle.db.delete(tickets)
      .where(eq(tickets.id, parseInt(id)))
      .returning();
  }
}
