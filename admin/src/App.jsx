import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from './api.js';
import Login from './pages/Login.jsx';
import Children from './pages/Children.jsx';
import ChildEditor from './pages/ChildEditor.jsx';
import Themes from './pages/Themes.jsx';
import Account from './pages/Account.jsx';

export default function App() {
  const [me, setMe] = useState(undefined); // undefined = loading, null = logged out
  const location = useLocation();

  useEffect(() => {
    api.get('/auth/me', { allow401: true })
      .then(setMe)
      .catch(() => setMe(null));
  }, []);

  if (me === undefined) return <Centered>Loading…</Centered>;

  if (!me && location.pathname !== '/login') return <Navigate to="/login" replace />;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {me && <Nav me={me} onLogout={() => setMe(null)} />}
      <main style={{ flex: 1, padding: 24, maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Routes>
          <Route path="/login" element={<Login onLogin={setMe} />} />
          <Route path="/" element={<Navigate to="/children" replace />} />
          <Route path="/children" element={<Children />} />
          <Route path="/children/:id" element={<ChildEditor />} />
          <Route path="/themes" element={<Themes />} />
          <Route path="/account" element={<Account me={me} />} />
          <Route path="*" element={<Centered>Not found</Centered>} />
        </Routes>
      </main>
    </div>
  );
}

function Nav({ me, onLogout }) {
  const nav = useNavigate();
  async function logout() {
    await api.post('/auth/logout');
    onLogout();
    nav('/login');
  }
  return (
    <header style={{
      background: '#111827', borderBottom: '1px solid #1f2937',
      padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 24,
    }}>
      <Link to="/children" style={{ fontWeight: 700, fontSize: 18, color: '#fbbf24', textDecoration: 'none' }}>
        🛠 Portfolio Admin
      </Link>
      <nav style={{ display: 'flex', gap: 16 }}>
        <NavLink to="/children">Children</NavLink>
        <NavLink to="/themes">Themes</NavLink>
        <NavLink to="/account">Account</NavLink>
      </nav>
      <span style={{ marginLeft: 'auto', color: '#94a3b8', fontSize: 13 }}>{me.email}</span>
      <button onClick={logout} style={btn('ghost')}>Log out</button>
    </header>
  );
}

function NavLink({ to, children }) {
  const loc = useLocation();
  const active = loc.pathname.startsWith(to);
  return (
    <Link to={to} style={{
      color: active ? '#fbbf24' : '#cbd5e1',
      textDecoration: 'none', fontWeight: active ? 600 : 400,
    }}>{children}</Link>
  );
}

function Centered({ children }) {
  return <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh', opacity: 0.7 }}>{children}</div>;
}

export function btn(kind = 'primary') {
  const base = {
    border: '1px solid transparent', borderRadius: 6, padding: '8px 14px',
    fontSize: 14, cursor: 'pointer', fontWeight: 500,
  };
  if (kind === 'primary') return { ...base, background: '#fbbf24', color: '#1a1a1a' };
  if (kind === 'danger') return { ...base, background: '#dc2626', color: '#fff' };
  if (kind === 'ghost') return { ...base, background: 'transparent', color: '#cbd5e1', borderColor: '#334155' };
  return base;
}
