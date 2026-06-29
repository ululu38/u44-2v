import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guard/jwt-auth.guard.js';
import { RolesGuard } from '../guard/roles.guard.js';
import { Roles, UserRole } from '../../domain/entities/user.entity.js';
import { CreateBannerDto, UpdateBannerDto, GetBannersQueryDto } from '../dtos/banner.dto.js';
import { BannerService } from '../../service/banner.service.js';

@ApiTags('Banners')
@Controller('banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Get('public')
  @ApiOperation({ summary: 'List all public active banners' })
  async getPublicBanners() {
    return this.bannerService.getPublicBanners();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'List all banners (admin)' })
  async getAllBanners(
    @Query() query: GetBannersQueryDto
  ) {
    return this.bannerService.getAllBanners(query.page, query.limit, query.search, query.status);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get banner by ID' })
  async getBanner(@Param('id', ParseIntPipe) id: number) {
    return this.bannerService.getBanner(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Create a new banner' })
  async createBanner(@Body() dto: CreateBannerDto) {
    return this.bannerService.createBanner(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Update banner' })
  async updateBanner(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBannerDto
  ) {
    return this.bannerService.updateBanner(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete banner' })
  async deleteBanner(@Param('id', ParseIntPipe) id: number) {
    return this.bannerService.deleteBanner(id);
  }
}
