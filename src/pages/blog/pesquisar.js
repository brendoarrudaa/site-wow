import Head from 'next/head'
import { generateNextSeo } from 'next-seo/pages'
import dynamic from 'next/dynamic'

import BlogLayout from 'components/BlogLayout'

const SearchBlogClient = dynamic(() => import('components/SearchBlogClient'), {
  ssr: false
})

const SearchPage = () => {
  return (
    <BlogLayout>
      <Head>
        {generateNextSeo({
          title: 'Pesquisar no Blog | Movisul',
          description: 'Vai lá, busque por posts novos e bem antigos.'
        })}
      </Head>
      <SearchBlogClient />
    </BlogLayout>
  )
}

export default SearchPage
