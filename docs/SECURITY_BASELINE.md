# NexusDev 2.0 — Frontend security baseline

This document is the acceptance baseline for frontend migration. It does not claim that
the legacy application is already compliant.

## P0 — required before production

- Remove local/demo authentication paths that accept or persist plaintext passwords.
- Treat the backend as the authority for identity, permissions, progress and rewards.
- Do not put secrets in Vite client environment variables; all `VITE_*` values are public.
- Restrict session handling to the approved authentication design; never store passwords.
- Do not execute learner JavaScript with `new Function`, `eval`, or in the application window.
- Run learner code in a separately isolated execution service/origin with resource limits.
- Keep preview frames sandboxed; validate message origin, source and message schema.
- Render user-generated text safely; do not inject untrusted HTML.
- Validate all API response shapes before using security-sensitive values.
- Apply a restrictive Content Security Policy and remove production CDN script dependencies
  where practical.

## Migration gates

1. Inventory each legacy flow and its data dependencies.
2. Implement the replacement behind a feature boundary.
3. Add tests for authorization assumptions and hostile inputs.
4. Verify keyboard accessibility and responsive behavior.
5. Compare behavior with the current production application.
6. Do not route production traffic to the rebuild until explicit approval.
