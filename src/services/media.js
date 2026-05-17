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

// Walk any JSON value, collecting media IDs from /_media/<childId>/<mediaId>
// URLs. Used by the sweeper to find which uploads the saved portfolio still
// references — anything not in the result set is fair game to delete.
//
// The path component after the childId can be anything that isn't a path
// separator, whitespace, or query/fragment delimiter — we don't enforce a
// UUID shape so that a cache-busting suffix (?v=1), a future ID format
// change, or a stray newline can't accidentally leak files we shouldn't
// delete. The DB lookup in sweepOrphans validates against actual rows.
function collectMediaRefs(childId, value) {
  const ids = new Set();
  const safeChildId = String(childId).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`/_media/${safeChildId}/([^/\\s"'?#)]+)`, 'gi');
  (function walk(node) {
    if (node == null) return;
    if (typeof node === 'string') {
      let m;
      re.lastIndex = 0;
      while ((m = re.exec(node)) !== null) ids.add(m[1].toLowerCase());
      return;
    }
    if (Array.isArray(node)) { for (const v of node) walk(v); return; }
    if (typeof node === 'object') { for (const v of Object.values(node)) walk(v); }
  })(value);
  return ids;
}

// Delete any media rows + on-disk files for this child that are no longer
// referenced by either the portfolio data or the child's avatar. Returns
// the number of orphans removed. Safe to call after any operation that
// could orphan media: portfolio save, avatar removal, gallery item delete.
async function sweepOrphans(childId) {
  const child = await pool.query('SELECT avatar_media_id FROM children WHERE id = $1', [childId]);
  if (child.rowCount === 0) return 0;
  const portfolio = await pool.query('SELECT data FROM portfolios WHERE child_id = $1', [childId]);

  const referenced = collectMediaRefs(childId, portfolio.rows[0]?.data || {});
  if (child.rows[0].avatar_media_id) referenced.add(String(child.rows[0].avatar_media_id).toLowerCase());

  const all = await pool.query('SELECT id, filename, storage_path FROM media WHERE child_id = $1', [childId]);
  let removed = 0;
  for (const m of all.rows) {
    if (referenced.has(String(m.id).toLowerCase())) continue;
    try { fs.unlinkSync(m.storage_path); } catch (_) {}
    await pool.query('DELETE FROM media WHERE id = $1', [m.id]);
    console.log(`[media] swept orphan ${m.id} (${m.filename}) from child ${childId}`);
    removed++;
  }
  if (removed > 0) console.log(`[media] sweep complete for child ${childId}: ${removed} file(s) removed, ${referenced.size} kept`);
  return removed;
}

// Remove the entire child's media directory from disk. The matching DB rows
// are wiped by the children.id -> media.child_id ON DELETE CASCADE; this
// function only deals with the on-disk files so deleting a child doesn't
// leak the uploaded image / PDF bytes.
function removeChildDirectory(childId) {
  const dir = childMediaDir(childId);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

module.exports = { listMedia, storeMedia, getMediaForServe, deleteMedia, sweepOrphans, removeChildDirectory, collectMediaRefs };
