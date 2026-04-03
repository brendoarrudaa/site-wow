# TODO — i18n Pendente

Páginas e componentes com strings **mockadas em pt-BR** aguardando integração com `useTranslation`.

As chaves já existem nos arquivos `src/locales/pt-BR.json`, `en.json` e `es.json`.
Basta substituir as strings literais por `t("chave")` e importar `useTranslation`.

---

## Páginas

| Arquivo | Chaves a usar |
|---|---|
| `src/pages/cadastro.tsx` | `register.*` — formulário integrado com API real; etapa de verificação de e-mail implementada; i18n pendente |
| `src/pages/dashboard.tsx` | `dashboard.*` — integrado com sessão real e personagens do banco; chaves ainda não criadas nos locales |
| `src/pages/recuperar-senha.tsx` | `account.resetPassword.*` — página nova, chaves não criadas nos locales |
| `src/pages/como-jogar.tsx` | `pages.howToPlay.*` |
| `src/pages/download.tsx` | `pages.download.*` |
| `src/pages/rates.tsx` | `pages.rates.*` |
| `src/pages/regras.tsx` | `pages.rules.*` |
| `src/pages/faq.tsx` | `pages.faq.*` |
| `src/pages/status.tsx` | `pages.status.*` |
| `src/pages/vip.tsx` | `pages.vip.*` |
| `src/pages/roadmap.tsx` | `pages.roadmap.*` |
| `src/pages/comunidade.tsx` | `pages.community.*` |
| `src/pages/sugestoes.tsx` | `pages.suggestions.*` |
| `src/pages/bugs.tsx` | `pages.bugs.*` |
| `src/pages/blog/index.tsx` | `pages.blog.*` |
| `src/pages/blog/[slug].tsx` | `pages.blog.*`, `common.*` |
| `src/pages/blog/pesquisar.tsx` | `pages.blog.*`, `common.*` |
| `src/pages/404.tsx` | `pages.notFound.*` |
| `src/pages/politica-de-privacidade.tsx` | `pages.privacy.*` |

## Componentes

| Arquivo | Chaves a usar |
|---|---|
| `src/components/CTASection/index.tsx` | `cta.*` |
| `src/components/forms/SuggestionForm.tsx` | `forms.suggestion.*` |
| `src/components/forms/BugReportForm.tsx` | `forms.bug.*` |

## Novos componentes/páginas sem i18n (criados no backend WoW)

Estes arquivos foram criados recentemente e **não têm nenhuma string traduzida** ainda.
Precisam de chaves novas nos locales antes de aplicar `t()`.

| Arquivo | Chaves sugeridas |
|---|---|
| `src/pages/recuperar-senha.tsx` | `account.resetPassword.*` |
| Etapa de verificação em `cadastro.tsx` | `register.verify.*` |

## Já traduzidos

- `src/components/Layout/Header.tsx` — completo
- `src/components/Layout/Footer.tsx` — completo
- `src/components/LanguageSelector/index.tsx` — completo

## Como aplicar

```tsx
import { useTranslation } from "@/hooks/useTranslation";

const { t } = useTranslation();

// substitui a string fixa
<h1>{t("pages.howToPlay.title")}</h1>
```
