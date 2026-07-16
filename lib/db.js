// Shared database connection for all API routes.
// Uses the DATABASE_URL environment variable, which you'll set in Vercel
// to your Neon connection string.
const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set.');
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

// Creates the kv_store table if it doesn't already exist. Safe to call on
// every request — CREATE TABLE IF NOT EXISTS is a no-op once it's there.
async function ensureSchema() {
  const p = getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS kv_store (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

module.exports = { getPool, ensureSchema };
