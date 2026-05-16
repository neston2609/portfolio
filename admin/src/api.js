// Thin fetch wrapper. Always sends cookies, JSON encodes bodies, surfaces
// the server's error string on non-2xx.

const BASE = '/api';

async function request(method, path, body, opts = {}) {
  const init = { method, credentials: 'include', headers: {} };
  if (body instanceof FormData) {
    init.body = body;
  } else if (body !== undefined) {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }
  const res = await fetch(BASE + path, init);
  if (res.status === 401 && !opts.allow401) {
    // session expired; force re-login
    if (location.pathname !== '/login') location.assign('/login');
  }
  const text = await res.text();
  const data = text ? safeJson(text) : null;
  if (!res.ok) {
    const msg = (data && data.error) || res.statusText || 'request failed';
    throw new Error(msg);
  }
  return data;
}

function safeJson(s) {
  try { return JSON.parse(s); } catch { return s; }
}

export const api = {
  get: (p, opts) => request('GET', p, undefined, opts),
  post: (p, b, opts) => request('POST', p, b, opts),
  patch: (p, b) => request('PATCH', p, b),
  put: (p, b) => request('PUT', p, b),
  delete: (p) => request('DELETE', p),
};
