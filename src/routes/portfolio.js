// Public portfolio routes. Mounted as the catch-all for child subdomains.
// Renders the assigned theme with the child's data injected.

const express = require('express');
const fs = require('fs');
const mime = require('path');
const { getThemeBySlug, resolveAsset } = require('../themes/registry');
const { renderTheme } = require('../themes/render');
const children = require('../services/children');
const portfolios = require('../services/portfolios');
const media = require('../services/media');
const { wrapRouter } = require('../utils/async-handler');

const router = wrapRouter(express.Router());

// Serve a theme asset (jsx/js/css/img) under the current child's subdomain.
// Path: /_theme-assets/<file>. We resolve under the child's assigned theme dir.
router.get('/_theme-assets/*', async (req, res) => {
  const child = req.tenant.kind === 'child' ? await children.getChildBySubdomain(req.tenant.sub) : null;
  if (!child) return res.status(404).send('not found');
  const theme = getThemeBySlug(child.theme_slug);
  if (!theme) return res.status(404).send('theme missing');
  const rel = req.params[0];
  const asset = resolveAsset(theme, rel);
  if (!asset) return res.status(404).send('not found');
  res.type(guessType(asset));
  fs.createReadStream(asset).pipe(res);
});

// Serve child media. Tenant-isolated: only the child whose subdomain matches
// can access their own media. We don't expose other children's media here.
router.get('/_media/:childId/:mediaId', async (req, res) => {
  const child = req.tenant.kind === 'child' ? await children.getChildBySubdomain(req.tenant.sub) : null;
  if (!child || child.id !== req.params.childId) return res.status(404).send('not found');
  const m = await media.getMediaForServe(req.params.childId, req.params.mediaId);
  if (!m) return res.status(404).send('not found');
  res.type(m.mime_type);
  fs.createReadStream(m.storage_path).pipe(res);
});

// Catch-all: render the portfolio page.
router.get('*', async (req, res) => {
  if (req.tenant.kind !== 'child') return res.status(404).send('not found');
  const child = await children.getChildBySubdomain(req.tenant.sub);
  if (!child) {
    return res.status(404).type('html').send(notFoundHtml(req.tenant.sub));
  }
  const theme = getThemeBySlug(child.theme_slug);
  if (!theme) return res.status(500).send('configured theme missing on disk');

  const p = await portfolios.getPortfolio(child.id);
  const v = await portfolios.getVisibility(child.id);
  const data = portfolios.applyVisibility(p ? p.data : {}, v);

  const childMeta = buildMeta(child, data);
  const html = renderTheme(theme, {
    portfolioData: data,
    childMeta,
    assetBase: '/_theme-assets/',
  });
  res.type('html').send(html);
});

function buildMeta(child, data) {
  // Themes read PORTFOLIO_DATA.meta for nav/hero info.
  const passthrough = (data && data.meta) || {};
  return {
    name: passthrough.name || { en: `${child.firstname}${child.lastname ? ' ' + child.lastname : ''}` },
    nickname: passthrough.nickname || { en: child.nickname || child.firstname },
    role: passthrough.role,
    age: passthrough.age,
    grade: passthrough.grade,
    school: passthrough.school,
    location: passthrough.location,
    motto: passthrough.motto,
    hello: passthrough.hello || { en: 'Hi there!' },
    catch: passthrough.catch || { en: 'POW!' },
    available: passthrough.available,
    email: passthrough.email,
  };
}

function guessType(p) {
  const ext = p.split('.').pop().toLowerCase();
  switch (ext) {
    case 'html': return 'text/html';
    case 'js': case 'jsx': return 'application/javascript';
    case 'css': return 'text/css';
    case 'json': return 'application/json';
    case 'svg': return 'image/svg+xml';
    case 'png': return 'image/png';
    case 'jpg': case 'jpeg': return 'image/jpeg';
    case 'webp': return 'image/webp';
    case 'gif': return 'image/gif';
    case 'woff': return 'font/woff';
    case 'woff2': return 'font/woff2';
    default: return 'application/octet-stream';
  }
}

function notFoundHtml(sub) {
  return `<!doctype html><meta charset="utf-8"><title>Not found</title>
  <body style="font-family:system-ui;display:grid;place-items:center;height:100vh;margin:0;background:#0b0f1e;color:#fffaf0">
    <div style="text-align:center">
      <div style="font-size:96px">🔍</div>
      <h1 style="margin:8px 0">No portfolio at ${sub}</h1>
      <p style="opacity:.7">There's no published child portfolio at this subdomain.</p>
    </div>
  </body>`;
}

module.exports = router;
