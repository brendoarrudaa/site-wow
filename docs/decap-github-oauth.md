# Decap CMS — GitHub OAuth via Vercel

O login do `/admin` usa a própria aplicação Next.js como proxy OAuth para o GitHub.
O client_secret nunca é exposto ao browser.

## Fluxo

```
/admin → abre popup → /api/auth → GitHub OAuth → /api/auth/callback → postMessage → /admin
```

1. O Decap CMS abre um popup para `/api/auth`
2. `/api/auth` gera um `state` CSRF, salva em cookie httpOnly, redireciona para GitHub
3. GitHub autentica o usuário e redireciona para `/api/auth/callback?code=...&state=...`
4. `/api/auth/callback` valida o state, troca o code pelo token com a API do GitHub
5. O token é enviado de volta ao Decap CMS via `window.opener.postMessage`

## Variáveis de ambiente (Vercel)

| Variável | Valor |
|---|---|
| `OAUTH_CLIENT_ID` | Client ID do GitHub OAuth App |
| `OAUTH_CLIENT_SECRET` | Client Secret do GitHub OAuth App |
| `NEXT_PUBLIC_SITE_URL` | `https://azerothlegacy.com` |

## Configurar o GitHub OAuth App

1. Acesse <https://github.com/settings/developers> → **OAuth Apps** → **New OAuth App**
2. Preencha:
   - **Application name**: Azeroth Legacy CMS
   - **Homepage URL**: `https://azerothlegacy.com`
   - **Authorization callback URL**: `https://azerothlegacy.com/api/auth/callback`
3. Copie o **Client ID** e gere um **Client Secret**
4. Adicione ambos como variáveis de ambiente na Vercel

## Desenvolvimento local

Use `npm run dev:cms` — isso roda `next dev` + `decap-server` em paralelo.

A rota `/api/admin-config` detecta `NODE_ENV=development` e serve o config com `local_backend: true`,
apontando para o servidor local do Decap em `http://localhost:8081`.

```bash
npm run dev:cms
# CMS disponível em http://localhost:3000/admin
```

Para autenticar com GitHub em desenvolvimento (sem local_backend), use `npm run dev` apenas
e faça login normalmente — será necessário ter `OAUTH_CLIENT_ID` e `OAUTH_CLIENT_SECRET` no `.env`.

## Arquivos envolvidos

| Arquivo | Papel |
|---|---|
| `app/api/auth/route.js` | Inicia o fluxo OAuth, gera state CSRF |
| `app/api/auth/callback/route.js` | Recebe o callback, valida state, troca code por token |
| `app/api/admin-config/route.js` | Serve o config.yml dinâmico (dev vs produção) |
| `public/admin/index.html` | Carrega o Decap CMS, aponta config para `/api/admin-config` |
| `public/admin/config.yml` | Referência estática (não carregado em runtime) |
| `next.config.js` | Sobrescreve `Cross-Origin-Opener-Policy` para `/admin` e `/api/auth` |

## Por que o COOP precisa ser `unsafe-none` no admin?

O fluxo OAuth usa um popup. Quando o popup navega pelo GitHub (cross-origin), o browser
sever o `window.opener` por padrão com `COOP: same-origin`. Sem a sobrescrita para
`unsafe-none`, o `window.opener.postMessage` no callback falha silenciosamente e o login
nunca completa.
