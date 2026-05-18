import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard.js';
import { Roles } from '../../infrastructure/auth/decorators/roles.decorator.js';
import { DrizzleService } from '../../infrastructure/db/drizzle.service.js';
import { users } from '../../domain/entities/schema.js';
import { eq, and } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';

@ApiTags('users')
@ApiCookieAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly drizzle: DrizzleService) {}

  // Admin Only: ดูรายชื่อ User ทั้งหมด
  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Return all users' })
  async findAll() {
    return this.drizzle.db.select().from(users);
  }

  // Admin Only: สร้าง User ใหม่
  @Post()
  @Roles('admin')
  async create(@Body() body: any) {
    const hashedPassword = await bcrypt.hash(body.password, 10);
    return this.drizzle.db.insert(users).values({
      ...body,
      password: hashedPassword,
    }).returning();
  }

  // My Account: แก้ไข Email และ Notification ของตัวเอง
  @Put('my-account')
  async updateProfile(@Req() req: any, @Body() body: any) {
    const { email, isEmailActive } = body;
    return this.drizzle.db.update(users)
      .set({ email, isEmailActive, updatedAt: new Date() })
      .where(eq(users.uid, req.user.uid))
      .returning();
  }

  // Admin Only: แก้ไข User (รวมถึงเปลี่ยน Password)
  @Put(':id')
  @Roles('admin')
  async update(@Param('id') id: string, @Body() body: any) {
    const updateData: any = { ...body, updatedAt: new Date() };
    
    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    return this.drizzle.db.update(users)
      .set(updateData)
      .where(eq(users.uid, parseInt(id)))
      .returning();
  }

  // Admin Only: ลบ User
  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id') id: string) {
    return this.drizzle.db.delete(users).where(eq(users.uid, parseInt(id))).returning();
  }
}
