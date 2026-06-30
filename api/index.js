const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const publicDir = path.join(__dirname, '..', 'src', 'public');
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.ico': 'image/x-icon'
};

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) return sendJson(res, 404, { error: 'Not found' });
    res.statusCode = 200;
    res.setHeader('Content-Type', contentTypes[path.extname(filePath)] || 'application/octet-stream');
    res.end(data);
  });
}

module.exports = async (req, res) => {
  const url = new URL(req.url, 'https://vercel.local');

  if (url.pathname === '/api/health') {
    return sendJson(res, 200, { ok: true, runtime: 'vercel-serverless-preview' });
  }

  if (url.pathname === '/api/csrf-token') {
    return sendJson(res, 200, { csrfToken: crypto.randomBytes(24).toString('hex') });
  }

  if (url.pathname.startsWith('/api/')) {
    return sendJson(res, 503, {
      error: 'Live WhatsApp bot APIs require a persistent Node.js server with MongoDB and session storage. Deploy this project on VPS, Docker, Railway, or Render for production bot connectivity.',
      docs: '/README.md'
    });
  }

  if (url.pathname === '/socket.io/socket.io.js') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    return res.end('window.io = window.io || undefined;');
  }

  const safePath = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
  const requested = path.join(publicDir, safePath === '/' ? 'index.html' : safePath);
  const filePath = requested.startsWith(publicDir) && fs.existsSync(requested) && fs.statSync(requested).isFile()
    ? requested
    : path.join(publicDir, 'index.html');
  return sendFile(res, filePath);
};
