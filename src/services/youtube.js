// YouTube Data API v3 fetcher with in-memory cache.
//
// Given a channel handle (e.g. "@kong-adventures") plus a desired video count,
// returns { channel: {...}, items: [...] } shaped to match the existing
// portfolio data shape so themes don't need to change.
//
// Cache is keyed by `${handle}:${count}` with a 10-min TTL. Misses make at
// most 3 API calls (channel, playlistItems, videos). Errors return null so
// the renderer can fall back to admin-provided data.

const config = require('../config');

const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map(); // key -> { at: epoch_ms, data }

function cacheGet(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) { cache.delete(key); return null; }
  return hit.data;
}

function cachePut(key, data) {
  cache.set(key, { at: Date.now(), data });
  // soft cap so the map can't grow without bound
  if (cache.size > 200) cache.delete(cache.keys().next().value);
}

async function api(path, params) {
  if (!config.youtubeApiKey) return null;
  const url = new URL('https://www.googleapis.com/youtube/v3/' + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set('key', config.youtubeApiKey);
  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.warn('[youtube] api error', res.status, body.slice(0, 200));
    return null;
  }
  return res.json();
}

// Parse "@handle" or "handle" or a full URL -> bare handle.
function normalizeHandle(input) {
  if (!input) return null;
  let s = String(input).trim();
  // strip URL prefix
  s = s.replace(/^https?:\/\/(www\.)?youtube\.com\//, '').replace(/\/$/, '');
  // strip leading slash and @
  s = s.replace(/^\/?@?/, '');
  // drop any sub-path (e.g. "kong-adventures/videos")
  s = s.split('/')[0];
  return s || null;
}

// Convert ISO-8601 PT#M#S duration -> "M:SS".
function isoDurationToShort(iso) {
  if (!iso) return '';
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return iso;
  const h = Number(m[1] || 0), min = Number(m[2] || 0), sec = Number(m[3] || 0);
  if (h) return `${h}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${min}:${String(sec).padStart(2, '0')}`;
}

function compactCount(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return String(n);
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(v >= 10_000_000 ? 0 : 1) + 'M';
  if (v >= 1_000) return (v / 1_000).toFixed(v >= 10_000 ? 0 : 1) + 'K';
  return String(v);
}

async function fetchChannelData(handleInput, maxVideos = 4) {
  if (!config.youtubeApiKey) return null;
  const handle = normalizeHandle(handleInput);
  if (!handle) return null;

  const cacheKey = `${handle}:${maxVideos}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  try {
    // 1) Channel by handle (the `forHandle` param was added in 2023).
    const chRes = await api('channels', {
      part: 'snippet,statistics,contentDetails',
      forHandle: handle,
    });
    if (!chRes || !chRes.items || chRes.items.length === 0) return null;
    const ch = chRes.items[0];
    const uploadsId = ch.contentDetails?.relatedPlaylists?.uploads;

    // 2) Latest N video IDs from the uploads playlist.
    let videoIds = [];
    if (uploadsId) {
      const plRes = await api('playlistItems', {
        part: 'contentDetails',
        playlistId: uploadsId,
        maxResults: String(Math.max(1, Math.min(50, maxVideos))),
      });
      videoIds = (plRes?.items || [])
        .map((it) => it.contentDetails?.videoId)
        .filter(Boolean);
    }

    // 3) Per-video stats + thumbnails + duration.
    let videos = [];
    if (videoIds.length) {
      const vRes = await api('videos', {
        part: 'snippet,statistics,contentDetails',
        id: videoIds.join(','),
      });
      videos = (vRes?.items || []).map((v) => ({
        title: { en: v.snippet?.title || '' },
        kind: { en: v.snippet?.channelTitle || '' },
        duration: isoDurationToShort(v.contentDetails?.duration),
        views: compactCount(v.statistics?.viewCount || 0),
        date: (v.snippet?.publishedAt || '').slice(0, 7),
        url: `https://www.youtube.com/watch?v=${v.id}`,
        thumbnail: v.snippet?.thumbnails?.medium?.url || v.snippet?.thumbnails?.default?.url || null,
      }));
    }

    const result = {
      channel: {
        name: { en: ch.snippet?.title || '' },
        handle: '@' + handle,
        tagline: { en: ch.snippet?.description?.split('\n')[0]?.slice(0, 120) || '' },
        subs: compactCount(ch.statistics?.subscriberCount || 0),
        videos: Number(ch.statistics?.videoCount || 0),
        views: compactCount(ch.statistics?.viewCount || 0),
        url: `https://www.youtube.com/@${handle}`,
        thumbnail: ch.snippet?.thumbnails?.medium?.url || ch.snippet?.thumbnails?.default?.url || null,
      },
      items: videos,
    };

    cachePut(cacheKey, result);
    return result;
  } catch (e) {
    console.warn('[youtube] fetch failed:', e.message);
    return null;
  }
}

module.exports = { fetchChannelData, normalizeHandle };
