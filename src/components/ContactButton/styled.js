import styled from 'styled-components'
import media from 'styled-media-query'

export const ButtonContainer = styled.div`
  .btn-wapp {
    position: fixed;
    bottom: 1rem;
    right: 0.5rem;
    z-index: 99;

    ${media.greaterThan('medium')`
      bottom: 1.5rem;
      right: 1.5rem;
    `}

    img {
      width: 60px;
      height: 60px;
    }
  }

  .button-contact {
    display: flex;
    flex-direction: column;
    position: fixed;
    bottom: 0.5rem;
    right: 0.5rem;
    z-index: 98;

    ${media.greaterThan('medium')`
      display: none;
    `}
  }
`
