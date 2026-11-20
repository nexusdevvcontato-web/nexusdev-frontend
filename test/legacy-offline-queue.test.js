import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');

test('legacy offline queue has no automatic replay worker or enqueue path', () => {
  assert.match(source, /Legacy offline actions are intentionally not replayed/);
  assert.doesNotMatch(source, /pingAndFlush|for \(const item of syncQueue\)|onEnqueueSync|enqueueSyncItem/);
});

test('legacy local queue storage is preserved without being imported', () => {
  assert.doesNotMatch(source, /localStorage\.getItem\(\x60nexusdev_sync_queue_/);
  assert.match(source, /Old localStorage queue entries are left untouched/);
});
