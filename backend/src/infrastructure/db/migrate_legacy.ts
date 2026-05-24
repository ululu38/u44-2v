import { createConnection } from 'mysql2/promise';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../../domain/entities/schema';

async function migrate() {
  const mysql = await createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'db_password',
    database: 'u44tech'
  });

  const pool = new Pool({
    connectionString: 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2'
  });
  const db = drizzle(pool, { schema });

  console.log("Connected to both databases.");

  // Fetch from MySQL
  const [categories] = await mysql.query<any>('SELECT * FROM categories');
  const [hashtags] = await mysql.query<any>('SELECT * FROM hashtags');
  const [tagclients] = await mysql.query<any>('SELECT * FROM tagclients');
  const [posts] = await mysql.query<any>('SELECT * FROM posts');
  const [thumbnails] = await mysql.query<any>('SELECT * FROM thumbnails');
  
  const [post_categories] = await mysql.query<any>('SELECT * FROM post_categories');
  const [post_hashtags] = await mysql.query<any>('SELECT * FROM post_hashtags');
  const [post_tagclients] = await mysql.query<any>('SELECT * FROM post_tagclients');

  console.log(`Fetched: ${posts.length} posts, ${categories.length} categories, ${hashtags.length} hashtags, ${tagclients.length} clients, ${thumbnails.length} thumbnails`);

  // 1. Migrate Hashtags
  console.log("Migrating Hashtags...");
  for (const h of hashtags) {
    await db.insert(schema.hashtags).values({
      id: h.hashtag_id,
      name: h.tag,
      usageCount: 0
    }).onConflictDoNothing();
  }

  // 2. Migrate Clients (from tagclients)
  console.log("Migrating Clients...");
  for (const c of tagclients) {
    await db.insert(schema.clients).values({
      clientId: c.tagclient_id,
      name: c.tag || c.name || `Client ${c.tagclient_id}`,
      displayOrder: 0
    }).onConflictDoNothing();
  }

  // 3. Migrate Media (thumbnails)
  console.log("Migrating Media...");
  for (const t of thumbnails) {
    const fullPath = t.file_path || t.path || t.url || '';
    let cleanPath = fullPath.replace('/src/images/', '/images/');
    cleanPath = cleanPath.replace('../../src/images/', '/images/');
    cleanPath = cleanPath.replace('../../src', '');
    if (cleanPath.startsWith('../../images/')) {
      cleanPath = cleanPath.replace('../../images/', '/images/');
    }
    if (!cleanPath.startsWith('/') && !cleanPath.startsWith('http')) {
      cleanPath = '/' + cleanPath;
    }

    await db.insert(schema.media).values({
      id: t.thumbnail_id,
      filename: cleanPath.split('/').pop() || 'unknown.jpg',
      urlFull: cleanPath,
      urlThumb: cleanPath,
      urlMini: cleanPath,
      blurHash: '',
      width: 800,
      height: 600
    }).onConflictDoNothing();
  }

  // 4. Migrate Posts
  console.log("Migrating Posts...");
  const CATEGORY_MAP: Record<number, number> = {
    2: 1,  // News
    17: 2, // Solution
    15: 3, // Project
    16: 4, // Product
    4: 5,  // Services
    21: 6, // Movement
    1: 7   // Solution News
  };

  for (const p of posts) {
    const cats = post_categories
      .filter((pc: any) => pc.post_id === p.post_id)
      .map((pc: any) => CATEGORY_MAP[pc.category_id])
      .filter((id): id is number => id !== undefined);

    const tb = post_categories.find((pc: any) => pc.post_id === p.post_id && pc.thumbnail_id);
    const thumbnailId = tb ? tb.thumbnail_id : null;

    let slug = (p.title || "").toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    if (!slug) slug = `post`;
    slug = `${slug}-${p.post_id}`; // Prevent duplicates

    const postHashtagIds = post_hashtags.filter((ph: any) => ph.post_id === p.post_id).map((ph: any) => ph.hashtag_id);
    const postTags = hashtags.filter((h: any) => postHashtagIds.includes(h.hashtag_id)).map((h: any) => h.tag);

    try {
      await db.insert(schema.posts).values({
        postId: p.post_id,
        title: p.title,
        content: p.content,
        status: p.status === 'published' ? 1 : 0,
        views: p.views || 0,
        slug: slug,
        thumbnailMediaId: thumbnailId,
        categoryIds: cats.length > 0 ? cats : null,
        tags: postTags.length > 0 ? postTags : null,
        createdAt: p.created_at,
        updatedAt: p.updated_at
      }).onConflictDoNothing();
    } catch (err: any) {
      if (err.code === '23503') { // Foreign key violation (likely invalid thumbnailMediaId)
         await db.insert(schema.posts).values({
            postId: p.post_id,
            title: p.title,
            content: p.content,
            status: p.status === 'published' ? 1 : 0,
            views: p.views || 0,
            slug: slug,
            thumbnailMediaId: null, // Fallback to null
            categoryIds: cats.length > 0 ? cats : null,
            tags: postTags.length > 0 ? postTags : null,
            createdAt: p.created_at,
            updatedAt: p.updated_at
          }).onConflictDoNothing();
      } else {
        console.error("Error inserting post:", p.post_id, err.message);
      }
    }
  }

  // Fetch actual inserted posts to strictly filter junctions
  const pgPosts = await db.select({ postId: schema.posts.postId }).from(schema.posts);
  const pgPostIds = new Set(pgPosts.map(p => p.postId.toString()));

  // 5. Migrate Post Hashtags
  console.log("Migrating Post Hashtags...");
  for (const ph of post_hashtags) {
    if (!pgPostIds.has(ph.post_id.toString())) continue;
    try {
      await db.insert(schema.postHashtags).values({
        postId: ph.post_id,
        hashtagId: ph.hashtag_id
      }).onConflictDoNothing();
    } catch (e: any) {
      console.error("Hashtag insert error for post", ph.post_id, e.message);
    }
  }

  // 6. Migrate Post Clients
  console.log("Migrating Post Clients...");
  for (const pc of post_tagclients) {
    if (!pgPostIds.has(pc.post_id.toString())) continue;
    try {
      await db.insert(schema.postClients).values({
        postId: pc.post_id,
        clientId: pc.tagclient_id
      }).onConflictDoNothing();
    } catch (e: any) {
      console.error("Client insert error for post", pc.post_id, e.message);
    }
  }

  // 7. Migrate Client Groups
  console.log("Migrating Client Groups...");
  const GROUPS = [
    { id: 1, name: 'กลุ่มโรงพยาบาล', displayOrder: 1 },
    { id: 2, name: 'กลุ่มราชการ', displayOrder: 2 },
    { id: 3, name: 'กลุ่มโรงเรียน', displayOrder: 3 },
    { id: 4, name: 'กลุ่มเอกชน', displayOrder: 4 }
  ];

  const CLIENT_RELATIONS = [
    { clientId: 9, groupId: 1 },
    { clientId: 12, groupId: 2 },
    { clientId: 13, groupId: 2 },
    { clientId: 14, groupId: 3 },
    { clientId: 15, groupId: 3 },
    { clientId: 16, groupId: 3 },
    { clientId: 10, groupId: 4 },
    { clientId: 11, groupId: 4 },
    { clientId: 17, groupId: 4 },
    { clientId: 18, groupId: 4 },
    { clientId: 19, groupId: 4 },
    { clientId: 20, groupId: 4 },
    { clientId: 21, groupId: 4 },
    { clientId: 22, groupId: 4 },
    { clientId: 23, groupId: 4 },
    { clientId: 24, groupId: 4 }
  ];

  for (const g of GROUPS) {
    await db.insert(schema.clientGroups).values({
      groupId: g.id,
      name: g.name,
      displayOrder: g.displayOrder
    }).onConflictDoNothing();
  }

  for (const rel of CLIENT_RELATIONS) {
    await db.insert(schema.clientGroupRelations).values({
      clientId: rel.clientId,
      groupId: rel.groupId
    }).onConflictDoNothing();
  }

  console.log("Migration Complete!");
}

migrate().catch(console.error).finally(() => process.exit(0));
