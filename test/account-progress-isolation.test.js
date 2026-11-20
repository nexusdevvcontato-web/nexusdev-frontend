import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');

test('Google login replaces prior account progress instead of merging accounts', () => {
  assert.match(source, /setCompletedChallenges\(apiData\.user\.completedIds\)/);
  assert.doesNotMatch(source, /Array\.from\(new Set\(\[\.\.\.prev, \.\.\.apiData\.user\.completedIds\]\)\)/);
});
