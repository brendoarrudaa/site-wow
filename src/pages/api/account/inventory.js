import { query } from '../../../lib/db'
import { getSession } from '../../../lib/session'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const session = await getSession(req, res)
    if (!session?.user?.id) {
      return res.status(401).json({ success: false, error: 'Não autenticado' })
    }

    const character_guid = req.query.character_guid ?? req.query.characterGuid

    if (!character_guid) {
      return res
        .status(400)
        .json({ success: false, error: 'character_guid obrigatório' })
    }

    const accountId = session.user.id

    // Verify character belongs to this account
    const [char] = await query(
      `SELECT guid, name, account
       FROM acore_characters.characters
       WHERE guid = ? AND account = ?`,
      [character_guid, accountId]
    )

    if (!char) {
      return res
        .status(403)
        .json({ success: false, error: 'Personagem não encontrado' })
    }

    // Query inventory items
    // Join with item_instance to get itemEntry/count, then item_template for details
    // Filter by whitelist (only show items that can be sold)
    const items = await query(
      `SELECT
        ii.guid as item_guid,
        ii.itemEntry as item_entry,
        ii.count,
        it.name as item_name,
        it.Quality as quality,
        wl.category,
        wl.rarity
       FROM acore_characters.character_inventory ci
       INNER JOIN acore_characters.item_instance ii ON ci.item = ii.guid
       INNER JOIN acore_world.item_template it ON ii.itemEntry = it.entry
       INNER JOIN wow_marketplace.item_whitelist wl ON ii.itemEntry = wl.item_entry
       WHERE ci.guid = ?
       AND ci.bag = 0
       AND ci.slot BETWEEN 0 AND 22
       ORDER BY it.Quality DESC, it.name ASC`,
      [character_guid]
    )

    return res.status(200).json({
      success: true,
      data: {
        character: char,
        items: items || []
      }
    })
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar inventário'
    })
  }
}
