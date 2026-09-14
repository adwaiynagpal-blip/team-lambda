/**
 * Local proxy server — run this on your PC while using the Vercel-hosted controller.
 *
 * Why this exists:
 *   Browsers block HTTP requests from HTTPS pages (Mixed Content policy).
 *   BUT they allow HTTPS pages to fetch http://localhost (localhost is a secure-context exception).
 *   This proxy listens on localhost:8080 and forwards requests to your device's HTTP server.
 *
 * Usage:
 *   node proxy.js
 *
 * Then open your Vercel page — it will route through this proxy automatically.
 */

const http = require('http');

const PORT = 8080;

const ALLOWED_ORIGINS = [/^https:\/\/.*\.vercel\.app$/, /^http:\/\/localhost(:\d+)?$/, /^file:\/\//];

function getAllowedOrigin(origin) {
  if (!origin) return '*';
  return ALLOWED_ORIGINS.some(re => re.test(origin)) ? origin : '*';
}

const server = http.createServer((req, res) => {
  const origin = req.headers['origin'];
  const allowedOrigin = getAllowedOrigin(origin);

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Health check
  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': allowedOrigin });
    res.end('ok');
    return;
  }

  if (url.pathname !== '/proxy') {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found. Use GET /proxy?ip=<device-ip>&cmd=<command>');
    return;
  }

  const deviceIp = url.searchParams.get('ip');
  const cmd = url.searchParams.get('cmd');

  if (!deviceIp || !cmd) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Missing required params: ip, cmd');
    return;
  }

  const targetUrl = `http://${deviceIp}/data?cmd=${encodeURIComponent(cmd)}`;
  console.log(`[proxy] ${new Date().toLocaleTimeString()} -> ${targetUrl}`);

  const proxyReq = http.get(targetUrl, (proxyRes) => {
    const corsHeaders = { 'Access-Control-Allow-Origin': allowedOrigin };
    res.writeHead(proxyRes.statusCode, { ...proxyRes.headers, ...corsHeaders });
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error(`[proxy] Failed to reach device: ${err.message}`);
    res.writeHead(502, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': allowedOrigin,
    });
    res.end(`Proxy error: could not reach ${deviceIp} -- ${err.message}`);
  });

  proxyReq.setTimeout(5000, () => {
    proxyReq.destroy();
    res.writeHead(504, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': allowedOrigin,
    });
    res.end(`Timeout: device at ${deviceIp} did not respond within 5s`);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('');
  console.log('  Local proxy running at http://localhost:' + PORT);
  console.log('  Open your Vercel page -- commands will route through here');
  console.log('  Press Ctrl+C to stop');
  console.log('');
});
