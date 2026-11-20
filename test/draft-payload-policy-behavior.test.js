import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidDraftFiles,
  validateRemoteDraft,
  validateSavedDraftResponse
} from '../src/drafts/draft-payload-policy.js';

test('accepts only the documented empty cloud draft representation', () => {
  assert.deepEqual(validateRemoteDraft({ draft: { revision: 0, files: null } }), {
    revision: 0,
    files: {}
  });
  assert.deepEqual(validateRemoteDraft({ draft: { revision: 0, files: {} } }), {
    revision: 0,
    files: {}
  });
  assert.throws(() => validateRemoteDraft({ draft: { revision: 1, files: null } }));
});

test('validates draft file count, names, controls and byte limits', () => {
  assert.equal(isValidDraftFiles({ 'index.html': '<h1>ok</h1>' }), true);
  assert.equal(isValidDraftFiles(Object.fromEntries(
    Array.from({ length: 11 }, (_, index) => [`file${index}.js`, 'x'])
  )), false);
  assert.equal(isValidDraftFiles({ '../secret.js': 'x' }), false);
  assert.equal(isValidDraftFiles({ 'index.js': 'x\u0000y' }), false);
  assert.equal(isValidDraftFiles({ 'index.js': 'x'.repeat(50 * 1024 + 1) }), false);
  assert.equal(isValidDraftFiles({ 'index.js': 'x'.repeat(40 * 1024 + 1) }), false);
});

test('rejects malformed and non-monotonic cloud revisions', () => {
  assert.throws(() => validateRemoteDraft({ draft: { revision: -1, files: {} } }));
  assert.throws(() => validateRemoteDraft({ draft: { revision: 1.5, files: { 'index.js': 'x' } } }));
  assert.throws(() => validateRemoteDraft({ draft: { revision: 2, files: {} } }));
  assert.equal(validateSavedDraftResponse({ saved: true, draft: { revision: 4 } }, 3), 4);
  assert.throws(() => validateSavedDraftResponse({ saved: true, draft: { revision: 5 } }, 3));
  assert.throws(() => validateSavedDraftResponse({ saved: false, draft: { revision: 4 } }, 3));
});


test('rejects non-plain objects and prototype-sensitive file names', () => {
  assert.equal(isValidDraftFiles(Object.create(null)), false);
  assert.equal(isValidDraftFiles(new Date()), false);
  for (const name of ['__proto__', 'prototype', 'constructor']) {
    assert.equal(isValidDraftFiles({ [name]: 'x' }), false);
  }
});
