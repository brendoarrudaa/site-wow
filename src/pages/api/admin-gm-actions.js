// ============================================================================
// API: POST /api/admin-gm-actions
// ============================================================================
// Ações GM via banco de dados (funciona offline)
// Actions: ban | unban | money | level
// Requer GM level 2+

import { getSession } from '../../lib/session'
import { getPool } from '../../lib/db'
import { assertSameOrigin } from '../../lib/requestSecurity'
import rateLimit from '../../lib/rateLimit'

const limiter = rateLimit({ limit: 30, interval: 60 * 1000 })

// Durations em segundos
const DURATION_MAP = {
  '1h':        3600,
  '6h':        21600,
  '12h':       43200,
  '1d':        86400,
  '7d':        604800,
  '30d':       2592000,
  'permanent': 0,
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }
  if (!assertSameOrigin(req, res)) return
  if (!limiter.check(req, res)) return

  const session = await getSession(req, res)
  if (!session?.user) {
    return res.status(401).json({ success: false, error: 'Not authenticated' })
  }

  const pool = getPool()
  const connection = await pool.getConnection()

  try {
    // GM level 2+
    const [access] = await connection.query(
      'SELECT gmlevel FROM acore_auth.account_access WHERE id = ? AND gmlevel >= 2',
      [session.user.id]
    )
    if (access.length === 0) {
      return res.status(403).json({ success: false, error: 'GM level 2+ required.' })
    }
    const actorLevel = access[0].gmlevel

    const { action } = req.body ?? {}
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'

    // ── BAN ────────────────────────────────────────────────────────────────
    if (action === 'ban') {
      const { username, duration, reason } = req.body
      if (!username || !duration || !reason) {
        return res.status(400).json({ success: false, error: 'username, duration e reason são obrigatórios.' })
      }

      const [accounts] = await connection.query(
        'SELECT id FROM acore_auth.account WHERE username = ?',
        [String(username).toUpperCase()]
      )
      if (accounts.length === 0) {
        return res.status(404).json({ success: false, error: `Conta "${username}" não encontrada.` })
      }
      const targetId = accounts[0].id

      // Verifica se já está banido
      const [existing] = await connection.query(
        'SELECT id FROM acore_auth.account_banned WHERE id = ? AND active = 1',
        [targetId]
      )
      if (existing.length > 0) {
        return res.status(400).json({ success: false, error: 'Conta já está banida.' })
      }

      const now = Math.floor(Date.now() / 1000)
      const durationSec = DURATION_MAP[duration] ?? 86400
      const unbandate = durationSec === 0 ? 0 : now + durationSec
      const bannedby = `GM${actorLevel}:${session.user.username}`
      const safeReason = escapeXml(String(reason).slice(0, 254))

      await connection.query(
        'INSERT INTO acore_auth.account_banned (id, bandate, unbandate, bannedby, banreason, active) VALUES (?, ?, ?, ?, ?, 1)',
        [targetId, now, unbandate, bannedby, safeReason]
      )

      await connection.query(
        `INSERT INTO wow_marketplace.audit_log
         (account_id, actor_role, action_type, target_type, target_id, after_state, details, ip_address)
         VALUES (?, ?, 'BAN_ACCOUNT', 'account', ?, NULL, ?, ?)`,
        [
          session.user.id, `GM${actorLevel}`, targetId,
          JSON.stringify({ username, duration, reason: safeReason, unbandate }),
          ip,
        ]
      )

      return res.status(200).json({
        success: true,
        message: `Conta "${username}" banida${durationSec === 0 ? ' permanentemente' : ` por ${duration}`}.`,
      })
    }

    // ── UNBAN ──────────────────────────────────────────────────────────────
    if (action === 'unban') {
      const { username } = req.body
      if (!username) {
        return res.status(400).json({ success: false, error: 'username é obrigatório.' })
      }

      const [accounts] = await connection.query(
        'SELECT id FROM acore_auth.account WHERE username = ?',
        [String(username).toUpperCase()]
      )
      if (accounts.length === 0) {
        return res.status(404).json({ success: false, error: `Conta "${username}" não encontrada.` })
      }
      const targetId = accounts[0].id

      const [result] = await connection.query(
        'UPDATE acore_auth.account_banned SET active = 0 WHERE id = ? AND active = 1',
        [targetId]
      )
      if (result.affectedRows === 0) {
        return res.status(400).json({ success: false, error: 'Conta não está banida.' })
      }

      await connection.query(
        `INSERT INTO wow_marketplace.audit_log
         (account_id, actor_role, action_type, target_type, target_id, details, ip_address)
         VALUES (?, ?, 'UNBAN_ACCOUNT', 'account', ?, ?, ?)`,
        [session.user.id, `GM${actorLevel}`, targetId, JSON.stringify({ username }), ip]
      )

      return res.status(200).json({ success: true, message: `Ban de "${username}" removido com sucesso.` })
    }

    // ── MONEY ──────────────────────────────────────────────────────────────
    if (action === 'money') {
      const { character, gold } = req.body
      if (!character || gold === undefined || gold === '') {
        return res.status(400).json({ success: false, error: 'character e gold são obrigatórios.' })
      }
      const goldNum = parseInt(gold)
      if (isNaN(goldNum)) {
        return res.status(400).json({ success: false, error: 'gold deve ser um número.' })
      }

      const [chars] = await connection.query(
        'SELECT guid, name, account, money FROM acore_characters.characters WHERE name = ?',
        [String(character)]
      )
      if (chars.length === 0) {
        return res.status(404).json({ success: false, error: `Personagem "${character}" não encontrado.` })
      }
      const char = chars[0]

      const copperDelta = goldNum * 10000
      const newMoney = Math.max(0, char.money + copperDelta)

      await connection.query(
        'UPDATE acore_characters.characters SET money = ? WHERE guid = ?',
        [newMoney, char.guid]
      )

      await connection.query(
        `INSERT INTO wow_marketplace.audit_log
         (account_id, actor_role, action_type, target_type, target_id, before_state, after_state, details, ip_address)
         VALUES (?, ?, 'GM_MODIFY_MONEY', 'character', ?, ?, ?, ?, ?)`,
        [
          session.user.id, `GM${actorLevel}`, char.guid,
          JSON.stringify({ money: char.money }),
          JSON.stringify({ money: newMoney }),
          JSON.stringify({ character: char.name, gold_delta: goldNum, gold_final: Math.floor(newMoney / 10000) }),
          ip,
        ]
      )

      const sign = goldNum >= 0 ? '+' : ''
      return res.status(200).json({
        success: true,
        message: `${sign}${goldNum.toLocaleString('pt-BR')} gold para ${char.name}. Total: ${Math.floor(newMoney / 10000).toLocaleString('pt-BR')} gold.`,
      })
    }

    // ── LEVEL ──────────────────────────────────────────────────────────────
    if (action === 'level') {
      const { character, level } = req.body
      if (!character || !level) {
        return res.status(400).json({ success: false, error: 'character e level são obrigatórios.' })
      }
      const lvl = parseInt(level)
      if (isNaN(lvl) || lvl < 1 || lvl > 80) {
        return res.status(400).json({ success: false, error: 'level deve ser entre 1 e 80.' })
      }

      const [chars] = await connection.query(
        'SELECT guid, name, account, level FROM acore_characters.characters WHERE name = ?',
        [String(character)]
      )
      if (chars.length === 0) {
        return res.status(404).json({ success: false, error: `Personagem "${character}" não encontrado.` })
      }
      const char = chars[0]
      const oldLevel = char.level

      await connection.query(
        'UPDATE acore_characters.characters SET level = ?, xp = 0, leveltime = 0 WHERE guid = ?',
        [lvl, char.guid]
      )

      await connection.query(
        `INSERT INTO wow_marketplace.audit_log
         (account_id, actor_role, action_type, target_type, target_id, before_state, after_state, details, ip_address)
         VALUES (?, ?, 'GM_SET_LEVEL', 'character', ?, ?, ?, ?, ?)`,
        [
          session.user.id, `GM${actorLevel}`, char.guid,
          JSON.stringify({ level: oldLevel }),
          JSON.stringify({ level: lvl }),
          JSON.stringify({ character: char.name, old_level: oldLevel, new_level: lvl }),
          ip,
        ]
      )

      return res.status(200).json({
        success: true,
        message: `${char.name}: nível ${oldLevel} → ${lvl}. Personagem deve reconectar para aplicar.`,
      })
    }

    return res.status(400).json({ success: false, error: `Ação "${action}" desconhecida.` })
  } catch (error) {
    console.error('[admin-gm-actions]', error)
    return res.status(500).json({ success: false, error: 'Erro interno.' })
  } finally {
    connection.release()
  }
}
