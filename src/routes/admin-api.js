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
  res.json({ ok: true });
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
