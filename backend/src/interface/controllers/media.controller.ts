import { Controller, Post, Get, Delete, Param, Query, UseInterceptors, UploadedFile, ParseIntPipe, UseGuards, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiQuery, ApiCookieAuth } from '@nestjs/swagger';
import { MediaService } from '../../infrastructure/media/media.service.js';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard.js';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Upload and optimize image for Gallery' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: any) {
    return this.mediaService.processAndUpload(file);
  }

  @Get()
  @ApiOperation({ summary: 'List all media (Gallery)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20'
  ) {
    return this.mediaService.findAll(parseInt(page), parseInt(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const item = await this.mediaService.findOne(id);
    if (!item) throw new NotFoundException('Media not found');
    return item;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete media' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const item = await this.mediaService.remove(id);
    if (!item) throw new NotFoundException('Media not found');
    return { success: true };
  }
}
