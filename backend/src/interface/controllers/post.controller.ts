import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseIntPipe, NotFoundException, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../guard/jwt-auth.guard.js';
import { RolesGuard } from '../guard/roles.guard.js';
import { Roles, UserRole } from '../../domain/entities/user.entity.js';
import { CreatePostDto, UpdatePostDto, GetPostsQueryDto, GetProjectsQueryDto } from '../dtos/post.dto.js';
import { PostService } from '../../service/post.service.js';


@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
  ) {}

  @Get('projects/filter')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get filtered projects' })
  @ApiResponse({ status: 200, description: 'Return list of filtered projects' })
  async getProjects(
    @Req() req: any,
    @Query() query: GetProjectsQueryDto,
  ) {
    const isLogged = !!req.user;
    return this.postService.findProjects(query, isLogged);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  async create(@Body() createPostDto: CreatePostDto) {
    return this.postService.create(createPostDto);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get all posts or search posts with relevance ranking' })
  @ApiResponse({ status: 200, description: 'Return list of posts' })
  async search(
    @Req() req: any,
    @Query() query: GetPostsQueryDto,
  ) {
    const isLogged = !!req.user;
    return this.postService.searchPosts(query, isLogged);
  }


  @Get(':identifier')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get a post by ID or Slug' })
  @ApiResponse({ status: 200, description: 'Return the post' })
  async findOne(@Param('identifier') identifier: string, @Req() req: any) {
    const isLogged = !!req.user;
    return this.postService.findByIdentifier(identifier, isLogged);
  }

  @Post(':id/view')
  @ApiOperation({ summary: 'Increment post views' })
  @ApiResponse({ status: 200, description: 'View count incremented' })
  async incrementView(@Param('id', ParseIntPipe) id: number) {
    return this.postService.incrementView(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Update a post' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete a post' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.postService.remove(id);
  }
}
