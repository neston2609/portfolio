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
// visible=false get replaced with a safe stub (empty arrays / titles) AND
// flagged with __hidden:true. Themes guard each <section> on __hidden so
// hidden sections disappear entirely; the stub also keeps themes from
// crashing on access (`data.about.title` etc.) if a guard is missed.
function applyVisibility(data, visibility) {
  if (!visibility) return data;
  const out = { ...data };
  for (const [key, visible] of Object.entries(visibility)) {
    if (visible) continue;
    if (key.includes('.')) continue; // nested not supported in v1
    out[key] = stubFor(key);
  }
  return out;
}

// Section-shape stubs. Must include every nested field a theme might read.
// Keeping these aligned with services/children.defaultPortfolioData is the
// invariant: any new required field there needs a matching slot here.
function stubFor(key) {
  const empty = { en: '' };
  const base = { __hidden: true, title: empty };
  switch (key) {
    case 'about':        return { ...base, intro: empty, favorites: [] };
    case 'powers':       return { ...base, items: [] };
    case 'education':    return { ...base, items: [] };
    case 'projects':     return { ...base, items: [] };
    case 'youtube':      return { ...base, channel: { name: empty, handle: '', tagline: empty, subs: '0', videos: 0, views: '0', url: '#' }, items: [] };
    case 'scratch':      return { ...base, intro: empty, profile: { handle: '', followers: 0, projectsShared: 0, url: '#' }, items: [] };
    case 'gallery':      return { ...base, intro: empty, items: [] };
    case 'achievements': return base;
    case 'awards':       return { ...base, items: [] };
    case 'certificates': return { ...base, items: [], categories: [{ id: 'all', label: { en: 'All' } }] };
    case 'social':       return { ...base, items: [] };
    default:             return { ...base, items: [] };
  }
}

module.exports = { getPortfolio, updatePortfolio, getVisibility, setVisibility, applyVisibility };
