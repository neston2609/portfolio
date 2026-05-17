// Visibility sub-page — section-by-section public-site visibility toggles.

import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { btn } from '../../App.jsx';
import { Panel } from './_shared.jsx';

const SECTIONS = [
  ['about', 'About'],
  ['powers', 'Powers / Skills'],
  ['education', 'Education'],
  ['projects', 'Projects / Quests'],
  ['youtube', 'YouTube'],
  ['scratch', 'Scratch'],
  ['gallery', 'Gallery'],
  ['achievements', 'Achievements (whole row)'],
  ['awards', 'Awards / Trophies (sub-row)'],
  ['certificates', 'Certificates (sub-row)'],
  ['social', 'Social / Contact'],
];

export default function Visibility() {
  const { visibility, saveVisibility } = useOutletContext();
  const [local, setLocal] = useState(visibility);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [err, setErr] = useState(null);

  function toggle(key) {
    setLocal((v) => ({ ...v, [key]: v[key] === false ? true : false }));
  }

  async function save() {
    setSaving(true); setErr(null);
    try { await saveVisibility(local); setSavedAt(new Date()); }
    catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  }

  return (
    <Panel title="Visibility" subtitle="Hide sections from the public site. Hidden sections still keep their data — toggling back on restores them.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {SECTIONS.map(([key, label]) => {
          const visible = local[key] !== false;
          return (
            <label key={key} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: 12, border: '1px solid #334155', borderRadius: 6,
              background: visible ? '#0b1220' : '#1a1a1a',
              cursor: 'pointer', fontSize: 14,
            }}>
              <input type="checkbox" checked={visible} onChange={() => toggle(key)} />
              <span style={{ color: visible ? '#fffaf0' : '#64748b' }}>{label}</span>
            </label>
          );
        })}
      </div>
      {err && <div style={{ color: '#fca5a5', marginTop: 12, fontSize: 13 }}>{err}</div>}
      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={save} disabled={saving} style={btn('primary')}>{saving ? 'Saving…' : 'Save visibility'}</button>
        {savedAt && <span style={{ color: '#94a3b8', fontSize: 13 }}>Saved {savedAt.toLocaleTimeString()}</span>}
      </div>
    </Panel>
  );
}
