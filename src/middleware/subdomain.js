const config = require('../config');

// Parse Host header into a tenant kind:
//   kind = 'admin'    -> admin.<root>           (admin panel)
//   kind = 'child'    -> <slug>.<root>          (one child portfolio)
//   kind = 'apex'     -> <root>                 (no tenant)
//   kind = 'unknown'  -> anything else
//
// In development, if DEV_FORCE_SUBDOMAIN is set, localhost requests are treated
// as that subdomain so you can develop without /etc/hosts editing.
function parseHost(hostHeader) {
  const raw = (hostHeader || '').toLowerCase().split(':')[0];
  if (!raw) return { kind: 'unknown', sub: null, host: raw };

  if (config.devForceSubdomain && (raw === 'localhost' || raw === '127.0.0.1')) {
    return classify(config.devForceSubdomain);
  }

  if (raw === config.rootDomain) return { kind: 'apex', sub: null, host: raw };

  const suffix = '.' + config.rootDomain;
  if (raw.endsWith(suffix)) {
    const sub = raw.slice(0, -suffix.length);
    return classify(sub);
  }

  // localhost without dev shim — treat as apex so admin works in plain dev
  if (raw === 'localhost' || raw === '127.0.0.1') {
    return { kind: 'apex', sub: null, host: raw };
  }

  return { kind: 'unknown', sub: null, host: raw };
}

function classify(sub) {
  if (sub === 'admin') return { kind: 'admin', sub: 'admin', host: sub };
  // multi-label subs (e.g. "a.b") aren't valid tenant slugs
  if (sub.includes('.')) return { kind: 'unknown', sub, host: sub };
  return { kind: 'child', sub, host: sub };
}

function tenantMiddleware(req, res, next) {
  req.tenant = parseHost(req.headers.host);
  next();
}

module.exports = { tenantMiddleware, parseHost };
