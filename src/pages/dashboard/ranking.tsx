import { GetServerSideProps } from 'next'
import { getIronSession } from 'iron-session'
import SEO from '@/components/SEO'
import DashboardLayout from '@/components/Dashboard/DashboardLayout'
import RankingPage from '@/components/Dashboard/RankingPage'
import { sessionOptions } from '@/lib/session'

const Ranking = () => {
  return (
    <>
      <SEO title="Ranking PvP" description="Ranking de PvP do Azeroth Legacy." path="/dashboard/ranking" />
      <DashboardLayout>
        <RankingPage />
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

export default Ranking
