import pg from 'pg';

async function checkMissingMini() {
  console.log('🔍 Connecting to database to fetch media missing mini thumbnails...');
  const pool = new pg.Pool({
    connectionString: 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2',
  });

  try {
    const query = `
      SELECT m.id, m.filename, m.url_full, m.url_mini, mb.data_mini IS NULL as blob_mini_missing
      FROM media m
      LEFT JOIN media_blobs mb ON m.id = mb.id
      WHERE m.url_mini = '/images/fallback-mini.webp' OR mb.data_mini IS NULL;
    `;
    const dbRes = await pool.query(query);
    const missingCount = dbRes.rows.length;
    console.log(`📊 Found ${missingCount} media records missing mini thumbnails.`);

    if (missingCount > 0) {
      console.log('\n❌ MISSING MINI THUMBNAILS:');
      console.table(dbRes.rows.map(row => ({
        id: row.id,
        filename: row.filename,
        url_mini: row.url_mini,
        blob_missing: row.blob_mini_missing
      })));
    } else {
      console.log('✅ All media records have mini thumbnails generated!');
    }
  } catch (err) {
    console.error('❌ Error checking database:', err);
  } finally {
    await pool.end();
  }
}

checkMissingMini();
