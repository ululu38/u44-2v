import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../infrastructure/db/connector.js';
import { clientGroups } from '../infrastructure/db/schema.js';
import { eq, asc, count } from 'drizzle-orm';
import { CreateClientGroupDto, UpdateClientGroupDto } from '../interface/dtos/client-group.dto.js';

@Injectable()
export class ClientGroupService {
  constructor(private readonly drizzle: DrizzleService) {}

  async create(dto: CreateClientGroupDto) {
    const result = await this.drizzle.db.insert(clientGroups).values(dto).returning();
    return result[0];
  }

  async findAll(page: number = 1, limit: number = 100) {
    const offset = (page - 1) * limit;

    const data = await this.drizzle.db.query.clientGroups.findMany({
      limit: limit,
      offset: offset,
      orderBy: [asc(clientGroups.displayOrder), asc(clientGroups.name)],
    });

    const totalCount = await this.drizzle.db.select({ value: count() }).from(clientGroups);

    return {
      data,
      meta: {
        total: totalCount[0].value,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalCount[0].value / limit),
      }
    };
  }

  async update(id: number, dto: UpdateClientGroupDto) {
    const result = await this.drizzle.db.update(clientGroups)
      .set(dto)
      .where(eq(clientGroups.groupId, id))
      .returning();
    
    if (result.length === 0) {
      throw new NotFoundException('Client group not found');
    }
    return result[0];
  }

  async remove(id: number) {
    const result = await this.drizzle.db.delete(clientGroups)
      .where(eq(clientGroups.groupId, id))
      .returning();
    
    if (result.length === 0) {
      throw new NotFoundException('Client group not found');
    }
    return result[0];
  }
}
