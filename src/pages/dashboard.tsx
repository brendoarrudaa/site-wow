import { GetServerSideProps } from 'next'
import { getIronSession } from 'iron-session'
import SEO from '@/components/SEO'
import DashboardLayout from '@/components/Dashboard/DashboardLayout'
import DashboardPage from '@/components/Dashboard/DashboardPage'
import { sessionOptions } from '@/lib/session'

type Props = {
  username: string
  email: string
}

const Dashboard = ({ username, email }: Props) => {
  return (
    <>
      <SEO title="Dashboard" description="Painel do jogador no Azeroth Legacy." path="/dashboard" />
      <DashboardLayout>
        <DashboardPage username={username} email={email} />
      </DashboardLayout>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getIronSession<{ user?: { id: number; username: string; email: string } }>(req, res, sessionOptions)

  if (!session.user) {
    return {
      redirect: { destination: '/cadastro', permanent: false },
    }
  }

  return {
    props: {
      username: session.user.username,
      email: session.user.email,
    },
  }
}

export default Dashboard
