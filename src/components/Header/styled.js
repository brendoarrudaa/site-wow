import styled from 'styled-components'
import media from 'styled-media-query'

export const HeaderContainer = styled.div`
  width: 100%;
  position: fixed;
  background: #8257e6;
  z-index: 9999;
  box-shadow: 0px 3px 6px #0000000d;

  ${media.lessThan('large')`
    box-shadow: none;
  `}

  a.text-white {
    font-size: 1.02rem;
    font-weight: 500;
    border-radius: 12px;
  }

  .btn-white {
    background: var(--white);
    text-transform: none;
    font-size: 1rem;
    margin-left: 30px;
    border: none;
    border-radius: 12px;
  }

  button.btn-contact-active {
    animation: none;
    transform: scale(var(--btn-focus-scale, 0.95));
  }

  ${media.lessThan('large')`
    .flex-none {
      display: none;
    }
  `}
`

export const NavBar = styled.div`
  width: 100%;
  max-width: 1216px;
  margin: 0 auto;
  padding: 0 16px;

  .navbar {
    min-height: 4.4rem;
    justify-content: space-between;

    ${media.lessThan('large')`
      min-height: auto;
    `}

    .menu-icon {
      display: none;

      .swap {
        > svg {
          fill: var(--white);
        }
      }
    }

    .menu-horizontal {
      gap: 8px;

      details > summary {
        list-style: none;
      }

      details > summary::-webkit-details-marker {
        display: none;
      }

      ul.bg-base-100 {
        > li {
          font-weight: 700;
        }
      }
    }

    ${media.lessThan('large')`
      .movisul-icon {
        justify-content: flex-end;

        img {
          width: 30px!important;
        }
      }
      .menu-icon {
        display: block;
      }
    `}
  }
`
