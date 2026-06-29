import pg from 'pg';

async function test() {
  const pool = new pg.Pool({
    connectionString: 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2',
  });

  try {
    const res = await pool.query('SELECT * FROM media_blobs LIMIT 1;');
    console.log('Success!', res.rows);
  } catch (err) {
    console.error('ERROR OCCURRED:');
    console.error(err);
  } finally {
    await pool.end();
  }
}

test();
