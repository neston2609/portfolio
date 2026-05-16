import React, { useState } from 'react';
import { api } from '../api.js';
import { btn } from '../App.jsx';

export default function Account({ me }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(null); setOk(false);
    if (next !== confirm) { setErr('New passwords do not match'); return; }
    if (next.length < 8) { setErr('New password must be at least 8 characters'); return; }
    if (current === next) { setErr('New password must differ from current'); return; }
    setBusy(true);
    try {
      await api.post('/auth/change-password', { current_password: current, new_password: next });
      setOk(true);
      setCurrent(''); setNext(''); setConfirm('');
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div>
      <h1 style={{ margin: 0 }}>Account</h1>
      <p style={{ color: '#94a3b8' }}>Signed in as <code>{me?.email}</code>.</p>

      <section style={{ marginTop: 18, padding: 20, background: '#111827', border: '1px solid #1f2937', borderRadius: 10, maxWidth: 480 }}>
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Change password</h2>
        <form onSubmit={submit} style={{ display: 'grid', gap: 12, marginTop: 12 }}>
          <label style={lbl}>
            Current password
            <input type="password" autoComplete="current-password" required
                   value={current} onChange={(e) => setCurrent(e.target.value)} style={inp} />
          </label>
          <label style={lbl}>
            New password (min 8 characters)
            <input type="password" autoComplete="new-password" required minLength={8}
                   value={next} onChange={(e) => setNext(e.target.value)} style={inp} />
          </label>
          <label style={lbl}>
            Confirm new password
            <input type="password" autoComplete="new-password" required minLength={8}
                   value={confirm} onChange={(e) => setConfirm(e.target.value)} style={inp} />
          </label>
          {err && <div style={{ color: '#fca5a5', fontSize: 13 }}>{err}</div>}
          {ok  && <div style={{ color: '#86efac', fontSize: 13 }}>✓ Password updated. Your session is still active.</div>}
          <div>
            <button type="submit" disabled={busy} style={btn('primary')}>{busy ? 'Updating…' : 'Update password'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

const lbl = { display: 'grid', gap: 4, fontSize: 13, color: '#cbd5e1' };
const inp = {
  background: '#0b1220', color: '#fffaf0', border: '1px solid #334155',
  borderRadius: 6, padding: '8px 10px', fontSize: 14, fontFamily: 'inherit',
};
