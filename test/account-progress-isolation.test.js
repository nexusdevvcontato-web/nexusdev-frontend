import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');

test('Google login replaces prior account progress instead of merging accounts', () => {
  assert.match(source, /setCompletedChallenges\(apiData\.user\.completedIds\)/);
  assert.doesNotMatch(source, /Array\.from\(new Set\(\[\.\.\.prev, \.\.\.apiData\.user\.completedIds\]\)\)/);
});


test('a restored refresh session must load /api/me before account-scoped storage opens', () => {
  assert.match(source, /const \[sessionBootstrapComplete, setSessionBootstrapComplete\] = useState\(false\)/);
  assert.match(source, /const \[sessionIdentityResolved, setSessionIdentityResolved\] = useState\(false\)/);
  assert.match(source, /authenticatedFetch\(\x60\$\{API_BASE_URL\}\/api\/me\x60/);
  assert.match(source, /typeof data\?\.id !== 'string'.*?24/);
  assert.match(source, /const storageIdentityReady = sessionIdentityResolved && !sessionIdentityError && !storageLoadError/);
  assert.match(source, /Não foi possível confirmar sua sessão com segurança/);
});

test('profile restoration replaces client account identity only with a validated Mongo user id', () => {
  assert.match(source, /id: data\.id,[\s\S]*?provider: data\.provider \|\| prev\?\.provider \|\| 'email'/);
  assert.match(source, /if \(Array\.isArray\(data\.completedIds\)\) \{\s*setCompletedChallenges\(data\.completedIds\)/);
  assert.match(source, /setSessionIdentityError\(true\);\s*setSessionIdentityResolved\(true\)/);
});
