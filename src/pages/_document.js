// eslint-disable-next-line @next/next/no-document-import-in-page
import Document, { Html, Head, Main, NextScript } from 'next/document'
import { ServerStyleSheet } from 'styled-components'

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet()
    const originalRenderPage = ctx.renderPage

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: App => props => sheet.collectStyles(<App {...props} />)
        })

      const initialProps = await Document.getInitialProps(ctx)
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        )
      }
    } finally {
      sheet.seal()
    }
  }

  render() {
    return (
      <Html lang="pt-BR" data-theme="movisul" data-scroll-behavior="smooth">
        <Head />
        <body>
          <script
            dangerouslySetInnerHTML={{
              __html: `
              (function() {
                var themeListeners = [];
                window.__onThemeChange = function(fn) {
                  if (typeof fn === 'function') { themeListeners.push(fn); return; }
                };
                function setTheme(newTheme) {
                  window.__theme = newTheme;
                  preferredTheme = newTheme;
                  document.body.className = newTheme;
                  document.documentElement.className = newTheme;
                  themeListeners.forEach(function(fn) { fn(newTheme); });
                }
                var preferredTheme;
                try {
                  preferredTheme = localStorage.getItem('theme');
                } catch (err) { }
                window.__setPreferredTheme = function(newTheme) {
                  setTheme(newTheme);
                  try {
                    localStorage.setItem('theme', newTheme);
                  } catch (err) {}
                }

                var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
                var systemTheme = darkQuery.matches ? 'dark' : 'light';
                setTheme(preferredTheme || systemTheme);

                darkQuery.addEventListener('change', function(e) {
                  if (!localStorage.getItem('theme')) {
                    setTheme(e.matches ? 'dark' : 'light');
                  }
                });
              })();
            `
            }}
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
