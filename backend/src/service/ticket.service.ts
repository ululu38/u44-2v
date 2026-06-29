import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../infrastructure/db/connector.js';
import { tickets } from '../infrastructure/db/schema.js';
import { eq, desc, count } from 'drizzle-orm';
import { CreateTicketDto } from '../interface/dtos/ticket.dto.js';

@Injectable()
export class TicketService {
  constructor(private readonly drizzle: DrizzleService) {}

  async create(dto: CreateTicketDto) {
    // Auto-generate ticketId
    const now = new Date();
    const datePart = now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0');
    const randPart = Math.floor(1000 + Math.random() * 9000).toString();
    const ticketId = `MSG-${datePart}-${randPart}`;

    const newTicket = await this.drizzle.db.insert(tickets).values({
      ticketId,
      name: dto.name,
      phone: dto.phone,
      email: dto.email,
      subject: dto.subject,
      message: dto.message,
    }).returning();

    return newTicket.length > 0 ? newTicket[0] : null;
  }

  async findAll(page: number = 1, limit: number = 20, filter: string = 'all') {
    const offset = (page - 1) * limit;
    let whereClause: any = undefined;
    
    if (filter === 'unread') whereClause = eq(tickets.isRead, false);
    if (filter === 'read')   whereClause = eq(tickets.isRead, true);

    const [data, totalResult, unreadResult] = await Promise.all([
      this.drizzle.db.query.tickets.findMany({
        where: whereClause,
        orderBy: [desc(tickets.createdAt)],
        limit,
        offset,
      }),
      this.drizzle.db.select({ value: count() }).from(tickets).where(whereClause),
      this.drizzle.db.select({ value: count() }).from(tickets).where(eq(tickets.isRead, false)),
    ]);

    return {
      data,
      meta: {
        total: totalResult[0]?.value ?? 0,
        page,
        limit,
        totalPages: Math.ceil((totalResult[0]?.value ?? 0) / limit),
        unreadCount: unreadResult[0]?.value ?? 0,
      },
    };
  }

  async markAsRead(id: number) {
    const result = await this.drizzle.db.update(tickets)
      .set({ isRead: true })
      .where(eq(tickets.id, id))
      .returning();
    return result.length > 0 ? result[0] : null;
  }

  async remove(id: number) {
    const result = await this.drizzle.db.delete(tickets)
      .where(eq(tickets.id, id))
      .returning();
    return result.length > 0 ? result[0] : null;
  }
}
