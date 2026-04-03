import styled from 'styled-components'
import media from 'styled-media-query'

import transitions from 'styles/transitions'

export const LayoutWrapper = styled.section`
  margin: 0;
  display: flex;
  flex-direction: column;
`

export const LayoutMain = styled.main`
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: ${transitions.DEFAULT};
  width: 100%;
  margin: 0;

  ${media.lessThan('large')`
    padding: 3rem 0 0 0;
  `}
`
