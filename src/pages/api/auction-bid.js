// ============================================================================
// API: POST /api/auction-bid
// ============================================================================
// Dá um lance em um leilão ativo

import { getSession } from '../../lib/session'
import { getPool } from '../../lib/db'
import { assertSameOrigin } from '../../lib/requestSecurity'
import rateLimit from '../../lib/rateLimit'
import {
  acquireIdempotencyLock,
  releaseIdempotencyLock
} from '../../lib/idempotency-server'

const limiter = rateLimit({ limit: 30, interval: 60 * 1000 })

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido.' })
  }

  if (!assertSameOrigin(req, res)) return
  if (!limiter.check(req, res)) return

  try {
    const session = await getSession(req, res)
    if (!session.user) {
      return res
        .status(401)
        .json({ success: false, error: 'Não autenticado.' })
    }

    const auctionId = Number(req.body?.auction_id)
    const bidAmount = Number(req.body?.bid_amount)

    // Validações básicas
    if (!Number.isInteger(auctionId) || auctionId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Campo obrigatorio invalido: auction_id'
      })
    }

    if (!Number.isInteger(bidAmount) || bidAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Campo obrigatorio invalido: bid_amount'
      })
    }

    if (bidAmount < 10) {
      return res.status(400).json({
        success: false,
        error: 'O lance minimo e de 10 DP'
      })
    }

    const idempotencyLock = await acquireIdempotencyLock(req, res, {
      scope: 'auction-bid',
      userId: session.user.id,
      windowMs: 15_000
    })

    if (!idempotencyLock) {
      return
    }

    const pool = getPool()
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      // Busca leilão com lock
      const [auctions] = await connection.query(
        `SELECT * FROM wow_marketplace.auction_items
         WHERE id = ? AND status = 'ACTIVE' AND end_time > NOW()
         FOR UPDATE`,
        [auctionId]
      )

      if (auctions.length === 0) {
        await connection.rollback()
        return res.status(404).json({
          success: false,
          error: 'Leilao nao encontrado ou ja encerrado.'
        })
      }

      const auction = auctions[0]

      // Verifica se o usuário é GM (gmlevel >= 2) — GMs podem testar sem restrições
      const [gmRows] = await connection.query(
        'SELECT 1 FROM acore_auth.account_access WHERE id = ? AND gmlevel >= 2 LIMIT 1',
        [session.user.id]
      )
      const isGM = gmRows.length > 0

      // Apenas não-GMs são bloqueados de dar lance no próprio leilão
      if (!isGM && auction.created_by === session.user.id) {
        await connection.rollback()
        return res.status(400).json({
          success: false,
          error: 'Voce nao pode dar lances no seu proprio leilao.'
        })
      }

      // Valida lance mínimo (deve ser >= starting_bid se não há lances, ou >= current_bid * 1.05)
      const minimumBid =
        auction.current_bid > 0
          ? Math.ceil(auction.current_bid * 1.05)
          : auction.starting_bid

      if (bidAmount < minimumBid) {
        await connection.rollback()
        return res.status(400).json({
          success: false,
          error: `Lance minimo: ${minimumBid} DP (incremento minimo de 5%)`
        })
      }

      // Apenas não-GMs são bloqueados de superar o próprio lance
      if (!isGM && auction.current_bidder_id === session.user.id) {
        await connection.rollback()
        return res.status(400).json({
          success: false,
          error: 'Voce ja possui o maior lance neste leilao.'
        })
      }

      // Busca wallet do usuário com lock
      let [wallets] = await connection.query(
        'SELECT * FROM wow_marketplace.wallets WHERE account_id = ? FOR UPDATE',
        [session.user.id]
      )

      if (wallets.length === 0) {
        // Cria wallet se não existe
        await connection.query(
          'INSERT INTO wow_marketplace.wallets (account_id, dp, vp) VALUES (?, 0, 0)',
          [session.user.id]
        )
        ;[wallets] = await connection.query(
          'SELECT * FROM wow_marketplace.wallets WHERE account_id = ? FOR UPDATE',
          [session.user.id]
        )
      }

      const wallet = wallets[0]

      // Verifica saldo suficiente
      if (wallet.dp < bidAmount) {
        await connection.rollback()
        return res.status(400).json({
          success: false,
          error: `Saldo insuficiente. Voce tem ${wallet.dp} DP e precisa de ${bidAmount} DP.`
        })
      }

      // Se há lance anterior, reembolsa o licitante anterior
      if (auction.current_bidder_id) {
        const previousBidder = auction.current_bidder_id
        const previousBid = auction.current_bid

        // Busca wallet do licitante anterior
        const [prevWallets] = await connection.query(
          'SELECT * FROM wow_marketplace.wallets WHERE account_id = ? FOR UPDATE',
          [previousBidder]
        )

        if (prevWallets.length > 0) {
          const prevWallet = prevWallets[0]

          // Reembolsa DP
          await connection.query(
            'UPDATE wow_marketplace.wallets SET dp = dp + ? WHERE account_id = ?',
            [previousBid, previousBidder]
          )

          // Log de transação - reembolso
          await connection.query(
            `INSERT INTO wow_marketplace.wallet_transactions
             (account_id, type, amount, balance_before, balance_after, currency,
              reference_type, reference_id, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              previousBidder,
              'BID_REFUND',
              previousBid,
              prevWallet.dp,
              prevWallet.dp + previousBid,
              'DP',
              'AUCTION',
              auctionId,
              `Refund: outbid on auction #${auctionId}`
            ]
          )

          // Marca lance anterior como inativo
          await connection.query(
            'UPDATE wow_marketplace.auction_bids SET is_active = 0, refunded_at = NOW() WHERE auction_id = ? AND account_id = ?',
            [auctionId, previousBidder]
          )
        }
      }

      // Débito do novo licitante
      await connection.query(
        'UPDATE wow_marketplace.wallets SET dp = dp - ? WHERE account_id = ?',
        [bidAmount, session.user.id]
      )

      // Log de transação - lance
      await connection.query(
        `INSERT INTO wow_marketplace.wallet_transactions
         (account_id, type, amount, balance_before, balance_after, currency,
          reference_type, reference_id, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          session.user.id,
          'BID_PLACED',
          -bidAmount,
          wallet.dp,
          wallet.dp - bidAmount,
          'DP',
          'AUCTION',
          auctionId,
          `Bid placed on auction #${auctionId}`
        ]
      )

      // Atualiza leilão
      await connection.query(
        'UPDATE wow_marketplace.auction_items SET current_bid = ?, current_bidder_id = ? WHERE id = ?',
        [bidAmount, session.user.id, auctionId]
      )

      // Cria registro de lance
      await connection.query(
        `INSERT INTO wow_marketplace.auction_bids
         (auction_id, account_id, bid_amount, is_active)
         VALUES (?, ?, ?, 1)`,
        [auctionId, session.user.id, bidAmount]
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
          'PLACE_BID',
          'auction_bids',
          auctionId,
          JSON.stringify({ auction_id: auctionId, bid_amount: bidAmount }),
          ipAddress
        ]
      )

      await connection.commit()

      return res.status(200).json({
        success: true,
        message: 'Lance realizado com sucesso!',
        data: {
          auction_id: auctionId,
          bid_amount: bidAmount,
          new_balance: wallet.dp - bidAmount
        }
      })
    } catch (error) {
      await connection.rollback()
      await releaseIdempotencyLock(idempotencyLock)
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Error placing bid:', error)
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor.'
    })
  }
}
