import { createGlobalStyle } from 'styled-components'

const GlobalStyles = createGlobalStyle`
  /* http://meyerweb.com/eric/tools/css/reset/
   v2.0 | 20110126
   License: none (public domain)
  */

  /* HTML5 display-role reset for older browsers */
  article, aside, details, figcaption, figure,
  footer, header, hgroup, menu, nav, section {
    display: block;
  }
  html {
    scroll-behavior: smooth;
  }
  body {
    line-height: 1;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: #ececec;
    }

    &::-webkit-scrollbar-thumb {
      background: #0f4c81;
      border-radius: 10px;
    }
  }
  ol, ul {
    list-style: none;
  }
  blockquote, q {
    quotes: none;
  }
  blockquote:before, blockquote:after,
  q:before, q:after {
    content: '';
    content: none;
  }
  table {
    border-collapse: collapse;
    border-spacing: 0;
  }
  * {
    box-sizing: border-box;
  }
  body {
    background: #fff;
    line-height: 1;
    font-size: 100%;
    font-family: "Sora", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  }
  img {
    display: block;
  	width: 100%;
  	height: auto;
  }

  body.light {
    --borders: #e2e8f0;
    --postColor: #1a202c;
    --texts: #4a5568;
    --highlight: #0f4c81;
    --mediumBackground: #f7fafc;
    --background: #fff;
    --white: #fff;
    --black: #1a202c;
  }

  body.dark {
    --borders: #2d3748;
    --postColor: #e2e8f0;
    --texts: #a0aec0;
    --highlight: #63b3ed;
    --mediumBackground: #072741;
    --background: #111827;
    --white: #fff;
    --black: #1a202c;
    background: #072741;
  }

  body.dark::-webkit-scrollbar-track {
    background: #072741;
  }
`
export default GlobalStyles
