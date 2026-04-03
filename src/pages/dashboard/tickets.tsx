import { GetServerSideProps } from 'next'
import { getIronSession } from 'iron-session'
import SEO from '@/components/SEO'
import DashboardLayout from '@/components/Dashboard/DashboardLayout'
import TicketsPage from '@/components/Dashboard/TicketsPage'
import { sessionOptions } from '@/lib/session'

const Tickets = () => {
  return (
    <>
      <SEO title="Tickets" description="Seus tickets de suporte no Azeroth Legacy." path="/dashboard/tickets" />
      <DashboardLayout>
        <TicketsPage />
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

export default Tickets
