import { getPool } from '@/lib/db'

const CLASS_NAMES = {
  1: 'Warrior', 2: 'Paladin', 3: 'Hunter', 4: 'Rogue',
  5: 'Priest', 6: 'Death Knight', 7: 'Shaman', 8: 'Mage',
  9: 'Warlock', 11: 'Druid',
}

const HORDE_RACES = new Set([2, 5, 6, 8, 10])

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120')

  const pool = getPool()

  try {
    // Arena 2v2 ranking (type=2)
    const [arena2v2] = await pool.query(
      `SELECT at.rating AS teamRating, at.seasonWins, at.seasonGames,
              atm.personalRating, atm.seasonWins AS memberWins, atm.seasonGames AS memberGames,
              c.name, c.race, c.class, c.guid,
              g.name AS guildName
       FROM acore_characters.arena_team at
       JOIN acore_characters.arena_team_member atm ON atm.arenaTeamId = at.arenaTeamId
       JOIN acore_characters.characters c ON c.guid = atm.guid
       LEFT JOIN acore_characters.guild_member gm ON gm.guid = c.guid
       LEFT JOIN acore_characters.guild g ON g.guildid = gm.guildid
       WHERE at.type = 2
       ORDER BY atm.personalRating DESC
       LIMIT 50`
    )

    // Arena 3v3 ranking (type=3)
    const [arena3v3] = await pool.query(
      `SELECT at.rating AS teamRating, at.seasonWins, at.seasonGames,
              atm.personalRating, atm.seasonWins AS memberWins, atm.seasonGames AS memberGames,
              c.name, c.race, c.class, c.guid,
              g.name AS guildName
       FROM acore_characters.arena_team at
       JOIN acore_characters.arena_team_member atm ON atm.arenaTeamId = at.arenaTeamId
       JOIN acore_characters.characters c ON c.guid = atm.guid
       LEFT JOIN acore_characters.guild_member gm ON gm.guid = c.guid
       LEFT JOIN acore_characters.guild g ON g.guildid = gm.guildid
       WHERE at.type = 3
       ORDER BY atm.personalRating DESC
       LIMIT 50`
    )

    // Honorable kills ranking
    const [hkRanking] = await pool.query(
      `SELECT c.name, c.race, c.class, c.totalKills, c.guid,
              g.name AS guildName
       FROM acore_characters.characters c
       LEFT JOIN acore_characters.guild_member gm ON gm.guid = c.guid
       LEFT JOIN acore_characters.guild g ON g.guildid = gm.guildid
       WHERE c.totalKills > 0
       ORDER BY c.totalKills DESC
       LIMIT 50`
    )

    const mapArena = (rows) =>
      rows.map((r, i) => ({
        position: i + 1,
        name: r.name,
        class: CLASS_NAMES[r.class] || 'Desconhecido',
        faction: HORDE_RACES.has(r.race) ? 'Horda' : 'Aliança',
        rating: r.personalRating,
        wins: r.memberWins,
        losses: r.memberGames - r.memberWins,
        guild: r.guildName || null,
      }))

    const mapHK = (rows) =>
      rows.map((r, i) => ({
        position: i + 1,
        name: r.name,
        class: CLASS_NAMES[r.class] || 'Desconhecido',
        faction: HORDE_RACES.has(r.race) ? 'Horda' : 'Aliança',
        kills: r.totalKills,
        guild: r.guildName || null,
      }))

    return res.status(200).json({
      arena2v2: mapArena(arena2v2),
      arena3v3: mapArena(arena3v3),
      hk: mapHK(hkRanking),
    })
  } catch (err) {
    console.error('[ranking]', err)
    return res.status(500).json({ error: 'Erro interno.' })
  }
}
