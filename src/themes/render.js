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
  const payload = JSON.stringify({
    meta: childMeta,
    ...portfolioData,
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

  const dataScript = buildDataScript(portfolioData, childMeta);
  const baseTag = `<base href="${assetBase}">`;

  const injection = `${baseTag}\n${dataScript}`;

  if (html.includes('<!--PORTFOLIO_DATA-->')) {
    html = html.replace('<!--PORTFOLIO_DATA-->', injection);
  } else if (/<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, `${injection}\n</head>`);
  } else {
    html = injection + html;
  }
  return html;
}

module.exports = { renderTheme };
