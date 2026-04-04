import { getIronSession } from 'iron-session'
import { getPool } from '@/lib/db'
import { sessionOptions } from '@/lib/session'
import { verifyPassword, generateSalt, computeVerifier } from '@/lib/srp6'
import { assertSameOrigin } from '@/lib/requestSecurity'
import rateLimit from '@/lib/rateLimit'
import {
  acquireIdempotencyLock,
  releaseIdempotencyLock
} from '@/lib/idempotency-server'

const limiter = rateLimit({ limit: 5, interval: 15 * 60 * 1000 })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  if (!assertSameOrigin(req, res)) return
  if (!limiter.check(req, res)) return

  let idempotencyLock = null

  const session = await getIronSession(req, res, sessionOptions)
  if (!session.user) return res.status(401).json({ error: 'Não autenticado.' })

  const { currentPassword, newPassword } = req.body

  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    return res.status(400).json({ error: 'Campos obrigatórios.' })
  }

  if (newPassword.length < 6 || newPassword.length > 32) {
    return res
      .status(400)
      .json({ error: 'A nova senha deve ter entre 6 e 32 caracteres.' })
  }

  idempotencyLock = await acquireIdempotencyLock(req, res, {
    scope: 'account-change-password',
    userId: session.user.id,
    windowMs: 15_000
  })

  if (!idempotencyLock) return

  const pool = getPool()

  try {
    const [rows] = await pool.query(
      'SELECT username, salt, verifier FROM acore_auth.account WHERE id = ?',
      [session.user.id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Conta não encontrada.' })
    }

    const account = rows[0]
    const salt = Buffer.from(account.salt)
    const storedVerifier = Buffer.from(account.verifier)

    // Verify current password
    if (
      !verifyPassword(account.username, currentPassword, salt, storedVerifier)
    ) {
      return res.status(403).json({ error: 'Senha atual incorreta.' })
    }

    // Generate new salt + verifier
    const newSalt = generateSalt()
    const newVerifier = computeVerifier(account.username, newPassword, newSalt)

    await pool.query(
      'UPDATE acore_auth.account SET salt = ?, verifier = ? WHERE id = ?',
      [newSalt, newVerifier, session.user.id]
    )

    return res.status(200).json({ success: true })
  } catch (err) {
    if (idempotencyLock) await releaseIdempotencyLock(idempotencyLock)
    console.error('[change-password]', err)
    return res.status(500).json({ error: 'Erro interno.' })
  }
}
