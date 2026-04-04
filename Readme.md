# Azeroth Legacy — Site Oficial

Site oficial do servidor **Azeroth Legacy** (WoW WotLK 3.3.5a), construído com Next.js.

## Tecnologias

- [Next.js](https://nextjs.org/) — framework React com geração estática e API Routes
- [Tailwind CSS v4](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/) — estilização
- [Algolia](https://www.algolia.com/) — busca full-text no blog
- [iron-session](https://github.com/vvo/iron-session) — sessões seguras via cookie criptografado
- [mysql2](https://github.com/sidorares/node-mysql2) — conexão com o banco do servidor WoW
- [Resend](https://resend.com) — envio de e-mail transacional (verificação de cadastro)
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

## Verificação de e-mail no cadastro

O cadastro utiliza confirmação por código antes de ativar a conta no banco do jogo.

### Fluxo

```
1. Usuário preenche username, e-mail e senha
         ↓
2. POST /api/account/register
   - Valida dados e verifica duplicatas ativas
   - Gera código de 6 dígitos (crypto.randomInt)
   - Salva apenas o SHA-256 do código (nunca o código puro)
   - Expira em 10 minutos, cooldown de reenvio de 60s
   - Envia e-mail via Resend com o código em destaque
   - Retorna 202 (pendente) — conta NÃO criada ainda
         ↓
3. Usuário digita o código na tela de verificação
         ↓
4. POST /api/account/verify-code
   - Compara hash do código submetido (timingSafeEqual)
   - Verifica expiração e número de tentativas (máx. 5)
   - Se correto: INSERT na account + criação de sessão
   - Se incorreto: incrementa tentativas; ao atingir 5, apaga pendência
         ↓
5. Usuário redirecionado para /dashboard
```

### Reenvio

- `POST /api/account/resend-code` — disponível após 60s de cooldown
- Gera novo código, invalida o anterior, reseta tentativas
- Rate limit: 5 reenvios/15min por IP

### Configurar Resend

1. Crie uma conta em [resend.com](https://resend.com)
2. Gere uma API Key
3. Adicione ao `.env`:
   ```env
   RESEND_API_KEY=re_...
   EMAIL_FROM=onboarding@resend.dev   # ou seu domínio verificado
   APP_NAME=Azeroth Legacy
   ```
4. Em desenvolvimento, se `RESEND_API_KEY` não estiver definido, o código é impresso no console do servidor.

### Tabelas envolvidas

| Tabela | Banco | Propósito |
|---|---|---|
| `account_pending_verifications` | `acore_auth` | Armazena hash do código + dados do cadastro pendente |
| `account` | `acore_auth` | Conta real — criada somente após verificação |

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
| `POST` | `/api/account/register` | Inicia cadastro (pendente verificação) |
| `POST` | `/api/account/verify-code` | Confirma código de e-mail e cria conta |
| `POST` | `/api/account/resend-code` | Reenvia código de verificação |
| `POST` | `/api/account/login` | Autentica e cria sessão |
| `POST` | `/api/account/logout` | Destroi a sessão |
| `GET`  | `/api/account/session` | Retorna usuário da sessão atual |
| `GET`  | `/api/account/info` | Dados da conta (joindate, last login, etc.) |
| `POST` | `/api/account/change-password` | Altera senha (exige senha atual) |
| `POST` | `/api/account/reset-request` | Solicita reset de senha por e-mail |
| `POST` | `/api/account/reset-confirm` | Confirma reset de senha com token |
| `GET`  | `/api/account/characters` | Lista personagens da conta |
| `GET`  | `/api/account/armory` | Equipamentos e stats dos personagens |
| `GET`  | `/api/account/guild` | Informações da guild do personagem |
| `POST` | `/api/account/services` | Executa serviço de personagem |
| `GET`  | `/api/account/tickets` | Lista tickets de suporte |
| `POST` | `/api/account/tickets` | Cria novo ticket |
| `GET`  | `/api/account/ticket-messages` | Mensagens de um ticket |
| `POST` | `/api/account/ticket-messages` | Responde um ticket |
| `GET`  | `/api/ranking` | Ranking PvP (arena 2v2, 3v3, HK) |
| `GET`  | `/api/server/status` | Status do servidor (online/offline, players) |

---

## Dashboard

O painel do jogador (`/dashboard`) é protegido por sessão e oferece acesso a todas as funcionalidades da conta e personagens.

### Páginas

| Rota | Componente | Descrição |
|---|---|---|
| `/dashboard` | DashboardPage | Visão geral — personagens, stats, atalhos rápidos |
| `/dashboard/servicos` | ServicosPage | Serviços de personagem gratuitos |
| `/dashboard/ranking` | RankingPage | Ranking PvP do servidor |
| `/dashboard/armory` | ArmoryPage | Equipamentos e estatísticas dos personagens |
| `/dashboard/guild` | GuildPage | Informações da guild (membros, ranks, MOTD) |
| `/dashboard/tickets` | TicketsPage | Sistema de tickets de suporte |
| `/dashboard/conta` | ContaPage | Configurações da conta e troca de senha |
| `/dashboard/loja` | LojaPage | Loja de itens (em desenvolvimento) |

### Serviços de personagem

Serviços gratuitos disponíveis na página `/dashboard/servicos`. Todos exigem que o personagem esteja **offline**.

| Serviço | Tipo | Funcionamento |
|---|---|---|
| Destravar (Unstuck) | Instantâneo | Teleporta para Orgrimmar (Horda) ou Stormwind (Aliança) |
| Reset de Talentos | Instantâneo | Remove todos os talentos para redistribuição |
| Troca de Nome | Instantâneo | Altera o nome diretamente no banco (2-12 letras, verifica duplicatas) |
| Mudança de Aparência | Via jogo | Define flag `at_login=8` — tela de customização no próximo login |
| Troca de Raça | Via jogo | Define flag `at_login=64` — troca de raça no próximo login |
| Troca de Facção | Via jogo | Define flag `at_login=128` — troca de facção no próximo login |

### Ranking PvP

A API `/api/ranking` consulta diretamente as tabelas de arena e personagens do AzerothCore:

- **Arena 2v2** — `arena_team` (type=2) + `arena_team_member` → ordenado por `personalRating`
- **Arena 3v3** — `arena_team` (type=3) + `arena_team_member` → ordenado por `personalRating`
- **Honorable Kills** — `characters.totalKills` → top 50

Inclui nome da guild (via JOIN) e facção (detectada pela raça). Cache de 60s via `s-maxage`.

### Armory

A API `/api/account/armory` retorna para cada personagem da conta:

- Classe, raça, level, gold, tempo jogado, kills totais
- Equipamentos por slot (head, chest, legs, weapons, etc.) com nome do item, item level e raridade
- Item level médio calculado a partir dos itens equipados

Consulta as tabelas `characters`, `character_inventory` + `item_instance` + `item_template` do banco `acore_characters` e `acore_world`.

### Guild

A API `/api/account/guild` retorna:

- Nome da guild, facção, MOTD (Message of the Day)
- Lista completa de membros com nome, classe, raça, level, rank e status online
- Rank do jogador atual na guild

### Tickets de Suporte

Sistema de tickets com criação, listagem e troca de mensagens:

- Categorias: Bug, Conta, Personagem, Denúncia, Sugestão, Outro
- Prioridades: Baixa, Média, Alta
- Status: Aberto, Em Progresso, Resolvido, Fechado
- Mensagens com distinção visual staff/jogador

### Bancos de dados utilizados

| Banco | Tabelas consultadas |
|---|---|
| `acore_auth` | `account`, `account_pending_verifications` |
| `acore_characters` | `characters`, `character_inventory`, `item_instance`, `character_talent`, `arena_team`, `arena_team_member`, `guild`, `guild_member`, `guild_rank` |
| `acore_world` | `item_template` |

---

## Arquivos relevantes

```
src/
├── lib/
│   ├── db.js              # Pool de conexão MySQL (acore_auth + acore_characters)
│   ├── session.js         # Configuração do iron-session
│   ├── srp6.js            # Implementação SRP6 compatível com AzerothCore
│   ├── rateLimit.js       # Rate limiter in-memory por IP
│   └── emailVerification.js # Helpers de verificação de e-mail (Resend)
├── components/
│   └── Dashboard/
│       ├── DashboardLayout/   # Layout com sidebar e navegação
│       ├── DashboardPage/     # Página principal do painel
│       ├── ServicosPage/      # Serviços de personagem
│       ├── RankingPage/       # Ranking PvP
│       ├── RankingTable/      # Tabela reutilizável de ranking
│       ├── ArmoryPage/        # Equipamentos e stats
│       ├── GuildPage/         # Informações da guild
│       ├── TicketsPage/       # Tickets de suporte
│       ├── ContaPage/         # Configurações da conta
│       ├── LojaPage/          # Loja (mock data)
│       ├── StatsCards/        # Cards de estatísticas
│       ├── CharacterCard/     # Card de personagem
│       ├── ShopItemCard/      # Card de item da loja
│       ├── ServerStatusBadge/ # Badge de status do servidor
│       └── AppSidebar/        # Sidebar do dashboard
└── pages/
    ├── cadastro.tsx           # Página de login/cadastro
    ├── recuperar-senha.tsx    # Recuperação de senha
    ├── dashboard.tsx          # Dashboard principal
    ├── dashboard/
    │   ├── servicos.tsx
    │   ├── ranking.tsx
    │   ├── armory.tsx
    │   ├── guild.tsx
    │   ├── tickets.tsx
    │   ├── conta.tsx
    │   └── loja.tsx
    └── api/
        ├── server/
        │   └── status.js
        ├── ranking.js
        └── account/
            ├── register.js
            ├── verify-code.js
            ├── resend-code.js
            ├── login.js
            ├── logout.js
            ├── session.js
            ├── info.js
            ├── change-password.js
            ├── reset-request.js
            ├── reset-confirm.js
            ├── characters.js
            ├── armory.js
            ├── guild.js
            ├── services.js
            ├── tickets.js
            └── ticket-messages.js
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
