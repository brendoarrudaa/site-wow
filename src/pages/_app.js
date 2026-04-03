/* eslint-disable react/no-unknown-property */

import Head from 'next/head'
import { useEffect, useState } from 'react'
import NextNProgress from 'nextjs-progressbar'

import { generateDefaultSeo } from 'next-seo/pages'
import SEO from '../../next-seo.config'
import CookiesAlert from 'components/CookiesAlert'

import GlobalStyles from 'styles/global'
import 'styles/input.css'

function App({ Component, pageProps }) {
  // null = não decidiu ainda, true = aceitou, false = recusou
  const [cookieConsent, setCookieConsent] = useState(null)

  useEffect(() => {
    if (localStorage) {
      const stored = localStorage.getItem('accept-cookies')
      if (stored === 'true') setCookieConsent(true)
      else if (stored === 'false') setCookieConsent(false)
    }
  }, [])

  const handleCookieDecision = accepted => {
    setCookieConsent(accepted)
  }

  return (
    <>
      <Head>
        <title>MoviSul | Saude e Seguranca do Trabalho</title>
        <link rel="shortcut icon" href="/assets/img/logo-tab.png" />
        <link rel="apple-touch-icon" href="/assets/img/logo-tab.png" />
        <meta name="theme-color" content="#0f4c81" />
        <meta
          name="google-site-verification"
          content="zZa2E6npnGYkSbDVtkBttTWJR6XS8TLWVn2g2RQyzis"
        />
        <meta
          name="description"
          content="MoviSul - Gestao Inteligente em Saude e Seguranca do Trabalho. Solucoes completas para empresas que valorizam seguranca, performance e conformidade."
        />
      </Head>
      <Head>{generateDefaultSeo(SEO)}</Head>
      <GlobalStyles />
      <NextNProgress
        color="#0f4c81"
        startPosition={0.3}
        stopDelayMs={200}
        height={5}
        showSpinner={false}
      />
      <Component {...pageProps} />
      {cookieConsent === null && (
        <CookiesAlert setOpen={handleCookieDecision} />
      )}
    </>
  )
}

export default App
