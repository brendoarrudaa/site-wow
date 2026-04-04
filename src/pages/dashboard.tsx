import { GetServerSideProps } from 'next'
import { getIronSession } from 'iron-session'
import SEO from '@/components/SEO'
import DashboardLayout from '@/components/Dashboard/DashboardLayout'
import DashboardPage from '@/components/Dashboard/DashboardPage'
import { sessionOptions } from '@/lib/session'
import { getPool } from '@/lib/db'

type Props = {
  username: string
  email: string
  gmLevel: number
}

const Dashboard = ({ username, email, gmLevel }: Props) => {
  return (
    <>
      <SEO
        title="Painel do Jogador"
        description="Acesse sua conta, gerencie personagens, carteira, leilões e serviços no Azeroth Legacy."
        path="/dashboard"
        noindex
      />
      <DashboardLayout>
        <DashboardPage username={username} email={email} gmLevel={gmLevel} />
      </DashboardLayout>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getIronSession<{
    user?: { id: number; username: string; email: string }
  }>(req, res, sessionOptions)

  if (!session.user) {
    return {
      redirect: { destination: '/cadastro', permanent: false }
    }
  }

  // Refresh email from DB
  let email = session.user.email || ''
  let gmLevel = 0
  try {
    const pool = getPool()
    const [rows] = (await pool.query(
      'SELECT email FROM acore_auth.account WHERE id = ?',
      [session.user.id]
    )) as any
    if (rows.length > 0 && rows[0].email) {
      email = rows[0].email
    }

    const [accessRows] = (await pool.query(
      'SELECT MAX(gmlevel) as gmlevel FROM acore_auth.account_access WHERE account_id = ?',
      [session.user.id]
    )) as any

    if (accessRows.length > 0 && accessRows[0]?.gmlevel) {
      gmLevel = Number(accessRows[0].gmlevel) || 0
    }
  } catch {}

  return {
    props: {
      username: session.user.username,
      email,
      gmLevel
    }
  }
}

export default Dashboard
