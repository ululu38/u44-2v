import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../infrastructure/db/connector.js';
import { partners } from '../infrastructure/db/schema.js';
import { eq, asc, count } from 'drizzle-orm';
import { CreatePartnerDto, UpdatePartnerDto } from '../interface/dtos/partner.dto.js';
import { transformMedia } from './media.service.js';

@Injectable()
export class PartnerService {
  constructor(private readonly drizzle: DrizzleService) {}

  async create(dto: CreatePartnerDto) {
    const result = await this.drizzle.db.insert(partners).values(dto).returning();
    return result[0];
  }

  async findAll(page: number = 1, limit: number = 10, fields?: string) {
    const offset = (page - 1) * limit;

    // Dynamic columns selection logic
    const columnsToSelect: any = {
      partnerId: true,
      name: true,
      logoMediaId: true,
      description: true,
      displayOrder: true,
      createdAt: true,
    };

    if (fields) {
      const requestedFields = fields.split(',').map(f => f.trim());
      Object.keys(columnsToSelect).forEach(k => {
        columnsToSelect[k] = false;
      });
      requestedFields.forEach(f => {
        if (f === 'id' || f === 'partnerId') columnsToSelect.partnerId = true;
        if (f === 'name') columnsToSelect.name = true;
        if (f === 'logoMediaId' || f === 'logo_media_id') columnsToSelect.logoMediaId = true;
        if (f === 'description') columnsToSelect.description = true;
        if (f === 'displayOrder' || f === 'display_order') columnsToSelect.displayOrder = true;
        if (f === 'createdAt' || f === 'created_at') columnsToSelect.createdAt = true;
      });
      columnsToSelect.partnerId = true; // Always select ID
    }

    const wantsLogoMedia = !fields || fields.includes('logoMedia') || fields.includes('logoMediaId') || fields.includes('logo_media_id');

    const withRelations: any = {};
    if (wantsLogoMedia) {
      withRelations.logoMedia = true;
    }

    const data = await this.drizzle.db.query.partners.findMany({
      limit: limit,
      offset: offset,
      orderBy: [asc(partners.displayOrder)],
      columns: columnsToSelect,
      with: Object.keys(withRelations).length > 0 ? withRelations : undefined,
    });

    const totalCount = await this.drizzle.db.select({ value: count() }).from(partners);

    const formattedData = data.map(partner => {
      const { logoMedia, ...rest } = partner as any;
      if (wantsLogoMedia) {
        return {
          ...rest,
          logoMedia: logoMedia ? transformMedia(logoMedia) : null,
        };
      }
      return rest;
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

  async update(id: number, dto: UpdatePartnerDto) {
    const result = await this.drizzle.db.update(partners)
      .set(dto)
      .where(eq(partners.partnerId, id))
      .returning();
    
    if (result.length === 0) {
      throw new NotFoundException('Partner not found');
    }
    return result[0];
  }

  async remove(id: number) {
    const result = await this.drizzle.db.delete(partners)
      .where(eq(partners.partnerId, id))
      .returning();
    
    if (result.length === 0) {
      throw new NotFoundException('Partner not found');
    }
    return result[0];
  }
}
