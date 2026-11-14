import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 3030;
const OUT_DIR = path.resolve('out');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath.endsWith('/')) {
    reqPath += 'index.html';
  } else if (!path.extname(reqPath)) {
    // Try file.html or file/index.html
    if (fs.existsSync(path.join(OUT_DIR, reqPath + '.html'))) {
      reqPath += '.html';
    } else if (fs.existsSync(path.join(OUT_DIR, reqPath, 'index.html'))) {
      reqPath = path.join(reqPath, 'index.html');
    }
  }

  const filePath = path.join(OUT_DIR, reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // Dynamic SPA client route fallback (/product/* or /shop/*) or 404
    const notFoundPath = path.join(OUT_DIR, '404.html');
    if (fs.existsSync(notFoundPath)) {
      const isDynamicRoute = reqPath.startsWith('/product/') || reqPath.startsWith('/shop/');
      res.writeHead(isDynamicRoute ? 200 : 404, { 'Content-Type': 'text/html' });
      fs.createReadStream(notFoundPath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
