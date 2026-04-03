import { getIronSession } from 'iron-session'
import { getPool } from '@/lib/db'
import { sessionOptions } from '@/lib/session'

// AzerothCore equipment slot IDs (character_inventory bag=255 for equipped)
// slot 0-18 are the paper-doll slots
const SLOT_NAMES = {
  0:  'head',
  1:  'neck',
  2:  'shoulders',
  3:  'body',       // shirt
  4:  'chest',
  5:  'waist',
  6:  'legs',
  7:  'feet',
  8:  'wrist',
  9:  'hands',
  10: 'ring1',
  11: 'ring2',
  12: 'trinket1',
  13: 'trinket2',
  14: 'back',
  15: 'mainHand',
  16: 'offHand',
  17: 'ranged',
  18: 'tabard',
}

const SLOT_LABELS = {
  head:      'Cabeça',
  neck:      'Pescoço',
  shoulders: 'Ombros',
  body:      'Camisa',
  chest:     'Peito',
  waist:     'Cintura',
  legs:      'Pernas',
  feet:      'Pés',
  wrist:     'Pulsos',
  hands:     'Mãos',
  ring1:     'Anel 1',
  ring2:     'Anel 2',
  trinket1:  'Bijuteria 1',
  trinket2:  'Bijuteria 2',
  back:      'Costas',
  mainHand:  'Mão Principal',
  offHand:   'Mão Secundária',
  ranged:    'Ranged',
  tabard:    'Tabard',
}

const QUALITY_NAMES = {
  0: 'poor',
  1: 'common',
  2: 'uncommon',
  3: 'rare',
  4: 'epic',
  5: 'legendary',
  6: 'artifact',
}

const CLASS_NAMES = {
  1: 'Warrior', 2: 'Paladin', 3: 'Hunter', 4: 'Rogue',
  5: 'Priest', 6: 'Death Knight', 7: 'Shaman', 8: 'Mage',
  9: 'Warlock', 11: 'Druid',
}

const RACE_NAMES = {
  1: 'Humano', 2: 'Orc', 3: 'Anão', 4: 'Elfo Noturno',
  5: 'Morto-Vivo', 6: 'Tauren', 7: 'Gnomo', 8: 'Troll',
  10: 'Elfo Sangrento', 11: 'Draenei',
}

const HORDE_RACES = new Set([2, 5, 6, 8, 10])

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const session = await getIronSession(req, res, sessionOptions)
  if (!session.user) return res.status(401).json({ error: 'Não autenticado.' })

  const pool = getPool()
  const accountId = session.user.id

  try {
    // 1. Fetch all characters for this account
    const [charRows] = await pool.query(
      `SELECT guid, name, race, class, level, money, online, totaltime,
              arenaPoints, totalKills
       FROM acore_characters.characters
       WHERE account = ?
       ORDER BY level DESC`,
      [accountId]
    )

    if (charRows.length === 0) {
      return res.status(200).json({ characters: [] })
    }

    // 2. For each character fetch equipped items (bag = 255 = equipped)
    const characters = await Promise.all(charRows.map(async (c) => {
      const [itemRows] = await pool.query(
        `SELECT ci.slot, ii.itemEntry, it.name, it.ItemLevel, it.Quality
         FROM acore_characters.character_inventory ci
         JOIN acore_characters.item_instance ii ON ii.guid = ci.item
         JOIN acore_world.item_template it ON it.entry = ii.itemEntry
         WHERE ci.guid = ? AND ci.bag = 0 AND ci.slot <= 18`,
        [c.guid]
      )

      const equipment = {}
      let totalIlvl = 0
      let ilvlCount = 0

      for (const row of itemRows) {
        const slotKey = SLOT_NAMES[row.slot]
        if (!slotKey) continue
        const ilvl = row.ItemLevel || 0
        equipment[slotKey] = {
          name: row.name,
          ilvl,
          label: SLOT_LABELS[slotKey] || slotKey,
          rarity: QUALITY_NAMES[row.Quality] || 'common',
        }
        if (ilvl > 0) { totalIlvl += ilvl; ilvlCount++ }
      }

      const avgIlvl = ilvlCount > 0 ? Math.round(totalIlvl / ilvlCount) : 0

      // Convert money
      const gold   = Math.floor(c.money / 10000)
      const silver = Math.floor((c.money % 10000) / 100)
      const copper = c.money % 100

      // Played time
      const totalSec = c.totaltime || 0
      const days  = Math.floor(totalSec / 86400)
      const hours = Math.floor((totalSec % 86400) / 3600)
      const mins  = Math.floor((totalSec % 3600) / 60)
      const playedTime = `${days}d ${hours}h ${mins}m`

      return {
        guid: c.guid,
        name: c.name,
        class: CLASS_NAMES[c.class] || 'Desconhecido',
        race:  RACE_NAMES[c.race]  || 'Desconhecido',
        level: c.level,
        gold,
        silver,
        copper,
        online: c.online === 1,
        playedTime,
        totalKills: c.totalKills || 0,
        faction: HORDE_RACES.has(c.race) ? 'Horda' : 'Aliança',
        avgIlvl,
        equipment,
      }
    }))

    return res.status(200).json({ characters })
  } catch (err) {
    console.error('[armory]', err)
    return res.status(500).json({ error: 'Erro interno.' })
  }
}
