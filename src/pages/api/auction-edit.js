// ============================================================================
// API: PATCH /api/auction-edit
// ============================================================================
// Edita/publica/cancela um leilão (GM level 2+)
// Só permite editar DRAFT ou SCHEDULED; não altera leilões ACTIVE com lances

import { getSession } from '../../lib/session'
import { getPool } from '../../lib/db'
import { assertSameOrigin } from '../../lib/requestSecurity'
import rateLimit from '../../lib/rateLimit'

const limiter = rateLimit({ limit: 20, interval: 60 * 1000 })

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }
  if (!assertSameOrigin(req, res)) return
  if (!limiter.check(req, res)) return

  try {
    const session = await getSession(req, res)
    if (!session.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' })
    }

    const pool = getPool()
    const connection = await pool.getConnection()

    try {
      const [access] = await connection.query(
        'SELECT gmlevel FROM acore_auth.account_access WHERE id = ? AND gmlevel >= 2',
        [session.user.id]
      )
      if (access.length === 0) {
        return res.status(403).json({ success: false, error: 'GM level 2+ required.' })
      }

      const { auction_id: auctionIdRaw, action, ...fields } = req.body ?? {}
      const auctionId = parseInt(auctionIdRaw)

      if (!auctionId) {
        return res.status(400).json({ success: false, error: 'auction_id obrigatório' })
      }

      const [rows] = await connection.query(
        'SELECT * FROM wow_marketplace.auction_items WHERE id = ?',
        [auctionId]
      )
      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Leilão não encontrado' })
      }
      const auction = rows[0]

      const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
      const ua = req.headers['user-agent'] || null
      const beforeState = JSON.stringify(auction)

      // ── CANCEL ───────────────────────────────────────────────────────────
      if (action === 'cancel') {
        if (auction.status === 'CLOSED' || auction.status === 'CANCELLED') {
          return res.status(400).json({ success: false, error: 'Leilão já está encerrado' })
        }

        // Reembolsa licitante ativo se houver
        if (auction.current_bidder_id && auction.current_bid > 0) {
          await connection.beginTransaction()
          try {
            await connection.query(
              'UPDATE wow_marketplace.wallets SET dp = dp + ? WHERE account_id = ?',
              [auction.current_bid, auction.current_bidder_id]
            )
            await connection.query(
              `INSERT INTO wow_marketplace.wallet_transactions
               (account_id, type, amount, balance_before, balance_after, currency, reference_type, reference_id, notes)
               SELECT ?, 'BID_REFUND', ?, dp - ?, dp, 'DP', 'AUCTION', ?, ?
               FROM wow_marketplace.wallets WHERE account_id = ?`,
              [
                auction.current_bidder_id,
                auction.current_bid, auction.current_bid,
                auctionId,
                `Reembolso: leilão #${auctionId} cancelado pelo GM`,
                auction.current_bidder_id,
              ]
            )
            await connection.query(
              "UPDATE wow_marketplace.auction_items SET status = 'CANCELLED', closed_at = NOW() WHERE id = ?",
              [auctionId]
            )
            await connection.commit()
          } catch (e) {
            await connection.rollback()
            throw e
          }
        } else {
          await connection.query(
            "UPDATE wow_marketplace.auction_items SET status = 'CANCELLED', closed_at = NOW() WHERE id = ?",
            [auctionId]
          )
        }

        await connection.query(
          `INSERT INTO wow_marketplace.audit_log
           (account_id, actor_role, action_type, target_type, target_id, before_state, after_state, ip_address, user_agent)
           VALUES (?, ?, 'AUCTION_CANCELLED', 'auction_items', ?, ?, ?, ?, ?)`,
          [session.user.id, `GM${access[0].gmlevel}`, auctionId,
           beforeState, JSON.stringify({ status: 'CANCELLED' }), ip, ua]
        )

        return res.status(200).json({ success: true, message: 'Leilão cancelado.' })
      }

      // ── PUBLISH (DRAFT → ACTIVE) ──────────────────────────────────────────
      if (action === 'publish') {
        if (auction.status !== 'DRAFT') {
          return res.status(400).json({ success: false, error: 'Só é possível publicar rascunhos' })
        }
        const durationHours = parseInt(fields.duration_hours ?? 24)
        const endTime = new Date(Date.now() + durationHours * 3600 * 1000)

        await connection.query(
          "UPDATE wow_marketplace.auction_items SET status = 'ACTIVE', end_time = ? WHERE id = ?",
          [endTime, auctionId]
        )

        await connection.query(
          `INSERT INTO wow_marketplace.audit_log
           (account_id, actor_role, action_type, target_type, target_id, before_state, after_state, ip_address, user_agent)
           VALUES (?, ?, 'AUCTION_PUBLISHED', 'auction_items', ?, ?, ?, ?, ?)`,
          [session.user.id, `GM${access[0].gmlevel}`, auctionId,
           beforeState, JSON.stringify({ status: 'ACTIVE', end_time: endTime }), ip, ua]
        )

        return res.status(200).json({
          success: true,
          message: 'Leilão publicado!',
          data: { end_time: endTime },
        })
      }

      // ── EDIT FIELDS ───────────────────────────────────────────────────────
      // Só permite editar DRAFT ou SCHEDULED sem lances
      const canEdit =
        auction.status === 'DRAFT' ||
        (auction.status === 'SCHEDULED') ||
        (auction.status === 'ACTIVE' && auction.current_bid === 0)

      if (!canEdit) {
        return res.status(400).json({
          success: false,
          error: 'Não é possível editar leilão ativo com lances. Cancele e crie um novo.',
        })
      }

      const updates = {}
      if (fields.starting_bid  != null) updates.starting_bid  = parseInt(fields.starting_bid)
      if (fields.min_increment != null) updates.min_increment = parseInt(fields.min_increment)
      if (fields.buyout_price  != null) updates.buyout_price  = fields.buyout_price ? parseInt(fields.buyout_price) : null
      if (fields.reserve_price != null) updates.reserve_price = fields.reserve_price ? parseInt(fields.reserve_price) : null
      if (fields.description   != null) updates.description   = String(fields.description).slice(0, 500)
      if (fields.item_count    != null) updates.item_count    = parseInt(fields.item_count)

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ success: false, error: 'Nenhum campo para atualizar' })
      }

      const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ')
      await connection.query(
        `UPDATE wow_marketplace.auction_items SET ${setClauses} WHERE id = ?`,
        [...Object.values(updates), auctionId]
      )

      await connection.query(
        `INSERT INTO wow_marketplace.audit_log
         (account_id, actor_role, action_type, target_type, target_id, before_state, after_state, details, ip_address, user_agent)
         VALUES (?, ?, 'AUCTION_EDITED', 'auction_items', ?, ?, ?, ?, ?, ?)`,
        [session.user.id, `GM${access[0].gmlevel}`, auctionId,
         beforeState, JSON.stringify(updates),
         JSON.stringify({ changed_fields: Object.keys(updates) }),
         ip, ua]
      )

      return res.status(200).json({
        success: true,
        message: 'Leilão atualizado.',
        data: updates,
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('[auction-edit]', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
