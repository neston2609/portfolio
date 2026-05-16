const { pool } = require('../db');

async function listChildren() {
  const { rows } = await pool.query(
    `SELECT c.*, t.name AS theme_name
       FROM children c
       JOIN themes t ON t.slug = c.theme_slug
       ORDER BY c.created_at DESC`
  );
  return rows;
}

async function getChildById(id) {
  const { rows } = await pool.query('SELECT * FROM children WHERE id = $1', [id]);
  return rows[0] || null;
}

async function getChildBySubdomain(slug) {
  const { rows } = await pool.query(
    'SELECT * FROM children WHERE firstname_slug = $1 AND is_published = true',
    [slug]
  );
  return rows[0] || null;
}

async function createChild({ firstname_slug, firstname, lastname, nickname, theme_slug, is_published }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO children (firstname_slug, firstname, lastname, nickname, theme_slug, is_published)
       VALUES ($1,$2,$3,$4,$5, COALESCE($6,true))
       RETURNING *`,
      [firstname_slug, firstname, lastname || null, nickname || null, theme_slug, is_published]
    );
    const child = rows[0];
    // Seed an empty portfolio row so editor has something to update.
    await client.query(
      'INSERT INTO portfolios (child_id, data) VALUES ($1, $2)',
      [child.id, JSON.stringify(defaultPortfolioData(firstname, nickname))]
    );
    await client.query('COMMIT');
    return child;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function updateChild(id, patch) {
  const allowed = ['firstname_slug', 'firstname', 'lastname', 'nickname', 'theme_slug', 'is_published', 'avatar_media_id'];
  const sets = [];
  const vals = [];
  let i = 1;
  for (const k of allowed) {
    if (patch[k] !== undefined) {
      sets.push(`${k} = $${i++}`);
      vals.push(patch[k]);
    }
  }
  if (sets.length === 0) return getChildById(id);
  vals.push(id);
  const { rows } = await pool.query(
    `UPDATE children SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
    vals
  );
  return rows[0] || null;
}

async function deleteChild(id) {
  await pool.query('DELETE FROM children WHERE id = $1', [id]);
}

// Minimal scaffold so a new child renders without errors. Mirrors data.js
// from the design but keeps multilang shape ({en} only for v1).
function defaultPortfolioData(firstname, nickname) {
  const nick = nickname || firstname;
  return {
    about: {
      title: { en: 'About Me' },
      intro: { en: `Hi! I'm ${nick}.` },
      favorites: [],
    },
    powers: { title: { en: 'Superpowers' }, items: [] },
    education: { title: { en: 'School' }, items: [] },
    projects: { title: { en: 'My Quests' }, items: [] },
    youtube: {
      title: { en: 'My YouTube Channel' },
      channel: { name: { en: '' }, handle: '', tagline: { en: '' }, subs: '0', videos: 0, views: '0', url: '#' },
      items: [],
    },
    scratch: {
      title: { en: 'My Scratch Projects' },
      intro: { en: '' },
      profile: { handle: '', followers: 0, projectsShared: 0, url: '#' },
      items: [],
    },
    gallery: { title: { en: 'Gallery' }, intro: { en: '' }, items: [] },
    achievements: { title: { en: 'Achievements' } },
    awards: { title: { en: 'Trophies' }, items: [] },
    certificates: {
      title: { en: 'Certificates' },
      items: [],
      categories: [{ id: 'all', label: { en: 'All' } }],
    },
    social: { title: { en: 'Send me a message' }, items: [] },
  };
}

module.exports = {
  listChildren, getChildById, getChildBySubdomain,
  createChild, updateChild, deleteChild,
  defaultPortfolioData,
};
