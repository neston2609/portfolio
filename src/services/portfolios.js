const { pool } = require('../db');

async function getPortfolio(childId) {
  const { rows } = await pool.query(
    'SELECT data, updated_at FROM portfolios WHERE child_id = $1',
    [childId]
  );
  return rows[0] || null;
}

async function updatePortfolio(childId, data) {
  await pool.query(
    `INSERT INTO portfolios (child_id, data) VALUES ($1, $2)
     ON CONFLICT (child_id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
    [childId, JSON.stringify(data)]
  );
}

async function getVisibility(childId) {
  const { rows } = await pool.query(
    'SELECT section_key, visible FROM visibility_settings WHERE child_id = $1',
    [childId]
  );
  const map = {};
  for (const r of rows) map[r.section_key] = r.visible;
  return map;
}

async function setVisibility(childId, map) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM visibility_settings WHERE child_id = $1', [childId]);
    const keys = Object.keys(map || {});
    for (const k of keys) {
      await client.query(
        'INSERT INTO visibility_settings (child_id, section_key, visible) VALUES ($1,$2,$3)',
        [childId, k, !!map[k]]
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// Apply visibility to a portfolio blob before rendering. Sections marked
// visible=false are stripped. section_key supports dot paths
// (e.g. "social", "social.items[2]"). For v1 we support top-level section
// hide only (the common case from the design).
function applyVisibility(data, visibility) {
  if (!visibility) return data;
  const out = { ...data };
  for (const [key, visible] of Object.entries(visibility)) {
    if (visible) continue;
    if (key.includes('.')) continue; // nested not supported in v1
    delete out[key];
  }
  return out;
}

module.exports = { getPortfolio, updatePortfolio, getVisibility, setVisibility, applyVisibility };
