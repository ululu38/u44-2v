import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service.js';
import { hashtags, postHashtags } from '../../domain/entities/schema.js';
import { eq, inArray, sql } from 'drizzle-orm';

@Injectable()
export class HashtagsService {
  constructor(
    private readonly drizzle: DrizzleService,
  ) {}


  // Update post tags mapping
  async updatePostTags(postId: number, tagNames: string[]) {
    // 1. Get current tags mapped to this post
    const currentMappings = await this.drizzle.db.select({
      id: hashtags.id,
      name: hashtags.name,
    })
    .from(postHashtags)
    .innerJoin(hashtags, eq(postHashtags.hashtagId, hashtags.id))
    .where(eq(postHashtags.postId, postId));

    const currentTagNames = currentMappings.map(m => m.name);
    
    // Tags to add: in tagNames but not in currentTagNames
    const tagsToAdd = tagNames.filter(t => !currentTagNames.includes(t));
    
    // Tags to remove: in currentTagNames but not in tagNames
    const tagsToRemove = currentMappings.filter(m => !tagNames.includes(m.name));

    // Handle additions
    const addedTags: string[] = [];
    for (const tagName of tagsToAdd) {
      // Find or create tag
      let tagRecord = (await this.drizzle.db.select()
        .from(hashtags)
        .where(eq(hashtags.name, tagName)))[0];

      if (!tagRecord) {
        const insertRes = await this.drizzle.db.insert(hashtags)
          .values({ name: tagName, usageCount: 1 })
          .returning();
        tagRecord = insertRes[0];
      } else {
        await this.drizzle.db.update(hashtags)
          .set({ usageCount: sql`${hashtags.usageCount} + 1`, updatedAt: new Date() })
          .where(eq(hashtags.id, tagRecord.id));
      }
      
      // Link to post
      await this.drizzle.db.insert(postHashtags)
        .values({ postId, hashtagId: tagRecord.id })
        .onConflictDoNothing();
        
      addedTags.push(tagName);
    }

    // Handle removals
    const removedTags: string[] = [];
    for (const tagMapping of tagsToRemove) {
      // Unlink
      await this.drizzle.db.delete(postHashtags)
        .where(sql`${postHashtags.postId} = ${postId} AND ${postHashtags.hashtagId} = ${tagMapping.id}`);

      // Decrement usage count
      const updatedTag = (await this.drizzle.db.update(hashtags)
        .set({ usageCount: sql`${hashtags.usageCount} - 1`, updatedAt: new Date() })
        .where(eq(hashtags.id, tagMapping.id))
        .returning())[0];

      if (updatedTag && updatedTag.usageCount <= 0) {
        // Delete if no longer used
        await this.drizzle.db.delete(hashtags).where(eq(hashtags.id, tagMapping.id));
      }
    }
  }

  // Hook for when a post is deleted completely
  async handlePostDeletion(postId: number) {
    // Get all mappings for this post to decrement counts
    const currentMappings = await this.drizzle.db.select({
      id: hashtags.id,
      name: hashtags.name,
    })
    .from(postHashtags)
    .innerJoin(hashtags, eq(postHashtags.hashtagId, hashtags.id))
    .where(eq(postHashtags.postId, postId));

    const affectedTagNames: string[] = [];
    for (const mapping of currentMappings) {
      const updatedTag = (await this.drizzle.db.update(hashtags)
        .set({ usageCount: sql`${hashtags.usageCount} - 1`, updatedAt: new Date() })
        .where(eq(hashtags.id, mapping.id))
        .returning())[0];

      if (updatedTag && updatedTag.usageCount <= 0) {
        await this.drizzle.db.delete(hashtags).where(eq(hashtags.id, mapping.id));
      }
    }
  }
}
