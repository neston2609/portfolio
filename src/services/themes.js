const { pool } = require('../db');
const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');
const config = require('../config');
const { scanThemes, getThemeBySlug } = require('../themes/registry');

async function listThemes() {
  const { rows } = await pool.query('SELECT * FROM themes ORDER BY name');
  return rows;
}

async function upsertTheme(t) {
  await pool.query(
    `INSERT INTO themes (slug, name, description, source, entry_file, manifest)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (slug) DO UPDATE
       SET name=EXCLUDED.name,
           description=EXCLUDED.description,
           source=EXCLUDED.source,
           entry_file=EXCLUDED.entry_file,
           manifest=EXCLUDED.manifest`,
    [t.slug, t.name, t.description, t.source, t.entry_file, t.manifest]
  );
}

async function reconcileFromDisk() {
  const themes = scanThemes();
  for (const t of themes) await upsertTheme(t);
  // remove DB rows for themes that no longer exist on disk
  const onDiskSlugs = new Set(themes.map((t) => t.slug));
  const { rows } = await pool.query('SELECT slug FROM themes');
  for (const r of rows) {
    if (!onDiskSlugs.has(r.slug)) {
      // don't delete a theme still referenced by a child
      const used = await pool.query('SELECT 1 FROM children WHERE theme_slug = $1 LIMIT 1', [r.slug]);
      if (used.rowCount === 0) {
        await pool.query('DELETE FROM themes WHERE slug = $1', [r.slug]);
      }
    }
  }
  return themes;
}

// Accept an uploaded ZIP buffer and extract it into themes/_uploaded/<slug>.
// The slug is taken from the manifest or filename. Returns the registered row.
async function installThemeFromZip({ slug, zipPath }) {
  if (!/^[a-z0-9][a-z0-9-]{1,30}$/.test(slug)) {
    throw new Error('invalid theme slug — use lowercase letters, digits, hyphens');
  }
  if (!fs.existsSync(config.uploadedThemesDir)) {
    fs.mkdirSync(config.uploadedThemesDir, { recursive: true });
  }
  const target = path.join(config.uploadedThemesDir, slug);
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
  fs.mkdirSync(target, { recursive: true });

  await new Promise((resolve, reject) => {
    fs.createReadStream(zipPath)
      .pipe(unzipper.Parse())
      .on('entry', (entry) => {
        // strip any single top-level directory in the ZIP so themes can be
        // exported from Claude Design without manual repackaging
        let rel = entry.path.replace(/^[^/]+\//, '');
        if (!rel || rel.endsWith('/')) { entry.autodrain(); return; }
        // block path traversal
        if (rel.includes('..')) { entry.autodrain(); return; }
        const out = path.join(target, rel);
        fs.mkdirSync(path.dirname(out), { recursive: true });
        if (entry.type === 'File') entry.pipe(fs.createWriteStream(out));
        else entry.autodrain();
      })
      .on('close', resolve)
      .on('error', reject);
  });

  const theme = getThemeBySlug(slug);
  if (!theme) throw new Error('uploaded theme missing index.html / manifest');
  await upsertTheme(theme);
  return theme;
}

async function deleteUploadedTheme(slug) {
  const used = await pool.query('SELECT 1 FROM children WHERE theme_slug = $1 LIMIT 1', [slug]);
  if (used.rowCount > 0) throw new Error('theme is in use by a child — reassign first');
  const dir = path.join(config.uploadedThemesDir, slug);
  if (!fs.existsSync(dir)) throw new Error('theme not found in _uploaded');
  fs.rmSync(dir, { recursive: true, force: true });
  await pool.query('DELETE FROM themes WHERE slug = $1 AND source = $2', [slug, 'uploaded']);
}

module.exports = { listThemes, reconcileFromDisk, installThemeFromZip, deleteUploadedTheme };
