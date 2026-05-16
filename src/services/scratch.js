// Scratch (scratch.mit.edu) fetcher with in-memory cache.
//
// Scratch's public API is unauthenticated — no key needed. We hit:
//   https://api.scratch.mit.edu/users/<handle>           (profile, joined date)
//   https://api.scratch.mit.edu/users/<handle>/projects  (N most recent projects)
//
// Each project comes back with stats (views, loves, favorites, remixes) and a
// thumbnail URL, so the renderer can show real cards without admin input.
//
// Cache is keyed by `${handle}:${count}` with a 10-min TTL. On error or
// missing handle the function returns null and the renderer keeps the
// admin-typed fallback values.

const SCRATCH_API = 'https://api.scratch.mit.edu';
const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map();

function cacheGet(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) { cache.delete(key); return null; }
  return hit.data;
}
function cachePut(key, data) {
  cache.set(key, { at: Date.now(), data });
  if (cache.size > 200) cache.delete(cache.keys().next().value);
}

// Accept "kong-coder", "@kong-coder", or a profile URL.
function normalizeHandle(input) {
  if (!input) return null;
  let s = String(input).trim();
  s = s.replace(/^https?:\/\/(www\.)?scratch\.mit\.edu\/users\//, '').replace(/\/$/, '');
  s = s.replace(/^@/, '');
  s = s.split('/')[0];
  // Scratch usernames are 3-20 chars: letters, digits, underscore, hyphen.
  return /^[A-Za-z0-9_-]{1,30}$/.test(s) ? s : null;
}

function compactCount(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return String(n);
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(v >= 10_000_000 ? 0 : 1) + 'M';
  if (v >= 1_000) return (v / 1_000).toFixed(v >= 10_000 ? 0 : 1) + 'K';
  return String(v);
}

async function fetchScratchData(handleInput, maxProjects = 4) {
  const handle = normalizeHandle(handleInput);
  if (!handle) return null;

  const cacheKey = `${handle}:${maxProjects}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  try {
    // 1) User profile.
    const userRes = await fetch(`${SCRATCH_API}/users/${handle}`);
    if (!userRes.ok) {
      // 404 = no such user. Cache the negative briefly so we don't pound the API.
      cachePut(cacheKey, null);
      return null;
    }
    const user = await userRes.json();

    // 2) Recent projects (Scratch's API tops out around 40 per page; we cap at 40).
    const limit = Math.max(1, Math.min(40, Number(maxProjects)));
    const projRes = await fetch(`${SCRATCH_API}/users/${handle}/projects?limit=${limit}`);
    const projects = projRes.ok ? await projRes.json() : [];

    const result = {
      profile: {
        handle,
        // Followers/total project count aren't in the public API; the renderer
        // keeps the admin's manual value for those fields when set.
        projectsShared: projects.length,
        url: `https://scratch.mit.edu/users/${handle}/`,
        bio: user.profile?.bio || '',
        joined: user.history?.joined || null,
      },
      items: projects.map((p) => ({
        id: p.id,
        title: { en: p.title || 'Untitled' },
        kind: { en: 'Scratch project' },
        plays: compactCount(p.stats?.views || 0),
        loves: Number(p.stats?.loves || 0),
        favorites: Number(p.stats?.favorites || 0),
        remixes: Number(p.stats?.remixes || 0),
        blocks: 0, // not exposed by the API
        emoji: '🎮',
        bg: '#312e81',
        thumbnail: p.image || null,
        url: `https://scratch.mit.edu/projects/${p.id}/`,
      })),
    };

    cachePut(cacheKey, result);
    return result;
  } catch (e) {
    console.warn('[scratch] fetch failed:', e.message);
    return null;
  }
}

module.exports = { fetchScratchData, normalizeHandle };
