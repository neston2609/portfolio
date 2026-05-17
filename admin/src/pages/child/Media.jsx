// Media sub-page — full media library for this child: uploader + grid +
// per-item delete. Same data used by the portfolio form's per-item file
// pickers, exposed here so admins can manage uploads directly.

import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { btn } from '../../App.jsx';
import { Panel, inp } from './_shared.jsx';

export default function Media() {
  const { media, portfolioUrl, uploadMedia, deleteMedia } = useOutletContext();
  const [busy, setBusy] = useState(false);
  const [alt, setAlt] = useState('');
  const [err, setErr] = useState(null);

  async function onPick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setErr(null);
    try { await uploadMedia(file, alt); setAlt(''); e.target.value = ''; }
    catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  async function onDelete(id) {
    if (!confirm('Delete this media file? Anything referencing it (gallery tile, avatar, certificate scan, ...) will lose its image.')) return;
    try { await deleteMedia(id); }
    catch (e) { alert(e.message); }
  }

  return (
    <Panel title="Media" subtitle="Files uploaded for this child. Used by gallery tiles, award attachments, social icons, the avatar, and so on.">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <input type="text" value={alt} placeholder="Alt text (optional)" onChange={(e) => setAlt(e.target.value)} style={{ ...inp, width: 220 }} />
        <label style={{ ...btn('primary'), display: 'inline-block' }}>
          {busy ? 'Uploading…' : 'Upload file'}
          <input type="file" onChange={onPick} disabled={busy} style={{ display: 'none' }} />
        </label>
        {err && <span style={{ color: '#fca5a5', fontSize: 13 }}>{err}</span>}
      </div>

      {media.length === 0 ? (
        <p style={{ color: '#94a3b8', marginTop: 18 }}>No media uploaded yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginTop: 18 }}>
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
                  <button onClick={() => onDelete(m.id)} style={{ ...btn('ghost'), padding: '2px 8px', fontSize: 11 }}>×</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
