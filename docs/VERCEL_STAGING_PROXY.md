# Proxy de API da Vercel — staging NexusDev

**Status:** preparação documentada; rewrite externo ainda não configurado.
**Branch alvo:** `rebuild/v2-security`.
**Destino autorizado:** somente um Web Service de staging criado separadamente no Render.
**Produção:** não alterar nem apontar Preview para `https://nexusdev-1rq3.onrender.com`.

## Por que o rewrite ainda não foi adicionado

O destino externo precisa ser a URL real atribuída pelo Render ao novo serviço de staging. Esse serviço ainda não foi criado, portanto seu hostname não existe/foi confirmado. Colocar um placeholder no `vercel.json` quebraria as chamadas da API no Preview; usar o endereço conhecido de produção violaria o isolamento. Por isso, o `vercel.json` continua com apenas o fallback SPA até que o host de staging seja confirmado.

## Configuração final esperada

Depois que o serviço de staging existir e sua URL tiver sido conferida no painel do Render, atualizar o `vercel.json` desta branch. O rewrite externo da API deve aparecer antes do fallback SPA:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://<HOST-REAL-DO-STAGING>.onrender.com/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Substituir o placeholder pelo hostname exato do serviço de staging. Não usar domínio de produção, não acrescentar segredo ou token à URL e não configurar rewrite para host arbitrário. Preservar o restante da configuração Vercel existente.

## Contrato do frontend

- `VITE_API_BASE_URL` deve permanecer vazio no Preview que usa o proxy.
- O código já constrói as chamadas com caminhos relativos quando a variável está vazia.
- Não colocar segredos em variáveis `VITE_*`; elas são incorporadas ao bundle público.
- Não usar a URL direta do Render no frontend após ativar o proxy same-origin.
- O frontend deve continuar tratando respostas de erro sem simular login, sessão, XP ou certificado.

## Cache e transporte

- Não adicionar regras de cache para `/api/*`.
- O backend deve retornar `Cache-Control: no-store` para login, refresh, logout, CSRF, reautenticação, exportação de dados e demais respostas privadas.
- Verificar no navegador que as respostas da API mantêm a origem Vercel e que os cabeçalhos `Set-Cookie` são encaminhados e aplicados corretamente.
- Verificar que o cookie de refresh permanece `Secure`, `HttpOnly`, `Path=/`, sem `Domain`; o cookie `__Host-` precisa ser emitido pela origem Vercel vista pelo navegador.
- O backend deve permitir a origem Preview exata em `CORS_ORIGINS`, pois o middleware de segurança pode validar `Origin` mesmo quando a navegação é same-origin.
- Não assumir que rewrite por si só completa autenticação por cookie. Os endpoints de sessão, refresh, logout, autenticação e CSRF ainda precisam de migração coordenada.

## Procedimento após provisionamento do staging

1. Confirmar hostname e health check do backend de staging no Render.
2. Confirmar que a variável `MONGO_URI` do serviço aponta apenas para o banco de teste.
3. Aplicar o rewrite acima, substituindo o placeholder pelo hostname confirmado.
4. Manter `VITE_API_BASE_URL=` vazio no ambiente Preview.
5. Confirmar a origem Preview exata e incluí-la na allowlist CORS do backend de staging.
6. Executar build e CI da branch.
7. Fazer deploy apenas de Preview e validar login, cookies, refresh, logout, CSRF e cache em navegador.
8. Inspecionar Network e logs sem registrar credenciais, cookies ou tokens.

## Estado atual verificado

- `src/App.jsx` usa `VITE_API_BASE_URL || ''`, portanto aceita a origem atual quando a variável está vazia.
- `vercel.json` ainda contém somente o fallback SPA.
- Nenhum destino externo foi configurado.
- Nenhum serviço Render foi criado e nenhuma URL de produção foi usada nesta preparação.
