// GET /api/kv-list?prefix=X -> { keys: [...] }
const { getPool, ensureSchema } = require('../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    await ensureSchema();
    const pool = getPool();
    const prefix = req.query.prefix || '';
    const result = await pool.query('SELECT key FROM kv_store WHERE key LIKE $1', [prefix + '%']);
    res.status(200).json({ keys: result.rows.map((r) => r.key) });
  } catch (err) {
    console.error('kv-list API error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
};
