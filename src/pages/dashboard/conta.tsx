import { GetServerSideProps } from 'next'
import { getIronSession } from 'iron-session'
import SEO from '@/components/SEO'
import DashboardLayout from '@/components/Dashboard/DashboardLayout'
import ContaPage from '@/components/Dashboard/ContaPage'
import { sessionOptions } from '@/lib/session'

const Conta = () => {
  return (
    <>
      <SEO title="Configurações da Conta" description="Gerencie sua conta no servidor Frostmourne." path="/dashboard/conta" />
      <DashboardLayout>
        <ContaPage />
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

export default Conta
