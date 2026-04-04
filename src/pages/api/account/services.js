import { getIronSession } from 'iron-session'
import { getPool } from '@/lib/db'
import { sessionOptions } from '@/lib/session'

// AzerothCore at_login bitmask flags
const AT_LOGIN_FLAGS = {
  'name-change':    1,   // AT_LOGIN_RENAME
  'appearance':     8,   // AT_LOGIN_CUSTOMIZE
  'race-change':    64,  // AT_LOGIN_CHANGE_RACE
  'faction-change': 128, // AT_LOGIN_CHANGE_FACTION
}

// Homebind coordinates for unstuck (capital cities)
const HORDE_RACES = new Set([2, 5, 6, 8, 10])

// Orgrimmar for Horde, Stormwind for Alliance
const UNSTUCK_POS = {
  horde:    { map: 1,   x: 1629.36, y: -4373.34, z: 31.26 },  // Orgrimmar
  alliance: { map: 0,   x: -8833.38, y: 628.62,  z: 94.01 },  // Stormwind
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = await getIronSession(req, res, sessionOptions)
  if (!session.user) return res.status(401).json({ error: 'Não autenticado.' })

  const { serviceId, characterGuid } = req.body

  if (typeof serviceId !== 'string' || typeof characterGuid !== 'number') {
    return res.status(400).json({ error: 'Dados inválidos.' })
  }

  const pool = getPool()

  try {
    // Verify character belongs to this account
    const [charRows] = await pool.query(
      'SELECT guid, name, race, online, at_login FROM acore_characters.characters WHERE guid = ? AND account = ?',
      [characterGuid, session.user.id]
    )

    if (charRows.length === 0) {
      return res.status(404).json({ error: 'Personagem não encontrado.' })
    }

    const character = charRows[0]

    // Character must be offline
    if (character.online === 1) {
      return res.status(400).json({ error: 'O personagem precisa estar deslogado para usar este serviço.' })
    }

    // Block if character already has a pending service (at_login != 0)
    // Unstuck is allowed even with pending flags (it only changes position)
    if (serviceId !== 'unstuck' && character.at_login !== 0) {
      return res.status(400).json({
        error: 'Este personagem já tem um serviço pendente. Entre no jogo para aplicá-lo antes de usar outro.',
      })
    }

    // Handle unstuck separately (position update, not at_login flag)
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
        message: `${character.name} será teleportado para ${city} no próximo login.`,
      })
    }

    // Handle reset talents (set at_login flag 4)
    if (serviceId === 'level-reset') {
      await pool.query(
        'UPDATE acore_characters.characters SET at_login = at_login | 4 WHERE guid = ?',
        [characterGuid]
      )
      return res.status(200).json({
        success: true,
        message: `Os talentos de ${character.name} serão resetados no próximo login.`,
      })
    }

    // Handle at_login flag services
    const flag = AT_LOGIN_FLAGS[serviceId]
    if (!flag) {
      return res.status(400).json({ error: 'Serviço desconhecido.' })
    }

    await pool.query(
      'UPDATE acore_characters.characters SET at_login = at_login | ? WHERE guid = ?',
      [flag, characterGuid]
    )

    const serviceNames = {
      'name-change':    'Troca de Nome',
      'appearance':     'Mudança de Aparência',
      'race-change':    'Troca de Raça',
      'faction-change': 'Troca de Facção',
    }

    return res.status(200).json({
      success: true,
      message: `${serviceNames[serviceId]} ativado para ${character.name}. A alteração será feita no próximo login no jogo.`,
    })
  } catch (err) {
    console.error('[services]', err)
    return res.status(500).json({ error: 'Erro interno.' })
  }
}
