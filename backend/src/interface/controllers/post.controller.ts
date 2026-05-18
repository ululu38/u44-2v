import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiParam } from '@nestjs/swagger';
import { DrizzleService } from '../../infrastructure/db/drizzle.service.js';
import { posts, postImages } from '../../domain/entities/schema.js';

import { eq, desc, count, sql } from 'drizzle-orm';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard.js';
import { Roles } from '../../infrastructure/auth/decorators/roles.decorator.js';
import { CreatePostDto, UpdatePostDto } from '../dtos/post.dto.js';
import { Query } from '@nestjs/common';

import { SlugService } from '../../infrastructure/media/slug.service.js';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly slugService: SlugService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'employee')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createPostDto: CreatePostDto) {
    const { sliderImageIds, ...postData } = createPostDto;
    
    // Safeguard: Convert empty strings to null for numeric fields
    if ((postData as any).mediaId === "") {
      (postData as any).mediaId = null;
    }
    
    const result = await this.drizzle.db.insert(posts).values(postData).returning();
    const newPost = result[0];
    
    // Handle slider images
    if (sliderImageIds && sliderImageIds.length > 0) {
      const sliderData = sliderImageIds.map((mediaId, index) => ({
        postId: newPost.postId,
        mediaId,
        displayOrder: index,
      }));
      await this.drizzle.db.insert(postImages).values(sliderData);
    }

    // Generate and update slug
    const slug = this.slugService.generateSlug(newPost.title, newPost.postId);
    await this.drizzle.db.update(posts).set({ slug }).where(eq(posts.postId, newPost.postId));
    
    return { ...newPost, slug };
  }



  @Get()
  @ApiOperation({ summary: 'Get all posts' })
  @ApiResponse({ status: 200, description: 'Return all posts' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    const p = parseInt(page);
    const l = parseInt(limit);
    const offset = (p - 1) * l;

    const data = await this.drizzle.db.query.posts.findMany({
      limit: l,
      offset: offset,
      orderBy: [desc(posts.createdAt)],
      with: {
        media: true
      }
    });

    const totalCount = await this.drizzle.db.select({ value: count() }).from(posts);
    
    return {
      data,
      meta: {
        total: totalCount[0].value,
        page: p,
        limit: l,
        totalPages: Math.ceil(totalCount[0].value / l),
      }
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Return post' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.drizzle.db.query.posts.findFirst({
      where: eq(posts.postId, id),
      with: {
        media: true,
        sliderImages: {
          with: {
            media: true,
          }
        }
      },
    });
  }

  @Post(':id/view')
  @ApiOperation({ summary: 'Increment post views count' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Views count incremented successfully' })
  async incrementViews(@Param('id', ParseIntPipe) id: number) {
    await this.drizzle.db.update(posts)
      .set({ views: sql`${posts.views} + 1` })
      .where(eq(posts.postId, id));
    return { success: true };
  }



  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'employee')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Update a post' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Post updated successfully' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updatePostDto: UpdatePostDto) {
    const { sliderImageIds, ...dtoData } = updatePostDto;
    const updateData: any = { ...dtoData, updatedAt: new Date() };
    
    // Safeguard: Convert empty strings to null for numeric fields
    if (updateData.mediaId === "") {
      updateData.mediaId = null;
    }
    
    // If title changes, regenerate slug
    if (updatePostDto.title) {
      updateData.slug = this.slugService.generateSlug(updatePostDto.title, id);
    }

    const result = await this.drizzle.db.update(posts)
      .set(updateData)
      .where(eq(posts.postId, id))
      .returning();

    // Handle slider images update (Delete and Re-insert)
    if (sliderImageIds) {
      await this.drizzle.db.delete(postImages).where(eq(postImages.postId, id));
      if (sliderImageIds.length > 0) {
        const sliderData = sliderImageIds.map((mediaId, index) => ({
          postId: id,
          mediaId,
          displayOrder: index,
        }));
        await this.drizzle.db.insert(postImages).values(sliderData);
      }
    }

    return result[0];
  }



  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'employee')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete a post' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.drizzle.db.delete(posts)
      .where(eq(posts.postId, id))
      .returning();
    return result[0];
  }
}
