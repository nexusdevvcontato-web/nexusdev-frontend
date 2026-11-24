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

test('a logout broadcast from another tab invalidates local refreshes', () => {
  assert.match(source, /event\.data\?\.type === 'logout'[\s\S]*?sessionEpoch \+= 1[\s\S]*?logoutInProgress = true[\s\S]*?accessToken = null/);
  assert.match(source, /if \(accessToken\) \{\s*logoutInProgress = false;\s*refreshRetryAfter = 0;/);
});

test('legacy email-keyed learning data is not automatically assigned to a user ID', async () => {
  const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
  assert.match(app, /Legacy email-keyed data is intentionally left untouched/);
  assert.doesNotMatch(app, /const legacyPrefix = \x60nexusdev_user_\$\{currentUser\.email\}\x60/);
  assert.doesNotMatch(app, /localStorage\.removeItem\(legacyKey\)/);
});


test('confirmed global logout clears this tab and broadcasts revocation to other tabs', async () => {
  const start = source.indexOf('export function finalizeSessionLogout()');
  const end = source.indexOf('\n}', start) + 2;
  const body = source.slice(start, end);
  assert.ok(start >= 0);
  assert.match(body, /logoutInProgress = true/);
  assert.match(body, /sessionEpoch \+= 1/);
  assert.match(body, /accessToken = null/);
  assert.match(body, /clearLocalCsrfCookie\(\)/);
  assert.match(body, /channel\?\.postMessage\(\{ type: 'logout' \}\)/);
  assert.match(body, /notify\(\{ type: 'logout' \}\)/);
});

test('global logout is broadcast only after the API confirms revocation', async () => {
  const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
  const start = app.indexOf('const revokeAll = async () =>');
  const end = app.indexOf('\n  };', start) + 5;
  const body = app.slice(start, end);
  assert.ok(body.indexOf('response.status !== 204') < body.indexOf('onLogoutAll()'));
  assert.match(app, /onLogoutAll=\{\(\) => \{\s*finalizeSessionLogout\(\)/);
});
