// Child editor — layout component for /children/:id/* sub-routes.
// Loads all shared data here once, exposes it to sub-panels via Outlet
// context, and renders a left sidebar for navigation between sub-pages.

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link, Outlet, NavLink } from 'react-router-dom';
import { api } from '../api.js';
import { btn } from '../App.jsx';

const SUBPAGES = [
  { to: 'profile',    label: 'Profile',      icon: '👤' },
  { to: 'photo',      label: 'Photo',        icon: '📸' },
  { to: 'content',    label: 'Content',      icon: '📝' },
  { to: 'visibility', label: 'Visibility',   icon: '👁' },
  { to: 'media',      label: 'Media',        icon: '🖼' },
  { to: 'danger',     label: 'Danger zone',  icon: '⚠️', danger: true },
];

export default function ChildEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const [child, setChild] = useState(null);
  const [themes, setThemes] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [visibility, setVisibility] = useState({});
  const [media, setMedia] = useState([]);
  const [dataObj, setDataObj] = useState({});
  const [dataText, setDataText] = useState('');
  const [aiAvailable, setAiAvailable] = useState(false);
  const [loadErr, setLoadErr] = useState(null);

  async function loadAll() {
    setLoadErr(null);
    try {
      const [c, t, p, m, ai] = await Promise.all([
        api.get(`/children/${id}`),
        api.get('/themes'),
        api.get(`/children/${id}/portfolio`),
        api.get(`/children/${id}/media`),
        api.get('/ai/status').catch(() => ({ available: false })),
      ]);
      setChild(c); setThemes(t); setPortfolio(p);
      setVisibility(p.visibility || {});
      setMedia(m); setDataObj(p.data || {});
      setDataText(JSON.stringify(p.data || {}, null, 2));
      setAiAvailable(!!ai.available);
    } catch (e) { setLoadErr(e.message || 'Failed to load child data'); }
  }
  useEffect(() => { loadAll(); }, [id]);

  const portfolioUrl = useMemo(() => child ? `http://${child.firstname_slug}.rasikawan.com` : '', [child]);

  if (loadErr) return (
    <div>
      <Link to="/children" style={{ color: '#94a3b8', textDecoration: 'none' }}>← All children</Link>
      <div style={{ marginTop: 18, padding: 18, background: '#7f1d1d33', border: '1px solid #7f1d1d', borderRadius: 8, color: '#fca5a5' }}>
        <strong>Couldn't load this child:</strong> {loadErr}
        <p style={{ margin: '10px 0 0', fontSize: 13 }}>
          Check the browser network tab to see which request failed. If you just deployed, run <code>npm run migrate</code>.
        </p>
        <button onClick={loadAll} style={{ ...btn('ghost'), marginTop: 10 }}>Retry</button>
      </div>
    </div>
  );
  if (!child || !portfolio) return <p>Loading…</p>;

  // Shared mutators passed to sub-panels via Outlet context.
  async function saveProfile(patch) {
    const updated = await api.patch(`/children/${id}`, patch);
    setChild(updated);
  }

  async function savePortfolio(payload, opts = {}) {
    const result = await api.put(`/children/${id}/portfolio`, { data: payload, visibility });
    setDataObj(payload);
    setDataText(JSON.stringify(payload, null, 2));
    if (!opts.skipMediaRefresh) {
      api.get(`/children/${id}/media`).then(setMedia).catch(() => {});
    }
    return result;
  }

  async function saveVisibility(nextVis) {
    setVisibility(nextVis);
    await api.put(`/children/${id}/portfolio`, { data: dataObj, visibility: nextVis });
  }

  async function uploadAvatar(file) {
    const fd = new FormData();
    fd.append('file', file);
    const { child: updated, media: m } = await api.post(`/children/${id}/avatar`, fd);
    setChild(updated);
    setMedia((cur) => [m, ...cur]);
  }
  async function removeAvatar() {
    const { child: updated } = await api.delete(`/children/${id}/avatar`);
    setChild(updated);
    api.get(`/children/${id}/media`).then(setMedia).catch(() => {});
  }

  async function uploadMedia(file, alt) {
    const fd = new FormData();
    fd.append('file', file);
    if (alt) fd.append('alt', alt);
    const m = await api.post(`/children/${id}/media`, fd);
    setMedia((cur) => [m, ...cur]);
  }
  async function deleteMedia(mediaId) {
    await api.delete(`/children/${id}/media/${mediaId}`);
    setMedia((cur) => cur.filter((m) => m.id !== mediaId));
  }

  async function destroyChild() {
    await api.delete(`/children/${id}`);
    nav('/children');
  }

  const ctx = {
    childId: id, child, themes, dataObj, setDataObj, dataText, setDataText,
    visibility, media, portfolioUrl, aiAvailable,
    saveProfile, savePortfolio, saveVisibility,
    uploadAvatar, removeAvatar, uploadMedia, deleteMedia, destroyChild,
  };

  return (
    <div>
      <Link to="/children" style={{ color: '#94a3b8', textDecoration: 'none' }}>← All children</Link>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 8 }}>
        <h1 style={{ margin: 0 }}>{child.firstname} {child.lastname || ''}</h1>
        <a href={portfolioUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#fbbf24', fontSize: 13 }}>
          {portfolioUrl} ↗
        </a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, marginTop: 24 }}>
        <aside>
          <nav style={{
            position: 'sticky', top: 24,
            display: 'flex', flexDirection: 'column', gap: 4,
            background: '#111827', border: '1px solid #1f2937', borderRadius: 10, padding: 8,
          }}>
            {SUBPAGES.map((p) => (
              <NavLink
                key={p.to}
                to={p.to}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 6,
                  textDecoration: 'none', fontSize: 14,
                  background: isActive ? (p.danger ? '#7f1d1d44' : '#1f2937') : 'transparent',
                  color: isActive
                    ? (p.danger ? '#fca5a5' : '#fbbf24')
                    : (p.danger ? '#fca5a5aa' : '#cbd5e1'),
                  fontWeight: isActive ? 600 : 400,
                })}
              >
                <span style={{ width: 20, textAlign: 'center' }}>{p.icon}</span>
                <span>{p.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>
        <main style={{ minWidth: 0 }}>
          <Outlet context={ctx} />
        </main>
      </div>
    </div>
  );
}
