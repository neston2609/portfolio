const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { pool } = require('../db');
const config = require('../config');

function childMediaDir(childId) {
  return path.join(config.uploadDir, 'children', childId);
}

async function listMedia(childId) {
  const { rows } = await pool.query(
    'SELECT id, filename, mime_type, size_bytes, alt, created_at FROM media WHERE child_id = $1 ORDER BY created_at DESC',
    [childId]
  );
  return rows.map((m) => ({ ...m, url: `/_media/${childId}/${m.id}` }));
}

async function storeMedia(childId, file, alt) {
  const dir = childMediaDir(childId);
  fs.mkdirSync(dir, { recursive: true });
  const ext = path.extname(file.originalname).toLowerCase();
  const safeExt = /^\.[a-z0-9]{1,8}$/.test(ext) ? ext : '';
  const storedName = crypto.randomUUID() + safeExt;
  const storagePath = path.join(dir, storedName);
  fs.writeFileSync(storagePath, file.buffer);

  const { rows } = await pool.query(
    `INSERT INTO media (child_id, filename, mime_type, size_bytes, storage_path, alt)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING id, filename, mime_type, size_bytes, alt, created_at`,
    [childId, file.originalname, file.mimetype, file.size, storagePath, alt || null]
  );
  const m = rows[0];
  return { ...m, url: `/_media/${childId}/${m.id}` };
}

async function getMediaForServe(childId, mediaId) {
  const { rows } = await pool.query(
    'SELECT child_id, mime_type, storage_path, filename FROM media WHERE id = $1',
    [mediaId]
  );
  const m = rows[0];
  if (!m) return null;
  if (m.child_id !== childId) return null; // tenant isolation guard
  if (!fs.existsSync(m.storage_path)) return null;
  return m;
}

async function deleteMedia(childId, mediaId) {
  const { rows } = await pool.query(
    'SELECT storage_path FROM media WHERE id = $1 AND child_id = $2',
    [mediaId, childId]
  );
  if (rows.length === 0) return false;
  try { fs.unlinkSync(rows[0].storage_path); } catch (_) {}
  await pool.query('DELETE FROM media WHERE id = $1', [mediaId]);
  return true;
}

module.exports = { listMedia, storeMedia, getMediaForServe, deleteMedia };
