import { getPool } from '@/lib/db'
import { generateSalt, computeVerifier } from '@/lib/srp6'
import rateLimit from '@/lib/rateLimit'
import {
  generateVerificationCode,
  hashVerificationCode,
  isCodeExpired,
  sendVerificationEmail,
} from '@/lib/emailVerification'

const limiter = rateLimit({ limit: 5, interval: 60 * 60 * 1000 }) // 5/hora por IP

const USERNAME_RE = /^[A-Za-z0-9_]{3,16}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  if (!limiter.check(req, res)) return

  const { username, email, password } = req.body

  if (
    typeof username !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string'
  ) {
    return res.status(400).json({ error: 'Dados inválidos.' })
  }

  const user = username.trim()
  const mail = email.trim().toLowerCase()
  const pass = password

  if (!USERNAME_RE.test(user)) {
    return res.status(400).json({
      error: 'Usuário deve ter 3–16 caracteres e conter apenas letras, números ou _',
    })
  }

  if (!EMAIL_RE.test(mail)) {
    return res.status(400).json({ error: 'E-mail inválido.' })
  }

  if (pass.length < 6 || pass.length > 16) {
    return res.status(400).json({ error: 'Senha deve ter entre 6 e 16 caracteres.' })
  }

  const pool = getPool()

  try {
    // Conta ativa já existe?
    const [activeRows] = await pool.query(
      'SELECT id FROM account WHERE username = ? OR email = ?',
      [user.toUpperCase(), mail]
    )
    if (activeRows.length > 0) {
      return res.status(409).json({ error: 'Usuário ou e-mail já cadastrado.' })
    }

    const salt = generateSalt()
    const verifier = computeVerifier(user, pass, salt)
    const code = generateVerificationCode()
    const codeHash = hashVerificationCode(code)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)         // 10 minutos
    const resendAvailableAt = new Date(Date.now() + 60 * 1000)       // cooldown 60s

    // Conta pendente já existe para este e-mail ou username?
    const [pendingRows] = await pool.query(
      'SELECT id, expires_at FROM account_pending_verifications WHERE email = ? OR username = ?',
      [mail, user.toUpperCase()]
    )

    if (pendingRows.length > 0) {
      const pending = pendingRows[0]
      if (!isCodeExpired(pending.expires_at)) {
        // Código ainda válido — orienta o usuário a verificar o e-mail
        return res.status(202).json({
          pending: true,
          email: mail,
          message: 'Código de verificação já enviado. Verifique seu e-mail ou aguarde para reenviar.',
        })
      }
      // Código expirado — atualiza com novos dados e reenvia
      await pool.query(
        `UPDATE account_pending_verifications
         SET username = ?, salt = ?, verifier = ?, code_hash = ?,
             expires_at = ?, attempts = 0, resend_available_at = ?
         WHERE id = ?`,
        [user.toUpperCase(), salt, verifier, codeHash, expiresAt, resendAvailableAt, pending.id]
      )
    } else {
      await pool.query(
        `INSERT INTO account_pending_verifications
         (username, email, salt, verifier, code_hash, expires_at, resend_available_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user.toUpperCase(), mail, salt, verifier, codeHash, expiresAt, resendAvailableAt]
      )
    }

    await sendVerificationEmail(mail, code)

    return res.status(202).json({
      pending: true,
      email: mail,
      message: 'Código de verificação enviado para seu e-mail.',
    })
  } catch (err) {
    console.error('[register]', err)
    return res.status(500).json({ error: 'Erro interno. Tente novamente.' })
  }
}
