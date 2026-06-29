import { Controller, Post, Get, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateTicketDto, GetTicketsQueryDto } from '../dtos/ticket.dto.js';
import { TicketService } from '../../service/ticket.service.js';
import { JwtAuthGuard } from '../guard/jwt-auth.guard.js';
import { RolesGuard } from '../guard/roles.guard.js';
import { Roles, UserRole } from '../../domain/entities/user.entity.js';

@ApiTags('tickets')
@Controller('tickets')
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
  ) {}

  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 tickets per hour
  @Post()
  @ApiOperation({ summary: 'Submit a contact form message (Public)' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  async createTicket(@Body() body: CreateTicketDto) {
    const ticket = await this.ticketService.create(body);
    if (!ticket) throw new BadRequestException('ไม่สามารถบันทึกข้อความได้');
    return { message: 'ส่งข้อความเรียบร้อยแล้ว', ticketId: ticket.ticketId };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all contact messages (Admin only)' })
  async findAll(@Query() query: GetTicketsQueryDto) {
    return this.ticketService.findAll(query.page, query.limit, query.filter);
  }

  @Put(':id/read')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark ticket as read (Admin only)' })
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.markAsRead(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a ticket (Admin only)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.ticketService.remove(id);
    return { message: 'Deleted', ticket: result };
  }
}
