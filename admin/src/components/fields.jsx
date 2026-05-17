// Form primitives shared across portfolio section editors.
// All field components are controlled: parent owns state, passes value + onChange.
// Multilang fields write the {en: "..."} shape so the data is forward-compatible
// with the future Thai toggle even though v1 only renders English.

import React, { useState } from 'react';
import { createPortal } from 'react-dom';

export const inp = {
  background: '#0b1220', color: '#fffaf0', border: '1px solid #334155',
  borderRadius: 6, padding: '8px 10px', fontSize: 14, fontFamily: 'inherit', width: '100%',
};
export const lbl = { display: 'grid', gap: 4, fontSize: 12, color: '#cbd5e1', letterSpacing: '0.02em' };

export function TextField({ label, value, onChange, placeholder, multiline, monospace }) {
  const props = {
    value: value ?? '',
    placeholder,
    onChange: (e) => onChange(e.target.value),
    style: { ...inp, ...(monospace ? { fontFamily: 'ui-monospace, "JetBrains Mono", monospace', fontSize: 12 } : {}) },
  };
  return (
    <label style={lbl}>
      {label && <span>{label}</span>}
      {multiline ? <textarea rows={3} {...props} style={{ ...props.style, resize: 'vertical' }} /> : <input type="text" {...props} />}
    </label>
  );
}

export function DateField({ label, value, onChange, hint }) {
  return (
    <label style={lbl}>
      {label && <span>{label}</span>}
      <input type="date" value={value || ''} onChange={(e) => onChange(e.target.value || null)} style={inp} />
      {hint && <span style={{ color: '#64748b', fontSize: 11 }}>{hint}</span>}
    </label>
  );
}

export function NumberField({ label, value, onChange, min, max, step = 1 }) {
  return (
    <label style={lbl}>
      {label && <span>{label}</span>}
      <input type="number" value={value ?? ''} min={min} max={max} step={step}
             onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
             style={inp} />
    </label>
  );
}

export function ColorField({ label, value, onChange }) {
  const v = value || '#000000';
  return (
    <label style={lbl}>
      {label && <span>{label}</span>}
      <div style={{ display: 'flex', gap: 8 }}>
        <input type="color" value={v} onChange={(e) => onChange(e.target.value)}
               style={{ width: 38, height: 32, padding: 0, border: '1px solid #334155', borderRadius: 6, background: '#0b1220' }} />
        <input type="text" value={v} onChange={(e) => onChange(e.target.value)} placeholder="#rrggbb" style={inp} />
      </div>
    </label>
  );
}

// Multilang field: stores `{en: "..."}` (Thai key omitted until v2's TH input is added).
// Accepts plain strings too (data.js shape from the design uses strings for non-translated fields).
export function MultilangField({ label, value, onChange, placeholder, multiline }) {
  const en = typeof value === 'string' ? value : (value?.en ?? '');
  const handle = (v) => {
    if (typeof value === 'string' || value == null) {
      onChange({ en: v });
    } else {
      onChange({ ...value, en: v });
    }
  };
  return <TextField label={label} value={en} onChange={handle} placeholder={placeholder} multiline={multiline} />;
}

// Collapsible section wrapper. Saves vertical space when editing big portfolios.
// When `bare` is true, the wrapper + collapse UI is dropped and only the body
// is rendered — useful when the editor is already inside its own panel
// (e.g. on a Content sub-page with one section per route).
export function Section({ title, badge, defaultOpen = false, bare = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  if (bare) return <div style={{ display: 'grid', gap: 12 }}>{children}</div>;
  return (
    <section style={{
      marginTop: 14, background: '#0f172a', border: '1px solid #1f2937', borderRadius: 8, overflow: 'hidden',
    }}>
      <button type="button" onClick={() => setOpen((o) => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px', background: '#111827', border: 'none', color: '#fffaf0',
        cursor: 'pointer', textAlign: 'left',
      }}>
        <span style={{ fontSize: 12, color: '#94a3b8', width: 14 }}>{open ? '▼' : '▶'}</span>
        <span style={{ fontWeight: 600 }}>{title}</span>
        {badge != null && (
          <span style={{
            marginLeft: 'auto', background: '#1f2937', color: '#94a3b8',
            padding: '2px 8px', borderRadius: 999, fontSize: 11,
          }}>{badge}</span>
        )}
      </button>
      {open && <div style={{ padding: 16, display: 'grid', gap: 12 }}>{children}</div>}
    </section>
  );
}

// Add/remove list editor. `renderItem(item, update, index)` returns the item form.
// `defaultItem()` returns the blank shape used when "+ Add" is clicked.
export function ArrayField({ label, items, onChange, renderItem, defaultItem, itemLabel = 'item' }) {
  const list = Array.isArray(items) ? items : [];
  const add = () => onChange([...list, defaultItem()]);
  const remove = (i) => {
    if (!confirm(`Remove this ${itemLabel}?`)) return;
    onChange(list.filter((_, idx) => idx !== i));
  };
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = list.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const update = (i, patch) => onChange(list.map((it, idx) => idx === i ? { ...it, ...patch } : it));

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {label && <div style={{ fontSize: 12, color: '#cbd5e1', letterSpacing: '0.02em' }}>{label}</div>}
      {list.length === 0 && <div style={{ color: '#64748b', fontSize: 13, fontStyle: 'italic' }}>No {itemLabel}s yet.</div>}
      {list.map((it, i) => (
        <div key={i} style={{
          padding: 12, border: '1px dashed #334155', borderRadius: 8, background: '#0b1220',
          display: 'grid', gap: 8, position: 'relative',
        }}>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} style={iconBtn} title="Move up">▲</button>
            <button type="button" onClick={() => move(i, +1)} disabled={i === list.length - 1} style={iconBtn} title="Move down">▼</button>
            <button type="button" onClick={() => remove(i)} style={{ ...iconBtn, color: '#fca5a5' }} title="Remove">✕</button>
          </div>
          {renderItem(it, (patch) => update(i, patch), i)}
        </div>
      ))}
      <button type="button" onClick={add} style={{
        background: 'transparent', color: '#fbbf24', border: '1px dashed #fbbf24',
        borderRadius: 6, padding: '8px 12px', cursor: 'pointer', fontWeight: 500, fontSize: 13,
      }}>+ Add {itemLabel}</button>
    </div>
  );
}

const iconBtn = {
  background: 'transparent', border: '1px solid #334155', color: '#cbd5e1',
  width: 26, height: 26, borderRadius: 4, cursor: 'pointer', fontSize: 11, padding: 0,
};

// Two-column grid wrapper for compact field rows.
export function Row({ children, cols = 2 }) {
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10 }}>{children}</div>;
}

// File attachment field: upload an image or PDF to the child's media library
// and store the resulting URL on the parent item. The stored value is a
// relative path like "/_media/<childId>/<mediaId>" so it works under any host.
//
// Props:
//   value           current URL (string or '')
//   onChange(url)   parent setter
//   uploadUrl       endpoint to POST the file to (e.g. /children/<id>/media)
//   previewBase     absolute origin to prefix when showing the preview from
//                   the admin host (cross-origin OK; img tags don't need CORS)
//   accept          MIME or extensions (defaults to 'image/*,application/pdf')
export function FileAttachField({ label, value, onChange, uploadUrl, previewBase, accept, api }) {
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState(null);
  const [hover, setHover] = React.useState(null); // { x, y, side } for fixed-position popover
  const isPdf = value && /\.pdf(\?|$)/i.test(value);
  const isImg = value && /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(value);
  const absUrl = value ? ((previewBase || '') + value) : null;

  // Pin the popover to the thumbnail, then flip to the left side when there
  // isn't room on the right. Clamps vertically inside the viewport.
  function showPreview(e) {
    if (!isImg) return;
    const r = e.currentTarget.getBoundingClientRect();
    const previewMax = Math.min(window.innerWidth * 0.45, 480);
    const fitsRight = r.right + previewMax + 24 <= window.innerWidth;
    const x = fitsRight ? r.right + 10 : Math.max(8, r.left - previewMax - 10);
    const y = Math.max(8, Math.min(r.top, window.innerHeight - previewMax - 40));
    setHover({ x, y, max: previewMax });
  }

  async function onPick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setErr(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const m = await api.post(uploadUrl, fd);
      onChange(m.url);
      e.target.value = '';
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div style={lbl}>
      {label && <span>{label}</span>}
      <div style={{
        display: 'flex', gap: 10, alignItems: 'center', padding: 8,
        border: '1px dashed #334155', borderRadius: 6, background: '#0b1220',
      }}>
        <div
          onMouseEnter={showPreview}
          onMouseLeave={() => setHover(null)}
          style={{
            width: 56, height: 56, borderRadius: 4, background: '#1f2937',
            display: 'grid', placeItems: 'center', flexShrink: 0, overflow: 'hidden',
            color: '#64748b', fontSize: 10, textAlign: 'center',
            cursor: isImg ? 'zoom-in' : 'default',
          }}>
          {isImg ? (
            <img src={absUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : isPdf ? (
            <span style={{ fontSize: 20, color: '#fca5a5' }}>📄 PDF</span>
          ) : (
            <span>no file</span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {value
            ? <code style={{ fontSize: 11, color: '#94a3b8', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</code>
            : <span style={{ color: '#64748b', fontSize: 12 }}>No file attached.</span>}
          {err && <div style={{ color: '#fca5a5', fontSize: 11, marginTop: 4 }}>{err}</div>}
        </div>
        <label style={{
          background: '#334155', color: '#fffaf0', borderRadius: 4,
          padding: '6px 10px', fontSize: 12, cursor: 'pointer', flexShrink: 0,
        }}>
          {busy ? 'Uploading…' : (value ? 'Replace' : 'Upload')}
          <input type="file" accept={accept || 'image/*,application/pdf'} onChange={onPick} disabled={busy} style={{ display: 'none' }} />
        </label>
        {value && (
          <button type="button" onClick={() => onChange('')} style={{
            background: 'transparent', color: '#fca5a5', border: '1px solid #334155',
            borderRadius: 4, padding: '6px 10px', fontSize: 12, cursor: 'pointer', flexShrink: 0,
          }}>Remove</button>
        )}
      </div>
      {hover && isImg && createPortal(
        <div style={{
          position: 'fixed', left: hover.x, top: hover.y, zIndex: 9999,
          pointerEvents: 'none',
          background: '#0b1220', border: '2px solid #fbbf24', borderRadius: 8,
          boxShadow: '0 16px 48px rgba(0,0,0,0.6)', padding: 6,
        }}>
          <img src={absUrl} alt="" style={{
            display: 'block', maxWidth: hover.max, maxHeight: hover.max,
            borderRadius: 4,
          }} />
        </div>,
        document.body,
      )}
    </div>
  );
}
