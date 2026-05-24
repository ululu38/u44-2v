const { Client } = require('pg');

function stripHtml(html) {
  if (!html) return '';
  // Remove scripts and style blocks
  let text = html.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
  text = text.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '');
  // Remove tags
  text = text.replace(/<[^>]*>/g, ' ');
  // Replace HTML entities
  text = text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2'
  });
  await client.connect();

  console.log('Starting content split migration...');

  // 1. Check if column 'content' exists
  const checkContentCol = await client.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name='posts' AND column_name='content'
  `);

  if (checkContentCol.rows.length > 0) {
    console.log('Renaming "content" to "content_html"...');
    await client.query('ALTER TABLE posts RENAME COLUMN content TO content_html');
  } else {
    console.log('"content" column already renamed or does not exist.');
  }

  // 2. Add 'content_text' column if not exists
  console.log('Adding "content_text" column...');
  await client.query('ALTER TABLE posts ADD COLUMN IF NOT EXISTS content_text text');

  // 3. Retrieve all posts to populate content_text
  console.log('Fetching all posts to populate plain text...');
  const res = await client.query('SELECT post_id, content_html, content_text FROM posts');
  const posts = res.rows;
  console.log(`Found ${posts.length} posts.`);

  let updatedCount = 0;
  for (const post of posts) {
    // We update all posts to ensure their plain text is calculated and saved correctly
    const plainText = stripHtml(post.content_html);
    await client.query('UPDATE posts SET content_text = $1 WHERE post_id = $2', [plainText, post.post_id]);
    updatedCount++;
  }
  console.log(`Successfully populated plain text for ${updatedCount} posts.`);

  // 4. Alter content_text to NOT NULL
  console.log('Setting "content_text" column to NOT NULL...');
  await client.query('ALTER TABLE posts ALTER COLUMN content_text SET NOT NULL');

  console.log('Migration completed successfully!');
  await client.end();
}

run().catch(async (err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
