import Head from 'next/head'
import { generateNextSeo } from 'next-seo/pages'
import fs from 'fs'
import { getAllPosts } from 'lib/api'
import { timeToRead } from 'lib/utils'
import { buildAlgoliaIndexes } from 'lib/buildAlgoliaIndexes'
import { generateSitemap } from 'lib/generateSitemap'
import { generateRss } from 'lib/generateRSS'
import BlogLayout from 'components/BlogLayout'
import BlogList from 'templates/blog-list'
const Post = ({ posts }) => {
  return (
    <BlogLayout>
      <Head>
        {generateNextSeo({
          title: 'Nosso Blog | Movisul',
          description:
            'Conteúdo técnico sobre Saúde e Segurança do Trabalho: PGR, PCMSO, eSocial, laudos, treinamentos e muito mais.',
          canonical: 'https://movisul.com/blog',
          openGraph: {
            images: [
              {
                url: 'https://movisul.com/assets/img/movisul-icon.png',
                width: 1200,
                height: 630,
                alt: 'Movisul Blog'
              }
            ]
          }
        })}
      </Head>
      <BlogList posts={posts} />
    </BlogLayout>
  )
}

export async function getStaticProps() {
  const posts = getAllPosts()

  if (process.env.NODE_ENV !== 'development') {
    await generateSitemap(posts)

    const rss = await generateRss(posts)
    fs.writeFileSync('./public/feed.xml', rss)

    await buildAlgoliaIndexes(posts)
  }

  const postsForList = posts.map(post => ({
    slug: post.slug,
    date: post.date,
    readTime: timeToRead(post.content || ''),
    frontmatter: {
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      image: post.frontmatter.image || null,
      'main-class': post.frontmatter['main-class'] || null,
      date: post.frontmatter.date,
      formattedDate: post.frontmatter.formattedDate
    }
  }))

  return {
    props: {
      posts: postsForList
    }
  }
}

export default Post
