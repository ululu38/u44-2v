import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../../domain/entities/schema';
import { eq } from 'drizzle-orm';

// Category ID mapping:
// Legacy MySQL ID -> Next.js Frontend ID
// 2 (News)          -> 1 (News)
// 17 (Solution)     -> 2 (Solution)
// 15 (Project)      -> 3 (Project)
// 16 (Product)      -> 4 (Product)
// 4 (Services)      -> 5 (Services)
// 21 (Movement)     -> 6 (Movement)
// 1 (Solution News) -> 7 (Solution News)
const CATEGORY_MAP: Record<number, number> = {
  2: 1,
  17: 2,
  15: 3,
  16: 4,
  4: 5,
  21: 6,
  1: 7
};

async function main() {
  const pool = new Pool({
    connectionString: 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2'
  });
  const db = drizzle(pool, { schema });

  console.log("Starting DB Category and Tag Fix...");

  try {
    const pgPosts = await db.select().from(schema.posts);
    console.log(`Fetched ${pgPosts.length} posts to update.`);

    let updatedCount = 0;

    for (const post of pgPosts) {
      // 1. Map categoryIds
      let newCategoryIds: number[] | null = null;
      if (post.categoryIds && post.categoryIds.length > 0) {
        newCategoryIds = post.categoryIds
          .map(oldId => CATEGORY_MAP[oldId])
          .filter((id): id is number => id !== undefined);
        
        if (newCategoryIds.length === 0) {
          newCategoryIds = null;
        }
      }

      // 2. Fetch tag names from junction tables
      const tagRecords = await db.select({
        name: schema.hashtags.name
      })
      .from(schema.postHashtags)
      .innerJoin(schema.hashtags, eq(schema.postHashtags.hashtagId, schema.hashtags.id))
      .where(eq(schema.postHashtags.postId, post.postId));

      const tagNames = tagRecords.map(t => t.name);
      const newTags = tagNames.length > 0 ? tagNames : null;

      // 3. Update the post
      await db.update(schema.posts)
        .set({
          categoryIds: newCategoryIds,
          tags: newTags
        })
        .where(eq(schema.posts.postId, post.postId));

      updatedCount++;
      if (updatedCount % 20 === 0 || updatedCount === pgPosts.length) {
        console.log(`Updated ${updatedCount}/${pgPosts.length} posts.`);
      }
    }

    console.log("Fix completed successfully!");

  } catch (err: any) {
    console.error("Error during execution:", err);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
