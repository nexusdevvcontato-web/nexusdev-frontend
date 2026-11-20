import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveAuthenticatedApiUrl } from '../src/auth/request-url-policy.js';

const origin = 'https://nexusdev-frontend.vercel.app';

test('allows same-origin relative and absolute API routes', () => {
  assert.equal(
    resolveAuthenticatedApiUrl('/api/me', { origin }),
    'https://nexusdev-frontend.vercel.app/api/me'
  );
  assert.equal(
    resolveAuthenticatedApiUrl('https://nexusdev-frontend.vercel.app/api/privacy/export', { origin }),
    'https://nexusdev-frontend.vercel.app/api/privacy/export'
  );
});

test('allows API routes on the explicitly configured backend origin', () => {
  assert.equal(
    resolveAuthenticatedApiUrl('/api/me', {
      origin,
      apiBaseUrl: 'https://nexusdev-staging-v2.onrender.com'
    }),
    'https://nexusdev-staging-v2.onrender.com/api/me'
  );
});

test('rejects external, protocol-relative, non-API and credential-bearing URLs', () => {
  for (const url of [
    'https://attacker.example/api/collect',
    '//attacker.example/api/collect',
    '/logout',
    '/api',
    'https://user@nexusdev-frontend.vercel.app/api/me',
    'javascript:alert(1)',
    '/api/../admin'
  ]) {
    assert.throws(() => resolveAuthenticatedApiUrl(url, { origin }));
  }
});

test('does not allow lookalike origins or an untrusted API base', () => {
  assert.throws(() => resolveAuthenticatedApiUrl(
    'https://nexusdev-frontend.vercel.app.attacker.example/api/me',
    { origin }
  ));
  assert.throws(() => resolveAuthenticatedApiUrl('/api/me', {
    origin,
    apiBaseUrl: 'javascript:alert(1)'
  }));
});

test('requires explicit URL and origin inputs', () => {
  assert.throws(() => resolveAuthenticatedApiUrl('/api/me'));
  assert.throws(() => resolveAuthenticatedApiUrl('', { origin }));
  assert.throws(() => resolveAuthenticatedApiUrl(42, { origin }));
});
