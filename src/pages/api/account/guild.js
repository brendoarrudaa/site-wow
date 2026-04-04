import { getIronSession } from 'iron-session'
import { getPool } from '@/lib/db'
import { sessionOptions } from '@/lib/session'

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

  try {
    // Find character guids for this account
    const [charRows] = await pool.query(
      'SELECT guid FROM acore_characters.characters WHERE account = ?',
      [session.user.id]
    )

    if (charRows.length === 0) {
      return res.status(200).json({ guild: null })
    }

    const guids = charRows.map((c) => c.guid)

    // Find if any character is in a guild
    const [memberRows] = await pool.query(
      `SELECT gm.guildid, gm.guid, gm.rank AS rankId
       FROM acore_characters.guild_member gm
       WHERE gm.guid IN (?)
       LIMIT 1`,
      [guids]
    )

    if (memberRows.length === 0) {
      return res.status(200).json({ guild: null })
    }

    const guildId = memberRows[0].guildid
    const myGuid = memberRows[0].guid
    const myRankId = memberRows[0].rankId

    // Fetch guild info
    const [guildRows] = await pool.query(
      'SELECT name, leaderguid, motd, createdate FROM acore_characters.guild WHERE guildid = ?',
      [guildId]
    )

    if (guildRows.length === 0) {
      return res.status(200).json({ guild: null })
    }

    const guildInfo = guildRows[0]

    // Fetch ranks
    const [rankRows] = await pool.query(
      'SELECT rid, rname FROM acore_characters.guild_rank WHERE guildid = ? ORDER BY rid ASC',
      [guildId]
    )
    const rankMap = Object.fromEntries(rankRows.map((r) => [r.rid, r.rname]))

    // Fetch all members with character info
    const [allMembers] = await pool.query(
      `SELECT gm.guid, gm.rank AS rankId, c.name, c.race, c.class, c.level, c.online
       FROM acore_characters.guild_member gm
       JOIN acore_characters.characters c ON c.guid = gm.guid
       WHERE gm.guildid = ?
       ORDER BY gm.rank ASC, c.level DESC`,
      [guildId]
    )

    // Determine faction from leader's race
    const leaderMember = allMembers.find((m) => m.guid === guildInfo.leaderguid)
    const faction = leaderMember && HORDE_RACES.has(leaderMember.race) ? 'Horda' : 'Aliança'

    const members = allMembers.map((m) => ({
      name: m.name,
      class: CLASS_NAMES[m.class] || 'Desconhecido',
      race: RACE_NAMES[m.race] || 'Desconhecido',
      level: m.level,
      rank: rankMap[m.rankId] || `Rank ${m.rankId}`,
      online: m.online === 1,
      isLeader: m.guid === guildInfo.leaderguid,
    }))

    return res.status(200).json({
      guild: {
        name: guildInfo.name,
        faction,
        motd: guildInfo.motd || '',
        memberCount: members.length,
        myRank: rankMap[myRankId] || `Rank ${myRankId}`,
        members,
      },
    })
  } catch (err) {
    console.error('[guild]', err)
    return res.status(500).json({ error: 'Erro interno.' })
  }
}
