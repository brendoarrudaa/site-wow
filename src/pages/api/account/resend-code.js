import { getPool } from '@/lib/db'
import rateLimit from '@/lib/rateLimit'
import {
  generateVerificationCode,
  hashVerificationCode,
  isCodeExpired,
  isResendOnCooldown,
  resendCooldownSeconds,
  sendVerificationEmail,
} from '@/lib/emailVerification'

const limiter = rateLimit({ limit: 5, interval: 15 * 60 * 1000 })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  if (!limiter.check(req, res)) return

  const { email } = req.body

  if (typeof email !== 'string') {
    return res.status(400).json({ error: 'Dados inválidos.' })
  }

  const mail = email.trim().toLowerCase()
  const pool = getPool()

  try {
    const [rows] = await pool.query(
      'SELECT id, expires_at, resend_available_at FROM account_pending_verifications WHERE email = ?',
      [mail]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Nenhum cadastro pendente encontrado.' })
    }

    const pending = rows[0]

    if (isCodeExpired(pending.expires_at) && !isResendOnCooldown(pending.resend_available_at)) {
      // Sessão completamente expirada — orienta novo cadastro
      await pool.query('DELETE FROM account_pending_verifications WHERE id = ?', [pending.id])
      return res.status(400).json({ error: 'Sessão expirada. Faça o cadastro novamente.' })
    }

    if (isResendOnCooldown(pending.resend_available_at)) {
      const secs = resendCooldownSeconds(pending.resend_available_at)
      return res.status(429).json({
        error: `Aguarde ${secs} segundo${secs !== 1 ? 's' : ''} antes de reenviar.`,
        cooldown: secs,
      })
    }

    const code = generateVerificationCode()
    const codeHash = hashVerificationCode(code)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
    const resendAvailableAt = new Date(Date.now() + 60 * 1000)

    await pool.query(
      `UPDATE account_pending_verifications
       SET code_hash = ?, expires_at = ?, attempts = 0, resend_available_at = ?
       WHERE id = ?`,
      [codeHash, expiresAt, resendAvailableAt, pending.id]
    )

    await sendVerificationEmail(mail, code)

    return res.status(200).json({ ok: true, message: 'Novo código enviado.' })
  } catch (err) {
    console.error('[resend-code]', err)
    return res.status(500).json({ error: 'Erro interno. Tente novamente.' })
  }
}
