import { getIronSession } from 'iron-session'
import { getPool } from '@/lib/db'
import { sessionOptions } from '@/lib/session'

const RACE_NAMES = {
  1: 'Humano', 2: 'Orc', 3: 'Anão', 4: 'Elfo Noturno',
  5: 'Morto-Vivo', 6: 'Tauren', 7: 'Gnomo', 8: 'Troll',
  10: 'Elfo Sangrento', 11: 'Draenei',
}

const CLASS_NAMES = {
  1: 'Warrior', 2: 'Paladin', 3: 'Hunter', 4: 'Rogue',
  5: 'Priest', 6: 'Death Knight', 7: 'Shaman', 8: 'Mage',
  9: 'Warlock', 11: 'Druid',
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const session = await getIronSession(req, res, sessionOptions)
  if (!session.user) return res.status(401).json({ error: 'Não autenticado.' })

  const pool = getPool()

  try {
    const [rows] = await pool.query(
      `SELECT guid, name, race, class, level, money, online
       FROM acore_characters.characters
       WHERE account = ?
       ORDER BY level DESC`,
      [session.user.id]
    )

    const characters = rows.map(c => ({
      guid: c.guid,
      name: c.name,
      raceId: c.race,
      classId: c.class,
      race: RACE_NAMES[c.race] || 'Desconhecido',
      class: CLASS_NAMES[c.class] || 'Desconhecido',
      level: c.level,
      gold: Math.floor(c.money / 10000),
      silver: Math.floor((c.money % 10000) / 100),
      copper: c.money % 100,
      online: c.online === 1,
    }))

    return res.status(200).json({ characters })
  } catch (err) {
    console.error('[characters]', err)
    return res.status(500).json({ error: 'Erro interno.' })
  }
}
