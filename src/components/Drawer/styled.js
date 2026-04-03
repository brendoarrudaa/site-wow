import styled from 'styled-components'
import media from 'styled-media-query'

export const DrawerContainer = styled.div`
  display: none;
  color: var(--texts);

  ${media.lessThan('large')`
    display: flex;
    transition: 0.6s;
    flex-direction: column;
    background: #FAFAFA;
    padding: 48px 0;
    width: 100vw;
    top: 0;
    left: ${props => (props.$isOpen ? 0 : '-105%')};
    height: 100vh;
    position: fixed;
    z-index: 999;

    > .menu {
      margin: 26px 0;
      width: 100%;
      font-size: 1.2rem;
      font-weight: bold;



      > .dropdown {
        > label {
          display: flex;
          padding: 0.75rem 1rem;
        }

        .dropdown-content {
          width: 95%;
          background: #fff;
          font-size: 1.05rem;

          margin-left: 10px;
        }
      }
    }
  `}
`
