import Link from 'next/link'
import styled from 'styled-components'
import media from 'styled-media-query'

import transitions from 'styles/transitions'

export const PostWrapper = styled.section`
  background: var(--background);
  margin-bottom: 12px;
  border-radius: 9px;
  display: flex;
  height: auto;
  min-height: 135px;
  padding: 1.2rem 2.2rem;
  width: 100%;
  transition: ${transitions.ALL};

  ${media.lessThan('large')`
    align-items: flex-start;
    padding: 1rem 1rem;
    margin-left: 10px;
    margin-right: 10px;
    height: auto;
    min-height: 90px;
  `}
`

export const PostLink = styled(Link)`
  color: var(--texts);
  display: flex;
  text-decoration: none;
  transition: ${transitions.COLOR};

  &:hover {
    color: var(--highlight);
  }
`

export const PostTag = styled.div`
  align-items: center;
  background: var(--highlight);
  border-radius: 0 0 6px 6px;
  color: var(--white);
  display: flex;
  position: absolute;
  width: 100%;
  bottom: 0;
  padding: 0 6px;
  font-size: 0.75rem;
  font-weight: 500;
  justify-content: center;
  min-height: 20px;
  min-width: 40px;
  text-transform: uppercase;

  &.is-sst {
    background: #0f4c81;
  }

  &.is-gestao-riscos {
    background: #1a6fa8;
  }

  &.is-laudos {
    background: #2e7d32;
  }

  &.is-esocial {
    background: #6a1b9a;
  }

  &.is-seguranca {
    background: #e67e22;
  }

  &.is-treinamentos {
    background: #8e44ad;
  }

  &.is-saude-ocupacional {
    background: #c0392b;
  }

  &.is-prevencao {
    background: #d35400;
  }
`

export const PostInfo = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 1rem;
`

export const PostDate = styled.time`
  font-size: 0.9rem;

  ${media.lessThan('large')`
    font-size: 0.8rem;
  `}
`

export const PostTitle = styled.h1`
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0.2rem 0 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3; /* number of lines to show */
  line-clamp: 3;
  -webkit-box-orient: vertical;

  ${media.lessThan('large')`
    font-size: 1.1rem;
  `}
`

export const PostDescription = styled.h2`
  font-size: 1.2rem;
  font-weight: 300;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* number of lines to show */
  line-clamp: 2;
  -webkit-box-orient: vertical;

  ${media.lessThan('large')`
    font-size: 0.96rem;
  `}
`

export const PostImage = styled.div`
  height: 100%;
  min-width: 150px;
  position: relative;
  border-radius: 6px;
  overflow: hidden;

  .avatar {
    width: 100%;
    height: 100%;
  }

  ${media.lessThan('large')`
    min-width: 100px;
  `}
`
