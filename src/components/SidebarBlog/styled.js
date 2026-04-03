import styled from 'styled-components'
import media from 'styled-media-query'

import transitions from '../../styles/transitions'

export const SidebarContainer = styled.aside`
  top: 64px;
  align-items: center;
  border-right: 1px solid var(--borders);
  background: var(--mediumBackground);
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  right: 0;
  position: fixed;
  padding: 2rem;
  text-align: center;
  width: 20rem;
  transition: ${transitions.ALL};
  z-index: 2;

  ${media.lessThan('large')`
    display: none;
  `}
`

export const SidebarLinksContainer = styled.section`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`
