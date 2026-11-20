# Frontend/backend integration contract

Branch: `rebuild/v2-security`

## Environment and isolation

- The frontend reads `VITE_API_BASE_URL`; an empty value uses the same origin.
- Configure the preview build with the matching staging API origin. Do not point this branch at production.
- The API must allow the exact preview origin in backend `CORS_ORIGINS`.
- This value is public configuration, not a secret. Never put credentials or signing keys in Vite variables.

## Confirmed API contract

| Operation | Request | Response / behavior |
|---|---|---|
| Register | `POST /api/auth/register`, `{name,email,password}` | `{token,user}`, HTTP 201 |
| Login | `POST /api/auth/login`, `{email,password}` | `{token,user}` |
| Google | `POST /api/auth/google`, `{credential}` | `{token,user}`; backend verifies Google ID token |
| Current user | `GET /api/me`, Bearer token | User object directly, not wrapped in `user` |
| Progress | `POST /api/progress/complete`, `{challengeId,files,completionProof}` | XP/progress object; proof is mandatory |
| Certificate | `POST /api/certificates/issue`, `{studentName,githubUrl,liveUrl}` | `{verified,code,studentName,completedCount,xp,issuedAt,...}` |
| Certificate lookup | `GET /api/certificates/:code` | `{valid:true,code,...}` only for issued certificates |
| Leaderboard | `GET /api/leaderboard` | `{leaderboard:[...]}` |
| Tutor | `POST /api/tutor/analyze`, lesson/code context | `{tips:[...]}` |
| Read comments | `GET /api/lessons/:lessonId/comments` | `{comments:[...]}` |
| Create comment | Authenticated `POST /api/lessons/:lessonId/comments`, `{text}` | `{comment,xp}`; comments do not award XP |

## Changes made in this audit

- Removed the hard-coded production Render API URL; endpoint selection is environment-specific.
- Removed local fallback registration/login that stored plaintext passwords and created unauthenticated pseudo-accounts when the API was unavailable.
- Removed decoding of the Google credential in the browser as a fallback identity mechanism. Only the backend-verified response establishes a session.
- Removed manual name/email Google sign-in; it did not prove identity.
- Removed the client-side +10 XP reward for comments; the backend explicitly does not grant XP for comments.
- Local lesson completion remains a local learning aid. The frontend no longer sends or queues an unverified completion as if it were eligible for cloud XP.
- Certificate UI no longer fabricates a local-looking verification code or reports a certificate as issued when the API fails or rejects the request.

## Known limitations / work remaining

- The isolated runner is not yet deployed and no completion-proof signing key is provisioned. Consequently `/api/progress/complete` intentionally returns 503 when the public key is absent, or 403 without a valid proof. Frontend local progress is not cloud-verified and cannot qualify for official XP/certificates.
- The frontend still has a large legacy local-state model. Local XP/progress must be visibly distinguished from server-verified XP/progress in a later UX pass.
- The tutor endpoint is currently public and has no dedicated rate limiter; it accepts caller-provided lesson context. Add request validation and a bounded limiter before exposing it broadly.
- Public comments and leaderboard are read-only endpoints; authenticated user state is refreshed through `/api/me`.
- No live staging API, MongoDB, OAuth provider, browser E2E, or deployment was exercised in this audit.

## Staging checklist

1. Deploy only the staging backend and set its secrets outside the repository.
2. Set backend `CORS_ORIGINS` to the exact frontend preview origin(s).
3. Set frontend `VITE_API_BASE_URL` to the staging API URL and rebuild.
4. Verify register/login/`/api/me`, Google verification, comments, tutor, leaderboard, and certificate error paths against staging.
5. Do not enable official lesson XP until the isolated runner, proof signer, public key, and adversarial integration tests are operational.
