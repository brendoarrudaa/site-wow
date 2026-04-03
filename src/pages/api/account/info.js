import { getIronSession } from 'iron-session'
import { getPool } from '@/lib/db'
import { sessionOptions } from '@/lib/session'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const session = await getIronSession(req, res, sessionOptions)
  if (!session.user) return res.status(401).json({ error: 'Não autenticado.' })

  const pool = getPool()

  try {
    const [rows] = await pool.query(
      `SELECT joindate, last_login, last_ip, locked, failed_logins
       FROM acore_auth.account WHERE id = ?`,
      [session.user.id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Conta não encontrada.' })
    }

    const account = rows[0]

    const [charRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM acore_characters.characters WHERE account = ?`,
      [session.user.id]
    )

    return res.status(200).json({
      joindate: account.joindate,
      lastLogin: account.last_login,
      lastIp: account.last_ip,
      locked: account.locked === 1,
      failedLogins: account.failed_logins,
      totalCharacters: charRows[0].total,
    })
  } catch (err) {
    console.error('[account/info]', err)
    return res.status(500).json({ error: 'Erro interno.' })
  }
}
