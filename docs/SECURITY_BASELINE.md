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

## Frontend audit — current findings

- The profile snapshot is no longer persisted in `localStorage`. The UI now restores identity from the server-backed session and reloads the profile through `/api/me`; this avoids displaying stale personal data from a previous browser session.
- Local lesson drafts, local progress, capstone form state and community-comment cache still use browser storage. Their retention, account-switch isolation and migration behavior need a separate compatibility review before changing storage keys.
- The current local-storage namespace includes the account email in its key. A future migration should use a stable opaque account identifier and preserve existing local drafts without exposing email in storage keys.
- The editor uses `dangerouslySetInnerHTML` only for syntax highlighting. Its current helper escapes HTML metacharacters before adding fixed markup; this path should receive dedicated regression tests for hostile learner input.
- API calls are spread across the main component and use both the session-aware helper and direct `fetch`. A shared API client with consistent response validation, error handling and cache policy remains a recommended refactor.
- `index.html` still loads Tailwind from the unpinned CDN. Removing that runtime dependency requires bundling the utility CSS locally and verifying the full visual build; it remains a production-hardening item, not silently removed in this security-only pass.
- The frontend CI currently verifies the Vite production build. Dedicated component/integration tests for session restoration, account switching, browser-storage isolation and hostile editor content remain to be added.
- No production deployment was performed. The Vercel Preview remains the only frontend deployment target for this branch.
