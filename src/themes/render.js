// Render a theme's index.html for a specific child.
//
// The theme HTML must contain a placeholder comment <!--PORTFOLIO_DATA-->
// somewhere in <head>. We replace it with a <script> tag injecting
// window.PORTFOLIO_DATA + a window.L helper, plus a base href that rewrites
// asset URLs (./foo.jsx) into our /_theme-assets/<slug>/foo.jsx route.
//
// If a theme doesn't include the placeholder we fall back to injecting just
// before </head>.

const fs = require('fs');
const path = require('path');

function buildDataScript(portfolioData, childMeta) {
  // IMPORTANT: childMeta must win when both sides define a `meta` key, otherwise
  // editing any meta field in the admin form would wipe out server-computed
  // fields like avatar_url, name, and nickname.
  const portfolioMeta = (portfolioData && portfolioData.meta) || {};
  const mergedMeta = { ...portfolioMeta, ...childMeta };
  // Strip nulls from childMeta so portfolioMeta's value shows through for
  // fields the server didn't compute.
  for (const k of Object.keys(mergedMeta)) {
    if (mergedMeta[k] == null && portfolioMeta[k] != null) mergedMeta[k] = portfolioMeta[k];
  }
  const payload = JSON.stringify({
    ...portfolioData,
    meta: mergedMeta,
  }).replace(/</g, '\\u003c'); // safe-encode for inline <script>
  return `<script>
window.PORTFOLIO_DATA = ${payload};
window.L = function L(field, lang) {
  if (field == null) return '';
  if (typeof field === 'string' || typeof field === 'number') return field;
  return field[lang] != null ? field[lang]
       : field.en != null ? field.en
       : field.th != null ? field.th : '';
};
</script>`;
}

function renderTheme(theme, { portfolioData, childMeta, assetBase }) {
  const indexPath = path.join(theme.dir, theme.entry_file);
  let html = fs.readFileSync(indexPath, 'utf8');

  // Rewrite relative asset URLs (src="variant.jsx" -> src="/_theme-assets/variant.jsx").
  // We do NOT use a <base href> tag here because that would also re-anchor
  // every same-page hash link (#about, #powers, ...) to /_theme-assets/#about,
  // breaking the in-page nav.
  html = rewriteRelativePaths(html, assetBase);

  const injection = [
    buildDataScript(portfolioData, childMeta),
    buildVisibilityCss(portfolioData),
    MOBILE_CSS,
  ].join('\n');

  if (html.includes('<!--PORTFOLIO_DATA-->')) {
    html = html.replace('<!--PORTFOLIO_DATA-->', injection);
  } else if (/<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, `${injection}\n</head>`);
  } else {
    html = injection + html;
  }
  return html;
}

// Hidden sections get a CSS rule that drops them via the section's stable id.
// Data keys -> section ids in our 4 built-in themes (the design uses
// `quests` for projects, `contact` for social).
const SECTION_ID_BY_KEY = {
  about: 'about', powers: 'powers', education: 'education',
  projects: 'quests', youtube: 'youtube', scratch: 'scratch',
  gallery: 'gallery', achievements: 'achievements', social: 'contact',
};
// Mobile responsive overrides applied to every theme at render time.
// The 4 built-in themes (and most uploaded ones following the Claude Design
// shape) lay everything out with inline-styled CSS Grid sized for desktop
// (3-4 columns, big section padding). On a phone those grids cramp into
// 75px-wide columns and the design becomes unusable. Rather than edit each
// theme's hundreds of inline styles, we let CSS specificity do the work:
// !important rules in a max-width media query override the inline styles
// only when the viewport is narrow.
//
// Targets are intentionally aggressive — we'd rather over-stack a layout
// on mobile than leave it cramped.
const MOBILE_CSS = `<style id="rasikawan-mobile">
@media (max-width: 768px) {
  /* Stack any inline-styled multi-column grid into a single column.
     Catches everything that React renders as style="grid-template-columns:..."  */
  *[style*="grid-template-columns"] {
    grid-template-columns: 1fr !important;
    gap: 14px !important;
  }
  /* Auto rows that were sized for desktop become "as tall as content" */
  *[style*="grid-auto-rows"] {
    grid-auto-rows: auto !important;
  }
  /* Tight horizontal padding on sections — desktop uses 32-48px which eats
     most of a 375px screen */
  section {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }
  /* Allow horizontal flex rows (nav menus, social link bars, hero CTAs) to
     wrap onto multiple lines instead of overflowing */
  *[style*="display:flex"], *[style*="display: flex"] {
    flex-wrap: wrap !important;
  }
  /* Big inline min-heights (hero panels) cap to content height */
  *[style*="min-height: 540"], *[style*="min-height:540"],
  *[style*="min-height: 480"], *[style*="min-height:480"] {
    min-height: auto !important;
  }
  /* Oversized headlines can break across lines without horizontal scroll */
  h1, h2, h3 { word-break: break-word !important; }
  /* Final safety net: never scroll the page sideways */
  html, body { overflow-x: hidden !important; }
}
@media (max-width: 480px) {
  section {
    padding-left: 12px !important;
    padding-right: 12px !important;
    padding-top: 24px !important;
    padding-bottom: 24px !important;
  }
}
</style>`;

function buildVisibilityCss(data) {
  const hidden = [];
  for (const [k, id] of Object.entries(SECTION_ID_BY_KEY)) {
    if (data && data[k] && data[k].__hidden) hidden.push('#' + id);
  }
  if (hidden.length === 0) return '';
  return `<style>${hidden.join(', ')} { display: none !important; }</style>`;
}

// Rewrite relative src= and href= attributes to prepend assetBase.
// Leaves these untouched:
//   - absolute URLs (http://, https://, //)
//   - root-relative paths (/foo)
//   - anchor hashes (#about) — critical for in-page nav
//   - mailto:, tel:, javascript:, data: URIs
function rewriteRelativePaths(html, assetBase) {
  const base = assetBase.endsWith('/') ? assetBase : assetBase + '/';
  return html.replace(
    /(\s(?:src|href)\s*=\s*)(["'])([^"']+)\2/gi,
    (full, prefix, quote, val) => {
      if (/^(https?:)?\/\/|^\/|^#|^mailto:|^tel:|^javascript:|^data:/i.test(val)) {
        return full;
      }
      // Strip a leading "./" so we don't double the slash.
      const clean = val.replace(/^\.\//, '');
      return `${prefix}${quote}${base}${clean}${quote}`;
    }
  );
}

module.exports = { renderTheme };
