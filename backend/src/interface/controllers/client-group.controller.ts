import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guard/jwt-auth.guard.js';
import { RolesGuard } from '../guard/roles.guard.js';
import { Roles, UserRole } from '../../domain/entities/user.entity.js';
import { CreateClientGroupDto, UpdateClientGroupDto, GetClientGroupsQueryDto } from '../dtos/client-group.dto.js';
import { ClientGroupService } from '../../service/client-group.service.js';

@ApiTags('client-groups')
@Controller('client-groups')
export class ClientGroupController {
  constructor(private readonly clientGroupService: ClientGroupService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Create a new client group' })
  async create(@Body() createClientGroupDto: CreateClientGroupDto) {
    return this.clientGroupService.create(createClientGroupDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all client groups' })
  async findAll(@Query() query: GetClientGroupsQueryDto) {
    return this.clientGroupService.findAll(query.page, query.limit);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Update a client group' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClientGroupDto: UpdateClientGroupDto
  ) {
    return this.clientGroupService.update(id, updateClientGroupDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete a client group' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientGroupService.remove(id);
  }
}
