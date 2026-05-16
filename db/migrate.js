#!/usr/bin/env node
// Apply schema.sql, sync the on-disk theme registry into the themes table,
// and create a bootstrap admin if none exists. Idempotent — safe to re-run.

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool } = require('../src/db');
const { scanThemes } = require('../src/themes/registry');

async function main() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

  const client = await pool.connect();
  try {
    console.log('→ applying schema');
    await client.query(schema);

    console.log('→ syncing themes from filesystem');
    const themes = scanThemes();
    for (const t of themes) {
      await client.query(
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
      console.log(`  · ${t.slug} (${t.source})`);
    }

    const email = process.env.BOOTSTRAP_ADMIN_EMAIL || 'admin@rasikawan.com';
    const password = process.env.BOOTSTRAP_ADMIN_PASSWORD || 'changeme123';
    const existing = await client.query('SELECT id FROM admins WHERE email = $1', [email]);
    if (existing.rowCount === 0) {
      const hash = await bcrypt.hash(password, 12);
      await client.query(
        `INSERT INTO admins (email, password_hash, name) VALUES ($1,$2,$3)`,
        [email, hash, 'Bootstrap Admin']
      );
      console.log(`→ bootstrap admin created: ${email}  (password from env)`);
    } else {
      console.log(`→ admin already exists: ${email}`);
    }

    console.log('✓ migrate complete');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
