# Movisul - Blog

Site e blog em [movisul.com.br](https://movisul.com.br), construído com Next.js e hospedado na Vercel.

## Tecnologias

- [Next.js](https://nextjs.org/) — framework React com geração estática
- [Tailwind CSS v4](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/) — estilização
- [Algolia](https://www.algolia.com/) — busca full-text
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

### Variáveis de ambiente

Crie um arquivo `.env` na raiz com:

```env
NEXT_PUBLIC_ALGOLIA_APP_ID=
NEXT_PUBLIC_ALGOLIA_SEARCH_ONLY_KEY=
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=
ALGOLIA_ADMIN_KEY=
NEXT_PUBLIC_PROD_ALGOLIA=true
NEXT_PUBLIC_GA_TRACKING=
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=
```

---

## Como criar um post no blog

Os posts são arquivos `.md` dentro da pasta `/posts`. O Next.js detecta automaticamente os novos arquivos no build.

### Estrutura do frontmatter

Crie um arquivo como `/posts/meu-post.md`:

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
  - javascript
  - web
categories: Desenvolvimento
---

Conteúdo do post em Markdown aqui...
```

#### Campos do frontmatter

| Campo         | Descrição                                                   |
|---------------|-------------------------------------------------------------|
| `date`        | Data de publicação (formato `YYYY-MM-DD HH:mm:ss`)         |
| `image`       | Caminho da imagem de capa (salve em `/public/assets/img/`) |
| `title`       | Título do post                                              |
| `description` | Descrição curta (usada no SEO e na listagem)                |
| `main-class`  | Categoria principal (define a cor do card na listagem)      |
| `color`       | Cor hex do tema do post                                     |
| `tags`        | Lista de tags                                               |
| `categories`  | Categoria do post                                           |

### Nome do arquivo

O nome do arquivo vira a URL do post:

```
/posts/como-aprender-javascript.md  →  /blog/como-aprender-javascript
```

Use letras minúsculas, sem acentos e com hífens no lugar de espaços.

---

## Gerador de posts com GPT

Utilitário local (Node.js + OpenAI) para gerar rascunhos de posts em Markdown via CLI.

```bash
cd gpt-post-generator
npm install
OPENAI_API_KEY=sk-... npm run dev
```

O rascunho gerado deve ser revisado antes de publicar.

---

## Deploy

O deploy é feito automaticamente pela **Vercel** a cada push na branch principal.

Durante o build, são gerados automaticamente:
- `public/sitemap.xml` — sitemap do site
- `public/feed.xml` — feed RSS
- Índice do Algolia — atualizado quando `NEXT_PUBLIC_PROD_ALGOLIA=true`

---

## Repositório

[github.com/quicklab-tech/site-geilson](https://github.com/quicklab-tech/site-geilson)
