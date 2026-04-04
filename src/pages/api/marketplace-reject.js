// ============================================================================
// API: POST /api/marketplace-reject
// ============================================================================
// Rejeita uma listing (GM level 2+ apenas)

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

    const listingId = Number(req.body?.listing_id)
    const reason = req.body?.reason

    if (!Number.isInteger(listingId) || listingId <= 0 || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Invalid required fields: listing_id, reason'
      })
    }

    idempotencyLock = await acquireIdempotencyLock(req, res, {
      scope: 'marketplace-reject',
      userId: session.user.id,
      windowMs: 15_000
    })

    if (!idempotencyLock) return

    const pool = getPool()
    const connection = await pool.getConnection()

    try {
      // Verifica permissão GM level 2+
      const [access] = await connection.query(
        'SELECT * FROM acore_auth.account_access WHERE id = ? AND gmlevel >= 2',
        [session.user.id]
      )

      if (access.length === 0) {
        return res.status(403).json({
          success: false,
          error:
            'Insufficient permissions. GM level 2+ required to reject listings.'
        })
      }

      // Busca listing
      const [listings] = await connection.query(
        "SELECT * FROM wow_marketplace.marketplace_listings WHERE id = ? AND status = 'PENDING_APPROVAL'",
        [listingId]
      )

      if (listings.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Listing not found or already processed'
        })
      }

      // Rejeita
      await connection.query(
        "UPDATE wow_marketplace.marketplace_listings SET status = 'REJECTED', approved_by = ?, approved_at = NOW(), rejection_reason = ? WHERE id = ?",
        [session.user.id, reason, listingId]
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
          'REJECT_LISTING',
          'marketplace_listings',
          listingId,
          JSON.stringify({
            listing_id: listingId,
            reason,
            rejected_by: session.user.username
          }),
          ipAddress
        ]
      )

      return res.status(200).json({
        success: true,
        message: 'Listing rejected',
        data: { listing_id: listingId, reason }
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    if (idempotencyLock) await releaseIdempotencyLock(idempotencyLock)
    console.error('Error rejecting listing:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
