const { Client } = require('pg');

async function checkSchema() {
  const client = new Client({
    connectionString: 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2'
  });

  try {
    await client.connect();
    console.log("✅ Connected to DB");

    const query = `
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      ORDER BY table_name, ordinal_position;
    `;
    const res = await client.query(query);

    let currentTable = '';
    for (const row of res.rows) {
      if (currentTable !== row.table_name) {
        currentTable = row.table_name;
        console.log(`\n📦 TABLE: ${currentTable}`);
      }
      console.log(`  - ${row.column_name} (${row.data_type})`);
    }

  } catch (error) {
    console.error("❌ DB Error:", error);
  } finally {
    await client.end();
  }
}

checkSchema();
