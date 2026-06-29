import { Controller, Post, Get, Delete, Param, Query, UseInterceptors, UploadedFile, ParseIntPipe, UseGuards, NotFoundException, Res, BadRequestException } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiCookieAuth } from '@nestjs/swagger';
import * as express from 'express';
import { MediaService } from '../../service/media.service.js';
import { JwtAuthGuard } from '../guard/jwt-auth.guard.js';
import { GetMediaQueryDto } from '../dtos/media.dto.js';

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
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (allowed.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Invalid file type. Only JPG, PNG, WEBP, and GIF are allowed.'), false);
      }
    },
  }))
  async upload(@UploadedFile() file: any) {
    return this.mediaService.processAndUpload(file);
  }

  @Get()
  @ApiOperation({ summary: 'List all media (Gallery)' })
  async findAll(@Query() query: GetMediaQueryDto) {
    return this.mediaService.findAll(query.page ?? 1, query.limit ?? 20);
  }

  @SkipThrottle()
  @Get('uploads/:filename')
  @ApiOperation({ summary: 'Serve uploaded file from database' })
  async serveFile(@Param('filename') filename: string, @Res() res: express.Response) {
    const fileData = await this.mediaService.getFileBuffer(filename);
    if (!fileData) {
      throw new NotFoundException('File not found or empty');
    }

    res.setHeader('Content-Type', fileData.contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(fileData.buffer);
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
