import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { handleGenerateMoment } from './generateMoment.js';
import { handleLiveMatches } from './footballApi.js';
import { handleTrendingShorts } from './youtubeShorts.js';

const rootDir = resolve(process.cwd());
const publicDir = join(rootDir, 'public');
const port = Number(process.env.PORT || 3000);

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp'
};

function safeJoin(baseDir, requestPath) {
  const normalizedPath = requestPath.replace(/^\/+/, '');
  const resolvedPath = resolve(baseDir, normalizedPath);
  if (!resolvedPath.startsWith(baseDir)) {
    return null;
  }

  return resolvedPath;
}

async function sendFile(response, filePath) {
  try {
    const fileContents = await readFile(filePath);
    const extension = extname(filePath).toLowerCase();
    response.writeHead(200, {
      'Content-Type': contentTypes[extension] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    response.end(fileContents);
  } catch (error) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);

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

server.listen(port, () => {
  console.log(`Smart Stadium listening on http://localhost:${port}`);
});
