import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../../domain/entities/schema';
import { eq } from 'drizzle-orm';

async function inspectPost208() {
  const pool = new Pool({ connectionString: 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2' });
  const db = drizzle(pool, { schema });

  const post = await db.query.posts.findFirst({
    where: eq(schema.posts.postId, 208)
  });

  if (post) {
    console.log(`Post ID: ${post.postId} | Title: ${post.title}`);
    console.log('Content:');
    console.log(post.contentHtml);
  } else {
    console.log('Post 208 not found.');
  }

  process.exit(0);
}

inspectPost208().catch(console.error);
