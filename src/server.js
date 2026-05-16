// Multi-tenant entry point. One Express app handles three host shapes:
//   admin.<root>   -> admin SPA (served from admin/dist) + /api/* JSON API
//   <slug>.<root>  -> child portfolio render
//   <root>         -> apex landing (minimal placeholder)
//
// Tenant kind is decided per-request by middleware/subdomain.js. Auth is
// session-based with cookies scoped to admin.<root>.

const express = require('express');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const path = require('path');
const fs = require('fs');
const vary = require('vary');

const config = require('./config');
const { pool } = require('./db');
const { tenantMiddleware } = require('./middleware/subdomain');
const { adminOnly } = require('./middleware/auth');
const adminApi = require('./routes/admin-api');
const portfolioRouter = require('./routes/portfolio');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

// Vary on Host so caches (CDN, browser) don't mix tenants.
app.use((req, res, next) => { vary(res, 'Host'); next(); });

app.use(tenantMiddleware);

// Session — scoped to admin subdomain via cookie domain so portfolio
// pages never send admin cookies.
app.use(session({
  store: new PgSession({ pool, tableName: 'session' }),
  name: 'admin.sid',
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.env === 'production',
    maxAge: 1000 * 60 * 60 * 12, // 12h
    domain: config.sessionCookieDomain || undefined,
  },
}));

// Health check (any tenant).
app.get('/_health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// --- Admin API (only on admin.<root>) ---
app.use('/api', adminOnly, adminApi);

// --- Admin SPA (only on admin.<root>) ---
// Serve built assets and SPA-fallback. In dev (no build present), show a hint.
app.use((req, res, next) => {
  if (req.tenant.kind !== 'admin') return next();
  if (req.method !== 'GET') return next();

  const dist = config.adminDistDir;
  if (!fs.existsSync(dist)) {
    return res.status(503).type('html').send(adminUnbuiltHtml());
  }
  // static files
  if (req.path !== '/' && fs.existsSync(path.join(dist, req.path))) {
    return res.sendFile(path.join(dist, req.path));
  }
  // SPA fallback
  return res.sendFile(path.join(dist, 'index.html'));
});

// --- Apex landing ---
app.get('/', (req, res, next) => {
  if (req.tenant.kind !== 'apex') return next();
  res.type('html').send(apexHtml());
});

// --- Portfolio (child subdomains) ---
app.use((req, res, next) => {
  if (req.tenant.kind === 'child') return portfolioRouter(req, res, next);
  next();
});

// 404 fallback
app.use((req, res) => {
  res.status(404).type('html').send(`<!doctype html><meta charset="utf-8"><title>Not found</title>
    <body style="font-family:system-ui;display:grid;place-items:center;height:100vh;margin:0">
      <div><h1>Not found</h1><p>Host: ${req.tenant && req.tenant.host}</p></div>
    </body>`);
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'internal error' });
});

function apexHtml() {
  return `<!doctype html><meta charset="utf-8"><title>${config.rootDomain}</title>
  <body style="font-family:system-ui;display:grid;place-items:center;height:100vh;margin:0;background:#0b0f1e;color:#fffaf0">
    <div style="text-align:center">
      <div style="font-size:72px">📚</div>
      <h1 style="margin:8px 0">${config.rootDomain}</h1>
      <p style="opacity:.7">Each child has their own portfolio at <code>name.${config.rootDomain}</code>.</p>
    </div>
  </body>`;
}

function adminUnbuiltHtml() {
  return `<!doctype html><meta charset="utf-8"><title>Admin · not built</title>
  <body style="font-family:system-ui;padding:32px;max-width:640px;margin:auto">
    <h1>Admin UI not built</h1>
    <p>Run <code>npm run admin:build</code> to build the admin SPA, or
       <code>npm run admin:dev</code> to run Vite dev server on its own port.</p>
    <p>The REST API is live at <code>/api</code>.</p>
  </body>`;
}

app.listen(config.port, () => {
  console.log(`portfolio server on :${config.port}`);
  console.log(`  root domain: ${config.rootDomain}`);
  if (config.devForceSubdomain) console.log(`  dev shim sub: ${config.devForceSubdomain}`);
});
