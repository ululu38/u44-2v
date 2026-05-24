import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseIntPipe, NotFoundException, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiParam } from '@nestjs/swagger';
import { DrizzleService } from '../../infrastructure/db/drizzle.service.js';
import { posts, postImages, postClients, clients, clientGroups, clientGroupRelations } from '../../domain/entities/schema.js';

import { eq, desc, count, sql, ilike, or, and, exists } from 'drizzle-orm';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard.js';
import { Roles } from '../../infrastructure/auth/decorators/roles.decorator.js';
import { CreatePostDto, UpdatePostDto } from '../dtos/post.dto.js';
import { Query } from '@nestjs/common';

import { SlugService } from '../../infrastructure/media/slug.service.js';
import { HashtagsService } from '../../infrastructure/search/hashtags.service.js';
import { transformMedia } from '../../infrastructure/media/media.service.js';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly slugService: SlugService,
    private readonly hashtagsService: HashtagsService,
  ) {}

  private stripHtml(html: string): string {
    if (!html) return '';
    let text = html.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
    text = text.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '');
    text = text.replace(/<[^>]*>/g, ' ');
    text = text
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'");
    return text.replace(/\s+/g, ' ').trim();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'employee')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createPostDto: CreatePostDto) {
    const { sliderImageIds, clientIds, content, contentHtml, contentText, ...postData } = createPostDto;
    
    // Safeguard: Convert empty strings to null for numeric fields
    if ((postData as any).thumbnailMediaId === "") {
      (postData as any).thumbnailMediaId = null;
    }

    const finalContentHtml = contentHtml || content || '';
    const finalContentText = contentText || this.stripHtml(finalContentHtml);
    
    const result = await this.drizzle.db.insert(posts).values({
      ...postData,
      contentHtml: finalContentHtml,
      contentText: finalContentText,
    } as any).returning();
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

    // Handle clients mapping
    if (clientIds && clientIds.length > 0) {
      const parsedClientIds = Array.isArray(clientIds) 
        ? clientIds.map(id => typeof id === 'string' ? parseInt(id) : id).filter(Boolean)
        : typeof clientIds === 'string'
          ? (clientIds as string).split(',').map(id => parseInt(id.trim())).filter(Boolean)
          : [];
      if (parsedClientIds.length > 0) {
        const clientRelationsData = parsedClientIds.map(cId => ({
          postId: newPost.postId,
          clientId: cId,
        }));
        await this.drizzle.db.insert(postClients).values(clientRelationsData);
      }
    }

    // Handle hashtags mapping
    if (createPostDto.tags) {
      const tagsArray = Array.isArray(createPostDto.tags) 
        ? createPostDto.tags 
        : typeof createPostDto.tags === 'string' 
          ? (createPostDto.tags as string).split(',').map(t => t.trim()).filter(Boolean)
          : [];
      await this.hashtagsService.updatePostTags(newPost.postId, tagsArray);
    }

    // Generate and update slug
    const slug = this.slugService.generateSlug(newPost.title, newPost.postId);
    await this.drizzle.db.update(posts).set({ slug }).where(eq(posts.postId, newPost.postId));
    
    // No longer using Meilisearch

    return { ...newPost, slug };
  }



  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get all posts' })
  @ApiResponse({ status: 200, description: 'Return all posts' })
  async findAll(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('q') q?: string,
    @Query('clientId') clientId?: string,
    @Query('tag') tag?: string,
    @Query('status') status?: string
  ) {
    const isLogged = !!req.user;
    if (!isLogged) {
      status = '1';
    }

    const p = parseInt(page);
    const l = parseInt(limit);
    const offset = (p - 1) * l;

    // Build conditions
    const conditions: any[] = [];
    if (q) {
      conditions.push(or(
        ilike(posts.title, `%${q}%`),
        ilike(posts.contentText, `%${q}%`),
        ilike(sql`${posts.tags}::text`, `%${q}%`),
        exists(
          this.drizzle.db.select()
            .from(postClients)
            .innerJoin(clients, eq(postClients.clientId, clients.clientId))
            .leftJoin(clientGroupRelations, eq(clients.clientId, clientGroupRelations.clientId))
            .leftJoin(clientGroups, eq(clientGroupRelations.groupId, clientGroups.groupId))
            .where(and(
              eq(postClients.postId, posts.postId),
              or(
                ilike(clients.name, `%${q}%`),
                ilike(clientGroups.name, `%${q}%`)
              )
            ))
        )
      ));
    }
    if (tag) {
      conditions.push(or(
        sql`${posts.tags} @> ${JSON.stringify([tag])}::jsonb`,
        sql`${posts.tags} @> ${JSON.stringify([tag.toLowerCase()])}::jsonb`,
        sql`${posts.tags} @> ${JSON.stringify([tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase()])}::jsonb`
      ));
    }
    if (clientId && clientId !== 'all') {
      conditions.push(exists(
        this.drizzle.db.select()
          .from(postClients)
          .where(and(
            eq(postClients.postId, posts.postId),
            eq(postClients.clientId, parseInt(clientId))
          ))
      ));
    }
    if (status && status !== 'all') {
      conditions.push(eq(posts.status, parseInt(status)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const orderClause = q 
      ? [sql`similarity(${posts.title}, ${q}) DESC`] 
      : [desc(posts.createdAt)];

    const data = await this.drizzle.db.query.posts.findMany({
      where: whereClause,
      limit: l,
      offset: offset,
      orderBy: orderClause,
      with: {
        thumbnailMedia: true,
        clients: {
          with: {
            client: {
              with: {
                logoMedia: true,
                groups: {
                  with: {
                    group: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const transformPost = (postObj: any) => {
      if (!postObj) return postObj;
      const { clients: postClientsList, sliderImages, thumbnailMedia, ...rest } = postObj;
      return {
        ...rest,
        content: rest.contentHtml,
        thumbnailMedia: transformMedia(thumbnailMedia),
        sliderImages: sliderImages ? sliderImages.map((si: any) => ({
          ...si,
          media: transformMedia(si.media)
        })) : undefined,
        clients: postClientsList 
          ? postClientsList.map(pc => {
              if (!pc.client) return null;
              const { groups: groupRelationsList, logoMedia, ...cRest } = pc.client;
              return {
                ...cRest,
                logoMedia: transformMedia(logoMedia),
                groups: groupRelationsList ? groupRelationsList.map(gr => gr.group).filter(Boolean) : []
              };
            }).filter(Boolean)
          : []
      };
    };

    const formattedData = data.map(transformPost);

    const totalCount = await this.drizzle.db.select({ value: count() })
      .from(posts)
      .where(whereClause);
    
    return {
      data: formattedData,
      meta: {
        total: totalCount[0].value,
        page: p,
        limit: l,
        totalPages: Math.ceil(totalCount[0].value / l),
      }
    };
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get post by ID' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Return post' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async findOne(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const post = await this.drizzle.db.query.posts.findFirst({
      where: eq(posts.postId, id),
      with: {
        thumbnailMedia: true,
        clients: {
          with: {
            client: {
              with: {
                logoMedia: true,
                groups: {
                  with: {
                    group: true
                  }
                }
              }
            }
          }
        },
        sliderImages: {
          with: {
            media: true,
          }
        }
      },
    });

    if (!post) throw new NotFoundException('Post not found');

    const isLogged = !!req.user;
    if (!isLogged && post.status !== 1) {
      throw new NotFoundException('Post not found');
    }

    const transformPost = (postObj: any) => {
      if (!postObj) return postObj;
      const { clients: postClientsList, sliderImages, thumbnailMedia, ...rest } = postObj;
      return {
        ...rest,
        content: rest.contentHtml,
        thumbnailMedia: transformMedia(thumbnailMedia),
        sliderImages: sliderImages ? sliderImages.map((si: any) => ({
          ...si,
          media: transformMedia(si.media)
        })) : undefined,
        clients: postClientsList 
          ? postClientsList.map(pc => {
              if (!pc.client) return null;
              const { groups: groupRelationsList, logoMedia, ...cRest } = pc.client;
              return {
                ...cRest,
                logoMedia: transformMedia(logoMedia),
                groups: groupRelationsList ? groupRelationsList.map(gr => gr.group).filter(Boolean) : []
              };
            }).filter(Boolean)
          : []
      };
    };

    return transformPost(post);
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
    const { sliderImageIds, clientIds, content, contentHtml, contentText, ...dtoData } = updatePostDto;
    const updateData: any = { ...dtoData, updatedAt: new Date() };
    
    // Safeguard: Convert empty strings to null for numeric fields
    if (updateData.thumbnailMediaId === "") {
      updateData.thumbnailMediaId = null;
    }

    if (contentHtml !== undefined || content !== undefined) {
      const finalContentHtml = contentHtml !== undefined ? contentHtml : content;
      updateData.contentHtml = finalContentHtml;
      if (contentText === undefined) {
        updateData.contentText = this.stripHtml(finalContentHtml || '');
      }
    }
    if (contentText !== undefined) {
      updateData.contentText = contentText;
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

    // Handle clients mapping update
    if (clientIds !== undefined) {
      await this.drizzle.db.delete(postClients).where(eq(postClients.postId, id));
      const parsedClientIds = Array.isArray(clientIds)
        ? clientIds.map(id => typeof id === 'string' ? parseInt(id) : id).filter(Boolean)
        : typeof clientIds === 'string'
          ? (clientIds as string).split(',').map(id => parseInt(id.trim())).filter(Boolean)
          : [];
      if (parsedClientIds.length > 0) {
        const clientRelationsData = parsedClientIds.map(cId => ({
          postId: id,
          clientId: cId,
        }));
        await this.drizzle.db.insert(postClients).values(clientRelationsData);
      }
    }

    // Handle hashtags mapping
    if (updatePostDto.tags !== undefined) {
      const tagsArray = Array.isArray(updatePostDto.tags) 
        ? updatePostDto.tags 
        : typeof updatePostDto.tags === 'string' 
          ? (updatePostDto.tags as string).split(',').map(t => t.trim()).filter(Boolean)
          : [];
      await this.hashtagsService.updatePostTags(id, tagsArray);
    }

    // No longer using Meilisearch

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
    await this.hashtagsService.handlePostDeletion(id);
    const result = await this.drizzle.db.delete(posts)
      .where(eq(posts.postId, id))
      .returning();
    
    // No longer using Meilisearch

    return result[0];
  }

}
