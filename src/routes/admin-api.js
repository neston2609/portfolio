// REST API for the admin panel. Mounted under /api on admin.<root> only.
// Auth is session-based; all routes except /auth/* require an active session.

const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { pool } = require('../db');
const config = require('../config');
const { requireAdmin } = require('../middleware/auth');
const children = require('../services/children');
const portfolios = require('../services/portfolios');
const themes = require('../services/themes');
const media = require('../services/media');
const aiExtract = require('../services/ai-extract');
const gallery = require('../services/gallery');
const { wrapRouter } = require('../utils/async-handler');

const router = wrapRouter(express.Router());
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxUploadBytes },
});

// --- Auth ----------------------------------------------------------------

router.post('/auth/login', express.json(), async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const { rows } = await pool.query('SELECT id, email, password_hash, name FROM admins WHERE email = $1', [email.toLowerCase()]);
  const a = rows[0];
  if (!a) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, a.password_hash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  req.session.adminId = a.id;
  req.session.email = a.email;
  res.json({ id: a.id, email: a.email, name: a.name });
});

router.post('/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get('/auth/me', (req, res) => {
  if (!req.session || !req.session.adminId) return res.status(401).json({ error: 'unauthorized' });
  res.json({ id: req.session.adminId, email: req.session.email });
});

// All routes below require auth.
router.use(requireAdmin);

// --- Account -------------------------------------------------------------

router.post('/auth/change-password', express.json(), async (req, res) => {
  const { current_password, new_password } = req.body || {};
  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'current_password and new_password required' });
  }
  if (new_password.length < 8) {
    return res.status(400).json({ error: 'new password must be at least 8 characters' });
  }
  if (current_password === new_password) {
    return res.status(400).json({ error: 'new password must differ from current' });
  }
  const { rows } = await pool.query(
    'SELECT password_hash FROM admins WHERE id = $1',
    [req.session.adminId]
  );
  const admin = rows[0];
  if (!admin) return res.status(404).json({ error: 'admin not found' });

  const ok = await bcrypt.compare(current_password, admin.password_hash);
  if (!ok) return res.status(401).json({ error: 'current password is incorrect' });

  const newHash = await bcrypt.hash(new_password, 12);
  await pool.query(
    'UPDATE admins SET password_hash = $1 WHERE id = $2',
    [newHash, req.session.adminId]
  );
  res.json({ ok: true });
});

// --- Children ------------------------------------------------------------

router.get('/children', async (_req, res) => {
  res.json(await children.listChildren());
});

router.post('/children', express.json(), async (req, res) => {
  try {
    const c = await children.createChild(req.body || {});
    res.status(201).json(c);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/children/:id', async (req, res) => {
  const c = await children.getChildById(req.params.id);
  if (!c) return res.status(404).json({ error: 'not found' });
  res.json(c);
});

router.patch('/children/:id', express.json(), async (req, res) => {
  try {
    const c = await children.updateChild(req.params.id, req.body || {});
    if (!c) return res.status(404).json({ error: 'not found' });
    res.json(c);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/children/:id', async (req, res) => {
  // ON DELETE CASCADE wipes media rows; remove the on-disk directory too.
  media.removeChildDirectory(req.params.id);
  await children.deleteChild(req.params.id);
  res.json({ ok: true });
});

// --- Portfolio content ---------------------------------------------------

router.get('/children/:id/portfolio', async (req, res) => {
  const c = await children.getChildById(req.params.id);
  if (!c) return res.status(404).json({ error: 'not found' });
  const p = await portfolios.getPortfolio(c.id);
  const v = await portfolios.getVisibility(c.id);
  res.json({ data: p ? p.data : {}, visibility: v, updated_at: p ? p.updated_at : null });
});

router.put('/children/:id/portfolio', express.json({ limit: '2mb' }), async (req, res) => {
  const c = await children.getChildById(req.params.id);
  if (!c) return res.status(404).json({ error: 'not found' });
  const { data, visibility } = req.body || {};
  if (data === undefined) return res.status(400).json({ error: 'data required' });
  await portfolios.updatePortfolio(c.id, data);
  if (visibility) await portfolios.setVisibility(c.id, visibility);
  // Anything the saved portfolio no longer references (a removed gallery
  // photo, swapped-out award scan, deleted social icon, etc.) is fair game
  // to clean up. Runs after the save so the new data is authoritative.
  const removed = await media.sweepOrphans(c.id);
  res.json({ ok: true, orphans_removed: removed });
});

// --- Media ---------------------------------------------------------------

router.get('/children/:id/media', async (req, res) => {
  const c = await children.getChildById(req.params.id);
  if (!c) return res.status(404).json({ error: 'not found' });
  res.json(await media.listMedia(c.id));
});

router.post('/children/:id/media', upload.single('file'), async (req, res) => {
  const c = await children.getChildById(req.params.id);
  if (!c) return res.status(404).json({ error: 'not found' });
  if (!req.file) return res.status(400).json({ error: 'file required' });
  const m = await media.storeMedia(c.id, req.file, req.body.alt);
  res.status(201).json(m);
});

router.delete('/children/:id/media/:mediaId', async (req, res) => {
  const ok = await media.deleteMedia(req.params.id, req.params.mediaId);
  if (!ok) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
});

// Bulk-import gallery photos from a ZIP archive. Returns item shapes for
// the admin to merge into its form state — saving the portfolio is what
// actually persists the new gallery items. Media rows are created up-front;
// abandoned imports are cleaned up by sweepOrphans on the next save.
router.post('/children/:id/gallery/import-zip', upload.single('file'), async (req, res) => {
  const c = await children.getChildById(req.params.id);
  if (!c) return res.status(404).json({ error: 'not found' });
  if (!req.file) return res.status(400).json({ error: 'file required (zip)' });
  if (!/zip/i.test(req.file.mimetype) && !/\.zip$/i.test(req.file.originalname || '')) {
    return res.status(400).json({ error: 'expected a .zip file' });
  }

  const tmpPath = require('path').join(require('os').tmpdir(), `gallery-${Date.now()}.zip`);
  require('fs').writeFileSync(tmpPath, req.file.buffer);
  try {
    const result = await gallery.importGalleryZip(c.id, tmpPath);
    res.status(201).json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  } finally {
    try { require('fs').unlinkSync(tmpPath); } catch (_) {}
  }
});

// --- Avatar (the child's main profile photo) -----------------------------
// Uploads a file as media AND sets it as the child's avatar in one call.
// Image-only — the themes treat it as <img> in the hero/nav.
router.post('/children/:id/avatar', upload.single('file'), async (req, res) => {
  const c = await children.getChildById(req.params.id);
  if (!c) return res.status(404).json({ error: 'not found' });
  if (!req.file) return res.status(400).json({ error: 'file required' });
  if (!req.file.mimetype.startsWith('image/')) {
    return res.status(400).json({ error: 'avatar must be an image' });
  }
  const m = await media.storeMedia(c.id, req.file, req.body.alt || 'avatar');
  const updated = await children.updateChild(c.id, { avatar_media_id: m.id });
  res.status(201).json({ child: updated, media: m });
});

router.delete('/children/:id/avatar', async (req, res) => {
  const c = await children.getChildById(req.params.id);
  if (!c) return res.status(404).json({ error: 'not found' });
  const updated = await children.updateChild(c.id, { avatar_media_id: null });
  // Removing the avatar may have orphaned the media file (if nothing in
  // the portfolio references the same URL). Sweep it.
  await media.sweepOrphans(c.id);
  res.json({ child: updated });
});

// --- AI extraction (Anthropic API) ---------------------------------------
// Extract award / certificate metadata from a previously-uploaded media
// file. Body: { file_url: "/_media/<childId>/<mediaId>" }. Returns the
// extracted fields, or 400 with `ai_unavailable` if no ANTHROPIC_API_KEY.

router.get('/ai/status', async (_req, res) => {
  res.json(await aiExtract.publicStatus());
});

router.put('/ai/settings', express.json(), async (req, res) => {
  try {
    const next = await aiExtract.saveConfig(req.body || {});
    res.json(next);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/ai/settings', async (_req, res) => {
  res.json(await aiExtract.clearConfig());
});

router.post('/children/:id/extract-from-file', express.json(), async (req, res) => {
  if (!(await aiExtract.isAvailable())) {
    return res.status(400).json({ error: 'ai_unavailable', message: 'No GenAI provider is configured. Set one up in Admin → GenAI.' });
  }
  const c = await children.getChildById(req.params.id);
  if (!c) return res.status(404).json({ error: 'not found' });

  const { file_url } = req.body || {};
  if (!file_url) return res.status(400).json({ error: 'file_url required' });

  const m = String(file_url).match(/^\/_media\/[^/]+\/([0-9a-f-]{36})$/i);
  if (!m) return res.status(400).json({ error: 'invalid media URL' });

  const mediaRecord = await media.getMediaForServe(c.id, m[1]);
  if (!mediaRecord) return res.status(404).json({ error: 'media not found' });

  const extracted = await aiExtract.extractAwardData(mediaRecord.storage_path, mediaRecord.mime_type);
  if (!extracted) {
    return res.status(502).json({ error: 'extraction_failed', message: 'Claude could not extract metadata from this file' });
  }
  res.json(extracted);
});

// --- Themes --------------------------------------------------------------

router.get('/themes', async (_req, res) => {
  // Reconcile on read so newly-dropped folders show up without a server restart.
  await themes.reconcileFromDisk();
  res.json(await themes.listThemes());
});

router.post('/themes/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'file required (zip)' });
  const slug = (req.body.slug || '').toLowerCase();
  // multer memory storage gives us a buffer; unzipper wants a path. Write temp.
  const tmpDir = require('os').tmpdir();
  const tmpPath = require('path').join(tmpDir, `theme-${Date.now()}.zip`);
  require('fs').writeFileSync(tmpPath, req.file.buffer);
  try {
    const t = await themes.installThemeFromZip({ slug, zipPath: tmpPath });
    res.status(201).json(t);
  } catch (e) {
    res.status(400).json({ error: e.message });
  } finally {
    try { require('fs').unlinkSync(tmpPath); } catch (_) {}
  }
});

router.delete('/themes/:slug', async (req, res) => {
  try {
    await themes.deleteUploadedTheme(req.params.slug);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
