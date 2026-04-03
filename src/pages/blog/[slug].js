import BlogPost from 'templates/blog-post'
import { getPostBySlug, getAllPosts } from 'lib/api'
import markdownToHtml from 'lib/markdownToHtml'
import BlogLayout from 'components/BlogLayout'

const allPosts = getAllPosts()
const postsBySlug = new Map(allPosts.map(post => [post.slug, post]))

const toRecommendedPost = post => {
  if (!post) return null

  return {
    slug: post.slug,
    frontmatter: {
      title: post.frontmatter.title
    }
  }
}

const relatedPostsBySlug = allPosts.reduce((acc, post, index) => {
  acc[post.slug] = {
    nextPost: toRecommendedPost(allPosts[index - 1]),
    prevPost: toRecommendedPost(allPosts[index + 1])
  }

  return acc
}, {})

const Post = post => {
  return (
    <BlogLayout>
      <BlogPost post={post} />
    </BlogLayout>
  )
}

export default Post

export async function getStaticProps({ params }) {
  const slug = params.slug
  const post = postsBySlug.get(slug) || getPostBySlug(slug)

  if (!post) {
    return {
      notFound: true
    }
  }

  const content = await markdownToHtml(post.content || '')

  const relatedPosts = relatedPostsBySlug[slug] || {}
  const nextPost = relatedPosts.nextPost || null
  const prevPost = relatedPosts.prevPost || null

  return {
    props: {
      ...post,
      content,
      nextPost,
      prevPost
    }
  }
}

export async function getStaticPaths() {
  const paths = allPosts.map(({ slug }) => ({ params: { slug } }))

  return {
    paths,
    fallback: false
  }
}
