// Content sub-page — the structured portfolio editor with a Form/JSON toggle
// and a single Save button that persists everything.

import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../api.js';
import { btn } from '../../App.jsx';
import { Panel } from './_shared.jsx';
import PortfolioForm from '../../components/PortfolioForm.jsx';

export default function Content() {
  const {
    childId, dataObj, setDataObj, dataText, setDataText,
    visibility, portfolioUrl, aiAvailable, savePortfolio,
  } = useOutletContext();

  const [editMode, setEditMode] = useState('form');
  const [dataErr, setDataErr] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [orphansRemoved, setOrphansRemoved] = useState(0);

  function switchMode(mode) {
    if (mode === editMode) return;
    if (mode === 'json') {
      setDataText(JSON.stringify(dataObj, null, 2));
      setDataErr(null);
      setEditMode('json');
    } else {
      try { setDataObj(JSON.parse(dataText)); setDataErr(null); setEditMode('form'); }
      catch (e) { setDataErr('JSON parse error — fix before switching to form view: ' + e.message); }
    }
  }

  async function save() {
    let payload;
    if (editMode === 'json') {
      try { payload = JSON.parse(dataText); }
      catch (e) { setDataErr('JSON parse error: ' + e.message); return; }
    } else { payload = dataObj; }
    setDataErr(null); setSaving(true);
    try {
      const result = await savePortfolio(payload);
      setSavedAt(new Date());
      setOrphansRemoved(result?.orphans_removed || 0);
    } catch (e) { setDataErr(e.message); }
    finally { setSaving(false); }
  }

  return (
    <Panel title="Portfolio content" subtitle="Edit every section of the public site. Click each section header to expand. Save below to persist.">
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <ModeButton active={editMode === 'form'} onClick={() => switchMode('form')}>Form</ModeButton>
        <ModeButton active={editMode === 'json'} onClick={() => switchMode('json')}>JSON</ModeButton>
      </div>

      {editMode === 'form' ? (
        <PortfolioForm
          data={dataObj}
          onChange={setDataObj}
          childId={childId}
          portfolioUrl={portfolioUrl}
          api={api}
          aiAvailable={aiAvailable}
        />
      ) : (
        <>
          <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 0 }}>
            Multilang fields use {`{"en": "...", "th": "..."}`}. For v1 only English is rendered.
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
      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
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
