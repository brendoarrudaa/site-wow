const DefaultSEO = {
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://movisul.com',
    site_name: 'MoviSul - Saude e Seguranca do Trabalho'
  },
  twitter: {
    handle: '@movisul',
    site: '@movisul',
    cardType: 'summary_large_image'
  },
  additionalMetaTags: [
    {
      name: 'author',
      content: 'MoviSul'
    },
    {
      name: 'robots',
      content: 'index, follow'
    },
    {
      name: 'keywords',
      content: 'seguranca do trabalho, saude ocupacional, SST, PGR, PCMSO, eSocial, consultoria SST, gestao de riscos'
    }
  ],
  additionalLinkTags: [
    {
      rel: 'canonical',
      href: 'https://movisul.com'
    }
  ]
}

export default DefaultSEO
