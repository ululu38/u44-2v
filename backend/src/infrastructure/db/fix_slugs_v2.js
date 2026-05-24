/**
 * fix_slugs_v2.js
 *
 * Re-generates slug for ALL posts using Sqids-encoded postId:
 *   <slugified-title>-<sqids(postId)>
 *
 * This matches exactly what the frontend [slug]/page.tsx expects:
 *   const parts = slug.split('-');
 *   const encodedId = parts.pop();
 *   const ids = sqids.decode(encodedId);  ← needs Sqids, not plain number
 *
 * Run:
 *   node src/infrastructure/db/fix_slugs_v2.js --dry-run   (preview only)
 *   node src/infrastructure/db/fix_slugs_v2.js              (apply changes)
 */

const { Pool } = require('pg');
const Sqids = require('sqids').default;

const sqids = new Sqids({ minLength: 5 });

// Slugify without external dep — strips non-ASCII (Thai etc.), normalizes to kebab-case
function slugify(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // strip diacritics
    .replace(/[^\x00-\x7F]/g, '')     // strip non-ASCII (Thai)
    .replace(/[^a-z0-9]+/g, '-')      // non-alphanum → dash
    .replace(/^-+|-+$/g, '')          // trim edges
    .replace(/-{2,}/g, '-');          // collapse dashes
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  if (dryRun) console.log('🔍 DRY RUN — no changes will be written\n');

  const pool = new Pool({
    connectionString: 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2',
  });

  const { rows: posts } = await pool.query(
    'SELECT post_id, title, slug FROM posts ORDER BY post_id'
  );

  console.log(`Found ${posts.length} posts total.\n`);

  const updates = [];
  const seen = new Map();

  for (const post of posts) {
    const base = slugify(post.title || '');
    const prefix = base || 'post';
    const encodedId = sqids.encode([post.post_id]);
    const newSlug = `${prefix}-${encodedId}`;

    // Verify decode round-trip
    const decoded = sqids.decode(newSlug.split('-').pop());
    if (!decoded.length || decoded[0] !== post.post_id) {
      console.error(`❌ Round-trip failed for post ${post.post_id}: ${newSlug}`);
    }

    if (seen.has(newSlug)) {
      console.warn(`⚠️  DUPLICATE slug "${newSlug}" for post ${post.post_id} and ${seen.get(newSlug)}`);
    }
    seen.set(newSlug, post.post_id);

    const changed = newSlug !== post.slug;
    if (changed) {
      updates.push({ postId: post.post_id, oldSlug: post.slug, newSlug });
      console.log(`  [${post.post_id}] ${post.slug || 'NULL'}`);
      console.log(`        → ${newSlug}`);
    }
  }

  console.log(`\n${updates.length} slug(s) need updating.`);

  if (dryRun || updates.length === 0) {
    await pool.end();
    return;
  }

  let ok = 0, fail = 0;
  for (const u of updates) {
    try {
      await pool.query(
        'UPDATE posts SET slug = $1, updated_at = NOW() WHERE post_id = $2',
        [u.newSlug, u.postId]
      );
      ok++;
    } catch (err) {
      console.error(`  ❌ post ${u.postId}: ${err.message}`);
      fail++;
    }
  }

  console.log(`\n✅ Updated: ${ok} | ❌ Failed: ${fail}`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
