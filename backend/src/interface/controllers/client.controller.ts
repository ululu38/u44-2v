import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guard/jwt-auth.guard.js';
import { RolesGuard } from '../guard/roles.guard.js';
import { Roles, UserRole } from '../../domain/entities/user.entity.js';
import { CreateClientDto, UpdateClientDto, GetClientsQueryDto } from '../dtos/client.dto.js';
import { ClientService } from '../../service/client.service.js';

@ApiTags('clients')
@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Create a new client' })
  async create(@Body() createClientDto: CreateClientDto) {
    return this.clientService.create(createClientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all clients' })
  async findAll(@Query() query: GetClientsQueryDto) {
    return this.clientService.findAll(query.page, query.limit, query.groupId, query.fields);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Update a client' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateClientDto: UpdateClientDto) {
    return this.clientService.update(id, updateClientDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete a client' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.remove(id);
  }
}
