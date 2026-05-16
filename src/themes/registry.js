// Theme registry. A theme is a directory containing a manifest.json (or just
// an index.html) plus its assets. We scan two locations:
//   src/themes/<slug>/              -> source = 'builtin'
//   src/themes/_uploaded/<slug>/    -> source = 'uploaded'
// Scans are done on-demand (not at boot) so an admin upload is immediately
// visible to the next request.

const fs = require('fs');
const path = require('path');
const config = require('../config');

const BUILTIN_IGNORE = new Set(['_uploaded']);

function readManifest(themeDir) {
  const manifestPath = path.join(themeDir, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    try { return JSON.parse(fs.readFileSync(manifestPath, 'utf8')); }
    catch (e) { return {}; }
  }
  return {};
}

function describe(slug, themeDir, source) {
  const manifest = readManifest(themeDir);
  const entry = manifest.entry || 'index.html';
  if (!fs.existsSync(path.join(themeDir, entry))) return null;
  return {
    slug,
    name: manifest.name || slug,
    description: manifest.description || '',
    entry_file: entry,
    source,
    manifest,
    dir: themeDir,
  };
}

function scanDir(parent, source) {
  if (!fs.existsSync(parent)) return [];
  return fs.readdirSync(parent)
    .filter((d) => !d.startsWith('.') && !d.startsWith('_'))
    .map((d) => {
      if (source === 'builtin' && BUILTIN_IGNORE.has(d)) return null;
      const full = path.join(parent, d);
      if (!fs.statSync(full).isDirectory()) return null;
      return describe(d, full, source);
    })
    .filter(Boolean);
}

function scanThemes() {
  const builtin = scanDir(config.themesDir, 'builtin');
  const uploaded = scanDir(config.uploadedThemesDir, 'uploaded');
  // uploaded slugs shadow builtins of the same name
  const map = new Map();
  for (const t of builtin) map.set(t.slug, t);
  for (const t of uploaded) map.set(t.slug, t);
  return [...map.values()].sort((a, b) => a.slug.localeCompare(b.slug));
}

function getThemeBySlug(slug) {
  // Prefer uploaded over builtin if collision
  const uploadedDir = path.join(config.uploadedThemesDir, slug);
  if (fs.existsSync(uploadedDir) && fs.statSync(uploadedDir).isDirectory()) {
    const t = describe(slug, uploadedDir, 'uploaded');
    if (t) return t;
  }
  const builtinDir = path.join(config.themesDir, slug);
  if (BUILTIN_IGNORE.has(slug)) return null;
  if (fs.existsSync(builtinDir) && fs.statSync(builtinDir).isDirectory()) {
    return describe(slug, builtinDir, 'builtin');
  }
  return null;
}

// Safely resolve <themeDir>/<relPath> blocking path traversal. Returns null
// if the resolved path escapes the theme dir or doesn't exist.
function resolveAsset(theme, relPath) {
  const target = path.resolve(theme.dir, relPath);
  const rel = path.relative(theme.dir, target);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) return null;
  return target;
}

module.exports = { scanThemes, getThemeBySlug, resolveAsset };
