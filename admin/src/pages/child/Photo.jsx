// Photo sub-page — upload/replace/remove the child's main profile photo.

import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { btn } from '../../App.jsx';
import { Panel } from './_shared.jsx';

export default function Photo() {
  const { child, portfolioUrl, uploadAvatar, removeAvatar } = useOutletContext();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const hasAvatar = !!child.avatar_media_id;
  const avatarUrl = hasAvatar ? `${portfolioUrl}/_media/${child.id}/${child.avatar_media_id}` : null;
  const initial = (child.nickname || child.firstname || '?').charAt(0).toUpperCase();

  async function onPick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setErr('Pick an image file (PNG, JPG, WebP, …).'); return; }
    setBusy(true); setErr(null);
    try { await uploadAvatar(file); e.target.value = ''; }
    catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  async function onRemove() {
    if (!confirm("Remove the child's profile photo? The image file will be deleted unless it's referenced elsewhere.")) return;
    setBusy(true); setErr(null);
    try { await removeAvatar(); }
    catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <Panel title="Profile photo" subtitle="Shown in the hero and nav avatar of every theme. Falls back to the nickname letter when empty.">
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{
          width: 140, height: 140, borderRadius: '50%', overflow: 'hidden',
          background: '#1f2937', display: 'grid', placeItems: 'center',
          border: '3px solid #334155', flexShrink: 0,
        }}>
          {hasAvatar
            ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: 64, fontWeight: 700, color: '#fbbf24' }}>{initial}</span>}
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <p style={{ marginTop: 0, color: '#cbd5e1' }}>
            {hasAvatar
              ? 'Current profile photo. Replace by uploading a new image.'
              : 'No profile photo set. Themes are showing the nickname letter as a fallback.'}
          </p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ ...btn('primary'), display: 'inline-block' }}>
              {busy ? 'Working…' : (hasAvatar ? 'Replace photo' : 'Upload photo')}
              <input type="file" accept="image/*" onChange={onPick} disabled={busy} style={{ display: 'none' }} />
            </label>
            {hasAvatar && <button type="button" onClick={onRemove} disabled={busy} style={btn('ghost')}>Remove photo</button>}
            {err && <span style={{ color: '#fca5a5', fontSize: 13 }}>{err}</span>}
          </div>
          <p style={{ color: '#64748b', fontSize: 12, marginTop: 10 }}>
            Square images work best (themes crop to a circle). PNG/JPG/WebP, up to 20 MB.
          </p>
        </div>
      </div>
    </Panel>
  );
}
