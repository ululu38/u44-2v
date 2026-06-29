import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../infrastructure/db/connector.js';
import { clients, clientGroupRelations } from '../infrastructure/db/schema.js';
import { eq, asc, count, and, inArray, exists } from 'drizzle-orm';
import { CreateClientDto, UpdateClientDto } from '../interface/dtos/client.dto.js';
import { transformMedia } from './media.service.js';

@Injectable()
export class ClientService {
  constructor(private readonly drizzle: DrizzleService) {}

  async create(dto: CreateClientDto) {
    const { groupIds, ...clientData } = dto;

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

  async findAll(page: number = 1, limit: number = 10, groupId?: string, fields?: string) {
    const offset = (page - 1) * limit;

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

    // Dynamic columns selection logic
    const columnsToSelect: any = {
      clientId: true,
      name: true,
      logoMediaId: true,
      displayOrder: true,
      createdAt: true,
    };

    if (fields) {
      const requestedFields = fields.split(',').map(f => f.trim());
      Object.keys(columnsToSelect).forEach(k => {
        columnsToSelect[k] = false;
      });
      requestedFields.forEach(f => {
        if (f === 'id' || f === 'clientId') columnsToSelect.clientId = true;
        if (f === 'name') columnsToSelect.name = true;
        if (f === 'logoMediaId' || f === 'logo_media_id') columnsToSelect.logoMediaId = true;
        if (f === 'displayOrder' || f === 'display_order') columnsToSelect.displayOrder = true;
        if (f === 'createdAt' || f === 'created_at') columnsToSelect.createdAt = true;
      });
      columnsToSelect.clientId = true; // Always select ID
    }

    const wantsLogoMedia = !fields || fields.includes('logoMedia') || fields.includes('logoMediaId') || fields.includes('logo_media_id');
    const wantsGroups = !fields || fields.includes('groups');

    const withRelations: any = {};
    if (wantsLogoMedia) {
      withRelations.logoMedia = true;
    }
    if (wantsGroups) {
      withRelations.groups = {
        with: {
          group: true,
        },
      };
    }

    const data = await this.drizzle.db.query.clients.findMany({
      where: whereClause,
      columns: columnsToSelect,
      with: Object.keys(withRelations).length > 0 ? withRelations : undefined,
      limit: limit,
      offset: offset,
      orderBy: [asc(clients.displayOrder)],
    });

    const totalCountQuery = this.drizzle.db.select({ value: count() }).from(clients);
    if (whereClause) {
      totalCountQuery.where(whereClause);
    }
    const totalCount = await totalCountQuery;

    const formattedData = data.map(client => {
      const { logoMedia, ...rest } = client as any;
      const resultObj: any = { ...rest };
      
      if (wantsLogoMedia) {
        resultObj.logoMedia = logoMedia ? transformMedia(logoMedia) : null;
      }

      if (wantsGroups && (client as any).groups) {
        resultObj.groups = (client as any).groups.map((gRel: any) => gRel.group).filter(Boolean);
      }
      
      return resultObj;
    });

    return {
      data: formattedData,
      meta: {
        total: totalCount[0].value,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalCount[0].value / limit),
      }
    };
  }

  async update(id: number, dto: UpdateClientDto) {
    const { groupIds, ...clientData } = dto;

    return await this.drizzle.db.transaction(async (tx) => {
      const result = await tx.update(clients)
        .set(clientData)
        .where(eq(clients.clientId, id))
        .returning();
      
      if (result.length === 0) {
        throw new NotFoundException('Client not found');
      }
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

  async remove(id: number) {
    return await this.drizzle.db.transaction(async (tx) => {
      // First delete junction relations
      await tx.delete(clientGroupRelations).where(eq(clientGroupRelations.clientId, id));
      
      const result = await tx.delete(clients)
        .where(eq(clients.clientId, id))
        .returning();
      
      if (result.length === 0) {
        throw new NotFoundException('Client not found');
      }
      return result[0];
    });
  }
}
