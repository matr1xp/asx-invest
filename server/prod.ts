import { createServer } from 'node:http';
import { createReadStream, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { routeApi } from './handlers';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const PORT = Number(process.env.PORT ?? 5173);
const HOST = process.env.HOST ?? '0.0.0.0';

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain',
};

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');

  if (routeApi(url, req, res)) return;

  // Resolve the requested file; fall back to index.html for SPA routes
  const rawPath = join(DIST, url.pathname);
  const filePath = existsSync(rawPath) && !rawPath.endsWith('/') ? rawPath : join(DIST, 'index.html');
  const ext = extname(filePath);

  res.setHeader('Content-Type', MIME[ext] ?? 'application/octet-stream');
  if (ext === '.html') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  } else if (url.pathname.startsWith('/assets/')) {
    // Vite fingerprints asset filenames — safe to cache forever
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }

  createReadStream(filePath)
    .on('error', () => { res.statusCode = 404; res.end('Not found'); })
    .pipe(res);
});

server.listen(PORT, HOST, () => {
  console.log(`[prod] ASX Tracker running at http://${HOST}:${PORT}`);
  console.log(`[prod] Serving static files from: ${DIST}`);
});
