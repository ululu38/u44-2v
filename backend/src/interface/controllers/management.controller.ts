import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard.js';
import { Roles } from '../../infrastructure/auth/decorators/roles.decorator.js';
import { DrizzleService } from '../../infrastructure/db/drizzle.service.js';
import { partners, partnerGroups, categories } from '../../domain/entities/schema.js';
import { eq } from 'drizzle-orm';

@ApiTags('management')
@ApiCookieAuth()
@Controller('management')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ManagementController {
  constructor(private readonly drizzle: DrizzleService) {}

  // --- PARTNERS (Any Role, but must be Logged In) ---
  @Post('partners')
  async createPartner(@Body() body: any) {
    return this.drizzle.db.insert(partners).values(body).returning();
  }

  @Put('partners/:id')
  async updatePartner(@Param('id') id: string, @Body() body: any) {
    return this.drizzle.db.update(partners).set(body).where(eq(partners.partnerId, parseInt(id))).returning();
  }

  // --- PARTNER GROUPS (Any Role, but must be Logged In) ---
  @Post('partner-groups')
  async createGroup(@Body() body: any) {
    return this.drizzle.db.insert(partnerGroups).values(body).returning();
  }

  // --- CATEGORIES (Admin Only) ---
  @Post('categories')
  @Roles('admin')
  async createCategory(@Body() body: any) {
    return this.drizzle.db.insert(categories).values(body).returning();
  }

  @Delete('categories/:id')
  @Roles('admin')
  async removeCategory(@Param('id') id: string) {
    return this.drizzle.db.delete(categories).where(eq(categories.categoryId, parseInt(id))).returning();
  }
}
