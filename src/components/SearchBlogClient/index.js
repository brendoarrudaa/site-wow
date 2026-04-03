import { liteClient as algoliasearch } from 'algoliasearch/lite'
import { InstantSearch } from 'react-instantsearch'

import SearchBlog from 'components/SearchBlog'

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID
const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_ONLY_KEY
const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME

const searchClient =
  appId && searchKey ? algoliasearch(appId, searchKey) : null

const SearchBlogClient = () => {
  if (!searchClient || !indexName) {
    return <p>Pesquisa indisponível no momento.</p>
  }

  return (
    <InstantSearch indexName={indexName} searchClient={searchClient}>
      <SearchBlog />
    </InstantSearch>
  )
}

export default SearchBlogClient
