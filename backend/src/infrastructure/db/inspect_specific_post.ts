import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../../domain/entities/schema';
import { like } from 'drizzle-orm';

async function inspectSpecificPost() {
  const pool = new Pool({ connectionString: 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2' });
  const db = drizzle(pool, { schema });

  const matchingPosts = await db.query.posts.findMany({
    where: like(schema.posts.contentHtml, '%20250225_032811_6237.jpg%')
  });

  console.log(`Found ${matchingPosts.length} posts matching.`);
  for (const post of matchingPosts) {
    console.log(`Post ID: ${post.postId} | Title: ${post.title}`);
    console.log('Content snippet:');
    console.log(post.contentHtml);
    console.log('------------------------------');
  }

  process.exit(0);
}

inspectSpecificPost().catch(console.error);
