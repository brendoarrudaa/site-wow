# Meu Servidor — Site Oficial

Site oficial do servidor **Meu Servidor** (WoW WotLK 3.3.5a), construído com Next.js.

## Tecnologias

- [Next.js](https://nextjs.org/) — framework React com geração estática e API Routes
- [Tailwind CSS v4](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/) — estilização
- [Algolia](https://www.algolia.com/) — busca full-text no blog
- [iron-session](https://github.com/vvo/iron-session) — sessões seguras via cookie criptografado
- [mysql2](https://github.com/sidorares/node-mysql2) — conexão com o banco do servidor WoW
- [Vercel](https://vercel.com) — hospedagem e deploy automático

---

## Desenvolvimento local

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
# Acesse: http://localhost:3000

# Build de produção
npm run build

# Iniciar servidor de produção
npm run start
```

> O Docker do servidor WoW deve estar rodando para que login/cadastro funcionem:
> ```bash
> cd ../wow
> docker compose up -d ac-database
> ```

---

## Variáveis de ambiente

Crie (ou edite) o arquivo `.env` na raiz:

```env
# Algolia — busca do blog
NEXT_PUBLIC_ALGOLIA_APP_ID=
NEXT_PUBLIC_ALGOLIA_SEARCH_ONLY_KEY=
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=
ALGOLIA_ADMIN_KEY=
NEXT_PUBLIC_PROD_ALGOLIA=true

# Google Analytics
NEXT_PUBLIC_GA_TRACKING=

# CMS (Decap) — OAuth GitHub
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=
NEXT_PUBLIC_SITE_URL=https://seusite.com

# Banco de dados AzerothCore (acore_auth)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password

# Sessão — troque por uma string aleatória longa em produção (mín. 32 chars)
SESSION_SECRET=troque-por-uma-chave-secreta-de-32-chars-ou-mais
```

---

## Sistema de contas (autenticação WoW)

O login e cadastro do site compartilham o banco `acore_auth` com o servidor de jogo. A mesma conta serve para entrar no site **e** no cliente WoW.

### Fluxo de cadastro

```
Usuário preenche formulário
        ↓
POST /api/account/register
        ↓
Rate limit: 5 cadastros/hora por IP
Validações: formato username, e-mail, tipo dos campos
        ↓
Verifica se username/email já existem no banco
        ↓
Gera salt aleatório (32 bytes)
Calcula verifier SRP6 = g^x mod N
  onde x = SHA1(salt || SHA1(UPPER(user):UPPER(pass)))
        ↓
INSERT INTO acore_auth.account
        ↓
Cria sessão (cookie HttpOnly criptografado)
```

### Fluxo de login

```
Usuário preenche formulário
        ↓
POST /api/account/login
        ↓
Rate limit: 10 tentativas/15min por IP
        ↓
Busca conta no banco pelo username
        ↓
Verifica se conta está bloqueada ou failed_logins >= 10
        ↓
Recalcula verifier com a senha informada
Compara com verifier armazenado (timingSafeEqual)
        ↓
Se falhar: incrementa failed_logins
           Após 10 falhas: locked = 1 (bloqueio automático)
        ↓
Se sucesso: zera failed_logins, registra last_login e last_ip
            Cria sessão
```

### Por que SRP6?

O AzerothCore armazena senhas usando o protocolo **SRP6** (Secure Remote Password), que é o mesmo usado pelo cliente WoW para autenticar. Não há senha em texto plano nem hash simples — o banco guarda apenas um `salt` (32 bytes aleatórios) e um `verifier` (resultado de `g^x mod N`).

Isso significa que **o banco vazado sozinho não expõe as senhas** dos jogadores.

### Proteções implementadas

| Proteção | Detalhe |
|---|---|
| Rate limiting — cadastro | 5 cadastros/hora por IP |
| Rate limiting — login | 10 tentativas/15 min por IP |
| Lockout automático | Conta bloqueada após 10 falhas consecutivas |
| Validação de username | Apenas `[A-Za-z0-9_]`, 3–16 chars |
| Validação de e-mail | Regex no servidor (não só HTML5) |
| Type check | Rejeita campos que não sejam `string` (evita object injection) |
| IP seguro | Sanitização do `x-forwarded-for` |
| Resposta genérica | Login não revela se o usuário existe |
| Cookie seguro | HttpOnly, SameSite=Lax, Secure em produção |
| Comparação segura | `timingSafeEqual` evita timing attacks |

### Rotas de API

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/account/register` | Cria conta |
| `POST` | `/api/account/login` | Autentica e cria sessão |
| `POST` | `/api/account/logout` | Destroi a sessão |
| `GET` | `/api/account/session` | Retorna usuário da sessão atual |

---

## Arquivos relevantes

```
src/
├── lib/
│   ├── db.js          # Pool de conexão MySQL (acore_auth)
│   ├── session.js     # Configuração do iron-session
│   ├── srp6.js        # Implementação SRP6 compatível com AzerothCore
│   └── rateLimit.js   # Rate limiter in-memory por IP
└── pages/
    ├── cadastro.tsx   # Página de login/cadastro
    └── api/
        └── account/
            ├── register.js
            ├── login.js
            ├── logout.js
            └── session.js
```

---

## Blog

Os posts são arquivos `.md` dentro da pasta `/posts`. O Next.js detecta automaticamente os novos arquivos no build.

### Estrutura do frontmatter

```markdown
---
layout: post
date: 2026-03-19 10:00:00
image: /assets/img/capa.png
title: Título do Post
description: Descrição curta para SEO e listagem.
main-class: dev
color: "#637a91"
tags:
  - wow
  - wotlk
categories: Notícias
---

Conteúdo do post em Markdown aqui...
```

#### Campos do frontmatter

| Campo | Descrição |
|---|---|
| `date` | Data de publicação (`YYYY-MM-DD HH:mm:ss`) |
| `image` | Caminho da imagem de capa (`/public/assets/img/`) |
| `title` | Título do post |
| `description` | Descrição curta (SEO e listagem) |
| `main-class` | Categoria principal (define cor do card) |
| `color` | Cor hex do tema do post |
| `tags` | Lista de tags |
| `categories` | Categoria do post |

### Nome do arquivo

O nome do arquivo vira a URL do post:

```
/posts/novidades-da-semana.md  →  /blog/novidades-da-semana
```

Use letras minúsculas, sem acentos e com hífens no lugar de espaços.

---

## Deploy

O deploy é feito automaticamente pela **Vercel** a cada push na branch principal.

Durante o build são gerados automaticamente:
- `public/sitemap.xml` — sitemap
- `public/feed.xml` — feed RSS
- Índice do Algolia — quando `NEXT_PUBLIC_PROD_ALGOLIA=true`

> Em produção, configure as variáveis de ambiente na Vercel e aponte `DB_HOST` para o IP do seu servidor WoW.
