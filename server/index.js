import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { handleGenerateMoment } from './generateMoment.js';
import { handleLiveMatches } from './footballApi.js';
import { handleTrendingShorts } from './youtubeShorts.js';
import { readFileSync, existsSync } from 'fs';

// Rate Limiting (in-memory)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 200; // 200 requests per IP per minute

function checkRateLimit(ip) {
  const now = Date.now();
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  const record = rateLimitMap.get(ip);
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW_MS;
    return true;
  }
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  record.count++;
  return true;
}

const rootDir = resolve(process.cwd());
const publicDir = join(rootDir, 'public');
const port = Number(process.env.PORT || 3000);

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp'
};

/**
 * Safely joins and resolves a path to prevent directory traversal attacks.
 * @param {string} baseDir - The root directory.
 * @param {string} requestPath - The requested relative path.
 * @returns {string|null} The resolved absolute path, or null if invalid.
 */
function safeJoin(baseDir, requestPath) {
  const normalizedPath = requestPath.replace(/^\/+/, '');
  const resolvedPath = resolve(baseDir, normalizedPath);
  if (!resolvedPath.startsWith(baseDir)) {
    return null;
  }

  return resolvedPath;
}

/**
 * Serves a static file with appropriate Content-Type and Cache-Control headers.
 * @param {import('node:http').ServerResponse} response - The HTTP response object.
 * @param {string} filePath - Absolute path to the file.
 */
async function sendFile(response, filePath) {
  try {
    const fileContents = await readFile(filePath);
    const extension = extname(filePath).toLowerCase();
    
    // Efficiency: Cache static assets aggressively (1 year)
    const isStaticAsset = ['.js', '.css', '.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(extension);
    const cacheControl = isStaticAsset ? 'public, max-age=31536000, immutable' : 'no-store';

    response.writeHead(200, {
      'Content-Type': contentTypes[extension] || 'application/octet-stream',
      'Cache-Control': cacheControl
    });
    response.end(fileContents);
  } catch (error) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
}

export const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
  const clientIp = request.headers['x-forwarded-for'] || request.socket.remoteAddress || 'unknown';

  // Security: Apply Rate Limiting
  if (!checkRateLimit(clientIp)) {
    response.writeHead(429, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ error: 'Too Many Requests' }));
    return;
  }

  // Security: Apply Security Headers
  response.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('X-XSS-Protection', '1; mode=block');
  // Only allow our own scripts and CDN scripts
  response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://images.unsplash.com https://upload.wikimedia.org https://i.guim.co.uk https://phantom-marca.unidadeditorial.es; connect-src 'self' https://generativelanguage.googleapis.com https://www.googleapis.com; frame-src 'self' https://www.youtube.com");

  // Enable CORS headers for ease of local testing and remote containerized access
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  // Health check endpoint
  if (url.pathname === '/api/health') {
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ ok: true, service: 'viral-match-moment' }));
    return;
  }

  // Live football data API route
  if (url.pathname === '/api/live-matches') {
    await handleLiveMatches(request, response);
    return;
  }

  // Live match-moment AI generation route
  if (url.pathname === '/api/generate-moment') {
    await handleGenerateMoment(request, response);
    return;
  }

  // YouTube trending football shorts route
  if (url.pathname === '/api/trending-shorts') {
    await handleTrendingShorts(request, response);
    return;
  }

  // Route to serve FIFA AI dashboard
  if (url.pathname === '/' || url.pathname === '/buddy' || url.pathname === '/fifa') {
    const filePath = join(rootDir, 'index.html');
    await sendFile(response, filePath);
    return;
  }

  // Route to serve the Smart Stadium (VMM) screen
  if (url.pathname === '/vmm') {
    const filePath = join(publicDir, 'index.html');
    await sendFile(response, filePath);
    return;
  }

  // Route to serve Smart Stadium sub-page
  if (url.pathname === '/vmm' || url.pathname === '/vmm/' || url.pathname === '/viral-moment') {
    const filePath = join(publicDir, 'index.html');
    await sendFile(response, filePath);
    return;
  }

  // Route to serve FIFA AI dashboard javascript logic
  if (url.pathname === '/app.js') {
    const filePath = join(rootDir, 'app.js');
    await sendFile(response, filePath);
    return;
  }

  // Serve static assets from public/ directory
  const filePath = safeJoin(publicDir, url.pathname);
  if (!filePath) {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Forbidden');
    return;
  }

  await sendFile(response, filePath);
});

// Only start listening automatically if run directly (not imported in tests)
if (process.env.NODE_ENV !== 'test') {
  server.listen(port, () => {
    console.log(`Smart Stadium listening on http://localhost:${port}`);
  });
}
