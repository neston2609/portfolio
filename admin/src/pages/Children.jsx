import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { btn } from '../App.jsx';

export default function Children() {
  const [children, setChildren] = useState(null);
  const [themes, setThemes] = useState([]);
  const [showNew, setShowNew] = useState(false);

  async function refresh() {
    const [c, t] = await Promise.all([api.get('/children'), api.get('/themes')]);
    setChildren(c);
    setThemes(t);
  }
  useEffect(() => { refresh(); }, []);

  if (children === null) return <p>Loading…</p>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Children</h1>
        <button onClick={() => setShowNew((s) => !s)} style={btn('primary')}>
          {showNew ? 'Cancel' : '+ New child'}
        </button>
      </div>
      {showNew && <NewChild themes={themes} onCreated={() => { setShowNew(false); refresh(); }} />}
      {children.length === 0 ? (
        <p style={{ color: '#94a3b8', marginTop: 24 }}>No children yet — create one above.</p>
      ) : (
        <table style={tbl}>
          <thead>
            <tr>
              <th style={th}>Name</th>
              <th style={th}>Subdomain</th>
              <th style={th}>Theme</th>
              <th style={th}>Status</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {children.map((c) => (
              <tr key={c.id}>
                <td style={td}>
                  <div style={{ fontWeight: 600 }}>{c.firstname} {c.lastname || ''}</div>
                  {c.nickname && <div style={{ color: '#94a3b8', fontSize: 13 }}>“{c.nickname}”</div>}
                </td>
                <td style={td}><code>{c.firstname_slug}</code>.rasikawan.com</td>
                <td style={td}>{c.theme_name}</td>
                <td style={td}>
                  {c.is_published
                    ? <span style={badge('#10b981')}>Published</span>
                    : <span style={badge('#475569')}>Draft</span>}
                </td>
                <td style={{ ...td, textAlign: 'right' }}>
                  <Link to={`/children/${c.id}`} style={{ ...btn('ghost'), textDecoration: 'none' }}>Edit →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function NewChild({ themes, onCreated }) {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [nickname, setNickname] = useState('');
  const [slug, setSlug] = useState('');
  const [themeSlug, setThemeSlug] = useState(themes[0]?.slug || '');
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      const computedSlug = (slug || firstname).toLowerCase().replace(/[^a-z0-9-]/g, '');
      await api.post('/children', {
        firstname_slug: computedSlug,
        firstname, lastname, nickname,
        theme_slug: themeSlug,
      });
      onCreated();
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} style={{ marginTop: 18, padding: 18, background: '#111827', border: '1px solid #1f2937', borderRadius: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        <Field label="First name *"><input required value={firstname} onChange={(e) => setFirstname(e.target.value)} style={inp} /></Field>
        <Field label="Last name"><input value={lastname} onChange={(e) => setLastname(e.target.value)} style={inp} /></Field>
        <Field label="Nickname"><input value={nickname} onChange={(e) => setNickname(e.target.value)} style={inp} /></Field>
        <Field label="Subdomain (defaults to firstname, lowercase a-z 0-9 - only)">
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={firstname.toLowerCase()} style={inp} />
        </Field>
        <Field label="Theme">
          <select value={themeSlug} onChange={(e) => setThemeSlug(e.target.value)} style={inp}>
            {themes.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
          </select>
        </Field>
      </div>
      {err && <div style={{ color: '#fca5a5', marginTop: 10, fontSize: 13 }}>{err}</div>}
      <div style={{ marginTop: 14 }}>
        <button type="submit" disabled={busy} style={btn('primary')}>{busy ? 'Creating…' : 'Create child'}</button>
      </div>
    </form>
  );
}

function Field({ label, children }) {
  return <label style={{ display: 'grid', gap: 4, fontSize: 13, color: '#cbd5e1' }}>{label}{children}</label>;
}

const inp = {
  background: '#0b1220', color: '#fffaf0', border: '1px solid #334155',
  borderRadius: 6, padding: '8px 10px', fontSize: 14, fontFamily: 'inherit',
};
const tbl = { width: '100%', borderCollapse: 'collapse', marginTop: 24, background: '#111827', borderRadius: 8, overflow: 'hidden' };
const th = { textAlign: 'left', padding: '12px 14px', background: '#1f2937', fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em' };
const td = { padding: '14px', borderTop: '1px solid #1f2937', fontSize: 14 };
const badge = (bg) => ({ background: bg, color: '#0b0f1e', padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600 });
