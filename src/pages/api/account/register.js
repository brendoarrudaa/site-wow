import { getIronSession } from 'iron-session'
import { getPool } from '@/lib/db'
import { generateSalt, computeVerifier } from '@/lib/srp6'
import { sessionOptions } from '@/lib/session'
import rateLimit from '@/lib/rateLimit'

const limiter = rateLimit({ limit: 5, interval: 60 * 60 * 1000 }) // 5 cadastros/hora por IP

const USERNAME_RE = /^[A-Za-z0-9_]{3,16}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  if (!limiter.check(req, res)) return

  const { username, email, password } = req.body

  // Rejeita se qualquer campo não for string (evita object injection)
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
    const [rows] = await pool.query(
      'SELECT id FROM account WHERE username = ?',
      [user.toUpperCase()]
    )

    if (rows.length > 0) {
      return res.status(409).json({ error: 'Nome de usuário já existe.' })
    }

    const [emailRows] = await pool.query(
      'SELECT id FROM account WHERE email = ?',
      [mail]
    )

    if (emailRows.length > 0) {
      return res.status(409).json({ error: 'E-mail já cadastrado.' })
    }

    const salt = generateSalt()
    const verifier = computeVerifier(user, pass, salt)

    const [result] = await pool.query(
      `INSERT INTO account (username, salt, verifier, email, reg_mail, expansion)
       VALUES (?, ?, ?, ?, ?, 2)`,
      [user.toUpperCase(), salt, verifier, mail, mail]
    )

    const session = await getIronSession(req, res, sessionOptions)
    session.user = {
      id: result.insertId,
      username: user.toUpperCase(),
      email: mail,
    }
    await session.save()

    return res.status(201).json({ ok: true, username: user.toUpperCase() })
  } catch (err) {
    console.error('[register]', err)
    return res.status(500).json({ error: 'Erro interno. Tente novamente.' })
  }
}
