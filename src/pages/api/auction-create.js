// ============================================================================
// API: POST /api/auction-create
// ============================================================================
// Cria um leilão (GM level 2+)
// status: DRAFT (não publicado) | ACTIVE (publicado imediatamente) | SCHEDULED (publicação futura)

import { getSession } from '../../lib/session'
import { getPool } from '../../lib/db'
import { assertSameOrigin } from '../../lib/requestSecurity'
import rateLimit from '../../lib/rateLimit'

const limiter = rateLimit({ limit: 10, interval: 10 * 60 * 1000 })

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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
        return res.status(403).json({
          success: false,
          error: 'GM level 2+ required to create auctions.',
        })
      }

      const {
        item_entry:    itemEntryRaw,
        item_count:    itemCountRaw,
        starting_bid:  startingBidRaw,
        min_increment: minIncrementRaw,
        buyout_price:  buyoutPriceRaw,
        reserve_price: reservePriceRaw,
        duration_hours: durationHoursRaw,
        start_time:    startTimeRaw,   // ISO string para leilão agendado
        description:   descriptionRaw,
        status:        statusRaw,
      } = req.body ?? {}

      const itemEntry    = Number(itemEntryRaw)
      const itemCount    = Number(itemCountRaw ?? 1)
      const startingBid  = Number(startingBidRaw)
      const minIncrement = Number(minIncrementRaw ?? 50)
      const durationHours = Number(durationHoursRaw ?? 24)
      const buyoutPrice  = buyoutPriceRaw  ? Number(buyoutPriceRaw)  : null
      const reservePrice = reservePriceRaw ? Number(reservePriceRaw) : null
      const description  = typeof descriptionRaw === 'string' ? descriptionRaw.trim().slice(0, 500) : null

      // Validações
      if (!Number.isInteger(itemEntry) || itemEntry <= 0)
        return res.status(400).json({ success: false, error: 'item_entry inválido' })
      if (!Number.isInteger(startingBid) || startingBid < 10)
        return res.status(400).json({ success: false, error: 'starting_bid deve ser ≥ 10 DP' })
      if (!Number.isInteger(itemCount) || itemCount < 1)
        return res.status(400).json({ success: false, error: 'item_count deve ser ≥ 1' })
      if (!Number.isInteger(minIncrement) || minIncrement < 1)
        return res.status(400).json({ success: false, error: 'min_increment deve ser ≥ 1' })
      if (buyoutPrice !== null && (!Number.isInteger(buyoutPrice) || buyoutPrice <= startingBid))
        return res.status(400).json({ success: false, error: 'buyout_price deve ser maior que starting_bid' })
      if (reservePrice !== null && (!Number.isInteger(reservePrice) || reservePrice < startingBid))
        return res.status(400).json({ success: false, error: 'reserve_price deve ser ≥ starting_bid' })

      // Determina status e datas
      const allowedStatuses = ['DRAFT', 'ACTIVE', 'SCHEDULED']
      const requestedStatus = allowedStatuses.includes(statusRaw) ? statusRaw : 'ACTIVE'

      let endTime   = null
      let startTime = null
      let finalStatus = requestedStatus

      if (requestedStatus === 'DRAFT') {
        // Draft: sem datas obrigatórias
        if (durationHours > 0) {
          endTime = new Date(Date.now() + durationHours * 3600 * 1000)
        }
      } else if (requestedStatus === 'SCHEDULED') {
        if (!startTimeRaw)
          return res.status(400).json({ success: false, error: 'start_time obrigatório para leilão agendado' })
        startTime = new Date(startTimeRaw)
        if (isNaN(startTime.getTime()) || startTime <= new Date())
          return res.status(400).json({ success: false, error: 'start_time deve ser no futuro' })
        if (durationHours < 1 || durationHours > 168)
          return res.status(400).json({ success: false, error: 'Duração deve ser entre 1h e 168h' })
        endTime = new Date(startTime.getTime() + durationHours * 3600 * 1000)
      } else {
        // ACTIVE: publicado imediatamente
        if (durationHours < 1 || durationHours > 168)
          return res.status(400).json({ success: false, error: 'Duração deve ser entre 1h e 168h' })
        endTime = new Date(Date.now() + durationHours * 3600 * 1000)
      }

      // Verifica whitelist
      const [whitelist] = await connection.query(
        'SELECT * FROM wow_marketplace.item_whitelist WHERE item_entry = ? AND can_auction = 1',
        [itemEntry]
      )
      if (whitelist.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Item não está na whitelist para leilões (can_auction = 1).',
        })
      }

      // Insere
      const [result] = await connection.query(
        `INSERT INTO wow_marketplace.auction_items
         (item_entry, item_count, starting_bid, min_increment, buyout_price, reserve_price,
          end_time, start_time, status, created_by, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          itemEntry, itemCount, startingBid, minIncrement, buyoutPrice, reservePrice,
          endTime, startTime, finalStatus, session.user.id, description,
        ]
      )

      // Audit
      const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
      const ua = req.headers['user-agent'] || null
      await connection.query(
        `INSERT INTO wow_marketplace.audit_log
         (account_id, actor_role, action_type, target_type, target_id,
          after_state, details, ip_address, user_agent)
         VALUES (?, ?, 'CREATE_AUCTION', 'auction_items', ?, ?, ?, ?, ?)`,
        [
          session.user.id,
          `GM${access[0].gmlevel}`,
          result.insertId,
          JSON.stringify({ status: finalStatus }),
          JSON.stringify({
            item_entry: itemEntry, starting_bid: startingBid,
            min_increment: minIncrement, buyout_price: buyoutPrice,
            duration_hours: durationHours, status: finalStatus,
          }),
          ip, ua,
        ]
      )

      return res.status(200).json({
        success: true,
        message: finalStatus === 'DRAFT'
          ? 'Rascunho criado. Publique quando estiver pronto.'
          : finalStatus === 'SCHEDULED'
          ? `Leilão agendado para ${startTime?.toLocaleString('pt-BR')}.`
          : 'Leilão publicado com sucesso!',
        data: {
          auction_id: result.insertId,
          item_name: whitelist[0].item_name,
          starting_bid: startingBid,
          buyout_price: buyoutPrice,
          end_time: endTime,
          start_time: startTime,
          status: finalStatus,
        },
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('[auction-create]', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
