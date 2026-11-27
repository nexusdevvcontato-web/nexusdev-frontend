import test from 'node:test';
import assert from 'node:assert/strict';
import { isAuthenticatedView, resolveViewForSession } from '../src/auth/protected-view-policy.js';

test('account and session views require an authenticated user', () => {
  for (const view of ['profile', 'sessions', 'privacy']) assert.equal(isAuthenticatedView(view), true);
  for (const view of ['home', 'dashboard', 'workspace', 'verify']) assert.equal(isAuthenticatedView(view), false);
});

test('restored private views fail closed until session identity is confirmed', () => {
  for (const view of ['profile', 'sessions', 'privacy']) {
    assert.equal(resolveViewForSession(view), 'home');
    assert.equal(resolveViewForSession(view, false, 'login'), 'login');
    assert.equal(resolveViewForSession(view, true), view);
  }
});

test('public views remain available without a session', () => {
  for (const view of ['home', 'dashboard', 'workspace', 'verify']) {
    assert.equal(resolveViewForSession(view), view);
  }
});
