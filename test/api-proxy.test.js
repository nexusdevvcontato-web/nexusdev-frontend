import test from 'node:test';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import handler from '../api/proxy.js';
import { PassThrough } from 'node:stream';

function responseSink() {
  const stream = new PassThrough();
  const chunks = [];
  stream.on('data', chunk => chunks.push(chunk));
  stream.statusCode = 200;
  stream.headers = {};
  stream.setHeader = function(name, value) { this.headers[name.toLowerCase()] = value; };
  stream.status = function(code) { this.statusCode = code; return this; };
  stream.endOriginal = stream.end.bind(stream);
  stream.end = function(chunk) { if (chunk) chunks.push(Buffer.from(chunk)); return stream.endOriginal(); };
  stream.bodyText = () => Buffer.concat(chunks).toString('utf8');
  return stream;
}

test('proxy fails closed when the preview secret is not configured', async () => {
  const previous = process.env.NEXUSDEV_PROXY_SECRET;
  delete process.env.NEXUSDEV_PROXY_SECRET;
  const res = responseSink();
  const finished = new Promise(resolve => res.once('finish', resolve));
  await handler({ url: '/api/proxy?path=health', query: { path: 'health' }, method: 'GET', headers: {} }, res);
  await finished;
  assert.equal(res.statusCode, 503);
  if (previous !== undefined) process.env.NEXUSDEV_PROXY_SECRET = previous;
});

test('proxy forwards only to the fixed staging API and preserves auth headers', async () => {
  const previousSecret = process.env.NEXUSDEV_PROXY_SECRET;
  const previousFetch = globalThis.fetch;
  process.env.NEXUSDEV_PROXY_SECRET = 's'.repeat(48);
  let captured;
  globalThis.fetch = async (url, options) => {
    captured = { url: String(url), options };
    return new Response('ok', { status: 200, headers: { 'content-type': 'text/plain', 'cache-control': 'no-store' } });
  };
  try {
    const res = responseSink();
    const finished = new Promise(resolve => res.once('finish', resolve));
    await handler({
      url: '/api/proxy?path=auth%2Fsession%2Flogin&source=test',
      query: { path: 'auth/session/login' },
      method: 'POST',
      headers: { cookie: 'session=synthetic', origin: 'https://preview.example', 'content-type': 'application/json', 'x-csrf-token': 'csrf' },
      body: { email: 'synthetic@example.invalid', password: 'not-a-real-password' }
    }, res);
    await finished;
    assert.equal(captured.url, 'https://nexusdev-staging-v2.onrender.com/api/auth/session/login?source=test');
    assert.equal(captured.options.headers.get('x-nexus-proxy-key'), 's'.repeat(48));
    assert.equal(captured.options.headers.get('cookie'), 'session=synthetic');
    assert.equal(captured.options.headers.get('origin'), 'https://preview.example');
    assert.equal(captured.options.body, JSON.stringify({ email: 'synthetic@example.invalid', password: 'not-a-real-password' }));
    assert.equal(res.bodyText(), 'ok');
  } finally {
    globalThis.fetch = previousFetch;
    if (previousSecret === undefined) delete process.env.NEXUSDEV_PROXY_SECRET;
    else process.env.NEXUSDEV_PROXY_SECRET = previousSecret;
  }
});

test('SPA fallback uses a Vercel-supported matcher that excludes API routes', () => {
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  const fallback = config.rewrites.find(rule => rule.destination === '/index.html');
  assert.ok(fallback, 'SPA fallback rewrite must exist');
  assert.equal(fallback.source, '/:path((?!api/).*)');
  const matcher = new RegExp('^(?!api/).*');
  assert.equal(matcher.test('api/health'), false);
  assert.equal(matcher.test('api/auth/session/login'), false);
  assert.equal(matcher.test(''), true);
  assert.equal(matcher.test('student/profile'), true);
});
