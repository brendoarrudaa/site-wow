import { getIronSession } from 'iron-session'
import { getPool } from '@/lib/db'
import { sessionOptions } from '@/lib/session'

const HORDE_RACES = new Set([2, 5, 6, 8, 10])
const ALLIANCE_RACES = new Set([1, 3, 4, 7, 11])

const UNSTUCK_POS = {
  horde:    { map: 1, x: 1629.36, y: -4373.34, z: 31.26 },
  alliance: { map: 0, x: -8833.38, y: 628.62, z: 94.01 },
}


const RACE_NAMES = {
  1: 'Humano', 2: 'Orc', 3: 'Anão', 4: 'Elfo Noturno',
  5: 'Morto-Vivo', 6: 'Tauren', 7: 'Gnomo', 8: 'Troll',
  10: 'Elfo Sangrento', 11: 'Draenei',
}

// Valid races per class (WoW 3.3.5a — WotLK)
// Race IDs: 1=Human 2=Orc 3=Dwarf 4=NightElf 5=Undead 6=Tauren 7=Gnome 8=Troll 10=BloodElf 11=Draenei
// Class IDs: 1=Warrior 2=Paladin 3=Hunter 4=Rogue 5=Priest 6=DeathKnight 7=Shaman 8=Mage 9=Warlock 11=Druid
const CLASS_RACE_MAP = {
  1:  new Set([1, 2, 3, 4, 5, 6, 7, 8, 10, 11]), // Warrior: all
  2:  new Set([1, 3, 10, 11]),                     // Paladin
  3:  new Set([2, 3, 4, 6, 8, 10, 11]),            // Hunter
  4:  new Set([1, 2, 3, 4, 5, 7, 8, 10]),          // Rogue
  5:  new Set([1, 3, 4, 5, 8, 10, 11]),            // Priest
  6:  new Set([1, 2, 3, 4, 5, 6, 7, 8, 10, 11]),  // Death Knight: all
  7:  new Set([2, 6, 8, 11]),                       // Shaman
  8:  new Set([1, 5, 7, 8, 10, 11]),               // Mage
  9:  new Set([1, 2, 5, 7, 10]),                   // Warlock
  11: new Set([4, 6]),                              // Druid
}

// Services that require the game client UI (set at_login flag)
const AT_LOGIN_FLAGS = {
  'appearance': 8,
}

const USERNAME_RE = /^[A-Za-z]{2,12}$/

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = await getIronSession(req, res, sessionOptions)
  if (!session.user) return res.status(401).json({ error: 'Não autenticado.' })

  const { serviceId, newName } = req.body
  const characterGuid = Number(req.body.characterGuid)

  if (typeof serviceId !== 'string' || !Number.isInteger(characterGuid) || characterGuid <= 0) {
    return res.status(400).json({ error: 'Dados inválidos.' })
  }

  const pool = getPool()

  try {
    const [charRows] = await pool.query(
      'SELECT guid, name, race, class, online, at_login FROM acore_characters.characters WHERE guid = ? AND account = ?',
      [characterGuid, session.user.id]
    )

    if (charRows.length === 0) {
      return res.status(404).json({ error: 'Personagem não encontrado.' })
    }

    const character = charRows[0]

    if (character.online === 1) {
      return res.status(400).json({ error: 'O personagem precisa estar deslogado para usar este serviço.' })
    }

    // ── Unstuck ───────────────────────────────────────────────────────────
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

    // ── Reset Talents ─────────────────────────────────────────────────────
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

    // ── Name Change ───────────────────────────────────────────────────────
    if (serviceId === 'name-change') {
      if (typeof newName !== 'string' || !USERNAME_RE.test(newName)) {
        return res.status(400).json({
          error: 'O nome deve ter entre 2 e 12 letras (sem números ou espaços).',
        })
      }

      const [existing] = await pool.query(
        'SELECT guid FROM acore_characters.characters WHERE LOWER(name) = LOWER(?) AND guid != ?',
        [newName, characterGuid]
      )

      if (existing.length > 0) {
        return res.status(400).json({ error: `O nome "${newName}" já está em uso.` })
      }

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

    // ── Race Change (direct) ──────────────────────────────────────────────
    if (serviceId === 'race-change') {
      const newRace = Number(req.body.newRace)

      if (!Number.isInteger(newRace) || newRace <= 0 || !RACE_NAMES[newRace]) {
        return res.status(400).json({ error: 'Selecione uma raça válida.' })
      }

      if (newRace === character.race) {
        return res.status(400).json({ error: 'O personagem já é desta raça.' })
      }

      const currentIsHorde = HORDE_RACES.has(character.race)
      const newIsHorde     = HORDE_RACES.has(newRace)
      const newIsAlliance  = ALLIANCE_RACES.has(newRace)

      if (!newIsHorde && !newIsAlliance) {
        return res.status(400).json({ error: 'Raça inválida.' })
      }

      if (currentIsHorde !== newIsHorde) {
        return res.status(400).json({ error: 'A nova raça deve ser da mesma facção. Use Troca de Facção para mudar de facção.' })
      }

      const validRaces = CLASS_RACE_MAP[character.class]
      if (!validRaces || !validRaces.has(newRace)) {
        return res.status(400).json({ error: `A raça ${RACE_NAMES[newRace]} não pode ser ${character.class === 2 ? 'Paladino' : 'desta classe'}.` })
      }

      // Update race and reset appearance; set at_login flag so player can customize looks on next login
      await pool.query(
        `UPDATE acore_characters.characters
         SET race = ?, skin = 0, face = 0, hairStyle = 0, hairColor = 0, facialStyle = 0,
             at_login = at_login | 8
         WHERE guid = ?`,
        [newRace, characterGuid]
      )

      return res.status(200).json({
        success: true,
        message: `${character.name} agora é ${RACE_NAMES[newRace]}! Ao entrar no jogo você poderá personalizar a aparência.`,
      })
    }

    // ── Faction Change (direct) ───────────────────────────────────────────
    if (serviceId === 'faction-change') {
      const newRace = Number(req.body.newRace)

      if (!Number.isInteger(newRace) || newRace <= 0 || !RACE_NAMES[newRace]) {
        return res.status(400).json({ error: 'Selecione uma raça válida.' })
      }

      const currentIsHorde = HORDE_RACES.has(character.race)
      const newIsHorde     = HORDE_RACES.has(newRace)

      if (currentIsHorde === newIsHorde) {
        return res.status(400).json({ error: 'A nova raça deve ser da facção oposta.' })
      }

      const validRacesFaction = CLASS_RACE_MAP[character.class]
      if (!validRacesFaction || !validRacesFaction.has(newRace)) {
        return res.status(400).json({ error: `A raça ${RACE_NAMES[newRace]} não é compatível com a classe deste personagem.` })
      }

      // Remove from guild (guilds are faction-specific)
      await pool.query(
        'DELETE FROM acore_characters.guild_member WHERE guid = ?',
        [characterGuid]
      )

      // Update race and reset appearance
      await pool.query(
        `UPDATE acore_characters.characters
         SET race = ?, skin = 0, face = 0, hairStyle = 0, hairColor = 0, facialStyle = 0,
             at_login = at_login | 8
         WHERE guid = ?`,
        [newRace, characterGuid]
      )

      const newFaction = newIsHorde ? 'Horda' : 'Aliança'
      return res.status(200).json({
        success: true,
        message: `${character.name} migrou para a ${newFaction} como ${RACE_NAMES[newRace]}! Ao entrar no jogo você poderá personalizar a aparência.`,
      })
    }

    // ── Appearance (at_login flag) ────────────────────────────────────────
    const flag = AT_LOGIN_FLAGS[serviceId]
    if (!flag) {
      return res.status(400).json({ error: 'Serviço desconhecido.' })
    }

    if ((character.at_login & flag) !== 0) {
      return res.status(400).json({
        error: 'Este serviço já está ativado para este personagem. Entre no jogo para aplicá-lo.',
      })
    }

    await pool.query(
      'UPDATE acore_characters.characters SET at_login = at_login | ? WHERE guid = ?',
      [flag, characterGuid]
    )

    return res.status(200).json({
      success: true,
      message: `Mudança de Aparência ativada para ${character.name}. Entre no jogo — a tela de alteração aparecerá automaticamente.`,
    })

  } catch (err) {
    console.error('[services]', err)
    return res.status(500).json({ error: 'Erro interno.' })
  }
}
