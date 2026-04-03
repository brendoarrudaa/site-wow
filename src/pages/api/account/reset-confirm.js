import { getPool } from '@/lib/db'
import { generateSalt, computeVerifier } from '@/lib/srp6'
import rateLimit from '@/lib/rateLimit'

const limiter = rateLimit({ limit: 5, interval: 15 * 60 * 1000 })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  if (!limiter.check(req, res)) return

  const { token, password } = req.body

  if (typeof token !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Dados inválidos.' })
  }

  if (password.length < 6 || password.length > 16) {
    return res.status(400).json({ error: 'Senha deve ter entre 6 e 16 caracteres.' })
  }

  const pool = getPool()

  try {
    const [rows] = await pool.query(
      `SELECT t.id, t.account_id, t.expires_at, t.used, a.username
       FROM account_reset_tokens t
       JOIN account a ON a.id = t.account_id
       WHERE t.token = ?`,
      [token]
    )

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Link inválido ou expirado.' })
    }

    const record = rows[0]

    if (record.used) {
      return res.status(400).json({ error: 'Este link já foi utilizado.' })
    }

    if (new Date(record.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Link expirado. Solicite um novo.' })
    }

    const salt = generateSalt()
    const verifier = computeVerifier(record.username, password, salt)

    await pool.query(
      'UPDATE account SET salt = ?, verifier = ?, failed_logins = 0, locked = 0 WHERE id = ?',
      [salt, verifier, record.account_id]
    )

    await pool.query(
      'UPDATE account_reset_tokens SET used = 1 WHERE id = ?',
      [record.id]
    )

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[reset-confirm]', err)
    return res.status(500).json({ error: 'Erro interno. Tente novamente.' })
  }
}
