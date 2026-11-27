import test from 'node:test';
import assert from 'node:assert/strict';
import { getAuthFailureMessage } from '../src/auth/auth-error-message.js';

test('preserves a safe API validation message', () => {
  assert.equal(
    getAuthFailureMessage(409, { error: 'Este e-mail já está cadastrado. Faça login.' }),
    'Este e-mail já está cadastrado. Faça login.'
  );
});

test('reports HTTP status when the API response has no public error', () => {
  assert.equal(
    getAuthFailureMessage(503, {}),
    'A API respondeu com HTTP 503, mas não concluiu a autenticação. Informe este código ao suporte.'
  );
});

test('reports malformed successful responses without exposing response data', () => {
  assert.equal(
    getAuthFailureMessage(200, {}),
    'A API respondeu com HTTP 200, mas não concluiu a autenticação. Informe este código ao suporte.'
  );
});

test('uses a generic message for an invalid status', () => {
  assert.equal(
    getAuthFailureMessage(undefined, {}),
    'A API respondeu de forma inesperada. Tente novamente.'
  );
});
