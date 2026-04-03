import { remark } from 'remark'
import remarkOembed from 'remark-oembed'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'

const EMBED_URL_PATTERN =
  /(youtube\.com|youtu\.be|twitter\.com|x\.com|instagram\.com|vimeo\.com|codepen\.io|gist\.github\.com|soundcloud\.com|speakerdeck\.com|ted\.com|tiktok\.com)/i

// Schema permissivo: mantém iframes de embeds confiáveis e bloqueia vetores de XSS
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    iframe: ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'allow', 'title', 'loading'],
    div: [...(defaultSchema.attributes?.div || []), 'className', 'style'],
    span: [...(defaultSchema.attributes?.span || []), 'className', 'style'],
    code: [...(defaultSchema.attributes?.code || []), 'className'],
    pre: [...(defaultSchema.attributes?.pre || []), 'className'],
    a: ['href', 'title', 'target', 'rel', 'className', 'id']
  },
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'iframe',
    'figure',
    'figcaption',
    'details',
    'summary'
  ],
  protocols: {
    ...defaultSchema.protocols,
    href: ['http', 'https', 'mailto', '#']
  },
  strip: ['script', 'noscript']
}

const baseProcessor = remark()
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings, {
    behavior: 'wrap',
    properties: {
      className: ['anchor']
    }
  })
  .use(rehypeSanitize, sanitizeSchema)
  .use(rehypeStringify)

const oembedProcessor = remark()
  .use(remarkOembed)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings, {
    behavior: 'wrap',
    properties: {
      className: ['anchor']
    }
  })
  .use(rehypeSanitize, sanitizeSchema)
  .use(rehypeStringify)

export default async function markdownToHtml(markdown) {
  const source = markdown || ''
  const processor = EMBED_URL_PATTERN.test(source)
    ? oembedProcessor
    : baseProcessor

  const result = await processor.process(source)

  return result.toString()
}
