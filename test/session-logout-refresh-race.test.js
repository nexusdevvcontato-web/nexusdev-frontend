import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/auth/session-client.js', import.meta.url), 'utf8');

test('refresh captures the session epoch before issuing the refresh request', () => {
  const start = source.indexOf('async function performRefresh()');
  const end = source.indexOf('\nexport function refreshSession()', start);
  const body = source.slice(start, end);
  assert.match(body, /if \(logoutInProgress\) return null/);
  assert.match(body, /const refreshEpoch = sessionEpoch/);
  assert.match(body, /refreshEpoch !== sessionEpoch \|\| logoutInProgress/);
});

test('logout invalidates any refresh already in flight before awaiting the network', () => {
  const start = source.indexOf('export async function logoutSession(token)');
  const end = source.indexOf('\n}', start) + 2;
  const body = source.slice(start, end);
  assert.ok(body.indexOf('logoutInProgress = true') < body.indexOf('await fetch('));
  assert.ok(body.indexOf('sessionEpoch += 1') < body.indexOf('await fetch('));
  assert.match(body, /logoutInProgress = false/);
});

test('refresh cannot start while logout is being processed', () => {
  const start = source.indexOf('export function refreshSession()');
  const end = source.indexOf('\n}', start) + 2;
  const body = source.slice(start, end);
  assert.match(body, /if \(logoutInProgress\) return Promise\.resolve\(null\)/);
});

test('refresh and logout resolve their endpoints through the authenticated API URL policy', () => {
  assert.match(source, /function sessionApiUrl\(path\)/);
  assert.match(source, /resolveAuthenticatedApiUrl\(path/);
  assert.match(source, /fetch\(sessionApiUrl\('\/api\/auth\/session\/refresh'\)/);
  assert.match(source, /fetch\(sessionApiUrl\('\/api\/auth\/session\/logout'\)/);
  assert.doesNotMatch(source, /fetch\(\x60\$\{API_BASE_URL\}\/api\/auth\/session\//);
});
