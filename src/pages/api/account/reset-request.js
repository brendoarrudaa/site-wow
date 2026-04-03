import crypto from 'crypto'
import { getPool } from '@/lib/db'
import { sendResetEmail } from '@/lib/mailer'
import rateLimit from '@/lib/rateLimit'

const limiter = rateLimit({ limit: 3, interval: 15 * 60 * 1000 }) // 3 tentativas/15min por IP

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  if (!limiter.check(req, res)) return

  const { email } = req.body

  if (typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ error: 'Informe um e-mail válido.' })
  }

  const mail = email.trim().toLowerCase()

  // Resposta genérica — não revela se o e-mail está cadastrado
  const genericResponse = res
    .status(200)
    .json({ ok: true, message: 'Se este e-mail estiver cadastrado, você receberá as instruções em breve.' })

  const pool = getPool()

  try {
    const [rows] = await pool.query(
      'SELECT id, username FROM account WHERE email = ?',
      [mail]
    )

    if (rows.length === 0) return genericResponse

    const account = rows[0]

    // Invalida tokens anteriores não usados
    await pool.query(
      'DELETE FROM account_reset_tokens WHERE account_id = ? AND used = 0',
      [account.id]
    )

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    await pool.query(
      'INSERT INTO account_reset_tokens (account_id, token, expires_at) VALUES (?, ?, ?)',
      [account.id, token, expiresAt]
    )

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const resetUrl = `${siteUrl}/recuperar-senha?token=${token}`

    await sendResetEmail(mail, resetUrl)

    return genericResponse
  } catch (err) {
    console.error('[reset-request]', err)
    return genericResponse
  }
}
