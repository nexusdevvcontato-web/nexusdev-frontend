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
| Privacy export | Authenticated `GET /api/privacy/export`, Bearer token | JSON `schemaVersion: 2`, own profile data and comments linked by `authorUserId` |
| Privacy preferences | Authenticated `GET/PUT /api/privacy/preferences`, Bearer token | `{preferences:{showInLeaderboard,showCertificateDetails}}`; PUT accepts only boolean fields |
| Reauthentication | Authenticated `POST /api/auth/reauthenticate`, `{password}` for password accounts or `{credential}` for Google accounts | `{reauthToken,expiresIn}`; token is short-lived, user-bound and single-use; requires dedicated `REAUTH_TOKEN_SECRET` |
| Public certificate visibility | `GET /api/certificates/:code` | If details are hidden, `{valid:true,code,publicDetails:false}` without personal details |

## Parallel session authentication API

- Login/cadastro/Google use `/api/auth/session/*` and return a short-lived `accessToken`; refresh token is issued only as an HttpOnly cookie.
- Frontend keeps the access token in memory only and removes the legacy `nexusdev_token` key at startup.
- Refresh uses `POST /api/auth/session/refresh`, CSRF cookie/header, and Web Locks to serialize rotation across tabs. BroadcastChannel carries logout events only, never tokens.
- Protected requests use the in-memory access token and retry once after a 401-triggered refresh.
- Logout calls `POST /api/auth/session/logout`; other tabs clear their in-memory token on the broadcast event.
- The backend legacy `requireAuth` now accepts either a valid legacy JWT or a session access token linked to an active session, preserving existing protected routes during migration.
- The frontend still requires backend `SESSION_ACCESS_TOKEN_SECRET` in staging. Until provisioned, the parallel session endpoints return 503 by design.

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

1. Provision a separate Render staging backend and isolated test database; never reuse production credentials or data.
2. Confirm the actual staging hostname and the exact Vercel Preview origin.
3. Configure backend `CORS_ORIGINS` with the exact Preview origin.
4. Add the external `/api/*` rewrite to `vercel.json`, targeting only the confirmed staging hostname. Keep the rewrite before the SPA fallback and do not cache API responses.
5. Leave frontend `VITE_API_BASE_URL` empty so the browser uses same-origin `/api/*` requests through Vercel.
6. Build and deploy Preview only; verify register/login/`/api/me`, Google verification, comments, tutor, leaderboard, certificate error paths, cookies, refresh, logout and CSRF against staging.
7. Do not enable official lesson XP until the isolated runner, proof signer, public key, and adversarial integration tests are operational.

See `docs/VERCEL_STAGING_PROXY.md` for the proxy contract and the reason the rewrite remains unconfigured until a staging hostname exists.

## Central de privacidade no frontend

- O perfil do aluno oferece acesso à tela “Privacidade e dados”.
- A tela descreve categorias de dados armazenados, campos que podem aparecer publicamente e limitações conhecidas.
- O botão de exportação chama `GET /api/privacy/export` com o token da sessão e baixa a resposta JSON; falhas de rede/autorização são exibidas sem simular sucesso.
- A interface informa que comentários antigos sem vínculo, logs de infraestrutura e dados de provedores externos não estão incluídos e que exclusão/anonimização ainda não estão disponíveis.
- Nenhuma exclusão de conta, alteração de perfil ou mudança de visibilidade pública é executada nesta tela.

### Preferências granulares de visibilidade

- A central de privacidade carrega e salva as preferências no backend, sem depender apenas do estado local do navegador.
- A pessoa pode sair do ranking público ou ocultar os detalhes pessoais na validação pública do certificado.
- Um certificado com detalhes ocultos continua validável como autêntico; a resposta pública não contém nome, XP, progresso, data ou links.
- A tela informa que a opção de ranking controla somente a lista pública da API. O perfil local da própria sessão pode continuar visível ao titular.
- Contas legadas mantêm temporariamente os valores compatíveis com a divulgação anterior até que a pessoa altere as opções.
- O ranking não usa mais nomes fictícios de fallback quando a API retorna uma lista vazia.


### Reautenticação recente na Central de Privacidade

- A interface escolhe o método de confirmação com base no provedor da sessão: senha para contas locais ou botão oficial do Google Identity Services para contas Google.
- A credencial é enviada diretamente à API de staging com a sessão autenticada; a interface não decodifica tokens Google nem considera nome/e-mail digitados como prova de identidade.
- A prova retornada fica apenas em memória React enquanto a tela está montada; não é persistida em localStorage, sessionStorage ou URL. Ao sair da tela, é descartada.
- A confirmação apenas prepara a prova de uso único de cinco minutos. Não há botão nem endpoint de exclusão de conta conectado à interface.
- Para testes, configure o Client ID Google no frontend e o mesmo audience no backend de staging, além de `REAUTH_TOKEN_SECRET` distinto da chave de sessão. Não configure a URL de produção.


See `docs/FRONTEND_SESSION_CLIENT.md` for the client lifecycle, memory-only token handling, and cross-tab coordination details.
