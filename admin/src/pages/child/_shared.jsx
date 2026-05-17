// Shared layout primitives + styles for the child sub-pages. Keeps each
// panel file focused on its own logic without redefining the same panel
// frame, label, input style, etc.

import React from 'react';

export function Panel({ title, tone, subtitle, children }) {
  return (
    <section style={{
      padding: 20,
      background: '#111827', border: `1px solid ${tone === 'danger' ? '#7f1d1d' : '#1f2937'}`,
      borderRadius: 10,
    }}>
      <h2 style={{ margin: 0, fontSize: 18, color: tone === 'danger' ? '#fca5a5' : '#fffaf0' }}>{title}</h2>
      {subtitle && <p style={{ color: '#94a3b8', fontSize: 13, margin: '6px 0 16px' }}>{subtitle}</p>}
      {!subtitle && <div style={{ height: 14 }} />}
      {children}
    </section>
  );
}

export function Field({ label, children }) {
  return <label style={{ display: 'grid', gap: 4, fontSize: 13, color: '#cbd5e1' }}>{label}{children}</label>;
}

export const inp = {
  background: '#0b1220', color: '#fffaf0', border: '1px solid #334155',
  borderRadius: 6, padding: '8px 10px', fontSize: 14, fontFamily: 'inherit',
};
