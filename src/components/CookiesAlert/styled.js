import styled from 'styled-components'
import media from 'styled-media-query'

export const CookiesActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;

  ${media.lessThan('medium')`
    flex-direction: row;
    width: 100%;
    justify-content: flex-end;
  `}
`

export const CookiesContainer = styled.div`
  left: 50%;
  bottom: 5px;
  width: 100%;
  display: flex;
  gap: 12px;
  z-index: 9999;
  position: fixed;
  max-width: 856px;
  min-height: 50px;
  margin-left: -428px;
  border-radius: 4px;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;
  justify-content: space-around;
  border-bottom: 5px solid #8256e5;
  box-shadow: 0 2px 12px -2px;

  > div {
    > p {
      font-size: 14px;

      &:nth-child(2) {
        margin-top: 10px;
      }

      > a {
        color: #8256e5;
      }
    }
  }

  ${media.lessThan('medium')`
    > div {
      > p {
        font-size: 12px;
      }
    }
    flex-direction: column;
    left: 0;
    margin-left: 0;
  `}
`
