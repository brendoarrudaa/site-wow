import { GetServerSideProps } from 'next'
import { getIronSession } from 'iron-session'
import SEO from '@/components/SEO'
import DashboardLayout from '@/components/Dashboard/DashboardLayout'
import GuildPage from '@/components/Dashboard/GuildPage'
import { sessionOptions } from '@/lib/session'

const Guild = () => {
  return (
    <>
      <SEO title="Minha Guild" description="Informações da sua guild no Azeroth Legacy." path="/dashboard/guild" />
      <DashboardLayout>
        <GuildPage />
      </DashboardLayout>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getIronSession<{ user?: { id: number; username: string; email: string } }>(req, res, sessionOptions)

  if (!session.user) {
    return { redirect: { destination: '/cadastro', permanent: false } }
  }

  return { props: {} }
}

export default Guild
