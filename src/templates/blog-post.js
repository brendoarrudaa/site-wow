import { useEffect } from 'react'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'
import 'prismjs/plugins/line-numbers/prism-line-numbers'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-yaml'
import Image from 'next/image'
import Head from 'next/head'
import { generateNextSeo } from 'next-seo/pages'
import { timeToRead } from 'lib/utils'
import RecommendedPosts from 'components/RecommendedPosts'
import * as S from '../components/PostBlog/styled'

import {
  PostHeader,
  PostTitle,
  PostDescription,
  PostDate,
  MainContent,
  ButtonBack,
  PostBanner
} from 'styles/base'
import AdBlog from 'components/AdBlog'
import useWindowSize from 'hooks/useWindowSize'

const BlogPost = ({ post }) => {
  const { width } = useWindowSize()

  useEffect(() => {
    Prism.highlightAll()
  }, [post])

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.frontmatter.title,
    description: post.frontmatter.description,
    url: `https://movisul.com/blog/${post.slug}`,
    datePublished: post.frontmatter.date,
    dateModified: post.frontmatter.date,
    author: {
      '@type': 'Organization',
      name: 'Movisul',
      url: 'https://movisul.com'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Movisul',
      logo: {
        '@type': 'ImageObject',
        url: 'https://movisul.com/assets/img/movisul-icon.png'
      }
    },
    image:
      post.frontmatter.image ||
      `https://og-image-service.movisul.com/${encodeURIComponent(post.frontmatter.title)}.png`
  }

  return (
    <>
      <Head>
        {generateNextSeo({
          title: `${post.frontmatter.title} | Movisul`,
          description: post.frontmatter.description,
          canonical: `https://movisul.com/blog/${post.slug}`,
          openGraph: {
            type: 'article',
            url: `https://movisul.com/blog/${post.slug}`,
            title: `${post.frontmatter.title} - Movisul`,
            description: post.frontmatter.description,
            article: {
              publishedTime: post.frontmatter.date,
              modifiedTime: post.frontmatter.date,
              authors: ['https://movisul.com']
            },
            images: [
              {
                url: `https://og-image-service.movisul.com/${encodeURIComponent(
                  post.frontmatter.title
                )}.png`,
                alt: `${post.frontmatter.title}`
              }
            ]
          }
        })}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      </Head>
      <PostHeader>
        {width < 1169 && (
          <AdBlog
            url="/assets/img/movisul-blog-gif.gif"
            name="serviços de outsourcing e outros"
          />
        )}
        <ButtonBack href="/blog">← Voltar na listagem</ButtonBack>
        <PostDate>
          {post.frontmatter.formattedDate} • {timeToRead(post.content)}
        </PostDate>
        <PostBanner>
          <S.PostImage>
            {post.frontmatter.image && (
              <Image
                src={post.frontmatter.image}
                alt="Banner da publicação"
                fill
                sizes="(max-width: 768px) 100vw, 1200px"
                style={{ objectFit: 'cover' }}
              />
            )}
            {post.frontmatter['main-class'] && (
              <S.PostTag className={`is-${post.frontmatter['main-class']}`}>
                {post.frontmatter['main-class']}
              </S.PostTag>
            )}
          </S.PostImage>
        </PostBanner>
        <PostTitle>{post.frontmatter.title}</PostTitle>
        <PostDescription>{post.frontmatter.description}</PostDescription>
      </PostHeader>
      <MainContent>
        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </MainContent>
      <RecommendedPosts next={post.nextPost} previous={post.prevPost} />
    </>
  )
}

export default BlogPost
