import { algoliasearch } from 'algoliasearch'
import slugify from 'slugify'

function transformPostsToSearchObjects(posts) {
  const transformed = posts.map(post => {
    return {
      objectID: slugify(post.frontmatter.title, { lower: true, strict: true }),
      title: post.frontmatter.title,
      image: post.frontmatter.image,
      main_class: post.frontmatter['main-class'],
      description: post.frontmatter.description,
      fields: {
        slug: post.slug
      },
      date: post.frontmatter.date,
      date_timestamp: Date.parse(post.date)
    }
  })

  return transformed
}

export async function buildAlgoliaIndexes(posts) {
  const shouldIndexToAlgolia =
    process.env.NEXT_PUBLIC_PROD_ALGOLIA === 'true' &&
    process.env.NODE_ENV !== 'development'

  if (!shouldIndexToAlgolia) return

  try {
    const transformedPosts = transformPostsToSearchObjects(posts)

    if (posts.length === 0) return

    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID
    const adminKey = process.env.ALGOLIA_ADMIN_KEY
    const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME

    if (!appId || !adminKey || !indexName) {
      console.log(
        '\n\n⚠️ Algolia indexing skipped: missing APP_ID, ADMIN_KEY or INDEX_NAME env vars.'
      )
      return
    }

    const client = algoliasearch(appId, adminKey)
    const algoliaResponse = await client.saveObjects({
      indexName,
      objects: transformedPosts
    })

    const objectIDs = algoliaResponse.objectIDs || []

    console.log(
      `\n\n🎉 Successfully added ${
        objectIDs.length
      } records to Algolia search. Object IDs:\n${objectIDs.join('\n')}`
    )
  } catch (error) {
    console.log(error)
  }
}
