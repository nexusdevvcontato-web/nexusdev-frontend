import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');

test('JavaScript exercises fail closed until the isolated runner is available', () => {
  assert.match(
    app,
    /const runTests = \(\) => \{\s*if \(challenge\.language !== 'html'\) \{\s*setTestResults\(\[\{\s*id: 'isolated-runner-unavailable'/
  );
  assert.match(app, /A execução foi temporariamente desativada para proteger sua conta/);
  assert.match(app, /O executor isolado ainda não está implantado/);
});

test('HTML exercise previews cannot execute scripts or make network requests', () => {
  assert.match(app, /iframe\.setAttribute\('sandbox', 'allow-same-origin'\)/);
  assert.doesNotMatch(app, /iframe\.setAttribute\('sandbox', '[^']*allow-scripts/);
  assert.match(app, /default-src 'none'; script-src 'none'; connect-src 'none'/);
  assert.match(app, /img-src data:/);
  assert.match(app, /form-action 'none'; base-uri 'none'/);
});

test('the frontend does not evaluate student JavaScript in its own page context', () => {
  assert.doesNotMatch(app, /\bnew\s+Function\s*\(/);
  assert.doesNotMatch(app, /\beval\s*\(/);
});
