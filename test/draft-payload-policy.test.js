import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidDraftFiles, validateRemoteDraft, validateSavedDraftResponse } from '../src/drafts/draft-payload-policy.js';

test('accepts a valid persisted draft and preserves its revision', () => {
  const draft = { revision: 7, files: { 'index.js': 'const answer = 42;' } };
  assert.deepEqual(validateRemoteDraft({ draft }), draft);
});

test('accepts only an empty file map at revision zero', () => {
  assert.deepEqual(validateRemoteDraft({ draft: { revision: 0, files: {} } }), {
    revision: 0,
    files: {}
  });
  assert.throws(() => validateRemoteDraft({
    draft: { revision: 0, files: { 'index.js': 'stale' } }
  }), /draft_response_invalid/);
});

test('normalizes the API empty-draft representation without weakening persisted-draft validation', () => {
  assert.deepEqual(validateRemoteDraft({
    draft: { revision: 0, files: null, updatedAt: null }
  }), { revision: 0, files: {}, updatedAt: null });
  assert.throws(() => validateRemoteDraft({
    draft: { revision: 1, files: null }
  }), /draft_response_invalid/);
});

test('rejects missing, negative, fractional, unsafe, and malformed revisions', () => {
  for (const revision of [undefined, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, '2', null]) {
    assert.throws(() => validateRemoteDraft({
      draft: { revision, files: { 'index.js': 'ok' } }
    }), /draft_response_invalid/);
  }
});

test('rejects persisted revisions with empty or invalid file maps', () => {
  for (const files of [{}, [], null, { '../index.js': 'bad' }, { 'index.js': 'bad\u0000code' }]) {
    assert.throws(() => validateRemoteDraft({
      draft: { revision: 1, files }
    }), /draft_response_invalid/);
  }
});

test('enforces aggregate UTF-8 byte limits, not JavaScript character counts', () => {
  assert.equal(isValidDraftFiles({ 'a.js': 'é'.repeat(20 * 1024) }), true);
  assert.equal(isValidDraftFiles({ 'a.js': 'é'.repeat(20 * 1024 + 1) }), false);
});

test('rejects arrays, empty maps, unsafe names, control characters, and oversized files', () => {
  assert.equal(isValidDraftFiles([]), false);
  assert.equal(isValidDraftFiles({}), false);
  assert.equal(isValidDraftFiles(Object.fromEntries(Array.from({ length: 11 }, (_, i) => [`file${i}.js`, 'x']))), false);
  assert.equal(isValidDraftFiles({ '../x.js': 'x' }), false);
  assert.equal(isValidDraftFiles({ 'x.js': 'a\u0001b' }), false);
  assert.equal(isValidDraftFiles({ 'x.js': 'x'.repeat(50 * 1024 + 1) }), false);
});

test('accepts only the exact next revision after a successful save', () => {
  assert.equal(validateSavedDraftResponse({
    saved: true,
    draft: { revision: 4 }
  }, 3), 4);
});

test('rejects stale, skipped, unsafe, or malformed save revisions', () => {
  const invalid = [
    { saved: true, draft: { revision: 3 } },
    { saved: true, draft: { revision: 5 } },
    { saved: true, draft: { revision: Number.MAX_SAFE_INTEGER + 1 } },
    { saved: false, draft: { revision: 4 } },
    { saved: true, draft: {} },
    null
  ];
  for (const payload of invalid) {
    assert.throws(() => validateSavedDraftResponse(payload, 3), /draft_save_response_invalid/);
  }
  assert.throws(() => validateSavedDraftResponse({
    saved: true,
    draft: { revision: 1 }
  }, Number.MAX_SAFE_INTEGER), /draft_save_response_invalid/);
});
