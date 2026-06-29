import { Client } from 'pg';

async function run() {
  const client = new Client({ connectionString: 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2' });
  await client.connect();
  
  const filename = 'hcu-logo-d694cea2-6395-40ca-ad81-3ee6d8be07e6-mini.webp';
  
  let baseName = filename;
  let sizeType = 'full';
  if (filename.endsWith('-full.webp')) {
      baseName = filename.replace(/-full\.webp$/, '');
      sizeType = 'full';
  } else if (filename.endsWith('-thumb.webp')) {
      baseName = filename.replace(/-thumb\.webp$/, '');
      sizeType = 'thumb';
  } else if (filename.endsWith('-mini.webp')) {
      baseName = filename.replace(/-mini\.webp$/, '');
      sizeType = 'mini';
  }
  
  console.log("Original baseName:", baseName);
  
  baseName = baseName.replace(/^(?:media\/)?uploads\//, '');
  console.log("Cleaned baseName:", baseName);
  
  const res = await client.query('SELECT id, filename FROM media WHERE filename = $1', [baseName]);
  if (res.rows.length === 0) {
      console.log("Not found in media table!");
  } else {
      console.log("Found in media table:", res.rows[0]);
      
      const blobs = await client.query('SELECT length(data_mini) as size FROM media_blobs WHERE id = $1', [res.rows[0].id]);
      if (blobs.rows.length === 0) {
          console.log("Not found in media_blobs table!");
      } else {
          console.log("Blob size:", blobs.rows[0].size);
      }
  }

  await client.end();
}
run();
