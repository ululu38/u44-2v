import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../../domain/entities/schema';
import { eq, like } from 'drizzle-orm';
import * as path from 'path';

async function fixHtml() {
  const pool = new Pool({
    connectionString: 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2'
  });
  const db = drizzle(pool, { schema });

  const allPosts = await db.query.posts.findMany();
  let updatedCount = 0;

  for (const post of allPosts) {
    if (!post.contentHtml) continue;
    
    let newContent = post.contentHtml;
    let changed = false;

    // Fix relative paths
    if (newContent.includes('../../images/')) {
      newContent = newContent.replace(/\.\.\/\.\.\/images\//g, '/images/');
      changed = true;
    }
    if (newContent.includes('../../src/images/')) {
      newContent = newContent.replace(/\.\.\/\.\.\/src\/images\//g, '/images/');
      changed = true;
    }

    // Match all <img src="...">
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;
    
    // We have to collect replacements first to avoid messing up the loop
    const replacements: { oldSrc: string, newSrc: string }[] = [];

    while ((match = imgRegex.exec(newContent)) !== null) {
      const oldSrc = match[1]; // e.g. /images/uploads/thumbnails/183_20250117_153512_5084.jpg
      
      // If it already points to /uploads/...webp, it's fine
      if (oldSrc.startsWith('/uploads/') && oldSrc.endsWith('.webp')) continue;

      const ext = path.extname(oldSrc);
      if (!ext) continue;

      const baseName = path.basename(oldSrc, ext).replace(/[^a-z0-9]/gi, '-').toLowerCase();

      // Find in media table
      const mediaMatch = await db.query.media.findFirst({
        where: like(schema.media.filename, `${baseName}-%`)
      });

      if (mediaMatch) {
        replacements.push({ oldSrc, newSrc: mediaMatch.urlFull });
      }
    }

    for (const r of replacements) {
      newContent = newContent.split(r.oldSrc).join(r.newSrc);
      changed = true;
      console.log(`Post ${post.postId}: Replaced ${r.oldSrc} -> ${r.newSrc}`);
    }

    if (changed) {
      await db.update(schema.posts).set({ contentHtml: newContent }).where(eq(schema.posts.postId, post.postId));
      updatedCount++;
    }
  }

  console.log(`Updated HTML content in ${updatedCount} posts.`);
  process.exit(0);
}

fixHtml().catch(console.error);
