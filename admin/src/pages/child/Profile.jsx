// Profile sub-page — name, nickname, subdomain slug, theme, published flag.
// Saves via PATCH /api/children/:id (does NOT touch portfolio JSON).

import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { btn } from '../../App.jsx';
import { Panel, Field, inp } from './_shared.jsx';

export default function Profile() {
  const { child, themes, saveProfile } = useOutletContext();
  const [firstname, setFirstname] = useState(child.firstname);
  const [lastname, setLastname] = useState(child.lastname || '');
  const [nickname, setNickname] = useState(child.nickname || '');
  const [slug, setSlug] = useState(child.firstname_slug);
  const [themeSlug, setThemeSlug] = useState(child.theme_slug);
  const [isPublished, setIsPublished] = useState(child.is_published);
  const [err, setErr] = useState(null);
  const [savedAt, setSavedAt] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      await saveProfile({
        firstname, lastname, nickname,
        firstname_slug: slug, theme_slug: themeSlug, is_published: isPublished,
      });
      setSavedAt(new Date());
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <Panel title="Profile" subtitle="Identity, subdomain, and theme assignment for this child.">
      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        <Field label="First name"><input value={firstname} onChange={(e) => setFirstname(e.target.value)} style={inp} /></Field>
        <Field label="Last name"><input value={lastname} onChange={(e) => setLastname(e.target.value)} style={inp} /></Field>
        <Field label="Nickname"><input value={nickname} onChange={(e) => setNickname(e.target.value)} style={inp} /></Field>
        <Field label="Subdomain"><input value={slug} onChange={(e) => setSlug(e.target.value)} style={inp} /></Field>
        <Field label="Theme">
          <select value={themeSlug} onChange={(e) => setThemeSlug(e.target.value)} style={inp}>
            {themes.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
            <span>Published (visible at <code>{slug}.rasikawan.com</code>)</span>
          </label>
        </Field>
        {err && <div style={{ gridColumn: '1 / -1', color: '#fca5a5', fontSize: 13 }}>{err}</div>}
        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="submit" disabled={busy} style={btn('primary')}>{busy ? 'Saving…' : 'Save profile'}</button>
          {savedAt && <span style={{ color: '#94a3b8', fontSize: 13 }}>Saved {savedAt.toLocaleTimeString()}</span>}
        </div>
      </form>
    </Panel>
  );
}
