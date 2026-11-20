import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');

test('legacy offline queue is never replayed automatically', () => {
  assert.match(source, /Legacy offline actions are intentionally not replayed/);
  assert.doesNotMatch(source, /authenticatedFetch\(\x60\$\{API_BASE_URL\}\/api\/progress\/complete/);
  assert.doesNotMatch(source, /authenticatedFetch\(\x60\$\{API_BASE_URL\}\/api\/certificates\/issue/);
  assert.doesNotMatch(source, /onEnqueueSync/);
});

test('legacy local queue storage is preserved without being imported', () => {
  assert.doesNotMatch(source, /localStorage\.getItem\(\x60nexusdev_sync_queue_/);
  assert.match(source, /Old localStorage queue entries are left untouched/);
});
