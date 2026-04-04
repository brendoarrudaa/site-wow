// ============================================================================
// API: POST /api/marketplace-create
// ============================================================================
// Cria uma listing no marketplace (requer aprovação)

import { getSession } from '../../lib/session'
import { getPool } from '../../lib/db'
import { assertSameOrigin } from '../../lib/requestSecurity'
import rateLimit from '../../lib/rateLimit'
import {
  acquireIdempotencyLock,
  releaseIdempotencyLock
} from '../../lib/idempotency-server'

const limiter = rateLimit({ limit: 10, interval: 10 * 60 * 1000 })

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  if (!assertSameOrigin(req, res)) return
  if (!limiter.check(req, res)) return

  let idempotencyLock = null

  try {
    const session = await getSession(req, res)
    if (!session.user) {
      return res
        .status(401)
        .json({ success: false, error: 'Not authenticated' })
    }

    const characterGuid = Number(req.body?.character_guid)
    const itemEntry = Number(req.body?.item_entry)
    const price = Number(req.body?.price)

    // Validações básicas
    if (
      !Number.isInteger(characterGuid) ||
      characterGuid <= 0 ||
      !Number.isInteger(itemEntry) ||
      itemEntry <= 0 ||
      !Number.isInteger(price) ||
      price <= 0
    ) {
      return res.status(400).json({
        success: false,
        error: 'Invalid required fields: character_guid, item_entry, price'
      })
    }

    // Valida range de preço
    if (price < 10 || price > 50000) {
      return res.status(400).json({
        success: false,
        error: 'Price must be between 10 and 50,000 DP'
      })
    }

    idempotencyLock = await acquireIdempotencyLock(req, res, {
      scope: 'marketplace-create',
      userId: session.user.id,
      windowMs: 15_000
    })

    if (!idempotencyLock) return

    const pool = getPool()
    const connection = await pool.getConnection()

    try {
      // Verifica se personagem pertence ao account
      const [characters] = await connection.query(
        'SELECT * FROM acore_characters.characters WHERE guid = ? AND account = ?',
        [characterGuid, session.user.id]
      )

      if (characters.length === 0) {
        return res.status(403).json({
          success: false,
          error: 'Character does not belong to your account'
        })
      }

      const character = characters[0]

      // Verifica se item está na whitelist
      const [whitelist] = await connection.query(
        'SELECT * FROM wow_marketplace.item_whitelist WHERE item_entry = ? AND can_marketplace = 1',
        [itemEntry]
      )

      if (whitelist.length === 0) {
        return res.status(400).json({
          success: false,
          error:
            'Item not allowed in marketplace. Contact staff to add to whitelist.'
        })
      }

      const whitelistItem = whitelist[0]

      // Verifica max_price da whitelist
      if (whitelistItem.max_price && price > whitelistItem.max_price) {
        return res.status(400).json({
          success: false,
          error: `Price exceeds maximum allowed for this item (${whitelistItem.max_price} DP)`
        })
      }

      // Busca item no inventário do personagem
      const [inventory] = await connection.query(
        `SELECT ci.*, ii.*
         FROM acore_characters.character_inventory ci
         JOIN acore_characters.item_instance ii ON ci.item = ii.guid
         WHERE ci.guid = ? AND ii.itemEntry = ?
         LIMIT 1`,
        [characterGuid, itemEntry]
      )

      if (inventory.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Item not found in character inventory'
        })
      }

      const itemInstance = inventory[0]

      // Verifica se item já está listado
      const [existingListing] = await connection.query(
        `SELECT * FROM wow_marketplace.marketplace_listings
         WHERE item_instance_guid = ? AND status IN ('PENDING_APPROVAL', 'ACTIVE')`,
        [itemInstance.guid]
      )

      if (existingListing.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'This item is already listed'
        })
      }

      // Cria listing (status PENDING_APPROVAL)
      const [result] = await connection.query(
        `INSERT INTO wow_marketplace.marketplace_listings
         (seller_account_id, character_guid, character_name, item_instance_guid,
          item_entry, item_count, price, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING_APPROVAL')`,
        [
          session.user.id,
          characterGuid,
          character.name,
          itemInstance.guid,
          itemEntry,
          1, // Por enquanto só 1 item
          price
        ]
      )

      // Log de auditoria
      const ipAddress =
        req.headers['x-forwarded-for'] || req.socket.remoteAddress
      await connection.query(
        `INSERT INTO wow_marketplace.audit_log
         (account_id, action_type, entity_type, entity_id, details, ip_address)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          session.user.id,
          'CREATE_LISTING',
          'marketplace_listings',
          result.insertId,
          JSON.stringify({
            item_entry: itemEntry,
            price,
            character: character.name
          }),
          ipAddress
        ]
      )

      return res.status(200).json({
        success: true,
        message: 'Listing created successfully. Awaiting staff approval.',
        data: {
          listing_id: result.insertId,
          item_name: whitelistItem.item_name,
          price,
          status: 'PENDING_APPROVAL'
        }
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    if (idempotencyLock) await releaseIdempotencyLock(idempotencyLock)
    console.error('Error creating marketplace listing:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
