import { SearchBox, Hits, Stats, Configure } from 'react-instantsearch'

import Hit from './Hit'

import * as S from './styled'

const SearchBlog = () => {
  return (
    <S.SearchWrapper>
      <>
        <Configure hitsPerPage={200} distinct />
        <SearchBox placeholder="Pesquisar..." autoFocus={true} />
        <Stats
          translations={{
            rootElementText({ nbHits, processingTimeMS }) {
              return nbHits === 1
                ? `${nbHits} resultado encontrado em ${processingTimeMS}ms`
                : `${nbHits} resultados encontrados em ${processingTimeMS}ms`
            }
          }}
        />
        <Hits hitComponent={Hit} />
        <S.SearchTitle>
          Powered by Algolia
          <S.AlgoliaIcon />
        </S.SearchTitle>
      </>
    </S.SearchWrapper>
  )
}

export default SearchBlog
