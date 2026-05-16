import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { btn } from '../App.jsx';

export default function Themes() {
  const [themes, setThemes] = useState(null);
  const [slug, setSlug] = useState('');
  const [file, setFile] = useState(null);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  async function refresh() { setThemes(await api.get('/themes')); }
  useEffect(() => { refresh(); }, []);

  async function upload(e) {
    e.preventDefault();
    if (!file || !slug) return;
    setBusy(true); setErr(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('slug', slug);
      await api.post('/themes/upload', fd);
      setFile(null); setSlug('');
      await refresh();
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  async function destroy(s) {
    if (!confirm(`Delete uploaded theme "${s}"? (Built-in themes can't be deleted.)`)) return;
    try { await api.delete(`/themes/${s}`); await refresh(); }
    catch (e) { alert(e.message); }
  }

  if (themes === null) return <p>Loading…</p>;

  return (
    <div>
      <h1 style={{ margin: 0 }}>Themes</h1>
      <p style={{ color: '#94a3b8' }}>
        Themes are uploaded as ZIPs (from Claude Design or any compatible export). Each must contain an
        <code> index.html</code> with a <code>{`<!--PORTFOLIO_DATA-->`}</code> placeholder, plus its JSX/CSS assets.
      </p>

      <section style={{ marginTop: 18, padding: 18, background: '#111827', border: '1px solid #1f2937', borderRadius: 8 }}>
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Upload a new theme</h2>
        <form onSubmit={upload} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 10, alignItems: 'center' }}>
          <input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                 placeholder="slug (e.g. neon-arcade)" style={inp} />
          <input type="file" accept=".zip,application/zip" onChange={(e) => setFile(e.target.files?.[0] || null)} style={inp} />
          <button type="submit" disabled={busy || !slug || !file} style={btn('primary')}>{busy ? 'Uploading…' : 'Upload'}</button>
        </form>
        {err && <div style={{ color: '#fca5a5', marginTop: 8, fontSize: 13 }}>{err}</div>}
      </section>

      <table style={tbl}>
        <thead>
          <tr>
            <th style={th}>Slug</th>
            <th style={th}>Name</th>
            <th style={th}>Source</th>
            <th style={th}>Description</th>
            <th style={th}></th>
          </tr>
        </thead>
        <tbody>
          {themes.map((t) => (
            <tr key={t.slug}>
              <td style={td}><code>{t.slug}</code></td>
              <td style={td}>{t.name}</td>
              <td style={td}>
                {t.source === 'builtin'
                  ? <span style={badge('#475569')}>Built-in</span>
                  : <span style={badge('#fbbf24', '#1a1a1a')}>Uploaded</span>}
              </td>
              <td style={{ ...td, color: '#94a3b8', maxWidth: 380 }}>{t.description}</td>
              <td style={{ ...td, textAlign: 'right' }}>
                {t.source === 'uploaded' &&
                  <button onClick={() => destroy(t.slug)} style={{ ...btn('ghost'), color: '#fca5a5' }}>Delete</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const inp = { background: '#0b1220', color: '#fffaf0', border: '1px solid #334155', borderRadius: 6, padding: '8px 10px', fontSize: 14, fontFamily: 'inherit' };
const tbl = { width: '100%', borderCollapse: 'collapse', marginTop: 24, background: '#111827', borderRadius: 8, overflow: 'hidden' };
const th = { textAlign: 'left', padding: '12px 14px', background: '#1f2937', fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em' };
const td = { padding: '14px', borderTop: '1px solid #1f2937', fontSize: 14 };
const badge = (bg, fg = '#fffaf0') => ({ background: bg, color: fg, padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600 });
