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
const socialIcons = require('../services/social-icons');
const youtube = require('../services/youtube');
const scratch = require('../services/scratch');
const { wrapRouter } = require('../utils/async-handler');

const router = wrapRouter(express.Router());

// Built-in icon library. Public, cacheable. Themes reference these by
// absolute path (/_assets/icons/<name>.svg) which is skipped by the
// renderer's relative-path rewriter.
router.get('/_assets/icons/:name', (req, res) => {
  const base = req.params.name.replace(/\.svg$/, '');
  const p = socialIcons.iconPath(base);
  if (!p) return res.status(404).send('not found');
  res.set('Cache-Control', 'public, max-age=86400');
  res.type('image/svg+xml');
  fs.createReadStream(p).pipe(res);
});

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

  // Enrich social items with a resolved icon URL so themes don't need any
  // detection logic. Custom uploads (icon_url) win; otherwise we auto-pick
  // a built-in by label/href; finally fall back to the generic link icon.
  enrichSocialIcons(data);

  // Live data sources. Both fall back transparently to admin-typed values
  // when the handle is missing or the API call fails. Cached in the service
  // so repeated renders are cheap. Run in parallel — they hit different hosts.
  await Promise.all([enrichYoutube(data), enrichScratch(data)]);

  const childMeta = buildMeta(child, data);
  const html = renderTheme(theme, {
    portfolioData: data,
    childMeta,
    assetBase: '/_theme-assets/',
  });
  res.type('html').send(html);
});

async function enrichYoutube(data) {
  if (!data.youtube || data.youtube.__hidden) return;
  const handle = data.youtube.channel?.handle;
  if (!handle) return;
  const maxVideos = Math.max(1, Math.min(50, Number(data.youtube.max_videos || 4)));
  const live = await youtube.fetchChannelData(handle, maxVideos);
  if (!live) return; // API not configured or call failed — keep admin values
  // Live fills defaults; admin's "(override live)" fields in the form win.
  // Without this, the admin URL/name/tagline silently revert on every render.
  const admin = data.youtube.channel || {};
  const merged = { ...live.channel };
  if (admin.url && admin.url !== '#') merged.url = admin.url;
  if (hasMultilang(admin.name))    merged.name = admin.name;
  if (hasMultilang(admin.tagline)) merged.tagline = admin.tagline;
  // handle, subs, videos, views: always trust live.
  data.youtube = {
    ...data.youtube,
    channel: merged,
    items: live.items,
    _live: true,
  };
}

// Does this multilang field carry an admin-supplied value? Empty
// {en:''} placeholders shouldn't override the live channel name.
function hasMultilang(field) {
  if (!field) return false;
  if (typeof field === 'string') return field.trim().length > 0;
  if (typeof field === 'object') return Object.values(field).some((v) => typeof v === 'string' && v.trim().length > 0);
  return false;
}

async function enrichScratch(data) {
  if (!data.scratch || data.scratch.__hidden) return;
  const handle = data.scratch.profile?.handle;
  if (!handle) return;
  const maxProjects = Math.max(1, Math.min(40, Number(data.scratch.max_projects || 4)));
  const live = await scratch.fetchScratchData(handle, maxProjects);
  if (!live) return;
  // Live fills in defaults; admin's explicit overrides win for fields the
  // admin can legitimately customize. Without this, the URL field in the
  // admin form would silently revert to `scratch.mit.edu/users/<handle>/`
  // on every render, defeating the field.
  const admin = data.scratch.profile || {};
  const merged = { ...live.profile };
  if (admin.url && admin.url !== '#') merged.url = admin.url;
  if (admin.bio) merged.bio = admin.bio;
  if (typeof admin.followers === 'number' && admin.followers > 0) merged.followers = admin.followers;
  // handle stays as the normalized live value (admin input may have @ or URL form);
  // projectsShared + joined are live-only facts.
  data.scratch = {
    ...data.scratch,
    profile: merged,
    items: live.items,
    _live: true,
  };
}

function enrichSocialIcons(data) {
  if (!data.social || !Array.isArray(data.social.items)) return;
  data.social.items = data.social.items.map((it) => {
    if (it.icon_url) return { ...it, _icon_resolved: it.icon_url };
    const platform = it.platform || socialIcons.detectPlatform(it.label, it.href);
    return { ...it, platform, _icon_resolved: `/_assets/icons/${platform}.svg` };
  });
}

function buildMeta(child, data) {
  // Themes read PORTFOLIO_DATA.meta for nav/hero info.
  const passthrough = (data && data.meta) || {};
  // Avatar URL is served from the child's own subdomain (tenant-isolated).
  const avatar_url = child.avatar_media_id
    ? `/_media/${child.id}/${child.avatar_media_id}`
    : null;
  // Age is computed from DOB if present. Otherwise fall back to a manually
  // entered age in the data blob (legacy data from before DOB existed).
  const computed_age = passthrough.dob ? ageFromDob(passthrough.dob) : null;
  return {
    name: passthrough.name || { en: `${child.firstname}${child.lastname ? ' ' + child.lastname : ''}` },
    nickname: passthrough.nickname || { en: child.nickname || child.firstname },
    role: passthrough.role,
    dob: passthrough.dob,
    age: computed_age != null ? computed_age : passthrough.age,
    grade: passthrough.grade,
    school: passthrough.school,
    location: passthrough.location,
    motto: passthrough.motto,
    hello: passthrough.hello || { en: 'Hi there!' },
    catch: passthrough.catch || { en: 'POW!' },
    available: passthrough.available,
    email: passthrough.email,
    avatar_url,
  };
}

// Compute current age in whole years from a YYYY-MM-DD birthday.
// Returns null for missing/unparseable input.
function ageFromDob(dob) {
  if (!dob || typeof dob !== 'string') return null;
  const m = dob.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const [, y, mo, d] = m;
  const birth = new Date(Number(y), Number(mo) - 1, Number(d));
  if (isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const beforeBirthday = now.getMonth() < birth.getMonth()
    || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
  if (beforeBirthday) age--;
  return age >= 0 ? age : null;
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
