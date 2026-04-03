import { getIronSession } from 'iron-session'
import { getPool } from '@/lib/db'
import { sessionOptions } from '@/lib/session'
import rateLimit from '@/lib/rateLimit'
import { verifyCode, isCodeExpired } from '@/lib/emailVerification'

const limiter = rateLimit({ limit: 10, interval: 15 * 60 * 1000 })
const MAX_ATTEMPTS = 5

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  if (!limiter.check(req, res)) return

  const { email, code } = req.body

  if (typeof email !== 'string' || typeof code !== 'string') {
    return res.status(400).json({ error: 'Dados inválidos.' })
  }

  const mail = email.trim().toLowerCase()
  const submittedCode = code.trim().replace(/\s/g, '')

  if (!/^\d{6}$/.test(submittedCode)) {
    return res.status(400).json({ error: 'O código deve ter 6 dígitos.' })
  }

  const pool = getPool()

  try {
    const [rows] = await pool.query(
      'SELECT id, username, salt, verifier, code_hash, expires_at, attempts FROM account_pending_verifications WHERE email = ?',
      [mail]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Nenhum cadastro pendente encontrado para este e-mail.' })
    }

    const pending = rows[0]

    if (isCodeExpired(pending.expires_at)) {
      await pool.query('DELETE FROM account_pending_verifications WHERE id = ?', [pending.id])
      return res.status(400).json({ error: 'Código expirado. Faça o cadastro novamente.' })
    }

    if (pending.attempts >= MAX_ATTEMPTS) {
      await pool.query('DELETE FROM account_pending_verifications WHERE id = ?', [pending.id])
      return res.status(429).json({ error: 'Muitas tentativas. Faça o cadastro novamente.' })
    }

    if (!verifyCode(submittedCode, pending.code_hash)) {
      const newAttempts = pending.attempts + 1
      const remaining = MAX_ATTEMPTS - newAttempts

      if (newAttempts >= MAX_ATTEMPTS) {
        await pool.query('DELETE FROM account_pending_verifications WHERE id = ?', [pending.id])
        return res.status(429).json({ error: 'Muitas tentativas incorretas. Faça o cadastro novamente.' })
      }

      await pool.query(
        'UPDATE account_pending_verifications SET attempts = ? WHERE id = ?',
        [newAttempts, pending.id]
      )

      return res.status(401).json({
        error: `Código incorreto. ${remaining} tentativa${remaining !== 1 ? 's' : ''} restante${remaining !== 1 ? 's' : ''}.`,
      })
    }

    // ✅ Código correto — cria conta real
    const [result] = await pool.query(
      `INSERT INTO account (username, salt, verifier, email, reg_mail, expansion)
       VALUES (?, ?, ?, ?, ?, 2)`,
      [
        pending.username,
        Buffer.from(pending.salt),
        Buffer.from(pending.verifier),
        mail,
        mail,
      ]
    )

    // Remove registro pendente
    await pool.query('DELETE FROM account_pending_verifications WHERE id = ?', [pending.id])

    // Cria sessão
    const session = await getIronSession(
      req,
      res,
      sessionOptions
    )
    session.user = {
      id: result.insertId,
      username: pending.username,
      email: mail,
    }
    await session.save()

    return res.status(200).json({ ok: true, username: pending.username })
  } catch (err) {
    console.error('[verify-code]', err)
    return res.status(500).json({ error: 'Erro interno. Tente novamente.' })
  }
}
