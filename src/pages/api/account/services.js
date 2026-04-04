import { getIronSession } from 'iron-session'
import { getPool } from '@/lib/db'
import { sessionOptions } from '@/lib/session'

const HORDE_RACES = new Set([2, 5, 6, 8, 10])

const UNSTUCK_POS = {
  horde:    { map: 1, x: 1629.36, y: -4373.34, z: 31.26 },
  alliance: { map: 0, x: -8833.38, y: 628.62, z: 94.01 },
}

// Services that require the game client UI (set at_login flag)
const AT_LOGIN_FLAGS = {
  'appearance':     8,
  'race-change':    64,
  'faction-change': 128,
}

const USERNAME_RE = /^[A-Za-z]{2,12}$/

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = await getIronSession(req, res, sessionOptions)
  if (!session.user) return res.status(401).json({ error: 'Não autenticado.' })

  const { serviceId, characterGuid, newName } = req.body

  if (typeof serviceId !== 'string' || typeof characterGuid !== 'number') {
    return res.status(400).json({ error: 'Dados inválidos.' })
  }

  const pool = getPool()

  try {
    const [charRows] = await pool.query(
      'SELECT guid, name, race, online, at_login FROM acore_characters.characters WHERE guid = ? AND account = ?',
      [characterGuid, session.user.id]
    )

    if (charRows.length === 0) {
      return res.status(404).json({ error: 'Personagem não encontrado.' })
    }

    const character = charRows[0]

    if (character.online === 1) {
      return res.status(400).json({ error: 'O personagem precisa estar deslogado para usar este serviço.' })
    }

    // ── Unstuck (direct — changes position) ──────────────────────────────
    if (serviceId === 'unstuck') {
      const isHorde = HORDE_RACES.has(character.race)
      const pos = isHorde ? UNSTUCK_POS.horde : UNSTUCK_POS.alliance

      await pool.query(
        `UPDATE acore_characters.characters
         SET position_x = ?, position_y = ?, position_z = ?, map = ?
         WHERE guid = ?`,
        [pos.x, pos.y, pos.z, pos.map, characterGuid]
      )

      const city = isHorde ? 'Orgrimmar' : 'Stormwind'
      return res.status(200).json({
        success: true,
        message: `${character.name} foi teleportado para ${city}. Já pode logar!`,
      })
    }

    // ── Reset Talents (direct — clears talent table) ─────────────────────
    if (serviceId === 'level-reset') {
      await pool.query(
        'DELETE FROM acore_characters.character_talent WHERE guid = ?',
        [characterGuid]
      )

      return res.status(200).json({
        success: true,
        message: `Os talentos de ${character.name} foram resetados. Já pode logar e redistribuir!`,
      })
    }

    // ── Name Change (direct — updates name in DB) ────────────────────────
    if (serviceId === 'name-change') {
      if (typeof newName !== 'string' || !USERNAME_RE.test(newName)) {
        return res.status(400).json({
          error: 'O nome deve ter entre 2 e 12 letras (sem números ou espaços).',
        })
      }

      // Check if name is already taken
      const [existing] = await pool.query(
        'SELECT guid FROM acore_characters.characters WHERE LOWER(name) = LOWER(?) AND guid != ?',
        [newName, characterGuid]
      )

      if (existing.length > 0) {
        return res.status(400).json({ error: `O nome "${newName}" já está em uso.` })
      }

      // Capitalize first letter
      const formattedName = newName.charAt(0).toUpperCase() + newName.slice(1).toLowerCase()

      await pool.query(
        'UPDATE acore_characters.characters SET name = ? WHERE guid = ?',
        [formattedName, characterGuid]
      )

      return res.status(200).json({
        success: true,
        message: `Nome alterado de ${character.name} para ${formattedName}!`,
      })
    }

    // ── Services that need game client (at_login flag) ───────────────────
    const flag = AT_LOGIN_FLAGS[serviceId]
    if (!flag) {
      return res.status(400).json({ error: 'Serviço desconhecido.' })
    }

    // Check if this specific flag is already set
    if ((character.at_login & flag) !== 0) {
      return res.status(400).json({
        error: 'Este serviço já está ativado para este personagem. Entre no jogo para aplicá-lo.',
      })
    }

    await pool.query(
      'UPDATE acore_characters.characters SET at_login = at_login | ? WHERE guid = ?',
      [flag, characterGuid]
    )

    const serviceNames = {
      'appearance':     'Mudança de Aparência',
      'race-change':    'Troca de Raça',
      'faction-change': 'Troca de Facção',
    }

    return res.status(200).json({
      success: true,
      message: `${serviceNames[serviceId]} ativado para ${character.name}. Entre no jogo — a tela de alteração aparecerá automaticamente.`,
    })
  } catch (err) {
    console.error('[services]', err)
    return res.status(500).json({ error: 'Erro interno.' })
  }
}
