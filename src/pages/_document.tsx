import Document, { Html, Head, Main, NextScript, DocumentContext } from "next/document";

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    return Document.getInitialProps(ctx);
  }

  render() {
    return (
      <Html lang="pt-BR" data-theme="wow-dark">
        <Head>
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var t=localStorage.getItem('theme');var theme=t==='wow-light'||t==='wow-dark'?t:window.matchMedia('(prefers-color-scheme: light)').matches?'wow-light':'wow-dark';document.documentElement.setAttribute('data-theme',theme);}catch(e){}})();`,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
