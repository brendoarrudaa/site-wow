import styled from 'styled-components'
import media from 'styled-media-query'

import transitions from 'styles/transitions'

export const LayoutWrapper = styled.section`
  display: flex;
  flex-direction: column;

  ${media.lessThan('large')`
    flex-direction: column;
  `}
`

export const LayoutMain = styled.main`
  background: var(--background);
  min-height: 100vh;
  padding: 0.5rem 20rem 0 3.75rem;
  transition: ${transitions.DEFAULT};
  width: 100%;

  ${media.lessThan('large')`
    padding: 0.2rem 0 3rem 0;
  `}
`
