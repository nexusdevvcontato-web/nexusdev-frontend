const STAGING_API_ORIGIN = 'https://nexusdev-staging-v2.onrender.com';
const SECRET_HEADER = 'x-nexus-proxy-key';
const REQUEST_HEADERS = ['accept', 'content-type', 'cookie', 'origin', 'user-agent', 'x-csrf-token'];
const RESPONSE_HEADERS = ['cache-control', 'content-disposition', 'content-type', 'etag', 'last-modified', 'retry-after', 'vary', 'x-request-id'];

export default async function handler(req, res) {
  const secret = process.env.NEXUSDEV_PROXY_SECRET;
  if (typeof secret !== 'string' || secret.length < 32) {
    res.statusCode = 503;
    res.setHeader('Cache-Control', 'no-store');
    return res.end('Proxy de API não configurado neste ambiente.');
  }

  let incoming;
  let target;
  try {
    incoming = new URL(req.url, 'https://vercel.invalid');
    if (!incoming.pathname.startsWith('/api/')) { res.statusCode = 404; return res.end('Not found'); }
    // The upstream origin is fixed to staging; request input can never select a host.
    target = new URL(incoming.pathname + incoming.search, STAGING_API_ORIGIN);
    if (target.origin !== STAGING_API_ORIGIN) { res.statusCode = 400; return res.end('Invalid API path'); }
  } catch {
    return res.status(400).end('Invalid API request');
  }

  const headers = new Headers();
  for (const name of REQUEST_HEADERS) {
    const value = req.headers[name];
    if (typeof value === 'string') headers.set(name, value);
  }
  headers.set(SECRET_HEADER, secret);

  let body;
  if (!['GET', 'HEAD'].includes(req.method || 'GET') && req.body != null) {
    if (typeof req.body === 'string' || Buffer.isBuffer(req.body)) body = req.body;
    else {
      body = JSON.stringify(req.body);
      if (!headers.has('content-type')) headers.set('content-type', 'application/json');
    }
  }

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body,
      redirect: 'manual',
      cache: 'no-store'
    });

    res.statusCode = upstream.status;
    for (const name of RESPONSE_HEADERS) {
      const value = upstream.headers.get(name);
      if (value) res.setHeader(name, value);
    }
    // Preserve multiple session-cookie headers separately.
    const cookies = upstream.headers.getSetCookie?.() || [];
    if (cookies.length) res.setHeader('set-cookie', cookies);

    if (req.method === 'HEAD' || !upstream.body) return res.end();
    const { Readable } = await import('node:stream');
    return Readable.fromWeb(upstream.body).pipe(res);
  } catch {
    res.statusCode = 502;
    res.setHeader('Cache-Control', 'no-store');
    return res.end('Não foi possível acessar a API de staging.');
  }
}
