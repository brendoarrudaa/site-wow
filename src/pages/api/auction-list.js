// ============================================================================
// API: GET /api/auction-list
// ============================================================================
// Lista leilões com bids recentes, participantes e alertas
// ?status=ACTIVE|DRAFT|SCHEDULED|CLOSED|ALL (default: ACTIVE)
// ?admin=1 retorna todos os status se o usuário for GM

import { getSession } from '../../lib/session'
import { getPool } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const pool = getPool()
    const connection = await pool.getConnection()

    try {
      const { status: statusParam, admin } = req.query

      // Verifica se é admin (para mostrar DRAFT/SCHEDULED)
      let isAdmin = false
      if (admin === '1') {
        const session = await getSession(req, res)
        if (session?.user) {
          const [access] = await connection.query(
            'SELECT 1 FROM acore_auth.account_access WHERE id = ? AND gmlevel >= 2',
            [session.user.id]
          )
          isAdmin = access.length > 0
        }
      }

      // Define quais status buscar
      const requestedStatus = statusParam || 'ACTIVE'
      let statusFilter

      if (isAdmin && requestedStatus === 'ALL') {
        statusFilter = null // sem filtro
      } else if (isAdmin && ['DRAFT', 'SCHEDULED', 'CLOSED', 'CANCELLED'].includes(requestedStatus)) {
        statusFilter = [requestedStatus]
      } else {
        statusFilter = ['ACTIVE']
      }

      // Busca leilões
      let auctionsQuery = `
        SELECT
          a.id,
          a.item_entry,
          w.item_name,
          w.category,
          w.rarity,
          a.item_count,
          a.starting_bid,
          a.min_increment,
          a.current_bid,
          a.current_bidder_id,
          a.buyout_price,
          a.reserve_price,
          a.end_time,
          a.start_time,
          a.status,
          a.winner_id,
          a.created_by,
          a.created_at,
          a.description,
          GREATEST(0, TIMESTAMPDIFF(SECOND, NOW(), a.end_time)) AS seconds_remaining,
          (a.reserve_price IS NOT NULL AND a.current_bid < a.reserve_price) AS reserve_not_met,
          acc.username AS winner_username
        FROM wow_marketplace.auction_items a
        LEFT JOIN wow_marketplace.item_whitelist w ON w.item_entry = a.item_entry
        LEFT JOIN acore_auth.account acc ON acc.id = a.winner_id
      `
      const params = []

      if (statusFilter) {
        auctionsQuery += ` WHERE a.status IN (${statusFilter.map(() => '?').join(',')})`
        params.push(...statusFilter)
      }

      auctionsQuery += ' ORDER BY a.created_at DESC'

      const [auctions] = await connection.query(auctionsQuery, params)

      if (auctions.length === 0) {
        return res.status(200).json({
          success: true,
          data: { auctions: [], total: 0 },
        })
      }

      const auctionIds = auctions.map(a => a.id)

      // Busca contagem de participantes únicos por leilão
      const [participants] = await connection.query(
        `SELECT auction_id, COUNT(DISTINCT account_id) AS participant_count,
                COUNT(*) AS total_bids
         FROM wow_marketplace.auction_bids
         WHERE auction_id IN (${auctionIds.map(() => '?').join(',')})
         GROUP BY auction_id`,
        auctionIds
      )
      const participantMap = Object.fromEntries(
        participants.map(p => [p.auction_id, { count: p.participant_count, bids: p.total_bids }])
      )

      // Busca os últimos 5 lances de cada leilão
      const [recentBids] = await connection.query(
        `SELECT ab.auction_id, ab.bid_amount, ab.created_at,
                ac.username AS bidder_username
         FROM wow_marketplace.auction_bids ab
         LEFT JOIN acore_auth.account ac ON ac.id = ab.account_id
         WHERE ab.auction_id IN (${auctionIds.map(() => '?').join(',')})
         ORDER BY ab.auction_id, ab.created_at DESC`,
        auctionIds
      )

      // Agrupa últimos 5 por leilão
      const bidsMap = {}
      for (const b of recentBids) {
        if (!bidsMap[b.auction_id]) bidsMap[b.auction_id] = []
        if (bidsMap[b.auction_id].length < 5) bidsMap[b.auction_id].push(b)
      }

      const now = Date.now()

      const enriched = auctions.map(a => {
        const parts = participantMap[a.id] || { count: 0, bids: 0 }
        const endMs = new Date(a.end_time).getTime()

        // Alertas
        const alerts = []
        if (a.status === 'ACTIVE') {
          if (parts.bids === 0 && endMs - now < 6 * 3600 * 1000) {
            alerts.push({ type: 'no_bids', message: 'Sem lances — expira em breve!' })
          }
          if (endMs < now) {
            alerts.push({ type: 'expired', message: 'Leilão expirado — feche manualmente.' })
          }
          if (a.reserve_price && a.current_bid < a.reserve_price) {
            alerts.push({ type: 'reserve_not_met', message: 'Reserva não atingida.' })
          }
        }

        return {
          ...a,
          participant_count: parts.count,
          total_bids: parts.bids,
          recent_bids: bidsMap[a.id] || [],
          alerts,
        }
      })

      return res.status(200).json({
        success: true,
        data: {
          auctions: enriched,
          total: enriched.length,
        },
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('[auction-list]', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
