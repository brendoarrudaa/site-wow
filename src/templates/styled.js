import styled from 'styled-components'
import media from 'styled-media-query'

export const BlogListWrapper = styled.div`
  padding: 75px 0;
  background: var(--mediumBackground);
  min-height: 90vh;

  ${media.lessThan('large')`
    padding: 60px 0;
  `}
`
