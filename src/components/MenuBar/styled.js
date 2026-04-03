import Link from 'next/link'
import styled from 'styled-components'
import media from 'styled-media-query'

import transitions from 'styles/transitions'

export const MenuBarWrapper = styled.aside`
  align-items: center;
  background: var(--mediumBackground);
  border-left: 1px solid var(--borders);
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  justify-content: space-between;
  padding: 0.8rem 0;
  position: fixed;
  top: 64px;
  width: 3.75rem;
  transition: ${transitions.ALL};
  z-index: 999;

  ${media.lessThan('large')`
    border: 0;
    border-top: 1px solid var(--borders);
    flex-direction: row;
    height: 50px;
    top: auto;
    bottom: 0px;
    padding: 0;
    padding-bottom: env(safe-area-inset-bottom);
    position: fixed;
    width: 100%;
  `}
`

export const MenuBarGroupDesktop = styled.div`
  display: block;

  ${media.lessThan('large')`
    display: none;
  `}
`

export const MenuBarGroupMobile = styled.div`
  display: none;

  ${media.lessThan('large')`
    display: block;
  `}
`

export const MenuBarGroup = styled.div`
  display: flex;
  flex-direction: column;

  ${media.lessThan('large')`
    flex-direction: row;
  `}
`

export const MenuBarLink = styled(Link)`
  display: block;

  &.active {
    span {
      color: var(--highlight);
    }
  }
`

export const MenuBarExternalLink = styled.a`
  display: block;
`

export const MenuBarItem = styled.span`
  color: var(--texts);
  cursor: pointer;
  display: block;
  height: 3.75rem;
  padding: 1.1rem;
  position: relative;
  width: 3.75rem;
  transition: ${transitions.COLOR};

  svg {
    vertical-align: middle;
    width: 100%;
    height: 100%;
  }

  &.light {
    color: #d4d400;
  }

  &.display {
    ${media.lessThan('large')`
      display: none;
    `}
  }

  ${media.greaterThan('large')`
    &:hover {
      color: var(--highlight);
    }
  `}

  ${media.lessThan('large')`
    height: 3.2rem;
    padding: .9rem;
    position: relative;
    width: 3.2rem;
  `}
`

export const MenuBarNotification = styled.span`
  background: var(--highlight);
  border-radius: 50%;
  display: block;
  height: 0.4rem;
  position: absolute;
  right: 12px;
  top: 12px;
  width: 0.4rem;
`
