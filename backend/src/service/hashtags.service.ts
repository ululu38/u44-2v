import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../infrastructure/db/connector.js';
import { hashtags, posts } from '../infrastructure/db/schema.js';
import { eq, sql, ilike, desc } from 'drizzle-orm';

@Injectable()
export class HashtagsService {
  constructor(
    private readonly drizzle: DrizzleService,
  ) {}

  async search(query: string = '') {
    if (!query) return [];
    
    return await this.drizzle.db.query.hashtags.findMany({
      where: ilike(hashtags.name, `%${query}%`),
      limit: 10,
      orderBy: [desc(hashtags.usageCount)]
    });
  }

  // Update post tags mapping
  async updatePostTags(postId: number, tagNames: string[]) {
    // 1. Get current tags mapped to this post
    const postRecord = (await this.drizzle.db.select({
      tags: posts.tags
    })
    .from(posts)
    .where(eq(posts.postId, postId)))[0];

    const currentTagNames: string[] = Array.isArray(postRecord?.tags)
      ? (postRecord.tags as string[])
      : [];
    
    // Tags to add: in tagNames but not in currentTagNames
    const tagsToAdd = tagNames.filter(t => !currentTagNames.includes(t));
    
    // Tags to remove: in currentTagNames but not in tagNames
    const tagsToRemove = currentTagNames.filter(t => !tagNames.includes(t));

    // Handle additions
    for (const tagName of tagsToAdd) {
      // Find or create tag
      let tagRecord = (await this.drizzle.db.select()
        .from(hashtags)
        .where(eq(hashtags.name, tagName)))[0];

      if (!tagRecord) {
        await this.drizzle.db.insert(hashtags)
          .values({ name: tagName, usageCount: 1 })
          .onConflictDoNothing();
      } else {
        await this.drizzle.db.update(hashtags)
          .set({ usageCount: sql`${hashtags.usageCount} + 1`, updatedAt: new Date() })
          .where(eq(hashtags.id, tagRecord.id));
      }
    }

    // Handle removals
    for (const tagName of tagsToRemove) {
      const tagRecord = (await this.drizzle.db.select()
        .from(hashtags)
        .where(eq(hashtags.name, tagName)))[0];

      if (tagRecord) {
        const updatedTag = (await this.drizzle.db.update(hashtags)
          .set({ usageCount: sql`${hashtags.usageCount} - 1`, updatedAt: new Date() })
          .where(eq(hashtags.id, tagRecord.id))
          .returning())[0];

        if (updatedTag && updatedTag.usageCount <= 0) {
          await this.drizzle.db.delete(hashtags).where(eq(hashtags.id, tagRecord.id));
        }
      }
    }
  }

  // Hook for when a post is deleted completely
  async handlePostDeletion(postId: number) {
    const postRecord = (await this.drizzle.db.select({
      tags: posts.tags
    })
    .from(posts)
    .where(eq(posts.postId, postId)))[0];

    const currentTagNames: string[] = Array.isArray(postRecord?.tags)
      ? (postRecord.tags as string[])
      : [];

    for (const tagName of currentTagNames) {
      const tagRecord = (await this.drizzle.db.select()
        .from(hashtags)
        .where(eq(hashtags.name, tagName)))[0];

      if (tagRecord) {
        const updatedTag = (await this.drizzle.db.update(hashtags)
          .set({ usageCount: sql`${hashtags.usageCount} - 1`, updatedAt: new Date() })
          .where(eq(hashtags.id, tagRecord.id))
          .returning())[0];

        if (updatedTag && updatedTag.usageCount <= 0) {
          await this.drizzle.db.delete(hashtags).where(eq(hashtags.id, tagRecord.id));
        }
      }
    }
  }
}
