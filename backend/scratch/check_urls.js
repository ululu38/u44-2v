import pg from 'pg';

async function checkUrls() {
  const pool = new pg.Pool({
    connectionString: 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2',
  });

  try {
    const filename = '157-20250116-201216-3205-33bf457d-e8f6-4825-ad83-33391fa3a565';
    const dbRes = await pool.query('SELECT m.id, m.filename, m.url_full, m.url_thumb, m.url_mini, mb.data_mini IS NULL as no_mini_blob, mb.data_thumb IS NULL as no_thumb_blob, mb.data_full IS NULL as no_full_blob FROM media m LEFT JOIN media_blobs mb ON m.id = mb.id WHERE m.filename = $1 OR m.filename LIKE $2;', [filename, '%' + filename + '%']);
    console.log('📊 Query results for specific filename:');
    console.log(dbRes.rows);
  } catch (err) {
    console.error('❌ Error checking database:', err);
  } finally {
    await pool.end();
  }
}

checkUrls();
