const REPO = 'brendoarrudaa/site-wow'
const BRANCH = 'main'
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://azerothlegacy.com.br'

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
    label_singular: Post
    folder: posts
    create: true
    slug: "{{slug}}"
    fields:
      - { label: "Título", name: "title", widget: "string" }
      - { label: "Data", name: "date", widget: "datetime", format: "YYYY-MM-DD" }
      - { label: "Excerpt", name: "excerpt", widget: "text" }
      - label: "Categoria"
        name: "category"
        widget: "select"
        options:
          - Atualização
          - Evento
          - Guia
          - Changelog
          - Comunidade
          - Outro
      - label: "Cor de Capa"
        name: "coverColor"
        widget: "select"
        options:
          - { label: "Ouro", value: "from-yellow-900/40 to-yellow-800/20" }
          - { label: "Gelo", value: "from-blue-900/40 to-blue-800/20" }
          - { label: "Sombra", value: "from-purple-900/40 to-purple-800/20" }
          - { label: "Natureza", value: "from-green-900/40 to-green-800/20" }
          - { label: "Fogo", value: "from-red-900/40 to-red-800/20" }
      - { label: "Imagem", name: "image", widget: "image", required: false }
      - { label: "Conteúdo", name: "body", widget: "markdown" }
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
