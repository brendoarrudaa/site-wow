import { GetServerSideProps } from 'next'
import { getIronSession } from 'iron-session'
import SEO from '@/components/SEO'
import DashboardLayout from '@/components/Dashboard/DashboardLayout'
import ContaPage from '@/components/Dashboard/ContaPage'
import { sessionOptions } from '@/lib/session'
import { getPool } from '@/lib/db'

type Props = {
  username: string
  email: string
}

const Conta = ({ username, email }: Props) => {
  return (
    <>
      <SEO title="Configurações da Conta" description="Gerencie sua conta no Azeroth Legacy." path="/dashboard/conta" />
      <DashboardLayout>
        <ContaPage username={username} email={email} />
      </DashboardLayout>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getIronSession<{ user?: { id: number; username: string; email: string } }>(req, res, sessionOptions)

  if (!session.user) {
    return { redirect: { destination: '/cadastro', permanent: false } }
  }

  // Refresh email from DB
  let email = session.user.email || ''
  try {
    const pool = getPool()
    const [rows] = await pool.query(
      'SELECT email FROM acore_auth.account WHERE id = ?',
      [session.user.id]
    ) as any
    if (rows.length > 0 && rows[0].email) {
      email = rows[0].email
    }
  } catch {}

  return {
    props: {
      username: session.user.username,
      email,
    },
  }
}

export default Conta
