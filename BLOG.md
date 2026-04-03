# Guia de Postagem — Blog Azeroth Legacy

## Acesso ao CMS

### Localmente

```bash
npm run dev:cms
```

Acesse: [http://localhost:3000/admin](http://localhost:3000/admin)
Não exige senha — usa o backend local.

### Em produção

Acesse: [https://azerothlegacy.com/admin](https://azerothlegacy.com/admin)
Clique em **Login with GitHub** e autorize com sua conta.

---

## Criando um novo post

1. No CMS, clique em **Posts** → **New Posts**
2. Preencha todos os campos (veja a tabela abaixo)
3. Escreva o conteúdo na aba **Body**
4. Clique em **Publish**
   - **Local**: salva o arquivo `.md` diretamente em `/posts` — o post aparece após `npm run build`
   - **Produção**: abre um Pull Request no GitHub — o Vercel faz o deploy automaticamente após o merge

---

## Campos obrigatórios

| Campo               | Obrigatório | O que é                                                                   |
| ------------------- | ----------- | ------------------------------------------------------------------------- |
| **Titulo**          | Sim         | Título principal. Vira o slug do arquivo (ex: `como-usar-ia.md`)          |
| **Data**            | Sim         | Data e hora da publicação                                                 |
| **Descricao**       | Sim         | Resumo curto — aparece na listagem e no Google. **Máximo 160 caracteres** |
| **Categoria**       | Sim         | Define a cor e o filtro do post (ver tabela abaixo)                       |
| **Cor**             | Sim         | Cor visual do post — deve corresponder à Categoria escolhida              |
| **Categoria Label** | Sim         | Versão com maiúscula exibida no blog (ex: `IA`, `WEB`)                    |
| **Imagem**          | Recomendado | Caminho da imagem de capa. Salve antes em `/public/assets/img/`           |
| **Tags**            | Não         | Palavras-chave do post                                                    |
| **Conteudo**        | Sim         | Corpo do post em Markdown                                                 |

### Categoria → Cor → Label

| Categoria           | Cor       | Label               |
| ------------------- | --------- | ------------------- |
| `sst`               | `#0f4c81` | `SST`               |
| `gestao-riscos`     | `#1a6fa8` | `Gestao de Riscos`  |
| `laudos`            | `#2a9d6e` | `Laudos Tecnicos`   |
| `esocial`           | `#1d7a55` | `eSocial`           |
| `seguranca`         | `#e67e22` | `Seguranca`         |
| `treinamentos`      | `#8e44ad` | `Treinamentos`      |
| `saude-ocupacional` | `#c0392b` | `Saude Ocupacional` |
| `prevencao`         | `#d35400` | `Prevencao`         |

---

## Como fazer um bom post

### Tamanho ideal

Entre **600 e 1500 palavras**. Posts muito curtos não rankeiam bem. Posts muito longos perdem o leitor.

### Título

- Seja direto e use palavras que o leitor buscaria no Google
- Formatos que funcionam bem:
  - _"5 Motivos para..."_
  - _"Como fazer X em Y passos"_
  - _"O que é X e por que sua empresa precisa"_
  - _"X erros que sua empresa comete em..."_
- Evite títulos genéricos como _"Novidades"_ ou _"Atualização"_

### Descrição (meta description)

- Máximo **160 caracteres** — o que passa disso é cortado no Google
- Deve responder: _"O que o leitor vai aprender ou ganhar com esse post?"_
- Inclua a palavra-chave principal

### Imagem de capa

- Formato: `.webp` (menor e mais rápido que `.jpg` ou `.png`)
- Resolução: **1200 × 630 px** (proporção ideal para compartilhamento)
- Nome do arquivo: use o slug do post (ex: `reducao-custos-ia.webp`)
- Onde salvar: `public/assets/img/nome-do-arquivo.webp`
- Campo **Imagem** no CMS: `/assets/img/nome-do-arquivo.webp`

### Estrutura recomendada do conteúdo

```markdown
Parágrafo de introdução — apresente o problema e o que o leitor vai aprender.
Seja direto: 2 a 4 linhas.

## 1. Primeiro ponto importante

Desenvolva o tópico em 2 a 4 parágrafos.
Use listas para facilitar a leitura:

- **Termo em destaque**: explicação curta
- **Outro ponto**: explicação curta

## 2. Segundo ponto importante

...repita o padrão...

## 3. Terceiro ponto importante

...

## Conclusão

Resuma o que foi abordado em 2 a 3 frases.
Finalize com uma chamada para ação — convide o leitor a participar do servidor Azeroth Legacy.
```

### Boas práticas de formatação

- Use `##` para seções principais e `###` para subseções
- **Negrito** (`**texto**`) para destacar termos importantes — não exagere
- Listas com `-` para benefícios, passos e exemplos
- Blocos de código com ` ``` ` quando mostrar comandos ou exemplos técnicos
- Parágrafos curtos — no máximo 4 linhas cada
- Evite paredes de texto sem subtítulos

### O que não fazer

- Não copie conteúdo de outros sites
- Não use título igual à descrição
- Não publique sem imagem de capa
- Não deixe o campo **Cor** diferente da **Categoria** escolhida

---

## Exemplo completo

```markdown
---
layout: post
date: 2026-03-28 09:00:00
image: /assets/img/esocial-sst-conformidade.webp
title: eSocial SST: O Que Sua Empresa Precisa Saber em 2026
description: Entenda as obrigações do eSocial SST, quais eventos enviar e como manter sua empresa em conformidade com a legislação vigente.
main-class: sst
color: "#0f4c81"
tags:
  - seguranca do trabalho
  - PGR
  - normas regulamentadoras
categories: SST
---

A adequação às normas de Saúde e Segurança do Trabalho deixou de ser opcional.
Com o eSocial SST obrigatório, empresas de todos os portes precisam estar em conformidade.

## 1. O que muda com o eSocial SST

O envio dos eventos S-2210, S-2220 e S-2240 exige documentação atualizada e processos bem definidos.

- **S-2210**: Comunicação de Acidente de Trabalho (CAT)
- **S-2220**: Monitoramento da saúde do trabalhador (ASO)
- **S-2240**: Condições ambientais do trabalho — agentes nocivos

## 2. PGR e GRO atualizados

O Programa de Gerenciamento de Riscos (PGR) substitui o antigo PPRA e exige revisão anual.
Manter o documento desatualizado gera autuações e impede o envio correto ao eSocial.

## 3. Como o Azeroth Legacy pode ajudar

Nossa equipe mantém o servidor atualizado e disponível para que você foque na aventura.

## Conclusão

Não espere mais para começar sua jornada.
Entre no servidor Azeroth Legacy e vivencie o melhor do WotLK.
```
