# TODO — i18n Pendente

Páginas e componentes com strings **mockadas em pt-BR** aguardando integração com `useTranslation`.

As chaves já existem nos arquivos `src/locales/pt-BR.json`, `en.json` e `es.json`.
Basta substituir as strings literais por `t("chave")` e importar `useTranslation`.

---

## Páginas

| Arquivo | Chaves a usar |
|---|---|
| `src/pages/cadastro.tsx` | `register.*` — tabs login/registro |
| `src/pages/dashboard.tsx` | `dashboard.*` — chaves ainda não criadas nos locales |
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
