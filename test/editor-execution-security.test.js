import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');

test('JavaScript lessons are evaluated by the authenticated API, not dynamically executed in the browser', () => {
  assert.match(app, /const runTests = async/);
  assert.match(app, /Validação oficial do servidor/);
  assert.match(app, /onComplete\(challenge\.id, filesMap\)/);
  assert.match(app, /api\/progress\/complete/);
  assert.match(app, /markChallengeComplete = async \(challengeId, filesMap\)/);
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
