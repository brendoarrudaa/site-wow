// ============================================================================
// API: POST /api/marketplace-buy
// ============================================================================
// Compra um item do marketplace

import { getSession } from '../../lib/session'
import { getPool } from '../../lib/db'
import { assertSameOrigin } from '../../lib/requestSecurity'
import rateLimit from '../../lib/rateLimit'
import {
  acquireIdempotencyLock,
  releaseIdempotencyLock
} from '../../lib/idempotency-server'

const limiter = rateLimit({ limit: 20, interval: 60 * 1000 })

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  if (!assertSameOrigin(req, res)) return
  if (!limiter.check(req, res)) return

  try {
    const session = await getSession(req, res)
    if (!session.user) {
      return res
        .status(401)
        .json({ success: false, error: 'Not authenticated' })
    }

    const listingId = Number(req.body?.listing_id)

    if (!Number.isInteger(listingId) || listingId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid required field: listing_id'
      })
    }

    const idempotencyLock = await acquireIdempotencyLock(req, res, {
      scope: 'marketplace-buy',
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

      // Busca listing com lock
      const [listings] = await connection.query(
        `SELECT * FROM wow_marketplace.marketplace_listings
         WHERE id = ? AND status = 'ACTIVE'
         FOR UPDATE`,
        [listingId]
      )

      if (listings.length === 0) {
        await connection.rollback()
        return res.status(404).json({
          success: false,
          error: 'Listing not found or not available'
        })
      }

      const listing = listings[0]

      // Verifica se não está comprando do próprio item
      if (listing.seller_id === session.user.id) {
        await connection.rollback()
        return res.status(400).json({
          success: false,
          error: 'You cannot buy your own items'
        })
      }

      // Busca wallet do comprador com lock
      let [buyerWallets] = await connection.query(
        'SELECT * FROM wow_marketplace.wallets WHERE account_id = ? FOR UPDATE',
        [session.user.id]
      )

      if (buyerWallets.length === 0) {
        await connection.query(
          'INSERT INTO wow_marketplace.wallets (account_id, dp, vp) VALUES (?, 0, 0)',
          [session.user.id]
        )
        ;[buyerWallets] = await connection.query(
          'SELECT * FROM wow_marketplace.wallets WHERE account_id = ? FOR UPDATE',
          [session.user.id]
        )
      }

      const buyerWallet = buyerWallets[0]

      // Verifica saldo
      if (buyerWallet.dp < listing.price) {
        await connection.rollback()
        return res.status(400).json({
          success: false,
          error: `Insufficient balance. You have ${buyerWallet.dp} DP, need ${listing.price} DP`
        })
      }

      // Calcula taxa (5%)
      const fee = Math.floor(listing.price * 0.05)
      const sellerReceives = listing.price - fee

      // Débito do comprador
      await connection.query(
        'UPDATE wow_marketplace.wallets SET dp = dp - ? WHERE account_id = ?',
        [listing.price, session.user.id]
      )

      // Log transação - compra
      await connection.query(
        `INSERT INTO wow_marketplace.wallet_transactions
         (account_id, type, amount, balance_before, balance_after, currency,
          reference_type, reference_id, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          session.user.id,
          'MARKETPLACE_PURCHASE',
          -listing.price,
          buyerWallet.dp,
          buyerWallet.dp - listing.price,
          'DP',
          'MARKETPLACE_LISTING',
          listingId,
          `Purchase: ${listing.item_entry} from listing #${listingId}`
        ]
      )

      // Busca wallet do vendedor com lock
      let [sellerWallets] = await connection.query(
        'SELECT * FROM wow_marketplace.wallets WHERE account_id = ? FOR UPDATE',
        [listing.seller_id]
      )

      if (sellerWallets.length === 0) {
        await connection.query(
          'INSERT INTO wow_marketplace.wallets (account_id, dp, vp) VALUES (?, 0, 0)',
          [listing.seller_id]
        )
        ;[sellerWallets] = await connection.query(
          'SELECT * FROM wow_marketplace.wallets WHERE account_id = ? FOR UPDATE',
          [listing.seller_id]
        )
      }

      const sellerWallet = sellerWallets[0]

      // Crédito para o vendedor (95%)
      await connection.query(
        'UPDATE wow_marketplace.wallets SET dp = dp + ? WHERE account_id = ?',
        [sellerReceives, listing.seller_id]
      )

      // Log transação - venda
      await connection.query(
        `INSERT INTO wow_marketplace.wallet_transactions
         (account_id, type, amount, balance_before, balance_after, currency,
          reference_type, reference_id, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          listing.seller_id,
          'MARKETPLACE_SALE',
          sellerReceives,
          sellerWallet.dp,
          sellerWallet.dp + sellerReceives,
          'DP',
          'MARKETPLACE_LISTING',
          listingId,
          `Sale: ${listing.item_entry} to account ${session.user.id} (after 5% fee)`
        ]
      )

      // Log transação - taxa
      await connection.query(
        `INSERT INTO wow_marketplace.wallet_transactions
         (account_id, type, amount, balance_before, balance_after, currency,
          reference_type, reference_id, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          listing.seller_id,
          'MARKETPLACE_FEE',
          -fee,
          sellerWallet.dp + sellerReceives,
          sellerWallet.dp + sellerReceives,
          'DP',
          'MARKETPLACE_LISTING',
          listingId,
          `Marketplace fee (5% of ${listing.price} DP)`
        ]
      )

      // Atualiza listing
      await connection.query(
        `UPDATE wow_marketplace.marketplace_listings
         SET status = 'SOLD', buyer_id = ?, sold_at = NOW(),
             seller_received = ?, marketplace_fee = ?
         WHERE id = ?`,
        [session.user.id, sellerReceives, fee, listingId]
      )

      // Cria fulfillment para o comprador (receber item)
      await connection.query(
        `INSERT INTO wow_marketplace.fulfillment_queue
         (type, account_id, character_guid, item_entry, item_count, reference_id, priority)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          'MARKETPLACE_PURCHASE',
          session.user.id,
          null, // GM escolhe personagem na entrega
          listing.item_entry,
          listing.item_count,
          listingId,
          5
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
          'MARKETPLACE_PURCHASE',
          'marketplace_listings',
          listingId,
          JSON.stringify({
            listing_id: listingId,
            item_entry: listing.item_entry,
            price: listing.price,
            seller_id: listing.seller_id,
            seller_received: sellerReceives,
            fee
          }),
          ipAddress
        ]
      )

      await connection.commit()

      return res.status(200).json({
        success: true,
        message:
          'Purchase successful! Item will be delivered by staff shortly.',
        data: {
          listing_id: listingId,
          price: listing.price,
          seller_received: sellerReceives,
          marketplace_fee: fee,
          new_balance: buyerWallet.dp - listing.price
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
    console.error('Error purchasing marketplace item:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
