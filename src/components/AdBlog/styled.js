import styled from 'styled-components'
import media from 'styled-media-query'

export const AdBlogWrapper = styled.div`
  --ad-accent: #0f4c81;
  margin-top: 10px;
  height: 400px;
  width: 270px;
  border-radius: 9px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid var(--ad-accent);

  body.light & {
    --ad-accent: #0f4c81;
  }

  body.dark & {
    --ad-accent: #072741;
  }

  &::before {
    content: 'Anúncio';
    position: absolute;
    z-index: 10;
    top: 0;
    left: 0;
    color: #fff;
    background: var(--ad-accent);
    border-radius: 0 0 9px 0;
    padding: 4px 8px;
    font-size: 12px;
    font-weight: bold;
  }

  ${media.lessThan('large')`
    margin: 0 auto 25px;
  `}
`
