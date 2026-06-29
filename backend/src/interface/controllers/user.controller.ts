import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guard/jwt-auth.guard.js';
import { RolesGuard } from '../guard/roles.guard.js';
import { Roles, UserRole } from '../../domain/entities/user.entity.js';
import { UserService } from '../../service/user.service.js';
import { CreateUserDto, UpdateUserDto, UpdateMyAccountDto, GetUsersQueryDto } from '../dtos/user.dto.js';

@ApiTags('users')
@ApiCookieAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(
    private readonly userService: UserService
  ) {}

  // Admin Only: ดูรายชื่อ User ทั้งหมด
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Return all users' })
  async findAll(@Query() query: GetUsersQueryDto) {
    return this.userService.findAll(query.page, query.limit);
  }

  // Admin Only: สร้าง User ใหม่
  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // My Account: แก้ไข Email และ Notification ของตัวเอง
  @Put('my-account')
  @ApiOperation({ summary: 'Update your own account settings' })
  async updateProfile(@Req() req: any, @Body() updateMyAccountDto: UpdateMyAccountDto) {
    return this.userService.updateProfile(req.user.uid, updateMyAccountDto);
  }

  // Admin Only: แก้ไข User (รวมถึงเปลี่ยน Password)
  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a user (Admin only)' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  // Admin Only: ลบ User
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a user (Admin only)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
