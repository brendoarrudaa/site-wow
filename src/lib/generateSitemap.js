import { BLOG_URL } from './constants'
import { globby } from 'globby'
import { SitemapStream, streamToPromise } from 'sitemap'
import { Readable } from 'stream'
import { writeFileSync } from 'fs'

// pages that should not be in the sitemap
const blocklist = ['/404']

export async function generateSitemap(posts) {
  if (process.env.NODE_ENV === 'development') {
    return
  }

  const baseUrl = BLOG_URL
  const pages = await globby([
    'src/pages/**/*{.js}',
    '!src/pages/**/[*',
    '!src/pages/_*.js',
    '!src/pages/api'
  ])

  const now = new Date().toISOString()

  // normal page routes
  const pageLinks = pages
    .map(page => {
      const path = page
        .replace('pages', '')
        .replace('.js', '')
        .replace('src/', '')
      if (path === '/index') {
        return { url: '/', changefreq: 'daily', priority: 1.0, lastmod: now }
      }
      if (path.startsWith('/servicos')) {
        return { url: path, changefreq: 'weekly', priority: 0.9, lastmod: now }
      }
      if (path === '/blog' || path === '/blog/pesquisar') {
        return { url: path, changefreq: 'daily', priority: 0.8, lastmod: now }
      }
      return { url: path, changefreq: 'monthly', priority: 0.6, lastmod: now }
    })
    .filter(page => !blocklist.includes(page.url))

  // post routes
  const postLinks = posts.map(post => ({
    url: `/blog/${post.slug}`,
    changefreq: 'weekly',
    priority: 0.7,
    lastmod: post.frontmatter?.date
      ? new Date(post.frontmatter.date).toISOString()
      : now
  }))

  const links = [...pageLinks, ...postLinks]
  const stream = new SitemapStream({ hostname: baseUrl })

  const xml = await streamToPromise(Readable.from(links).pipe(stream)).then(
    data => data.toString()
  )

  writeFileSync('./public/sitemap.xml', xml)
}
