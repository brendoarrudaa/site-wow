import Head from "next/head";

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  type?: string;
  article?: {
    publishedTime?: string;
    section?: string;
  };
  noindex?: boolean;
}

const SITE_NAME = "Azeroth Legacy";
const BASE_URL = "https://realmofshadows.com";
const DEFAULT_DESCRIPTION =
  "Servidor brasileiro de World of Warcraft WotLK 3.3.5a com scripts Blizzlike, rates equilibradas, anti-cheat ativo e comunidade dedicada.";

const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  type = "website",
  article,
  noindex = false,
}: SEOProps) => {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Servidor WoW WotLK 3.3.5a`;
  const url = `${BASE_URL}${path}`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="pt_BR" />

      {article?.publishedTime && (
        <meta property="article:published_time" content={article.publishedTime} />
      )}
      {article?.section && (
        <meta property="article:section" content={article.section} />
      )}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Head>
  );
};

export default SEO;
