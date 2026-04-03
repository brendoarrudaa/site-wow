import matter from 'gray-matter'
import { join, resolve } from 'path'
import fs from 'fs'

import { format } from 'date-fns'
import { pt } from 'date-fns/locale'

const postsDirectory = join(process.cwd(), 'posts')

export function getPostBySlug(slug) {
  if (!slug) return null

  const realSlug = slug.replace(/\.md$/, '')
  const fullPath = join(postsDirectory, `${realSlug}.md`)

  // Proteção contra path traversal: garante que o arquivo está dentro de /posts
  if (!resolve(fullPath).startsWith(resolve(postsDirectory) + '/') &&
      !resolve(fullPath).startsWith(resolve(postsDirectory) + '\\')) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  const formattedDate = format(new Date(data.date), "dd 'de' MMMM 'de' yyyy", {
    locale: pt
  })

  return {
    slug: realSlug,
    date: data.date.toString(),
    frontmatter: { ...data, date: data.date.toString(), formattedDate },
    content
  }
}

export function getAllPosts() {
  const slugs = fs.readdirSync(postsDirectory)
  const posts = slugs
    .map(slug => getPostBySlug(slug))
    .sort((post1, post2) =>
      new Date(post1.date) > new Date(post2.date) ? -1 : 1
    )

  return posts
}
