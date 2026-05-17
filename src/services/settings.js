// app_settings access — key/value JSONB rows. Cached in-memory with a TTL
// so the hot path doesn't hit Postgres on every render.

const { pool } = require('../db');

const CACHE_TTL_MS = 30_000;
const cache = new Map(); // key -> { at, value }

async function get(key) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value;
  let value = null;
  try {
    const { rows } = await pool.query('SELECT value FROM app_settings WHERE key = $1', [key]);
    value = rows[0] ? rows[0].value : null;
  } catch (e) {
    // 42P01 = undefined_table — the migration hasn't been run yet. Don't
    // 500 the whole admin page; treat as "no stored config" so callers fall
    // back to defaults (e.g. env-var-only mode for ai-extract).
    if (e.code !== '42P01') throw e;
    console.warn('[settings] app_settings table missing — run `npm run migrate`. Falling back to env defaults.');
  }
  cache.set(key, { at: Date.now(), value });
  return value;
}

async function set(key, value) {
  await pool.query(
    `INSERT INTO app_settings (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [key, JSON.stringify(value)]
  );
  cache.delete(key);
}

async function clear(key) {
  await pool.query('DELETE FROM app_settings WHERE key = $1', [key]);
  cache.delete(key);
}

module.exports = { get, set, clear };
