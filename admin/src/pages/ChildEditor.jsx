import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { btn } from '../App.jsx';
import PortfolioForm from '../components/PortfolioForm.jsx';

// Editor mounts five panels:
//   Profile (slug/name/theme/published) | Portfolio JSON | Visibility | Media | Danger zone
// Portfolio data is JSON-edited for v1. The schema mirrors the data.js shape
// from the design — a structured form per-section would be the next iteration.

const SECTIONS = [
  ['about', 'About'],
  ['powers', 'Powers / Skills'],
  ['education', 'Education'],
  ['projects', 'Projects / Quests'],
  ['youtube', 'YouTube'],
  ['scratch', 'Scratch'],
  ['gallery', 'Gallery'],
  ['achievements', 'Achievements'],
  ['awards', 'Awards / Trophies'],
  ['certificates', 'Certificates'],
  ['social', 'Social / Contact'],
];

export default function ChildEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const [child, setChild] = useState(null);
  const [themes, setThemes] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [visibility, setVisibility] = useState({});
  const [media, setMedia] = useState([]);
  const [editMode, setEditMode] = useState('form'); // 'form' | 'json'
  const [dataObj, setDataObj] = useState({});       // source of truth in form mode
  const [dataText, setDataText] = useState('');     // source of truth in json mode
  const [dataErr, setDataErr] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  async function loadAll() {
    const [c, t, p, m] = await Promise.all([
      api.get(`/children/${id}`),
      api.get('/themes'),
      api.get(`/children/${id}/portfolio`),
      api.get(`/children/${id}/media`),
    ]);
    setChild(c);
    setThemes(t);
    setPortfolio(p);
    setVisibility(p.visibility || {});
    setMedia(m);
    setDataObj(p.data || {});
    setDataText(JSON.stringify(p.data || {}, null, 2));
  }
  useEffect(() => { loadAll(); }, [id]);

  // Switching tabs syncs the other view from the active one so edits aren't lost.
  function switchMode(mode) {
    if (mode === editMode) return;
    if (mode === 'json') {
      setDataText(JSON.stringify(dataObj, null, 2));
      setDataErr(null);
      setEditMode('json');
    } else {
      try {
        const parsed = JSON.parse(dataText);
        setDataObj(parsed);
        setDataErr(null);
        setEditMode('form');
      } catch (e) {
        setDataErr('JSON parse error — fix before switching to form view: ' + e.message);
      }
    }
  }

  const portfolioUrl = useMemo(() => child ? `http://${child.firstname_slug}.rasikawan.com` : '', [child]);

  if (!child || !portfolio) return <p>Loading…</p>;

  async function saveProfile(patch) {
    const updated = await api.patch(`/children/${id}`, patch);
    setChild(updated);
  }

  async function savePortfolio() {
    let payload;
    if (editMode === 'json') {
      try { payload = JSON.parse(dataText); }
      catch (e) { setDataErr('JSON parse error: ' + e.message); return; }
    } else {
      payload = dataObj;
    }
    setDataErr(null); setSaving(true);
    try {
      await api.put(`/children/${id}/portfolio`, { data: payload, visibility });
      setSavedAt(new Date());
      // Keep both views in sync after save
      setDataObj(payload);
      setDataText(JSON.stringify(payload, null, 2));
    } catch (e) { setDataErr(e.message); }
    finally { setSaving(false); }
  }

  function toggleSection(key) {
    setVisibility((v) => ({ ...v, [key]: v[key] === false ? true : false }));
  }

  async function uploadMedia(file, alt) {
    const fd = new FormData();
    fd.append('file', file);
    if (alt) fd.append('alt', alt);
    const m = await api.post(`/children/${id}/media`, fd);
    setMedia((cur) => [m, ...cur]);
  }

  async function deleteMedia(mediaId) {
    if (!confirm('Delete this media file?')) return;
    await api.delete(`/children/${id}/media/${mediaId}`);
    setMedia((cur) => cur.filter((m) => m.id !== mediaId));
  }

  async function destroy() {
    if (!confirm(`Permanently delete ${child.firstname}'s portfolio? This removes all content and media.`)) return;
    await api.delete(`/children/${id}`);
    nav('/children');
  }

  async function uploadAvatar(file) {
    const fd = new FormData();
    fd.append('file', file);
    const { child: updated, media: m } = await api.post(`/children/${id}/avatar`, fd);
    setChild(updated);
    setMedia((cur) => [m, ...cur]);
  }

  async function removeAvatar() {
    if (!confirm("Remove the child's profile photo? The image file stays in Media — you can re-set it later.")) return;
    const { child: updated } = await api.delete(`/children/${id}/avatar`);
    setChild(updated);
  }

  return (
    <div>
      <Link to="/children" style={{ color: '#94a3b8', textDecoration: 'none' }}>← All children</Link>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 8 }}>
        <h1 style={{ margin: 0 }}>{child.firstname} {child.lastname || ''}</h1>
        <a href={portfolioUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#fbbf24', fontSize: 13 }}>
          {portfolioUrl} ↗
        </a>
      </div>

      <Panel title="Profile">
        <ProfileForm child={child} themes={themes} onSave={saveProfile} />
      </Panel>

      <Panel title="Profile photo">
        <AvatarPanel
          child={child}
          portfolioUrl={portfolioUrl}
          onUpload={uploadAvatar}
          onRemove={removeAvatar}
        />
      </Panel>

      <Panel title="Visibility — public site sections">
        <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 0 }}>
          Toggle which sections are visible on the public portfolio. Hidden sections are stripped before rendering.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {SECTIONS.map(([key, label]) => {
            const visible = visibility[key] !== false;
            return (
              <label key={key} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: 10, border: '1px solid #334155', borderRadius: 6,
                background: visible ? '#0b1220' : '#1a1a1a', cursor: 'pointer',
              }}>
                <input type="checkbox" checked={visible} onChange={() => toggleSection(key)} />
                <span>{label}</span>
              </label>
            );
          })}
        </div>
      </Panel>

      <Panel title="Portfolio content">
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          <ModeButton active={editMode === 'form'} onClick={() => switchMode('form')}>Form</ModeButton>
          <ModeButton active={editMode === 'json'} onClick={() => switchMode('json')}>JSON</ModeButton>
          <div style={{ marginLeft: 'auto', alignSelf: 'center', color: '#94a3b8', fontSize: 12 }}>
            Click section headers to expand · changes only persist after <em>Save portfolio</em>
          </div>
        </div>

        {editMode === 'form' ? (
          <PortfolioForm
            data={dataObj}
            onChange={setDataObj}
            childId={id}
            portfolioUrl={portfolioUrl}
            api={api}
          />
        ) : (
          <>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 0 }}>
              Multilang fields use {`{"en": "...", "th": "..."}`}. For v1 only English is rendered, but adding Thai now
              will surface once the language toggle is enabled.
            </p>
            <textarea
              value={dataText}
              onChange={(e) => setDataText(e.target.value)}
              spellCheck={false}
              style={{
                width: '100%', minHeight: 420, padding: 14, fontSize: 12,
                fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
                background: '#0b1220', color: '#a5f3fc', border: '1px solid #334155', borderRadius: 6,
              }}
            />
          </>
        )}
        {dataErr && <div style={{ color: '#fca5a5', marginTop: 8, fontSize: 13 }}>{dataErr}</div>}
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={savePortfolio} disabled={saving} style={btn('primary')}>
            {saving ? 'Saving…' : 'Save portfolio'}
          </button>
          {savedAt && <span style={{ color: '#94a3b8', fontSize: 13 }}>Saved {savedAt.toLocaleTimeString()}</span>}
        </div>
      </Panel>

      <Panel title="Media">
        <MediaUploader onUpload={uploadMedia} />
        {media.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No media uploaded.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginTop: 14 }}>
            {media.map((m) => (
              <div key={m.id} style={{ border: '1px solid #334155', borderRadius: 6, overflow: 'hidden', background: '#0b1220' }}>
                {m.mime_type.startsWith('image/') ? (
                  <img src={portfolioUrl + m.url} alt={m.alt || m.filename}
                       style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ height: 120, display: 'grid', placeItems: 'center', fontSize: 32 }}>📄</div>
                )}
                <div style={{ padding: 8, fontSize: 12 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.filename}</div>
                  <div style={{ color: '#94a3b8', fontSize: 11 }}>{Math.round(m.size_bytes / 1024)} KB</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <code style={{ fontSize: 10, color: '#94a3b8', userSelect: 'all' }}>{m.url}</code>
                    <button onClick={() => deleteMedia(m.id)} style={{ ...btn('ghost'), padding: '2px 8px', fontSize: 11 }}>×</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Danger zone" tone="danger">
        <button onClick={destroy} style={btn('danger')}>Delete this child</button>
        <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 8 }}>
          Removes the child, portfolio content, visibility settings, and all media. Cannot be undone.
        </p>
      </Panel>
    </div>
  );
}

function Panel({ title, tone, children }) {
  return (
    <section style={{
      marginTop: 28, padding: 20,
      background: '#111827', border: `1px solid ${tone === 'danger' ? '#7f1d1d' : '#1f2937'}`,
      borderRadius: 10,
    }}>
      <h2 style={{ margin: '0 0 14px', fontSize: 16, color: tone === 'danger' ? '#fca5a5' : '#fffaf0' }}>{title}</h2>
      {children}
    </section>
  );
}

function ProfileForm({ child, themes, onSave }) {
  const [firstname, setFirstname] = useState(child.firstname);
  const [lastname, setLastname] = useState(child.lastname || '');
  const [nickname, setNickname] = useState(child.nickname || '');
  const [slug, setSlug] = useState(child.firstname_slug);
  const [themeSlug, setThemeSlug] = useState(child.theme_slug);
  const [isPublished, setIsPublished] = useState(child.is_published);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      await onSave({
        firstname, lastname, nickname,
        firstname_slug: slug, theme_slug: themeSlug, is_published: isPublished,
      });
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
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
      <div style={{ gridColumn: '1 / -1' }}>
        <button type="submit" disabled={busy} style={btn('primary')}>{busy ? 'Saving…' : 'Save profile'}</button>
      </div>
    </form>
  );
}

function MediaUploader({ onUpload }) {
  const [busy, setBusy] = useState(false);
  const [alt, setAlt] = useState('');
  const [err, setErr] = useState(null);

  async function onPick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setErr(null);
    try { await onUpload(file, alt); setAlt(''); e.target.value = ''; }
    catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <input type="text" value={alt} placeholder="Alt text (optional)" onChange={(e) => setAlt(e.target.value)} style={{ ...inp, width: 220 }} />
      <label style={{ ...btn('primary'), display: 'inline-block' }}>
        {busy ? 'Uploading…' : 'Upload file'}
        <input type="file" onChange={onPick} disabled={busy} style={{ display: 'none' }} />
      </label>
      {err && <span style={{ color: '#fca5a5', fontSize: 13 }}>{err}</span>}
    </div>
  );
}

function Field({ label, children }) {
  return <label style={{ display: 'grid', gap: 4, fontSize: 13, color: '#cbd5e1' }}>{label}{children}</label>;
}
const inp = {
  background: '#0b1220', color: '#fffaf0', border: '1px solid #334155',
  borderRadius: 6, padding: '8px 10px', fontSize: 14, fontFamily: 'inherit',
};

function AvatarPanel({ child, portfolioUrl, onUpload, onRemove }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const hasAvatar = !!child.avatar_media_id;
  const avatarUrl = hasAvatar ? `${portfolioUrl}/_media/${child.id}/${child.avatar_media_id}` : null;
  const initial = (child.nickname || child.firstname || '?').charAt(0).toUpperCase();

  async function onPick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErr('Pick an image file (PNG, JPG, WebP, …).'); return;
    }
    setBusy(true); setErr(null);
    try { await onUpload(file); e.target.value = ''; }
    catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{
        width: 120, height: 120, borderRadius: '50%', overflow: 'hidden',
        background: '#1f2937', display: 'grid', placeItems: 'center',
        border: '3px solid #334155', flexShrink: 0,
      }}>
        {hasAvatar ? (
          <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 56, fontWeight: 700, color: '#fbbf24' }}>{initial}</span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 240 }}>
        <p style={{ marginTop: 0, color: '#cbd5e1' }}>
          {hasAvatar
            ? 'Current profile photo. Themes show this in the hero and nav avatar. Replace by uploading a new image.'
            : 'No profile photo set. Themes are showing the nickname letter as a fallback. Upload an image to use it instead.'}
        </p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ ...btn('primary'), display: 'inline-block' }}>
            {busy ? 'Uploading…' : (hasAvatar ? 'Replace photo' : 'Upload photo')}
            <input type="file" accept="image/*" onChange={onPick} disabled={busy} style={{ display: 'none' }} />
          </label>
          {hasAvatar && (
            <button type="button" onClick={onRemove} style={btn('ghost')}>Remove photo</button>
          )}
          {err && <span style={{ color: '#fca5a5', fontSize: 13 }}>{err}</span>}
        </div>
        <p style={{ color: '#64748b', fontSize: 12, marginTop: 10 }}>
          Square images work best (themes crop to a circle). PNG/JPG/WebP, up to {Math.round((Number(import.meta.env?.VITE_MAX_UPLOAD_MB) || 20))} MB.
        </p>
      </div>
    </div>
  );
}

function ModeButton({ active, onClick, children }) {
  return (
    <button type="button" onClick={onClick} style={{
      background: active ? '#fbbf24' : 'transparent',
      color: active ? '#1a1a1a' : '#cbd5e1',
      border: '1px solid ' + (active ? '#fbbf24' : '#334155'),
      borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 600,
    }}>{children}</button>
  );
}
