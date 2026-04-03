import { GetServerSideProps } from 'next'
import { getIronSession } from 'iron-session'
import SEO from '@/components/SEO'
import DashboardLayout from '@/components/Dashboard/DashboardLayout'
import ArmoryPage from '@/components/Dashboard/ArmoryPage'
import { sessionOptions } from '@/lib/session'

const Armory = () => {
  return (
    <>
      <SEO title="Armory" description="Equipamentos e estatísticas dos seus personagens." path="/dashboard/armory" />
      <DashboardLayout>
        <ArmoryPage />
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

export default Armory
