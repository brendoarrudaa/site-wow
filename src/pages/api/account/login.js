import { getIronSession } from 'iron-session'
import { getPool } from '@/lib/db'
import { verifyPassword } from '@/lib/srp6'
import { sessionOptions } from '@/lib/session'
import rateLimit from '@/lib/rateLimit'

const limiter = rateLimit({ limit: 10, interval: 15 * 60 * 1000 }) // 10 tentativas/15min por IP

const MAX_FAILED_LOGINS = 10 // Bloqueia a conta após 10 falhas consecutivas

function safeIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) {
    const ip = forwarded.split(',')[0].trim()
    // Aceita somente IPs IPv4 ou IPv6 simples — descarta cabeçalhos forjados longos
    if (/^[\d.]{7,15}$/.test(ip) || /^[0-9a-f:]{3,39}$/i.test(ip)) return ip
  }
  return req.socket?.remoteAddress || '127.0.0.1'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  if (!limiter.check(req, res)) return

  const { username, password } = req.body

  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Dados inválidos.' })
  }

  const user = username.trim()
  const pass = password

  if (!user || !pass) {
    return res.status(400).json({ error: 'Preencha usuário e senha.' })
  }

  const pool = getPool()

  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, salt, verifier, locked, failed_logins, online FROM account WHERE username = ?',
      [user.toUpperCase()]
    )

    // Resposta genérica: não revela se o usuário existe ou não
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos.' })
    }

    const account = rows[0]

    if (account.locked || account.failed_logins >= MAX_FAILED_LOGINS) {
      return res.status(403).json({ error: 'Conta bloqueada. Entre em contato com o suporte.' })
    }

    const salt = Buffer.from(account.salt)
    const storedVerifier = Buffer.from(account.verifier)

    const valid = verifyPassword(user, pass, salt, storedVerifier)

    if (!valid) {
      const newFailed = account.failed_logins + 1
      if (newFailed >= MAX_FAILED_LOGINS) {
        await pool.query(
          'UPDATE account SET failed_logins = ?, locked = 1 WHERE id = ?',
          [newFailed, account.id]
        )
        return res.status(403).json({
          error: 'Conta bloqueada após múltiplas tentativas. Entre em contato com o suporte.',
        })
      }
      await pool.query(
        'UPDATE account SET failed_logins = failed_logins + 1 WHERE id = ?',
        [account.id]
      )
      return res.status(401).json({ error: 'Usuário ou senha incorretos.' })
    }

    const ip = safeIp(req)
    await pool.query(
      'UPDATE account SET failed_logins = 0, last_login = NOW(), last_ip = ? WHERE id = ?',
      [ip, account.id]
    )

    const session = await getIronSession(req, res, sessionOptions)
    session.user = {
      id: account.id,
      username: account.username,
      email: account.email,
      online: account.online > 0,
    }
    await session.save()

    return res.status(200).json({ ok: true, username: account.username })
  } catch (err) {
    console.error('[login]', err)
    return res.status(500).json({ error: 'Erro interno. Tente novamente.' })
  }
}
