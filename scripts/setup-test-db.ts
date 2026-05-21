import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL not found in .env');
  process.exit(1);
}

// target test db name
const TEST_DB_NAME = 'nextore_test';

// Extract base connection string (to default postgres db)
// Replace the database name in the URL with 'postgres'
const baseDbUrl = url.replace(/\/[^/]+\?/, '/postgres?');

async function setup() {
  const client = new Client({ connectionString: baseDbUrl });

  try {
    console.log('Connecting to PostgreSQL...');
    await client.connect();

    // Check if test db exists
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${TEST_DB_NAME}'`);
    
    if (res.rowCount === 0) {
      console.log(`Creating database "${TEST_DB_NAME}"...`);
      await client.query(`CREATE DATABASE ${TEST_DB_NAME}`);
      console.log('Database created successfully.');
    } else {
      console.log(`Database "${TEST_DB_NAME}" already exists.`);
    }

    await client.end();

    // Now run prisma db push using the test database URL
    const testDbUrl = (url as string).replace(/\/[^/]+\?/, `/${TEST_DB_NAME}?`);
    console.log('Syncing Prisma schema to test database...');
    
    // We use DATABASE_URL env override for this command
    execSync(`DATABASE_URL="${testDbUrl}" npx prisma db push --accept-data-loss`, { stdio: 'inherit' });
    
    console.log('Test database setup complete! Ready to run tests.');
  } catch (err) {
    console.error('Setup failed:', err);
    process.exit(1);
  }
}

setup();
