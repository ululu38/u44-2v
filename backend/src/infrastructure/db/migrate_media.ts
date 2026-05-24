import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../../domain/entities/schema';
import * as fs from 'fs/promises';
import * as path from 'path';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import sharp from 'sharp';

async function migrate() {
  const pool = new Pool({
    connectionString: 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2'
  });
  const db = drizzle(pool, { schema });

  const imagesDir = 'c:\\DEV\\u44tech.com\\u44tech.com\\src\\images';
  const uploadDir = 'c:\\DEV\\u44tech.com\\u44tech.com\\u44tech-v2\\backend\\uploads';
  
  await fs.mkdir(uploadDir, { recursive: true }).catch(() => {});

  async function walk(dir: string): Promise<string[]> {
    let results: string[] = [];
    const list = await fs.readdir(dir);
    for (const file of list) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(await walk(filePath));
      } else {
        if (filePath.match(/\.(jpg|jpeg|png|webp)$/i)) {
          results.push(filePath);
        }
      }
    }
    return results;
  }

  console.log('Scanning old images directory...');
  const files = await walk(imagesDir);
  console.log(`Found ${files.length} images to process.`);

  const urlMap: Record<string, string> = {};

  for (const filePath of files) {
    try {
      const buffer = await fs.readFile(filePath);
      const originalname = path.basename(filePath);
      const size = buffer.length;

      const fileId = crypto.randomUUID();
      const originalExtension = path.extname(originalname);
      const baseName = path.basename(originalname, originalExtension).replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const fileName = `${baseName}-${fileId}`;

      const originalPath = path.join(uploadDir, `${fileName}-original${originalExtension}`);
      const fullPath = path.join(uploadDir, `${fileName}-full.webp`);
      const thumbPath = path.join(uploadDir, `${fileName}-thumb.webp`);
      const miniPath = path.join(uploadDir, `${fileName}-mini.webp`);

      const image = sharp(buffer);
      const metadata = await image.metadata();

      await fs.writeFile(originalPath, buffer);
      await image.resize(1920, null, { withoutEnlargement: true }).webp({ quality: 85 }).toFile(fullPath);
      await image.resize(400, null, { withoutEnlargement: true }).webp({ quality: 80 }).toFile(thumbPath);
      await image.resize(150, null, { withoutEnlargement: true }).webp({ quality: 75 }).toFile(miniPath);

      const placeholderBuffer = await image.resize(10, 10, { fit: 'inside' }).blur(5).toBuffer();
      const blurHash = `data:image/png;base64,${placeholderBuffer.toString('base64')}`;

      const newMedia = {
        urlFull: `/uploads/${fileName}-full.webp`,
        urlThumb: `/uploads/${fileName}-thumb.webp`,
        urlMini: `/uploads/${fileName}-mini.webp`,
        blurHash: blurHash,
        width: metadata.width || 0,
        height: metadata.height || 0,
        fileSize: size,
        filename: fileName
      };

      const relativePath = path.relative(imagesDir, filePath).replace(/\\/g, '/');
      const oldUrl = `/images/${relativePath}`;

      urlMap[oldUrl] = newMedia.urlFull;
      console.log(`Processed: ${oldUrl} -> ${newMedia.urlFull}`);

      // We find the old "dummy" media record we inserted in the first migration
      let oldMediaRec = await db.query.media.findFirst({
        where: eq(schema.media.urlFull, oldUrl)
      });

      if (!oldMediaRec) {
        const altUrl = `../..${oldUrl}`;
        oldMediaRec = await db.query.media.findFirst({
          where: eq(schema.media.urlFull, altUrl)
        });
      }

      if (oldMediaRec) {
        // Update the old record (which preserves the ID that posts are linking to)
        await db.update(schema.media).set(newMedia).where(eq(schema.media.id, oldMediaRec.id));
      } else {
        // Just insert it so we have a record (optional, but good for completeness)
        await db.insert(schema.media).values(newMedia).onConflictDoNothing();
      }

    } catch (e: any) {
      console.error(`Failed to process ${filePath}:`, e.message);
    }
  }

  // Update HTML content in Posts
  console.log("Updating post content HTML...");
  const allPosts = await db.query.posts.findMany();
  for (const post of allPosts) {
    if (!post.contentHtml) continue;
    let newContent = post.contentHtml;
    let changed = false;

    for (const [oldUrl, newFullUrl] of Object.entries(urlMap)) {
      if (newContent.includes(oldUrl)) {
        newContent = newContent.split(oldUrl).join(newFullUrl);
        changed = true;
      }
    }

    if (changed) {
      await db.update(schema.posts).set({ contentHtml: newContent }).where(eq(schema.posts.postId, post.postId));
      console.log(`Updated HTML content for post ID: ${post.postId}`);
    }
  }

  console.log("Media migration complete!");
  process.exit(0);
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
