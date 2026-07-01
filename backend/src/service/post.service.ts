import { Injectable, NotFoundException } from '@nestjs/common';
import { PostRepository } from '../infrastructure/repositories/post.repository.js';
import { transformMedia } from './media.service.js';
import { SlugService } from './slug.service.js';
import { HashtagsService } from './hashtags.service.js';
import { CreatePostDto, UpdatePostDto } from '../interface/dtos/post.dto.js';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepo: PostRepository,
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

  async create(createPostDto: CreatePostDto) {
    const { sliderImageIds, clientIds, content, contentHtml, contentText, ...postData } = createPostDto;
    
    if ((postData as any).thumbnailMediaId === "") {
      (postData as any).thumbnailMediaId = null;
    }

    const finalContentHtml = contentHtml || content || '';
    const finalContentText = contentText || this.stripHtml(finalContentHtml);

    const newPost = await this.postRepo.create({
      ...postData,
      contentHtml: finalContentHtml,
      contentText: finalContentText,
    });

    if (sliderImageIds && sliderImageIds.length > 0) {
      const sliderData = sliderImageIds.map((mediaId, index) => ({
        postId: newPost.postId,
        mediaId,
        displayOrder: index,
      }));
      await this.postRepo.insertPostImages(sliderData);
    }

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
        await this.postRepo.insertPostClients(clientRelationsData);
      }
    }

    if (createPostDto.tags) {
      const tagsArray = Array.isArray(createPostDto.tags) 
        ? createPostDto.tags 
        : typeof createPostDto.tags === 'string' 
          ? (createPostDto.tags as string).split(',').map(t => t.trim()).filter(Boolean)
          : [];
      await this.hashtagsService.updatePostTags(newPost.postId, tagsArray);
    }

    const slug = this.slugService.generateSlug(newPost.title, newPost.postId);
    await this.postRepo.update(newPost.postId, { slug });

    return { ...newPost, slug };
  }

  async update(postId: number, updatePostDto: UpdatePostDto) {
    const existing = await this.postRepo.findById(postId);
    if (!existing) {
      throw new NotFoundException('Post not found');
    }

    const { sliderImageIds, clientIds, content, contentHtml, contentText, ...postData } = updatePostDto;
    
    if ((postData as any).thumbnailMediaId === "") {
      (postData as any).thumbnailMediaId = null;
    }

    const updatePayload: any = { ...postData };

    if (contentHtml !== undefined || content !== undefined) {
      const finalContentHtml = contentHtml !== undefined ? contentHtml : (content || '');
      const finalContentText = contentText !== undefined ? contentText : this.stripHtml(finalContentHtml);
      updatePayload.contentHtml = finalContentHtml;
      updatePayload.contentText = finalContentText;
    }

    let currentTitle = existing.title;
    if (updatePayload.title && updatePayload.title !== existing.title) {
      currentTitle = updatePayload.title;
      updatePayload.slug = this.slugService.generateSlug(currentTitle, postId);
    }

    const updatedPost = await this.postRepo.update(postId, updatePayload);

    if (sliderImageIds !== undefined) {
      await this.postRepo.deletePostImages(postId);
      if (sliderImageIds && sliderImageIds.length > 0) {
        const sliderData = sliderImageIds.map((mediaId, index) => ({
          postId,
          mediaId,
          displayOrder: index,
        }));
        await this.postRepo.insertPostImages(sliderData);
      }
    }

    if (clientIds !== undefined) {
      await this.postRepo.deletePostClients(postId);
      if (clientIds && clientIds.length > 0) {
        const parsedClientIds = Array.isArray(clientIds) 
          ? clientIds.map(id => typeof id === 'string' ? parseInt(id) : id).filter(Boolean)
          : typeof clientIds === 'string'
            ? (clientIds as string).split(',').map(id => parseInt(id.trim())).filter(Boolean)
            : [];
        if (parsedClientIds.length > 0) {
          const clientRelationsData = parsedClientIds.map(cId => ({
            postId,
            clientId: cId,
          }));
          await this.postRepo.insertPostClients(clientRelationsData);
        }
      }
    }

    if (updatePostDto.tags !== undefined) {
      const tagsArray = Array.isArray(updatePostDto.tags) 
        ? updatePostDto.tags 
        : typeof updatePostDto.tags === 'string' 
          ? (updatePostDto.tags as string).split(',').map(t => t.trim()).filter(Boolean)
          : [];
      await this.hashtagsService.updatePostTags(postId, tagsArray);
    }

    return updatedPost;
  }

  private buildColumnsAndRelations(fields: string | undefined, thumbSize: 'full' | 'thumb' | 'mini') {
    const columnsToSelect: any = {
      postId: true,
      title: true,
      contentText: true,
      tags: true,
      status: true,
      slug: true,
      createdAt: true,
    };

    const selectedThumbSizes = new Set<'full' | 'thumb' | 'mini'>();
    let wantsThumbnail = !fields;

    if (fields) {
      const requestedFields = fields.split(',').map(f => f.trim());
      Object.keys(columnsToSelect).forEach(k => {
        columnsToSelect[k] = false;
      });
      requestedFields.forEach(f => {
        if (f === 'id' || f === 'postId') columnsToSelect.postId = true;
        if (f === 'title') columnsToSelect.title = true;
        if (f === 'contentText' || f === 'content-text') columnsToSelect.contentText = true;
        if (f === 'tags') columnsToSelect.tags = true;
        if (f === 'status') columnsToSelect.status = true;
        if (f === 'slug') columnsToSelect.slug = true;
        if (f === 'createdAt') columnsToSelect.createdAt = true;

        if (f.startsWith('thumbnailMedia') || f.startsWith('thumbnail')) {
          wantsThumbnail = true;
          const parts = f.split(':');
          if (parts.length > 1 && ['full', 'thumb', 'mini'].includes(parts[1])) {
            selectedThumbSizes.add(parts[1] as 'full' | 'thumb' | 'mini');
          } else {
            selectedThumbSizes.add(thumbSize);
          }
        }
      });
      columnsToSelect.postId = true;
    } else {
      selectedThumbSizes.add('full');
      selectedThumbSizes.add('thumb');
      selectedThumbSizes.add('mini');
    }

    const wantsClients = !fields || fields.includes('clients');

    const withRelations: any = {};
    if (wantsThumbnail) {
      withRelations.thumbnailMedia = true;
    }
    if (wantsClients) {
      withRelations.clients = {
        with: { client: { with: { logoMedia: true } } },
      };
    }

    return { columnsToSelect, withRelations, wantsThumbnail, wantsClients, selectedThumbSizes };
  }

  private formatPostData(results: any[], wantsThumbnail: boolean, wantsClients: boolean, columnsToSelect: any, selectedThumbSizes: Set<string>) {
    return results.map((postObj: any) => {
      const { clients: postClientsList, thumbnailMedia, relevanceScore, ...rest } = postObj;
      const output: any = { postId: rest.postId };
      
      if (relevanceScore !== undefined) {
        output.relevanceScore = Number(relevanceScore) || 0;
      }

      if (columnsToSelect.title) output.title = rest.title;
      if (columnsToSelect.contentText) {
        output.contentText = rest.contentText ? rest.contentText.substring(0, 150) : '';
      }
      if (columnsToSelect.tags) output.tags = rest.tags || [];
      if (columnsToSelect.createdAt) output.createdAt = rest.createdAt;
      if (columnsToSelect.slug) output.slug = rest.slug;
      if (columnsToSelect.status) output.status = rest.status;

      if (wantsThumbnail) {
        let mappedThumbnail: any = null;
        if (thumbnailMedia) {
          const media = transformMedia(thumbnailMedia);
          if (media) {
            mappedThumbnail = {
              id: media.id,
              blurHash: media.blurHash,
              width: media.width,
              height: media.height,
            };
            if (selectedThumbSizes.has('mini')) mappedThumbnail.urlMini = media.urlMini;
            if (selectedThumbSizes.has('thumb')) mappedThumbnail.urlThumb = media.urlThumb;
            if (selectedThumbSizes.has('full')) mappedThumbnail.urlFull = media.urlFull;
          }
        }
        output.thumbnailMedia = mappedThumbnail;
      }
      
      if (wantsClients) {
        output.clients = postClientsList
          ? postClientsList.map((pc: any) => {
              if (!pc.client) return null;
              const { logoMedia, ...cRest } = pc.client;
              return {
                ...cRest,
                logoMedia: transformMedia(logoMedia),
              };
            }).filter(Boolean)
          : [];
      }

      return output;
    });
  }

  async searchPosts(query: any, isLogged: boolean) {
    const { q, page = 1, limit = 10, fields, tags, tag, status, clientId, thumbSize = 'thumb' } = query;
    const offset = (page - 1) * limit;
    const { columnsToSelect, withRelations, wantsThumbnail, wantsClients, selectedThumbSizes } = this.buildColumnsAndRelations(fields, thumbSize);

    const tagsArray = tags && tags.trim() !== '' ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
    if (tag && tag.trim() !== '') tagsArray.push(tag.trim());

    const { results, total } = await this.postRepo.searchWithRelevance(
      q || '', tagsArray, isLogged, limit, offset, columnsToSelect, withRelations, status, clientId
    );

    const formattedData = this.formatPostData(results, wantsThumbnail, wantsClients, columnsToSelect, selectedThumbSizes);

    return {
      data: formattedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        query: q,
      },
    };
  }

  async findProjects(query: any, isLogged: boolean) {
    const { q, page = 1, limit = 20, fields, tags = 'Project', clientIds, groupIds } = query;
    const offset = (page - 1) * limit;
    
    // We can default thumbSize to 'thumb' for projects grid
    const { columnsToSelect, withRelations, wantsThumbnail, wantsClients, selectedThumbSizes } = this.buildColumnsAndRelations(fields, 'thumb');

    const tagsArray = tags && tags.trim() !== '' ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
    
    const parsedClientIds = clientIds ? clientIds.split(',').map((id: string) => parseInt(id.trim())).filter(Boolean) : [];
    const parsedGroupIds = groupIds ? groupIds.split(',').map((id: string) => parseInt(id.trim())).filter(Boolean) : [];

    const { results, total } = await this.postRepo.searchProjects(
      q || '', tagsArray, isLogged, limit, offset, columnsToSelect, withRelations, parsedClientIds, parsedGroupIds
    );

    const formattedData = this.formatPostData(results, wantsThumbnail, wantsClients, columnsToSelect, selectedThumbSizes);

    return {
      data: formattedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }


  async findByIdentifier(identifier: string, isLogged: boolean) {
    let postRow: any = null;
    const id = parseInt(identifier);

    if (!isNaN(id)) {
      postRow = await this.postRepo.findById(id);
    } else {
      postRow = await this.postRepo.findBySlug(identifier);
    }

    if (!postRow) throw new NotFoundException('Post not found');

    if (!isLogged && postRow.status !== 1) {
      throw new NotFoundException('Post not found');
    }

    const { clients: postClientsList, sliderImages, thumbnailMedia, ...rest } = postRow;
    const output: any = { ...rest, content: rest.contentHtml };

    if (thumbnailMedia) {
      output.thumbnailMedia = transformMedia(thumbnailMedia);
    }

    if (sliderImages) {
      output.sliderImages = sliderImages.map((pi: any) => {
        if (!pi.media) return null;
        return {
          displayOrder: pi.displayOrder,
          media: transformMedia(pi.media),
        };
      }).filter(Boolean);
    }

    if (postClientsList) {
      output.clients = postClientsList.map((pc: any) => {
        if (!pc.client) return null;
        const { logoMedia, ...cRest } = pc.client;
        return {
          ...cRest,
          logoMedia: transformMedia(logoMedia),
        };
      }).filter(Boolean);
    }

    return output;
  }

  async remove(id: number) {
    const post = await this.postRepo.delete(id);
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async incrementView(id: number) {
    await this.postRepo.incrementView(id);
    return { success: true };
  }
}
