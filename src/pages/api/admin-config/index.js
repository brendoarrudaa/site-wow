const REPO = 'brendoarrudaa/site-movisul'
const BRANCH = 'main'
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://site-movisul.vercel.app'

const SHARED_CONFIG = `
locale: pt

media_folder: public/assets/img-blog
public_folder: /assets/img-blog

slug:
  encoding: ascii
  clean_accents: true

collections:
  - name: posts
    label: Posts
    folder: posts
    create: true
    slug: "{{slug}}"
    fields:
      - { label: "Layout", name: "layout", widget: "hidden", default: "post" }
      - { label: "Data", name: "date", widget: "datetime", format: "YYYY-MM-DD HH:mm:ss" }
      - { label: "Imagem", name: "image", widget: "image", required: false }
      - { label: "Titulo", name: "title", widget: "string" }
      - { label: "Descricao", name: "description", widget: "string" }
      - label: "Categoria"
        name: "main-class"
        widget: "select"
        options:
          - sst
          - gestao-riscos
          - laudos
          - esocial
          - seguranca
          - treinamentos
          - saude-ocupacional
          - prevencao
      - label: "Cor"
        name: "color"
        widget: "select"
        options:
          - { label: "SST", value: "#0f4c81" }
          - { label: "Gestao de Riscos", value: "#1a6fa8" }
          - { label: "Laudos Tecnicos", value: "#2a9d6e" }
          - { label: "eSocial", value: "#1d7a55" }
          - { label: "Seguranca", value: "#e67e22" }
          - { label: "Treinamentos", value: "#8e44ad" }
          - { label: "Saude Ocupacional", value: "#c0392b" }
          - { label: "Prevencao", value: "#d35400" }
      - { label: "Tags", name: "tags", widget: "list", default: [""] }
      - label: "Categoria Label"
        name: "categories"
        widget: "select"
        options:
          - SST
          - Gestao de Riscos
          - Laudos Tecnicos
          - eSocial
          - Seguranca
          - Treinamentos
          - Saude Ocupacional
          - Prevencao
      - { label: "Conteudo", name: "body", widget: "markdown" }
`.trimStart()

function buildConfig() {
  const isDev = process.env.NODE_ENV !== 'production'

  const backend = isDev
    ? `local_backend: true\n\nbackend:\n  name: github\n  repo: ${REPO}\n  branch: ${BRANCH}`
    : `backend:\n  name: github\n  repo: ${REPO}\n  branch: ${BRANCH}\n  base_url: ${SITE_URL}\n  auth_endpoint: /api/auth`

  return `${backend}\n\n${SHARED_CONFIG}`
}

export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/yaml; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.status(200).send(buildConfig())
}
