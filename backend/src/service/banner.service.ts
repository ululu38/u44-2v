import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../infrastructure/db/connector.js';
import { banners } from '../infrastructure/db/schema.js';
import { eq, desc, count, and, ilike } from 'drizzle-orm';
import { CreateBannerDto, UpdateBannerDto } from '../interface/dtos/banner.dto.js';
import { transformMedia } from './media.service.js';

@Injectable()
export class BannerService {
  constructor(private readonly drizzle: DrizzleService) {}

  async getPublicBanners() {
    const db = this.drizzle.db;
    const result = await db.query.banners.findMany({
      where: eq(banners.status, 1),
      with: {
        media: true,
      },
      orderBy: [desc(banners.createdAt)],
    });

    return result.map(banner => ({
      ...banner,
      media: banner.media ? transformMedia(banner.media) : null,
    }));
  }

  async getAllBanners(page: number = 1, limit: number = 10, search?: string, status?: string) {
    const offset = (page - 1) * limit;

    const db = this.drizzle.db;

    const conditions: any[] = [];
    if (search) {
      conditions.push(ilike(banners.name, `%${search}%`));
    }
    if (status !== undefined && status !== '' && status !== 'all') {
      const statusNum = parseInt(status);
      if (!isNaN(statusNum)) {
        conditions.push(eq(banners.status, statusNum));
      }
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const [data, totalCount] = await Promise.all([
      db.query.banners.findMany({
        where: whereClause,
        limit: limit,
        offset: offset,
        with: {
          media: true,
        },
        orderBy: [desc(banners.createdAt)],
      }),
      db.select({ value: count() }).from(banners).where(whereClause)
    ]);

    const formattedData = data.map(banner => ({
      ...banner,
      media: banner.media ? transformMedia(banner.media) : null,
    }));

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

  async getBanner(id: number) {
    const db = this.drizzle.db;
    const banner = await db.query.banners.findFirst({
      where: eq(banners.id, id),
      with: {
        media: true,
      },
    });

    if (!banner) throw new NotFoundException('Banner not found');

    return {
      ...banner,
      media: banner.media ? transformMedia(banner.media) : null,
    };
  }

  async createBanner(dto: CreateBannerDto) {
    const db = this.drizzle.db;
    
    const [newBanner] = await db.insert(banners).values({
      name: dto.name,
      mediaId: dto.mediaId,
      linkUrl: dto.linkUrl,
      status: dto.status ?? 1,
    }).returning();

    return newBanner;
  }

  async updateBanner(id: number, dto: UpdateBannerDto) {
    const db = this.drizzle.db;
    
    const [updatedBanner] = await db.update(banners).set({
      name: dto.name,
      mediaId: dto.mediaId,
      linkUrl: dto.linkUrl,
      status: dto.status,
      updatedAt: new Date(),
    }).where(eq(banners.id, id)).returning();

    if (!updatedBanner) throw new NotFoundException('Banner not found');

    return updatedBanner;
  }

  async deleteBanner(id: number) {
    const db = this.drizzle.db;
    const [deletedBanner] = await db.delete(banners).where(eq(banners.id, id)).returning();
    
    if (!deletedBanner) throw new NotFoundException('Banner not found');

    return { message: 'Banner deleted successfully' };
  }
}
