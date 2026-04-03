import { GetServerSideProps } from 'next'
import { getIronSession } from 'iron-session'
import SEO from '@/components/SEO'
import DashboardLayout from '@/components/Dashboard/DashboardLayout'
import ServicosPage from '@/components/Dashboard/ServicosPage'
import { sessionOptions } from '@/lib/session'

const Servicos = () => {
  return (
    <>
      <SEO title="Serviços" description="Serviços de personagem do servidor Frostmourne." path="/dashboard/servicos" />
      <DashboardLayout>
        <ServicosPage />
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

export default Servicos
