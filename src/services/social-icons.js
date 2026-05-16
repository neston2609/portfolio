// Detect a social-platform key (matching a file in src/assets/icons/<key>.svg)
// from a social link's label and href. Anything we can't recognise falls back
// to 'link'. Admins can override the detection by uploading a custom icon
// to the item's icon_url field.

const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.resolve(__dirname, '..', 'assets', 'icons');

// (regex matched against label OR href, lowercased) -> icon name.
// Order matters: URL-scheme prefixes (mailto:, tel:) get first crack so a
// "mailto:me@x.com" doesn't trip the twitter rule on the trailing x.com.
const RULES = [
  [/mailto:|\bemail\b|\bgmail\b/i, 'email'],
  [/tel:|\bphone\b|\bwhatsapp\b/i, 'phone'],
  [/\byoutube\b|youtu\.be|youtube\.com/i, 'youtube'],
  [/\bfacebook\b|\bfb\b|facebook\.com/i, 'facebook'],
  [/\binstagram\b|\binsta\b|instagram\.com|\bIG\b/i, 'instagram'],
  [/\btwitter\b|twitter\.com|\bx\.com\b|^x$/i, 'twitter'],
  [/\btiktok\b|tiktok\.com|tik tok/i, 'tiktok'],
  [/\bdiscord\b|discord\.gg|discord\.com/i, 'discord'],
  [/\bgithub\b|github\.com/i, 'github'],
  [/\blinkedin\b|linkedin\.com/i, 'linkedin'],
  [/\bschool\b|\bcollege\b|\buniversity\b/i, 'school'],
];

function detectPlatform(label, href) {
  const haystack = `${label || ''} ${href || ''}`;
  for (const [pattern, name] of RULES) {
    if (pattern.test(haystack)) return name;
  }
  return 'link';
}

function listAvailableIcons() {
  if (!fs.existsSync(ICONS_DIR)) return [];
  return fs.readdirSync(ICONS_DIR)
    .filter((f) => f.endsWith('.svg'))
    .map((f) => f.replace(/\.svg$/, ''));
}

function iconPath(name) {
  const safe = String(name).replace(/[^a-z0-9_-]/gi, '');
  if (!safe) return null;
  const p = path.join(ICONS_DIR, `${safe}.svg`);
  return fs.existsSync(p) ? p : null;
}

module.exports = { detectPlatform, listAvailableIcons, iconPath };
