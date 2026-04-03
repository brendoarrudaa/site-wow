import styled from 'styled-components'
import media from 'styled-media-query'

export const PoliticaDePrivacidadeContainer = styled.div`
  display: flex;
  flex-direction: column;

  .banner {
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 340px;
    width: 100%;
    max-width: 1216px;
    margin: 0 auto;

    ${media.lessThan('large')`
      display:flex;
      flex-direction:column;
      padding:20px;
    `}
  }
  .background {
    background: rgb(159, 118, 255);

    h1 {
      display: flex;
      color: #fff;
      font-weight: 520;
      font-size: 40px;

      ${media.lessThan('large')`
        font-size: 24px;
        flex-direction: column;
      `}
    }

    p {
      margin-bottom: 10px;
      color: #fff;
    }
  }
  .break {
    width: 100%;
    height: 140px;
    background-image: url(/assets/img/nuvem-clean.png);
    background-repeat: repeat-x;
    background-position: center;
    background-size: contain;
    z-index: 9;
    position: absolute;
    top: 210px;

    ${media.lessThan('large')`
      width: 100%;
      height: 200px;
      background-image: url(/assets/img/nuvem-clean.png);
      background-repeat: repeat-x;
      background-position: center;
      background-size: contain;
      z-index: 9;
      position: absolute;
      top: 272px;
    `}
  }

  .privacy {
    margin: 50px auto;
    max-width: 900px;
    width: 100%;
    line-height: 20px;

    ${media.lessThan('large')`
    padding: 15px;
     `}

    h2 {
      margin-top: 20px;
      font-weight: 600;
      padding: 10px 0;
      font-size: 22px;
      line-height: 24px;
    }
    p {
      span {
        font-weight: 600;
      }
    }
  }
`
