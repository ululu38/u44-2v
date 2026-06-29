import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guard/jwt-auth.guard.js';
import { RolesGuard } from '../guard/roles.guard.js';
import { Roles, UserRole } from '../../domain/entities/user.entity.js';
import { CreatePartnerDto, UpdatePartnerDto, GetPartnersQueryDto } from '../dtos/partner.dto.js';
import { PartnerService } from '../../service/partner.service.js';

@ApiTags('partners')
@Controller('partners')
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Create a new partner' })
  async create(@Body() createPartnerDto: CreatePartnerDto) {
    return this.partnerService.create(createPartnerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all partners' })
  async findAll(@Query() query: GetPartnersQueryDto) {
    return this.partnerService.findAll(query.page, query.limit, query.fields);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Update a partner' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updatePartnerDto: UpdatePartnerDto) {
    return this.partnerService.update(id, updatePartnerDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete a partner' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.partnerService.remove(id);
  }
}
