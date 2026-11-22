import test from 'node:test';
import assert from 'node:assert/strict';
import { extractPasswordResetLocation } from '../src/auth/password-reset-url.js';

test('accepts reset token only from fragment and preserves unrelated URL state', () => {
  const result = extractPasswordResetLocation({
    pathname: '/app',
    search: '?theme=dark&passwordResetToken=query-secret',
    hash: '#passwordResetToken=fragment-secret&tab=security'
  });
  assert.equal(result.token, 'fragment-secret');
  assert.equal(result.cleanedUrl, '/app?theme=dark#tab=security');
});

test('does not accept query-string reset tokens and removes them from the URL', () => {
  const result = extractPasswordResetLocation({
    pathname: '/app',
    search: '?passwordResetToken=query-secret&source=email',
    hash: ''
  });
  assert.equal(result.token, '');
  assert.equal(result.cleanedUrl, '/app?source=email');
});

test('removes the fragment token even when unrelated fragment parameters remain', () => {
  const result = extractPasswordResetLocation({
    pathname: '/',
    search: '',
    hash: '#tab=login&passwordResetToken=one-time-secret'
  });
  assert.equal(result.token, 'one-time-secret');
  assert.equal(result.cleanedUrl, '/#tab=login');
});

test('handles empty and malformed URL parts without throwing', () => {
  assert.deepEqual(extractPasswordResetLocation({}), { token: '', cleanedUrl: '/' });
});
