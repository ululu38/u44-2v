/**
 * test_slugs.js
 *
 * Simulates exactly what frontend [slug]/page.tsx does:
 *   const parts = slug.split('-');
 *   const encodedId = parts.pop();
 *   const ids = sqids.decode(encodedId);
 *   fetch(`/posts/${ids[0]}`)
 *
 * Then checks that the returned post.postId matches the original post.
 *
 * Run: node src/infrastructure/db/test_slugs.js
 */

const { Pool } = require('pg');
const Sqids = require('sqids').default;

const sqids = new Sqids({ minLength: 5 });
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function fetchPost(postId) {
  try {
    const res = await fetch(`${API}/posts/${postId}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function main() {
  const pool = new Pool({
    connectionString: 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2',
  });

  const { rows: posts } = await pool.query(
    'SELECT post_id, title, slug FROM posts ORDER BY post_id'
  );
  await pool.end();

  console.log(`\nðŸ” Testing ${posts.length} post slugs against ${API}\n`);
  console.log('â”€'.repeat(80));

  let pass = 0, fail = 0, warn = 0;
  const failures = [];
  const warnings = [];

  for (const post of posts) {
    const slug = post.slug;

    // â”€â”€â”€ Step 1: Slug exists? â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (!slug) {
      fail++;
      failures.push({ postId: post.post_id, reason: 'slug is NULL', slug: 'NULL' });
      continue;
    }

    // â”€â”€â”€ Step 2: Decode (same as frontend) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const parts = slug.split('-');
    const encodedId = parts.pop();
    const ids = sqids.decode(encodedId);

    if (!ids.length) {
      fail++;
      failures.push({ postId: post.post_id, reason: `sqids.decode("${encodedId}") â†’ []`, slug });
      continue;
    }

    const decodedId = ids[0];
    if (decodedId !== post.post_id) {
      fail++;
      failures.push({
        postId: post.post_id,
        reason: `decoded ID ${decodedId} â‰  actual postId ${post.post_id}`,
        slug,
      });
      continue;
    }

    // â”€â”€â”€ Step 3: Hit the API (optional â€” checks backend is alive) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const fetched = await fetchPost(decodedId);
    if (!fetched) {
      warn++;
      warnings.push({ postId: post.post_id, slug, reason: `API returned null/error for postId ${decodedId}` });
      continue;
    }

    if (fetched.postId !== post.post_id) {
      fail++;
      failures.push({
        postId: post.post_id,
        reason: `API returned postId ${fetched.postId} â‰  ${post.post_id}`,
        slug,
      });
      continue;
    }

    pass++;
    console.log(`  âœ… [${String(post.post_id).padStart(3)}] ${slug}`);
  }

  console.log('â”€'.repeat(80));

  if (warnings.length) {
    console.log(`\nâš ï¸  WARNINGS (API unreachable / no data):`);
    warnings.forEach(w => console.log(`  [${w.postId}] ${w.slug}\n      â†’ ${w.reason}`));
  }

  if (failures.length) {
    console.log(`\nâŒ FAILURES:`);
    failures.forEach(f => console.log(`  [${f.postId}] ${f.slug}\n      â†’ ${f.reason}`));
  }

  const total = posts.length;
  console.log(`
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
  Total posts : ${total}
  âœ… Pass     : ${pass}  (${((pass/total)*100).toFixed(1)}%)
  âš ï¸  Warn     : ${warn}  (API offline / skip)
  âŒ Fail     : ${fail}
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
