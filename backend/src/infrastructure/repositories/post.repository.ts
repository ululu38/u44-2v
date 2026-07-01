import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../db/connector.js';
import { posts, postImages, postClients, clients, clientGroupRelations, clientGroups, media } from '../db/schema.js';
import { eq, desc, count, sql, and, or, ilike, exists, inArray } from 'drizzle-orm';

@Injectable()
export class PostRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async create(data: any) {
    const result = await this.drizzle.db.insert(posts).values(data).returning();
    return result[0];
  }

  async update(postId: number, data: any) {
    const result = await this.drizzle.db.update(posts)
      .set(data)
      .where(eq(posts.postId, postId))
      .returning();
    return result[0];
  }

  async delete(postId: number) {
    const result = await this.drizzle.db.delete(posts)
      .where(eq(posts.postId, postId))
      .returning();
    return result[0];
  }

  async incrementView(postId: number) {
    await this.drizzle.db.update(posts)
      .set({ views: sql`${posts.views} + 1` })
      .where(eq(posts.postId, postId));
  }

  async findById(postId: number) {
    return this.drizzle.db.query.posts.findFirst({
      where: eq(posts.postId, postId),
      with: {
        thumbnailMedia: true,
        sliderImages: {
          orderBy: (postImages, { asc }) => [asc(postImages.displayOrder)],
          with: { media: true },
        },
        clients: {
          with: { client: { with: { logoMedia: true } } },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    return this.drizzle.db.query.posts.findFirst({
      where: eq(posts.slug, slug),
      with: {
        thumbnailMedia: true,
        sliderImages: {
          orderBy: (postImages, { asc }) => [asc(postImages.displayOrder)],
          with: { media: true },
        },
        clients: {
          with: { client: { with: { logoMedia: true } } },
        },
      },
    });
  }

  async countByConditions(conditions: any[]) {
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const result = await this.drizzle.db.select({ value: count() }).from(posts).where(whereClause);
    return result[0]?.value || 0;
  }

  async searchWithRelevance(
    searchQuery: string,
    tagsArray: string[],
    isLogged: boolean,
    limit: number,
    offset: number,
    columnsToSelect: any,
    withRelations: any,
    statusFilter?: string,
    clientIdFilter?: string
  ): Promise<{ results: any[]; total: number }> {
    const conditions: any[] = [];
    
    if (statusFilter !== undefined && statusFilter !== 'all') {
      conditions.push(eq(posts.status, parseInt(statusFilter)));
    } else if (!isLogged) {
      conditions.push(eq(posts.status, 1));
    }

    if (tagsArray.length > 0) {
      conditions.push(sql`${posts.tags} ?| ARRAY[${sql.join(tagsArray.map(t => sql`${t}`), sql`, `)}]`);
    }

    if (clientIdFilter !== undefined && clientIdFilter !== 'all') {
      conditions.push(sql`EXISTS (
        SELECT 1 FROM ${postClients} pc
        WHERE pc.post_id = ${posts.postId} AND pc.client_id = ${parseInt(clientIdFilter)}
      )`);
    }

    if (searchQuery) {
      conditions.push(sql`(
        ${posts.title} ILIKE ${'%' + searchQuery + '%'}
        OR ${posts.tags}::text ILIKE ${'%' + searchQuery + '%'}
        OR ${posts.contentText} ILIKE ${'%' + searchQuery + '%'}
        OR EXISTS (
          SELECT 1 FROM ${postClients} pc
          INNER JOIN ${clients} c ON pc.client_id = c.client_id
          WHERE pc.post_id = ${posts.postId} AND c.name ILIKE ${'%' + searchQuery + '%'}
        )
      )`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const scoreSql = searchQuery 
      ? sql<number>`(
          CASE WHEN ${posts.title} ILIKE ${'%' + searchQuery + '%'} THEN 4 ELSE 0 END +
          CASE WHEN ${posts.tags}::text ILIKE ${'%' + searchQuery + '%'} THEN 3 ELSE 0 END +
          CASE WHEN ${posts.contentText} ILIKE ${'%' + searchQuery + '%'} THEN 2 ELSE 0 END +
          CASE WHEN EXISTS (
            SELECT 1 FROM ${postClients} pc
            INNER JOIN ${clients} c ON pc.client_id = c.client_id
            WHERE pc.post_id = ${posts.postId} AND c.name ILIKE ${'%' + searchQuery + '%'}
          ) THEN 1 ELSE 0 END
        )`
      : sql<number>`0`;

    const orderBy = searchQuery 
      ? [desc(scoreSql), desc(posts.createdAt)]
      : [desc(posts.createdAt)];

    const results = await this.drizzle.db.query.posts.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy,
      extras: searchQuery ? { relevanceScore: scoreSql.as('relevance_score') } : undefined,
      columns: columnsToSelect,
      with: withRelations,
    });

    const total = await this.countByConditions(conditions);

    return { results, total };
  }

  async searchProjects(
    searchQuery: string,
    tagsArray: string[],
    isLogged: boolean,
    limit: number,
    offset: number,
    columnsToSelect: any,
    withRelations: any,
    clientIds?: number[],
    groupIds?: number[]
  ): Promise<{ results: any[]; total: number }> {
    const conditions: any[] = [];
    
    if (!isLogged) {
      conditions.push(eq(posts.status, 1));
    }

    if (tagsArray.length > 0) {
      conditions.push(sql`${posts.tags} ?| ARRAY[${sql.join(tagsArray.map(t => sql`${t}`), sql`, `)}]`);
    }

    if (clientIds && clientIds.length > 0) {
      conditions.push(sql`EXISTS (
        SELECT 1 FROM ${postClients} pc
        WHERE pc.post_id = ${posts.postId} AND pc.client_id IN (${sql.join(clientIds, sql`, `)})
      )`);
    }

    if (groupIds && groupIds.length > 0) {
      conditions.push(sql`EXISTS (
        SELECT 1 FROM ${postClients} pc
        INNER JOIN ${clientGroupRelations} cgr ON pc.client_id = cgr.client_id
        WHERE pc.post_id = ${posts.postId} AND cgr.group_id IN (${sql.join(groupIds, sql`, `)})
      )`);
    }

    if (searchQuery) {
      conditions.push(sql`(
        ${posts.title} ILIKE ${'%' + searchQuery + '%'}
        OR ${posts.tags}::text ILIKE ${'%' + searchQuery + '%'}
        OR ${posts.contentText} ILIKE ${'%' + searchQuery + '%'}
      )`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const results = await this.drizzle.db.query.posts.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: [desc(posts.createdAt)],
      columns: columnsToSelect,
      with: withRelations,
    });

    const total = await this.countByConditions(conditions);

    return { results, total };
  }


  // Relations
  async insertPostImages(data: any[]) {
    return this.drizzle.db.insert(postImages).values(data);
  }

  async deletePostImages(postId: number) {
    return this.drizzle.db.delete(postImages).where(eq(postImages.postId, postId));
  }

  async insertPostClients(data: any[]) {
    return this.drizzle.db.insert(postClients).values(data);
  }

  async deletePostClients(postId: number) {
    return this.drizzle.db.delete(postClients).where(eq(postClients.postId, postId));
  }
}
