import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../../domain/entities/schema';
import Sqids from 'sqids';
import slugify from 'slugify';
import { eq } from 'drizzle-orm';

async function fixSlugs() {
  const pool = new Pool({ connectionString: 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2' });
  const db = drizzle(pool, { schema });
  
  const sqids = new Sqids({ minLength: 5 });
  
  const allPosts = await db.query.posts.findMany();
  let cnt = 0;
  for (const post of allPosts) {
     const title = post.title || 'untitled';
     const thaiSlug = slugify(title, {
      replacement: '-',
      lower: true,
      strict: false,
      locale: 'th',
    });
    const encodedId = sqids.encode([post.postId]);
    const newSlug = `${thaiSlug}-${encodedId}`;
    
    if (newSlug !== post.slug) {
       await db.update(schema.posts).set({ slug: newSlug }).where(eq(schema.posts.postId, post.postId));
       cnt++;
    }
  }
  console.log(`Fixed slugs for ${cnt} posts.`);
  process.exit(0);
}

fixSlugs().catch(console.error);
