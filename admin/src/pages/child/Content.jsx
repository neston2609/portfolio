// Content sub-page — layout that renders a tab strip + an Outlet for the
// active section. Save button is global to Content: edits in any tab go
// into the shared dataObj (lives in ChildEditor), Save persists the whole
// portfolio. Switching tabs preserves unsaved edits.

import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useOutletContext, useLocation } from 'react-router-dom';
import { btn } from '../../App.jsx';
import { Panel } from './_shared.jsx';

const SECTIONS = [
  { slug: 'hero',         label: 'Hero / Meta' },
  { slug: 'about',        label: 'About' },
  { slug: 'powers',       label: 'Powers' },
  { slug: 'education',    label: 'Education' },
  { slug: 'projects',     label: 'Projects' },
  { slug: 'youtube',      label: 'YouTube' },
  { slug: 'scratch',      label: 'Scratch' },
  { slug: 'gallery',      label: 'Gallery' },
  { slug: 'achievements', label: 'Achievements' },
  { slug: 'social',       label: 'Social' },
  { slug: 'json',         label: 'Raw JSON' },
];

export default function Content() {
  const ctx = useOutletContext();
  const { dataObj, setDataObj, dataText, setDataText, savePortfolio } = ctx;
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [orphansRemoved, setOrphansRemoved] = useState(0);
  const [err, setErr] = useState(null);

  const location = useLocation();
  const isJsonTab = location.pathname.endsWith('/json');

  // Keep dataText and dataObj in sync across tab navigation so JSON edits
  // don't get silently dropped (and form edits show up in JSON view).
  const prevPathRef = useRef(location.pathname);
  useEffect(() => {
    const wasJson = prevPathRef.current.endsWith('/json');
    if (isJsonTab && !wasJson) {
      // Entering JSON tab: serialize current form state.
      setDataText(JSON.stringify(dataObj, null, 2));
    } else if (!isJsonTab && wasJson) {
      // Leaving JSON tab: parse the textarea back into the form state.
      // If the JSON is invalid, dataObj is left untouched and the next
      // save will use the form's current state.
      try { setDataObj(JSON.parse(dataText)); setErr(null); }
      catch (e) { setErr('Invalid JSON in Raw JSON tab — not applied to form: ' + e.message); }
    }
    prevPathRef.current = location.pathname;
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Source of truth depends on the active tab. Form tabs mutate dataObj
  // directly via setDataObj; the JSON tab mutates dataText. Save uses
  // whichever the user is currently editing.
  async function save() {
    let payload;
    if (isJsonTab) {
      try { payload = JSON.parse(dataText); }
      catch (e) { setErr('JSON parse error: ' + e.message); return; }
    } else {
      payload = dataObj;
    }
    setErr(null); setSaving(true);
    try {
      const result = await savePortfolio(payload);
      setSavedAt(new Date());
      setOrphansRemoved(result?.orphans_removed || 0);
      setDataText(JSON.stringify(payload, null, 2));
      setDataObj(payload);
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  }

  return (
    <Panel
      title="Portfolio content"
      subtitle="Edit each section in its own tab. The Save button at the bottom persists everything (whichever tab you're on)."
    >
      <nav style={{
        display: 'flex', gap: 4, flexWrap: 'wrap',
        borderBottom: '1px solid #1f2937', paddingBottom: 8, marginBottom: 16,
      }}>
        {SECTIONS.map((s) => (
          <NavLink
            key={s.slug}
            to={s.slug}
            style={({ isActive }) => ({
              padding: '6px 12px', borderRadius: 6, fontSize: 13,
              textDecoration: 'none',
              background: isActive ? '#1f2937' : 'transparent',
              color: isActive ? '#fbbf24' : '#cbd5e1',
              fontWeight: isActive ? 600 : 400,
            })}
          >{s.label}</NavLink>
        ))}
      </nav>

      <Outlet context={ctx} />

      {err && <div style={{ color: '#fca5a5', marginTop: 14, fontSize: 13 }}>{err}</div>}
      <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #1f2937', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={save} disabled={saving} style={btn('primary')}>{saving ? 'Saving…' : 'Save portfolio'}</button>
        {savedAt && (
          <span style={{ color: '#94a3b8', fontSize: 13 }}>
            Saved {savedAt.toLocaleTimeString()}
            {orphansRemoved > 0 && (
              <span style={{ color: '#86efac', marginLeft: 8 }}>
                · cleaned {orphansRemoved} unused file{orphansRemoved === 1 ? '' : 's'}
              </span>
            )}
          </span>
        )}
      </div>
    </Panel>
  );
}
