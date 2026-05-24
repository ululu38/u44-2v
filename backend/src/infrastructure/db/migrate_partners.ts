import pg from 'pg';
const { Pool } = pg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../../domain/entities/schema';
import * as fs from 'fs/promises';
import * as path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import * as dotenv from 'dotenv';

dotenv.config();

const partnersData = [
  { name: "P2S", url: "https://p2s.co.th/", logo: "DM_20250114154507_001.png" },
  { name: "PD Cable", url: "https://www.pdcable.com/", logo: "DM_20250114154507_002.png" },
  { name: "Poise Technology", url: "https://poisetechnology.com/", logo: "DM_20250114154507_003.jpg" },
  { name: "Synnex Group", url: "https://www.synnex-grp.com/en", logo: "DM_20250114154507_004.png" },
  { name: "PSS Groups", url: "https://www.pss-groups.com/", logo: "DM_20250114154507_005.jpg" },
  { name: "Worathan", url: "https://www.worathan.co.th/", logo: "DM_20250114154507_006.webp" },
  { name: "WiseTech Global", url: "https://www.wisetechglobal.com/", logo: "DM_20250114154507_007.png" },
  { name: "VSTECS", url: "https://www.vstecs.co.th/th/index.php", logo: "DM_20250114154507_008.png" },
  { name: "Syndome", url: "https://www.syndome.com/", logo: "DM_20250114154507_009.jpg" },
  { name: "Sounddd Shop", url: "https://www.sounddd.shop/", logo: "DM_20250114154507_010.webp" },
  { name: "SIS Thai", url: "https://www.sisthai.com/sis/page/xpage.php", logo: "DM_20250114154507_011.jpg" },
  { name: "Samsung Thailand", url: "https://www.samsung.com/th/", logo: "DM_20250114154507_012.png" },
  { name: "Quick Serv", url: "https://www.quickserv.co.th/", logo: "DM_20250114154507_013.png" },
  { name: "Advice", url: "https://www.advice.co.th/", logo: "DM_20250114154507_014.jpg" },
  { name: "Dahua Thailand", url: "https://www.dahua-thailand.net/", logo: "DM_20250114154507_015.jpg" },
  { name: "Americana", url: "https://americana.co.th/th/", logo: "DM_20250114154507_016.png" },
  { name: "Apple Thailand", url: "https://www.apple.com/th/", logo: "DM_20250114154507_017.png" },
  { name: "AV Value", url: "https://www.avvalue.com/", logo: "DM_20250114154507_018.jpg" },
  { name: "Dell Thailand", url: "https://www.dell.com/en-th", logo: "DM_20250114154507_019.png" },
  { name: "D-Tran Tech", url: "https://www.dtrantech.com/", logo: "DM_20250114154507_020.jpg" },
  { name: "Fujitsu Thailand", url: "https://www.fujitsu.com/th/th/", logo: "DM_20250114154507_021.png" },
  { name: "JIB", url: "https://www.jib.co.th/web/", logo: "DM_20250114154507_022.jpg" },
  { name: "IQ Touch", url: "https://iqtouch.net/", logo: "DM_20250114154507_023.png" },
  { name: "Interlink", url: "https://interlink.co.th/", logo: "DM_20250114154507_024.png" },
  { name: "Intel Thailand", url: "https://www.thailand.intel.com/content/www/th/th/homepage.html", logo: "DM_20250114154507_025.png" },
  { name: "Ingram Micro Asia", url: "https://th.ingrammicro-asia.com/", logo: "DM_20250114154507_026.png" },
  { name: "Huawei Thailand", url: "https://consumer.huawei.com/th/", logo: "DM_20250114154507_027.png" },
  { name: "HP Thailand", url: "https://www.hp.com/th-en/shop/", logo: "DM_20250114154507_028.png" },
  { name: "Hikvision Thailand", url: "https://www.hikvision.com/th/", logo: "DM_20250114154507_029.png" },
  { name: "GOT", url: "https://www.got.co.th/", logo: "DM_20250114154507_030.png" },
  { name: "Lenovo Thailand", url: "https://www.lenovo.com/th/en/", logo: "DM_20250114154507_031.png" },
  { name: "LG Thailand", url: "https://www.lg.com/th/", logo: "DM_20250114154507_032.png" },
  { name: "Loxley Orbit", url: "https://www.loxleyorbit.net/th", logo: "DM_20250114154507_033.png" },
  { name: "Microsoft Thailand", url: "https://www.microsoft.com/th-th", logo: "DM_20250114154507_034.png" }
];

async function main() {
  console.log("🚀 Starting migration of partners...");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2'
  });
  const db = drizzle(pool, { schema });

  const oldPartnersDir = 'c:\\DEV\\u44tech.com\\u44tech.com\\src\\images\\partners';
  const uploadDir = 'c:\\DEV\\u44tech.com\\u44tech.com\\u44tech-v2\\backend\\uploads';

  await fs.mkdir(uploadDir, { recursive: true }).catch(() => {});

  let count = 0;
  for (let i = 0; i < partnersData.length; i++) {
    const partner = partnersData[i];
    const imagePath = path.join(oldPartnersDir, partner.logo);

    try {
      // 0. Check if partner already exists in Postgres
      const existing = await db.query.partners.findFirst({
        where: (tbl, { or, ilike }) => {
          const conditions = [ilike(tbl.name, `%${partner.name}%`)];
          if (partner.name === 'PD Cable') conditions.push(ilike(tbl.name, '%Phelps Dodge%'));
          if (partner.name === 'VSTECS') conditions.push(ilike(tbl.name, '%VST%'));
          if (partner.name === 'Worathan') conditions.push(ilike(tbl.name, '%Worathan%'));
          if (partner.name === 'Synnex Group') conditions.push(ilike(tbl.name, '%Synnex%'));
          return or(...conditions);
        }
      });

      if (existing) {
        console.log(`⏭️ Skipped (already exists): ${partner.name}`);
        continue;
      }

      // 1. Read image
      const buffer = await fs.readFile(imagePath);
      const originalExtension = path.extname(partner.logo);
      const originalName = path.basename(partner.logo, originalExtension);

      const fileId = crypto.randomUUID();
      const fileName = `${originalName}-${fileId}`;

      // 2. Process image with Sharp
      const originalPath = path.join(uploadDir, `${fileName}-original${originalExtension}`);
      const fullPath = path.join(uploadDir, `${fileName}-full.webp`);
      const thumbPath = path.join(uploadDir, `${fileName}-thumb.webp`);
      const miniPath = path.join(uploadDir, `${fileName}-mini.webp`);

      await fs.writeFile(originalPath, buffer);

      const image = sharp(buffer);
      const metadata = await image.metadata();

      await image.resize(1920, null, { withoutEnlargement: true }).webp({ quality: 85 }).toFile(fullPath);
      await image.resize(400, null, { withoutEnlargement: true }).webp({ quality: 80 }).toFile(thumbPath);
      await image.resize(150, null, { withoutEnlargement: true }).webp({ quality: 75 }).toFile(miniPath);

      const placeholderBuffer = await image.resize(10, 10, { fit: 'inside' }).blur(5).toBuffer();
      const blurHash = `data:image/png;base64,${placeholderBuffer.toString('base64')}`;

      // 3. Save to media table
      const [newMedia] = await db.insert(schema.media).values({
        filename: fileName,
        urlFull: `${fileName}-full.webp`,
        urlThumb: `${fileName}-thumb.webp`,
        urlMini: `${fileName}-mini.webp`,
        blurHash,
        width: metadata.width || 0,
        height: metadata.height || 0,
        fileSize: buffer.length
      }).returning();

      // 4. Save to partners table
      await db.insert(schema.partners).values({
        name: partner.name,
        logoMediaId: newMedia.id,
        description: partner.url, // save website URL to description as in old project
        displayOrder: i
      });

      console.log(`✅ Migrated: ${partner.name} (Logo: ${partner.logo})`);
      count++;
    } catch (err: any) {
      console.error(`❌ Failed to migrate ${partner.name} (${partner.logo}):`, err.message);
    }
  }

  console.log(`🎉 Finished! Successfully migrated ${count}/${partnersData.length} partners.`);
  await pool.end();
}

main().catch(console.error);
