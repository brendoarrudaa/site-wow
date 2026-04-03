import Head from 'next/head'
import { generateNextSeo } from 'next-seo/pages'
import Link from 'next/link'
import styled from 'styled-components'

const Container = styled.section`
  background: var(--background);
  align-items: center;
  color: #111;
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
  padding: 0 20px;
  width: 100%;

  > div {
    display: flex;
    gap: 14px;
  }
`

const Title = styled.h1`
  background: var(--background);
  color: var(--texts);
  font-size: 100px;
  margin-top: 8px;
  font-weight: bold;
  letter-spacing: 0.1em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`

const Text = styled.p`
  background: var(--background);
  color: var(--texts);
`

const Button = styled(Link)`
  background: var(--background);
  border: 1px solid var(--borders);
  border-radius: 6px;
  color: var(--texts);
  cursor: pointer;
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 0.06em;
  line-height: 32px;
  margin-top: 1rem;
  padding: 0 10px;
  text-decoration: none;
  text-transform: uppercase;
  transition: opacity 0.5s;

  &:hover {
    opacity: 0.7;
  }
`

const NotFoundPage = () => (
  <Container>
    <Head>{generateNextSeo({ title: 'Não encontrado | Movisul' })}</Head>
    <Text>Erro</Text>
    <Title>404</Title>
    <Text>Parece que não tem o que você procura.</Text>
    <div>
      <Button href="/">Voltar ao site</Button>
      <Button href="/blog">Voltar ao blog</Button>
    </div>
  </Container>
)

export default NotFoundPage
