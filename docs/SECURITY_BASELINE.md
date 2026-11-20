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

## Account-scoped browser storage migration

- Authenticated learning data now uses the opaque MongoDB account identifier returned by the authenticated API, rather than embedding the user's email address in local-storage keys.
- The frontend migrates only the known legacy keys for the currently authenticated email: local completion snapshot, community XP, streak, capstone checklist/submission, and lesson drafts. Public comment cache remains separately keyed by lesson because it contains public discussion data.
- Migration copies a legacy value only when the stable-ID destination is absent, then removes the legacy key. It does not merge conflicting values or transfer data between accounts.
- Storage writes are paused until the new account namespace has been loaded, preventing the previous account's in-memory state from being written into the next account's namespace during an account switch.
- If the authenticated response does not provide a valid 24-character MongoDB ObjectId, account-scoped persistence is disabled rather than falling back to email or shared guest storage.
- The migration is client-side and was not run against any production or staging user account. The Vite build validates compilation; browser-level migration and account-switch tests remain a required follow-up.

## Pending synchronization queue isolation

- The synchronization queue now has a separate local-storage namespace per authenticated MongoDB account ID. A queue is loaded and persisted only after the matching owner namespace has been selected.
- The global legacy key `nexusdev_sync_queue` is deliberately not imported or replayed: its records have no trustworthy owner identifier, so assigning them to whichever account logs in next could disclose or submit another person's code or certificate data.
- Queue entries are limited to 25 and filtered to the two known record types. Unknown record types are retained rather than silently discarded.
- The flush process now requires the queue owner to match the authenticated account, checks each HTTP response's `ok` status before removing an item, and aborts in-flight fetches when the effect is cleaned up (including account changes).
- The old queue is left untouched for now; no production or staging browser storage was accessed. The current application does not enqueue new items through this path, so browser-level queue replay tests are still needed before treating offline synchronization as a supported feature.
- Tailwind CSS is now compiled locally with pinned `tailwindcss`, `postcss`, and `autoprefixer` versions. The runtime CDN script was removed from `index.html`, and `src/main.jsx` imports the local stylesheet entrypoint.
- `package-lock.json` (lockfile v3) is committed, the npm package manager is pinned to `10.8.2`, and frontend CI uses `npm ci` before the Vite build. This makes dependency installation reproducible from the committed lockfile.
- The generated Vercel Preview for the rebuild branch returned HTTP 200 for the HTML and compiled CSS assets; the CSS response contained Tailwind utilities and responsive breakpoint rules. This validates delivery of the compiled stylesheet, not a full browser visual or interaction regression.
- A source review found conditional class names expressed as complete literal Tailwind class strings in template expressions; Tailwind's content scan can detect those literals. No dynamically assembled utility fragments requiring a safelist were identified in the reviewed frontend source.
- Browser-level visual checks at mobile/desktop widths and interactive regression tests remain outstanding. No production deployment was made.

## Student-code execution containment

- Removed both in-page `new Function()` evaluators and the loop-rewriting helper. Student JavaScript must not execute in the NexusDev application origin, where it could access account-scoped browser storage or authenticated application capabilities.
- Until the isolated runner is deployed and integrated end to end, JavaScript challenge verification fails closed: it reports that execution is unavailable, does not mark a challenge complete, and cannot grant XP. The memory inspector is disabled for the same reason.
- HTML/CSS preview uses a sandboxed iframe and a deny-by-default Content Security Policy: scripts, network connections, forms, nested frames, objects, and external resources are blocked. Inline styles remain available for CSS lessons.
- The hidden HTML test fixture uses an iframe sandbox that permits parent DOM inspection but does not grant script execution. The same restrictive CSP is applied to the fixture document.
- Added Node built-in regression tests for the absence of dynamic JavaScript evaluation, the iframe/CSP restrictions, and fail-closed challenge behavior. Frontend CI runs `npm test` before `npm run build`.
- This is a temporary safety restriction, not a completed code-execution feature. The separate runner remains undeployed and has no provisioned signing key; do not enable JavaScript verification, XP, or certificates based on client-side execution.

## Frontend dependency security baseline

- Frontend build dependencies were updated to `vite@6.4.6`, `@vitejs/plugin-react@4.3.4`, and `postcss@8.5.33`. The React plugin release supports Vite 6; the Vite 6.4.6 release is the patched Vite 6 line. The Node runtime requirement is recorded as `>=20.19.0`.
- The lockfile was regenerated with npm 10.8.2, lockfile v3, and is committed with the manifest.
- CI uses `npm ci`, runs the security regression tests, reports npm audit details, enforces `npm audit --audit-level=low`, then builds.
- On the CI run for the refreshed lockfile, npm reported **0 vulnerabilities**, all four frontend security regression tests passed, and Vite completed the build successfully.
