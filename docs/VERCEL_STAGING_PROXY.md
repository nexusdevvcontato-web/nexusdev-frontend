# Proxy de API da Vercel — staging NexusDev

**Status:** configurado na branch de staging; documentação atualizada.
**Branch:** `rebuild/v2-security`.
**Frontend:** projeto Vercel `nexusdev-frontend`, Preview protegido por SSO.
**Backend de staging:** serviço Render `nexusdev-staging-v2`.
**Banco:** MongoDB Atlas `NexusDev Staging`, database `nexusdev_staging`.

> Produção permanece isolada. Não apontar Preview para o backend de produção, não fazer merge para `main` e não alterar serviços ou dados de produção.

## Roteamento atual

O arquivo `vercel.json` desta branch contém, nesta ordem:

1. Rewrite de `/api/:path*` para `https://nexusdev-staging-v2.onrender.com/api/:path*`.
2. Fallback SPA de `/(.*)` para `/index.html`.

O rewrite é same-origin para o navegador: o frontend chama caminhos relativos `/api/*`; a Vercel encaminha essas requisições ao backend de staging.

## Ambientes e URLs

- Render staging: `https://nexusdev-staging-v2.onrender.com`
- Health check configurado no Render: `/api/health`
- Vercel Preview branch alias: `https://nexusdev-frontend-git-rebuild-v2-security-nexusdevvcontato-4011.vercel.app`
- Acesso ao Preview continua protegido por Vercel SSO. Não desabilitar SSO nem criar Preview público.

A URL de produção do Render não é destino válido para este proxy e não deve ser usada em Preview.

## Contrato do frontend

- `VITE_API_BASE_URL` permanece vazio no Preview que usa o proxy.
- `src/api/client.js` usa caminhos relativos quando a variável está vazia.
- `apiFetch` inclui `credentials: 'include'` e usa `cache: 'no-store'` por padrão.
- Não colocar segredos em variáveis `VITE_*`; elas podem ser incorporadas ao bundle público.
- Não configurar o frontend para chamar diretamente o backend de produção.

## CORS, cookies e cache

- A variável `CORS_ORIGINS` do Render staging deve permitir a origem exata do Preview branch alias indicada acima.
- O backend deve preservar a validação de Origin e os atributos seguros dos cookies de sessão.
- Respostas privadas e de autenticação devem usar `Cache-Control: no-store`.
- Não adicionar regras de cache para `/api/*`.
- Ao validar no navegador, inspecionar status, origem, cookies e cabeçalhos sem registrar ou compartilhar credenciais, cookies ou tokens.
- O rewrite, isoladamente, não comprova o funcionamento completo dos fluxos de autenticação. Refresh, logout, CSRF e persistência de sessão precisam ser validados no Preview protegido.

## Configuração operacional do Render

- Serviço: `nexusdev-staging-v2`.
- Branch conectada: `rebuild/v2-security`.
- Auto Deploy: desligado; deploys devem ser manuais e somente após CI aprovado.
- Health check path: `/api/health`.
- A configuração de banco do serviço deve apontar exclusivamente para o cluster e database de staging.
- Nunca registrar valores de variáveis de ambiente, URI de banco, tokens ou segredos nesta documentação.

## Procedimento seguro para mudanças futuras

1. Fazer alterações somente em `rebuild/v2-security`.
2. Revisar o diff e confirmar que o destino do rewrite continua sendo o Render staging.
3. Executar e aguardar CI verde.
4. Se houver alteração de backend, avaliar e autorizar separadamente um deploy manual do serviço Render staging.
5. Se houver alteração de frontend que exija publicação, considerar a quota de deploys e manter SSO habilitado.
6. Validar os fluxos necessários com contas e dados sintéticos.
7. Não fazer merge para `main`, não alterar produção e não usar dados reais de usuários.

## Limites da validação registrada

A integração Vercel Preview → rewrite → Render staging já respondeu HTTP 200 no health check em uma verificação anterior. Essa resposta foi obtida antes do deploy mais recente do backend. Após esse deploy, os logs do Render confirmaram inicialização do servidor e conexão ao MongoDB, mas uma nova chamada HTTP ao health check ainda não foi confirmada. Não interpretar status `READY` do Preview ou logs de inicialização como teste E2E completo.
