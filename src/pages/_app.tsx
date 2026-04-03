import type { AppProps } from "next/app";
import Head from "next/head";
import NextNProgress from "nextjs-progressbar";

import "../styles/input.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="theme-color" content="#1a0a00" />
        <meta name="application-name" content="Azeroth Legacy" />
      </Head>
      <NextNProgress color="#c89b3c" startPosition={0.3} stopDelayMs={200} height={3} options={{ showSpinner: false }} />
      <Component {...pageProps} />
    </>
  );
}
