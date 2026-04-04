import { getIronSession } from 'iron-session'
import { getPool } from '@/lib/db'
import { sessionOptions } from '@/lib/session'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const session = await getIronSession(req, res, sessionOptions)

  if (!session.user) {
    return res.status(200).json({ user: null })
  }

  // Always refresh email from DB (it may have changed after session was created)
  let isAdmin = false
  try {
    const pool = getPool()
    const [rows] = await pool.query(
      'SELECT email FROM acore_auth.account WHERE id = ?',
      [session.user.id]
    )

    if (rows.length > 0 && rows[0].email !== session.user.email) {
      session.user.email = rows[0].email
      await session.save()
    }

    const [access] = await pool.query(
      'SELECT 1 FROM acore_auth.account_access WHERE id = ? AND gmlevel >= 2 LIMIT 1',
      [session.user.id]
    )
    isAdmin = access.length > 0
  } catch {}

  return res.status(200).json({ user: session.user, isAdmin })
}
