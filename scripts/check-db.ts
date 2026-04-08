import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

// Extract base connection string (to postgres db)
const baseDbUrl = url.replace(/\/[^/]+\?/, '/postgres?');

const client = new Client({ connectionString: baseDbUrl });

async function check() {
  try {
    await client.connect();
    const res = await client.query('SELECT datname FROM pg_database');
    console.log('Databases:', res.rows.map(r => r.datname));
    await client.end();
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

check();
