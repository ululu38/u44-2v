import * as readline from 'readline';
import { Writable } from 'stream';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../infrastructure/db/schema';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

dotenv.config();

const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  gray: "\x1b[90m",
};

// Create a mutable stdout to hide password input
const mutableStdout = new Writable({
  write: function(chunk, encoding, callback) {
    if (!(this as any).muted)
      process.stdout.write(chunk, encoding);
    callback();
  }
});

const rl = readline.createInterface({
  input: process.stdin,
  output: mutableStdout,
  terminal: true
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    (mutableStdout as any).muted = false;
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    (mutableStdout as any).muted = false;
    rl.question(question, (answer) => {
      (mutableStdout as any).muted = false;
      console.log(); // Move to new line after hidden input
      resolve(answer);
    });
    (mutableStdout as any).muted = true;
  });
}

async function main() {
  console.log(`\n${colors.bold}${colors.cyan}==============================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}     U44 - Create New User    ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}==============================${colors.reset}\n`);
  
  console.log(`${colors.yellow}Select Role:${colors.reset}`);
  console.log(`  ${colors.bold}1.${colors.reset} admin`);
  console.log(`  ${colors.bold}2.${colors.reset} employee\n`);
  
  let roleChoice = '';
  while (roleChoice !== '1' && roleChoice !== '2') {
    roleChoice = await ask(`${colors.magenta}âžœ Enter choice (1 or 2): ${colors.reset}`);
  }
  const role = roleChoice === '1' ? 'admin' : 'employee';

  const username = await ask(`\n${colors.cyan}âžœ Username: ${colors.reset}`);
  const email = await ask(`${colors.cyan}âžœ Email ${colors.gray}(optional)${colors.cyan}: ${colors.reset}`);
  const password = await askHidden(`${colors.cyan}âžœ Password: ${colors.reset}`);

  if (!username || !password) {
    console.log(`\n${colors.red}â Œ Username and Password are required.${colors.reset}`);
    process.exit(1);
  }

  console.log(`\n${colors.yellow}â§³ Connecting to database...${colors.reset}`);
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2',
  });
  const db = drizzle(pool, { schema });

  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(schema.users.username, username)
    });
    
    if (existingUser) {
      console.error(`\n${colors.red}â Œ Error: User with username "${colors.bold}${username}${colors.reset}${colors.red}" already exists.${colors.reset}`);
      process.exit(1);
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '10', 10);
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const finalEmail = email.trim() || `${username}@u44tech.local`;

    await db.insert(schema.users).values({
      username,
      password: hashedPassword,
      email: finalEmail,
      role,
    });

    console.log(`\n${colors.green}âœ… User "${colors.bold}${username}${colors.reset}${colors.green}" created successfully with role "${colors.bold}${role}${colors.reset}${colors.green}"!${colors.reset}\n`);
  } catch (error) {
    console.error(`\n${colors.red}â Œ Failed to create user:${colors.reset}`, error);
  } finally {
    await pool.end();
    rl.close();
  }
}

main();
