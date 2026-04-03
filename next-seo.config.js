const DefaultSEO = {
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://azerothlegacy.com',
    site_name: 'Azeroth Legacy - Servidor WoW WotLK 3.3.5a'
  },
  twitter: {
    handle: '@azerothlegacy',
    site: '@azerothlegacy',
    cardType: 'summary_large_image'
  },
  additionalMetaTags: [
    {
      name: 'author',
      content: 'Azeroth Legacy'
    },
    {
      name: 'robots',
      content: 'index, follow'
    },
    {
      name: 'keywords',
      content: 'wow servidor, wotlk, wrath of the lich king, azeroth legacy, 3.3.5a, world of warcraft privado'
    }
  ],
  additionalLinkTags: [
    {
      rel: 'canonical',
      href: 'https://azerothlegacy.com'
    }
  ]
}

export default DefaultSEO
