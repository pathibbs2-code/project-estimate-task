// Key-value storage API — a drop-in replacement for Claude's window.storage
// feature, backed by a Neon Postgres database instead.
//
//   GET    /api/kv?key=X        -> { key, value } or null (404-style: {})
//   POST   /api/kv              -> body: { key, value }  -> upserts, returns { key, value }
//   DELETE /api/kv?key=X        -> deletes, returns { key, deleted: true }
//
// This intentionally mirrors window.storage's get/set/delete shape so the
// front-end code barely has to change — see /public/storage-shim.js.

const { getPool, ensureSchema } = require('../lib/db');

module.exports = async (req, res) => {
  // Allow the app to be hosted on any domain during setup/testing.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await ensureSchema();
    const pool = getPool();

    if (req.method === 'GET') {
      const key = req.query.key;
      if (!key) {
        res.status(400).json({ error: 'Missing key query param' });
        return;
      }
      const result = await pool.query('SELECT key, value FROM kv_store WHERE key = $1', [key]);
      if (result.rows.length === 0) {
        res.status(200).json(null);
        return;
      }
      res.status(200).json(result.rows[0]);
      return;
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { key, value } = body || {};
      if (!key) {
        res.status(400).json({ error: 'Missing key in request body' });
        return;
      }
      await pool.query(
        `INSERT INTO kv_store (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [key, value]
      );
      res.status(200).json({ key, value });
      return;
    }

    if (req.method === 'DELETE') {
      const key = req.query.key;
      if (!key) {
        res.status(400).json({ error: 'Missing key query param' });
        return;
      }
      await pool.query('DELETE FROM kv_store WHERE key = $1', [key]);
      res.status(200).json({ key, deleted: true });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('kv API error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
};
