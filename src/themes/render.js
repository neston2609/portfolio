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

  const injection = buildDataScript(portfolioData, childMeta);

  if (html.includes('<!--PORTFOLIO_DATA-->')) {
    html = html.replace('<!--PORTFOLIO_DATA-->', injection);
  } else if (/<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, `${injection}\n</head>`);
  } else {
    html = injection + html;
  }
  return html;
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
