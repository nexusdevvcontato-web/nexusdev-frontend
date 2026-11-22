import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveAuthenticatedApiUrl } from '../src/auth/request-url-policy.js';

const options = {
  apiBaseUrl: 'https://api.example.test',
  origin: 'https://app.example.test'
};

test('authenticated API URLs resolve only inside the configured API origin and namespace', () => {
  assert.equal(
    resolveAuthenticatedApiUrl('/api/auth/session/refresh', options),
    'https://api.example.test/api/auth/session/refresh'
  );
  assert.equal(
    resolveAuthenticatedApiUrl('https://api.example.test/api/lessons/lesson-1/draft', options),
    'https://api.example.test/api/lessons/lesson-1/draft'
  );
});

test('rejects cross-origin, protocol-relative and non-API authenticated targets', () => {
  for (const input of [
    'https://attacker.example/api/steal',
    '//attacker.example/api/steal',
    'https://app.example.test/api/steal',
    '/private/resource',
    '/api/../private',
    '/api/%2e%2e/private',
    'javascript:alert(1)',
    'data:text/plain,hello'
  ]) {
    assert.throws(() => resolveAuthenticatedApiUrl(input, options), TypeError, input);
  }
});

test('rejects malformed origins and credential-bearing URLs', () => {
  for (const input of ['', '   ', null, undefined]) {
    assert.throws(() => resolveAuthenticatedApiUrl(input, options), TypeError);
  }
  assert.throws(() => resolveAuthenticatedApiUrl('/api/test', {
    apiBaseUrl: 'https://user:password@api.example.test',
    origin: 'https://app.example.test'
  }), TypeError);
  assert.throws(() => resolveAuthenticatedApiUrl('https://user:password@api.example.test/api/test', options), TypeError);
  assert.throws(() => resolveAuthenticatedApiUrl('/api/test', {
    apiBaseUrl: 'javascript:alert(1)',
    origin: 'https://app.example.test'
  }), TypeError);
});

test('rejects insecure remote API origins but allows local HTTP development', () => {
  for (const apiBaseUrl of [
    'http://api.example.test',
    'http://192.0.2.10',
    'ftp://api.example.test'
  ]) {
    assert.throws(() => resolveAuthenticatedApiUrl('/api/test', {
      apiBaseUrl,
      origin: 'https://app.example.test'
    }), TypeError, apiBaseUrl);
  }

  assert.equal(
    resolveAuthenticatedApiUrl('/api/test', {
      apiBaseUrl: 'http://localhost:3000',
      origin: 'http://localhost:5173'
    }),
    'http://localhost:3000/api/test'
  );
  assert.equal(
    resolveAuthenticatedApiUrl('/api/test', {
      apiBaseUrl: 'http://127.0.0.1:3000',
      origin: 'http://localhost:5173'
    }),
    'http://127.0.0.1:3000/api/test'
  );
});
