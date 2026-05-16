// Session-based admin auth. Sessions are scoped to the admin subdomain by
// cookie domain (configured in src/server.js).

function requireAdmin(req, res, next) {
  if (req.session && req.session.adminId) return next();
  return res.status(401).json({ error: 'unauthorized' });
}

// Admin REST API only answers on admin.<root>. Other tenants get 404 so the
// API surface is invisible from public portfolio pages.
function adminOnly(req, res, next) {
  if (req.tenant && req.tenant.kind === 'admin') return next();
  return res.status(404).send('Not found');
}

module.exports = { requireAdmin, adminOnly };
