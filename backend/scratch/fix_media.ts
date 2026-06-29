import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../src/infrastructure/db/schema';
import { eq, like } from 'drizzle-orm';
import * as path from 'path';

async function fixMedia() {
  const pool = new Pool({
    connectionString: 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2'
  });
  const db = drizzle(pool, { schema });

  // Find all old media records that have a bad URL
  const badMedia = await db.query.media.findMany({
    where: like(schema.media.urlFull, '%..%')
  });

  console.log(`Found ${badMedia.length} media records with bad URLs.`);

  for (const old of badMedia) {
    if (!old.filename) continue;
    
    // e.g. 183_20250117_153512_5084.jpg
    const ext = path.extname(old.filename);
    const baseName = path.basename(old.filename, ext).replace(/[^a-z0-9]/gi, '-').toLowerCase();
    
    // Find the newly uploaded one
    const newMediaMatch = await db.query.media.findFirst({
      where: like(schema.media.filename, `${baseName}-%`)
    });

    if (newMediaMatch && newMediaMatch.id !== old.id && !newMediaMatch.urlFull.includes('..')) {
      console.log(`Fixing ${old.id}: ${old.filename} -> ${newMediaMatch.urlFull}`);
      
      // Update old with new values
      await db.update(schema.media).set({
        urlFull: newMediaMatch.urlFull,
        urlThumb: newMediaMatch.urlThumb,
        urlMini: newMediaMatch.urlMini,
        blurHash: newMediaMatch.blurHash,
        width: newMediaMatch.width,
        height: newMediaMatch.height,
        filename: newMediaMatch.filename,
        fileSize: newMediaMatch.fileSize
      }).where(eq(schema.media.id, old.id));

      // Delete the new record to avoid duplicates
      await db.delete(schema.media).where(eq(schema.media.id, newMediaMatch.id));
    } else {
      console.log(`Could not find new match for ${old.filename} (base: ${baseName})`);
    }
  }

  // Also fix HTML content in posts just in case they have ../../images
  const allPosts = await db.query.posts.findMany();
  for (const post of allPosts) {
    if (!post.contentHtml) continue;
    let newContent = post.contentHtml;
    let changed = false;

    if (newContent.includes('../../images/')) {
      // Need to find what the new URL is.
      // This might be tricky without the exact match, but we can replace the prefix?
      // Actually, posts.content might have broken images. We can run a regex replace.
    }
  }

  console.log("Done fixing media.");
  process.exit(0);
}

fixMedia().catch(console.error);
