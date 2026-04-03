import { GetServerSideProps } from 'next'
import { getIronSession } from 'iron-session'
import SEO from '@/components/SEO'
import DashboardLayout from '@/components/Dashboard/DashboardLayout'
import LojaPage from '@/components/Dashboard/LojaPage'
import { sessionOptions } from '@/lib/session'

const Loja = () => {
  return (
    <>
      <SEO title="Loja" description="Loja de itens do servidor Frostmourne." path="/dashboard/loja" />
      <DashboardLayout>
        <LojaPage />
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

export default Loja
