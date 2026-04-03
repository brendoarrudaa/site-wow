import Head from 'next/head'
import { generateNextSeo } from 'next-seo/pages'
import Layout from 'components/Layout'
import Footer from 'components/FooterMoviSul'
import PoliticaDePrivacidade from 'components/PoliticaDePrivacidade'

const PrivacyPolicy = () => {
  return (
    <Layout>
      <Head>
        {generateNextSeo({
          title: 'Política de Privacidade | Movisul',
          description:
            'Saiba como a Movisul coleta, usa e protege seus dados pessoais em conformidade com a LGPD (Lei 13.709/2018).',
          canonical: 'https://movisul.com/politica-de-privacidade',
          openGraph: {
            url: 'https://movisul.com/politica-de-privacidade',
            title: 'Política de Privacidade | Movisul',
            description:
              'Saiba como a Movisul coleta, usa e protege seus dados pessoais em conformidade com a LGPD.'
          }
        })}
        <meta name="robots" content="noindex, follow" />
      </Head>
      <PoliticaDePrivacidade />
      <Footer />
    </Layout>
  )
}

export default PrivacyPolicy
