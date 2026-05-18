import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DrizzleService } from '../../infrastructure/db/drizzle.service.js';
import { MailService } from '../../infrastructure/mail/mail.service.js';
import { tickets, users } from '../../domain/entities/schema.js';
import { eq, and } from 'drizzle-orm';

@ApiTags('tickets')
@Controller('public/tickets')
export class TicketController {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly mailService: MailService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new support ticket' })
  @ApiResponse({ status: 201, description: 'Ticket created successfully' })
  async createTicket(@Body() body: any) {
    // 1. Save Ticket
    const newTicket = await this.drizzle.db.insert(tickets).values(body).returning();
    
    if (newTicket.length > 0) {
      // 2. Find All Admins with isEmailActive = true
      const activeAdmins = await this.drizzle.db.query.users.findMany({
        where: and(
          eq(users.role, 'admin'),
          eq(users.isEmailActive, true)
        ),
      });

      const adminEmails = activeAdmins.map(admin => admin.email);

      // 3. Send Notification Email
      const mailSent = await this.mailService.notifyAllAdmins(
        'มี Ticket ใหม่จากหน้าเว็บ',
        `ลูกค้า: ${body.firstname} สนใจตำแหน่ง: ${body.jobTitle}. เบอร์โทร: ${body.phone}`,
        adminEmails
      );

      return { 
        message: 'Ticket received', 
        id: newTicket[0].ticketId,
        notification: mailSent ? 'Sent' : 'Failed' // แจ้งสถานะการส่งเมล
      };
    }

    throw new BadRequestException('Could not create ticket');
  }
}
