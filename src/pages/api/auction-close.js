// ============================================================================
// API: POST /api/auction-close
// ============================================================================
// Fecha um leilão manualmente (GM level 2+)

import { getSession } from '../../lib/session'
import { getPool } from '../../lib/db'
import { assertSameOrigin } from '../../lib/requestSecurity'
import rateLimit from '../../lib/rateLimit'

const limiter = rateLimit({ limit: 20, interval: 60 * 1000 })

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }
  if (!assertSameOrigin(req, res)) return
  if (!limiter.check(req, res)) return

  const session = await getSession(req, res)
  if (!session?.user?.id) {
    return res.status(401).json({ success: false, error: 'Não autenticado' })
  }

  const pool = getPool()
  const connection = await pool.getConnection()

  try {
    // Verifica permissão GM level 2+
    const [access] = await connection.query(
      'SELECT gmlevel FROM acore_auth.account_access WHERE id = ? AND gmlevel >= 2',
      [session.user.id]
    )
    if (access.length === 0) {
      return res.status(403).json({ success: false, error: 'Apenas GMs podem fechar leilões' })
    }

    const auctionId = parseInt(req.body?.auction_id)
    if (!auctionId) {
      return res.status(400).json({ success: false, error: 'auction_id obrigatório' })
    }

    await connection.beginTransaction()

    try {
      // Busca leilão com lock
      const [rows] = await connection.query(
        `SELECT id, item_entry, item_count, current_bid, current_bidder_id,
                buyout_price, end_time, status, created_by
         FROM wow_marketplace.auction_items
         WHERE id = ? FOR UPDATE`,
        [auctionId]
      )

      if (rows.length === 0) {
        await connection.rollback()
        return res.status(404).json({ success: false, error: 'Leilão não encontrado' })
      }

      const auction = rows[0]

      if (!['ACTIVE', 'SCHEDULED'].includes(auction.status)) {
        await connection.rollback()
        return res.status(400).json({
          success: false,
          error: `Leilão não pode ser fechado (status: ${auction.status})`,
        })
      }

      const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
      const ua = req.headers['user-agent'] || null

      // Fecha o leilão
      await connection.query(
        `UPDATE wow_marketplace.auction_items
         SET status = 'CLOSED', closed_at = NOW(), winner_id = ?
         WHERE id = ?`,
        [auction.current_bidder_id || null, auctionId]
      )

      if (auction.current_bidder_id) {
        // Cria entrega na fila
        await connection.query(
          `INSERT INTO wow_marketplace.fulfillment_queue
           (type, reference_id, account_id, item_entry, item_count, notes, priority)
           VALUES ('AUCTION_WIN', ?, ?, ?, ?, ?, 1)`,
          [
            auctionId,
            auction.current_bidder_id,
            auction.item_entry,
            auction.item_count,
            `Leilão #${auctionId} — Lance final: ${auction.current_bid} DP. Fechado por GM #${session.user.id}`,
          ]
        )

        // Audit: leilão fechado COM vencedor
        await connection.query(
          `INSERT INTO wow_marketplace.audit_log
           (account_id, actor_role, action_type, target_type, target_id,
            before_state, after_state, details, ip_address, user_agent)
           VALUES (?, ?, 'AUCTION_CLOSED_GM', 'auction_items', ?,
                   ?, ?,
                   ?, ?, ?)`,
          [
            session.user.id,
            `GM${access[0].gmlevel}`,
            auctionId,
            JSON.stringify({ status: auction.status }),
            JSON.stringify({ status: 'CLOSED', winner_id: auction.current_bidder_id }),
            JSON.stringify({
              auction_id: auctionId,
              winner_account_id: auction.current_bidder_id,
              final_bid: auction.current_bid,
              item_entry: auction.item_entry,
            }),
            ip, ua,
          ]
        )
      } else {
        // Audit: leilão fechado SEM vencedor
        await connection.query(
          `INSERT INTO wow_marketplace.audit_log
           (account_id, actor_role, action_type, target_type, target_id,
            before_state, after_state, details, ip_address, user_agent)
           VALUES (?, ?, 'AUCTION_CLOSED_NO_BIDDER', 'auction_items', ?,
                   ?, ?,
                   ?, ?, ?)`,
          [
            session.user.id,
            `GM${access[0].gmlevel}`,
            auctionId,
            JSON.stringify({ status: auction.status }),
            JSON.stringify({ status: 'CLOSED' }),
            JSON.stringify({ auction_id: auctionId, item_entry: auction.item_entry }),
            ip, ua,
          ]
        )
      }

      await connection.commit()

      return res.status(200).json({
        success: true,
        message: auction.current_bidder_id
          ? 'Leilão fechado. Item adicionado à fila de entrega.'
          : 'Leilão fechado sem vencedor.',
        data: {
          auction_id: auctionId,
          had_winner: !!auction.current_bidder_id,
          final_bid: auction.current_bid,
        },
      })
    } catch (err) {
      await connection.rollback()
      throw err
    }
  } catch (error) {
    console.error('[auction-close]', error)
    return res.status(500).json({ success: false, error: 'Erro ao fechar leilão' })
  } finally {
    connection.release()
  }
}
