import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { DrizzleService } from '../../infrastructure/db/drizzle.service.js';
import { clients, clientGroupRelations } from '../../domain/entities/schema.js';
import { eq, asc, count, and, inArray, exists } from 'drizzle-orm';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard.js';
import { Roles } from '../../infrastructure/auth/decorators/roles.decorator.js';
import { CreateClientDto, UpdateClientDto } from '../dtos/client.dto.js';
import { transformMedia } from '../../infrastructure/media/media.service.js';

@ApiTags('clients')
@Controller('clients')
export class ClientController {
  constructor(private readonly drizzle: DrizzleService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'employee')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Create a new client' })
  async create(@Body() createClientDto: CreateClientDto) {
    const { groupIds, ...clientData } = createClientDto;

    return await this.drizzle.db.transaction(async (tx) => {
      const result = await tx.insert(clients).values(clientData).returning();
      const newClient = result[0];

      if (groupIds && groupIds.length > 0) {
        const relations = groupIds.map(groupId => ({
          clientId: newClient.clientId,
          groupId: groupId,
        }));
        await tx.insert(clientGroupRelations).values(relations);
      }

      return newClient;
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all clients' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('groupId') groupId?: string
  ) {
    const p = parseInt(page);
    const l = parseInt(limit);
    const offset = (p - 1) * l;

    let whereClause: any = undefined;
    if (groupId) {
      const groupIdsArray = groupId.split(',').map(id => parseInt(id.trim())).filter(Boolean);
      if (groupIdsArray.length > 0) {
        whereClause = exists(
          this.drizzle.db.select()
            .from(clientGroupRelations)
            .where(
              and(
                eq(clientGroupRelations.clientId, clients.clientId),
                inArray(clientGroupRelations.groupId, groupIdsArray)
              )
            )
        );
      }
    }

    const data = await this.drizzle.db.query.clients.findMany({
      where: whereClause,
      with: {
        logoMedia: true,
        groups: {
          with: {
            group: true,
          },
        },
      },
      limit: l,
      offset: offset,
      orderBy: [asc(clients.displayOrder)],
    });

    const totalCountQuery = this.drizzle.db.select({ value: count() }).from(clients);
    if (whereClause) {
      totalCountQuery.where(whereClause);
    }
    const totalCount = await totalCountQuery;

    return {
      data: data.map(client => ({
        ...client,
        logoMedia: client.logoMedia ? transformMedia(client.logoMedia) : null,
      })),
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
  @ApiOperation({ summary: 'Update a client' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateClientDto: UpdateClientDto) {
    const { groupIds, ...clientData } = updateClientDto;

    return await this.drizzle.db.transaction(async (tx) => {
      const result = await tx.update(clients)
        .set(clientData)
        .where(eq(clients.clientId, id))
        .returning();
      const updatedClient = result[0];

      if (groupIds !== undefined) {
        // Delete old relations
        await tx.delete(clientGroupRelations).where(eq(clientGroupRelations.clientId, id));
        // Add new relations if any
        if (groupIds.length > 0) {
          const relations = groupIds.map(groupId => ({
            clientId: id,
            groupId: groupId,
          }));
          await tx.insert(clientGroupRelations).values(relations);
        }
      }

      return updatedClient;
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'employee')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete a client' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.drizzle.db.transaction(async (tx) => {
      // First delete junction relations (due to cascade on delete constraint, this is optional, but safe)
      await tx.delete(clientGroupRelations).where(eq(clientGroupRelations.clientId, id));
      
      const result = await tx.delete(clients)
        .where(eq(clients.clientId, id))
        .returning();
      return result[0];
    });
  }
}
