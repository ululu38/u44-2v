import { createConnection } from 'mysql2/promise';

async function main() {
  const mysql = await createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'db_password',
    database: 'u44tech'
  });

  const [tables] = await mysql.query<any>('SHOW TABLES');
  console.log("MySQL tables:");
  console.log(JSON.stringify(tables, null, 2));

  process.exit(0);
}

main().catch(console.error);
