# Cliente de autenticação por sessão no frontend

**Branch:** `rebuild/v2-security`  
**Status:** cliente frontend integrado ao contrato paralelo; sem teste real contra Render/Vercel staging.

## Armazenamento

- Access token existe somente na memória do módulo `src/auth/session-client.js` e no estado React enquanto a aplicação está aberta.
- A chave legada `nexusdev_token` é removida no carregamento; o frontend não grava novo access token em localStorage/sessionStorage.
- O perfil em cache pode continuar em localStorage para apresentação, mas nunca é aceito como prova de autenticação.
- Refresh token permanece somente no cookie HttpOnly `__Host-nexusdev_refresh`; JavaScript não consegue lê-lo.
- O cookie CSRF `__Host-nexusdev_csrf` é lido para preencher o cabeçalho `X-CSRF-Token`.

## Ciclo de vida

1. Na inicialização, o cliente chama `POST /api/auth/session/refresh` com credentials include e CSRF.
2. O backend roda a rotação e retorna access token curto no JSON.
3. O token é mantido em memória e usado como Bearer nas rotas protegidas.
4. Uma renovação preventiva ocorre a cada 8 minutos e ao retornar o foco/visibilidade.
5. Se uma requisição autenticada recebe 401, `authenticatedFetch` tenta renovar uma vez e repetir a chamada.
6. Logout chama o endpoint real, limpa o token da memória e notifica as outras abas.

## Coordenação entre abas

- A rotação é serializada por Web Locks API usando o lock `nexusdev-session-refresh`.
- O access token nunca é transmitido por BroadcastChannel.
- BroadcastChannel transmite somente evento de logout para encerrar a sessão em memória nas outras abas.
- Se Web Locks não estiver disponível, a renovação falha de forma fechada para evitar duas abas consumirem simultaneamente o mesmo refresh token rotativo. O usuário precisará usar um navegador compatível/uma única aba após atualizar o suporte.

## Limites e pendências

- A integração requer `SESSION_ACCESS_TOKEN_SECRET` no backend staging e cookies HTTPS válidos.
- O domínio de Preview e a origem permitida precisam estar alinhados com o proxy Vercel -> Render staging.
- Ainda não foram executados testes de browser para login, refresh, replay, duas abas, logout e revogação.
- O frontend ainda depende de configuração de Client ID Google para o fluxo Google.
- A migração é paralela: rotas antigas continuam aceitando JWT legado enquanto o backend está configurado; não remover o contrato antigo nesta etapa.
- Nenhum token ou segredo foi adicionado ao repositório.
