import pg from 'pg';

async function checkAllImages() {
  console.log('🔍 Connecting to database to fetch all image URLs...');
  const pool = new pg.Pool({
    connectionString: 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2',
  });

  try {
    const dbRes = await pool.query('SELECT id, filename, url_full, url_thumb, url_mini FROM media;');
    const totalCount = dbRes.rows.length;
    console.log(`📊 Found ${totalCount} records in media table. Starting checks...`);

    let successCount = 0;
    let failCount = 0;
    const failures = [];

    // Let's check them in batches of 50 to avoid overloading the server
    const batchSize = 50;
    for (let i = 0; i < totalCount; i += batchSize) {
      const batch = dbRes.rows.slice(i, i + batchSize);
      const promises = batch.map(async (row) => {
        const relativeUrl = row.url_full;
        const filename = relativeUrl.replace(/^\/?uploads\//, '');
        const targetUrl = `http://localhost:4000/uploads/${filename}`;

        try {
          const res = await fetch(targetUrl);
          if (res.ok) {
            const buf = await res.arrayBuffer();
            if (buf.byteLength > 0) {
              successCount++;
            } else {
              failCount++;
              failures.push({ id: row.id, filename, error: 'Empty buffer received' });
            }
          } else {
            failCount++;
            const text = await res.text();
            failures.push({ id: row.id, filename, error: `HTTP ${res.status}: ${text}` });
          }
        } catch (err) {
          failCount++;
          failures.push({ id: row.id, filename, error: err.message });
        }
      });

      await Promise.all(promises);
      console.log(`⏳ Progress: Checked ${Math.min(i + batchSize, totalCount)}/${totalCount}...`);
    }

    console.log('\n========================================');
    console.log('📊 CHECK ALL IMAGES SUMMARY');
    console.log(`- Total: ${totalCount}`);
    console.log(`- Success: ${successCount}`);
    console.log(`- Failures: ${failCount}`);
    console.log('========================================');

    if (failures.length > 0) {
      console.log('\n❌ FIRST 10 FAILURES LOG:');
      console.table(failures.slice(0, 10));
    }
  } catch (err) {
    console.error('❌ Fatal error during check:', err);
  } finally {
    await pool.end();
  }
}

checkAllImages();
