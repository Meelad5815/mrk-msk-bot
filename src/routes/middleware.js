const jwt = require('jsonwebtoken');
const env = require('../config/env');
function requireAuth(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try { req.user = jwt.verify(token, env.jwtSecret); return next(); } catch { return res.status(401).json({ error: 'Invalid token' }); }
}
function requireAdmin(req, res, next) { return ['super_admin', 'admin'].includes(req.user?.role) ? next() : res.status(403).json({ error: 'Admin required' }); }
module.exports = { requireAuth, requireAdmin };
