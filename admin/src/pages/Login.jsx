import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { btn } from '../App.jsx';

export default function Login({ onLogin }) {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      const me = await api.post('/auth/login', { email, password }, { allow401: true });
      onLogin(me);
      nav('/children');
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div style={{ maxWidth: 380, margin: '8vh auto', padding: 28, background: '#111827', border: '1px solid #1f2937', borderRadius: 10 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Admin Sign-in</h1>
      <p style={{ color: '#94a3b8', marginTop: 6 }}>Restricted to platform administrators.</p>
      <form onSubmit={submit} style={{ display: 'grid', gap: 14, marginTop: 18 }}>
        <label style={lbl}>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inp} autoFocus />
        </label>
        <label style={lbl}>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inp} />
        </label>
        {err && <div style={{ color: '#fca5a5', fontSize: 13 }}>{err}</div>}
        <button type="submit" disabled={busy} style={btn('primary')}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}

const lbl = { display: 'grid', gap: 6, fontSize: 13, color: '#cbd5e1' };
const inp = {
  background: '#0b1220', color: '#fffaf0', border: '1px solid #334155',
  borderRadius: 6, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit',
};
