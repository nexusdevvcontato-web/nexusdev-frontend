import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const appSource = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');

test('student JavaScript is never dynamically evaluated in the app origin', () => {
  assert.doesNotMatch(appSource, /\bnew\s+Function\s*\(/);
  assert.doesNotMatch(appSource, /\beval\s*\(/);
  assert.match(appSource, /isolated-runner-unavailable/);
});

test('HTML preview is restricted by a deny-by-default CSP', () => {
  assert.match(appSource, /default-src 'none'/);
  assert.match(appSource, /script-src 'none'/);
  assert.match(appSource, /connect-src 'none'/);
  assert.match(appSource, /form-action 'none'/);
});

test('HTML preview and test fixture sandboxes do not enable scripts', () => {
  assert.match(appSource, /sandbox=""/);
  assert.doesNotMatch(appSource, /sandbox="[^"]*allow-scripts/);
  assert.match(appSource, /setAttribute\('sandbox', 'allow-same-origin'\)/);
  assert.doesNotMatch(appSource, /setAttribute\('sandbox', '[^']*allow-scripts/);
});

test('JavaScript challenges fail closed while the isolated runner is unavailable', () => {
  assert.match(appSource, /if \(challenge\.language !== 'html'\)[\s\S]{0,500}setAllPassed\(false\)/);
});
