import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../../domain/entities/schema';

async function checkImg() {
  const pool = new Pool({ connectionString: 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2' });
  const db = drizzle(pool, { schema });
  
  const allPosts = await db.query.posts.findMany();
  for (const post of allPosts) {
     if (!post.content) continue;
     const regex = /<img[^>]+src="([^">]+)"/g;
     let match;
     while ((match = regex.exec(post.content)) !== null) {
       console.log(`Post ID: ${post.postId}, src: ${match[1]}`);
     }
  }
  process.exit(0);
}

checkImg().catch(console.error);
