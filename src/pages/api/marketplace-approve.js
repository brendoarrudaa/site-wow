// ============================================================================
// API: POST /api/marketplace-approve
// ============================================================================
// Aprova uma listing (GM level 2+ apenas)

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

    if (!Number.isInteger(listingId) || listingId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid required field: listing_id'
      })
    }

    idempotencyLock = await acquireIdempotencyLock(req, res, {
      scope: 'marketplace-approve',
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
            'Insufficient permissions. GM level 2+ required to approve listings.'
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

      // Aprova
      await connection.query(
        "UPDATE wow_marketplace.marketplace_listings SET status = 'ACTIVE', approved_by = ? WHERE id = ?",
        [session.user.id, listingId]
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
          'APPROVE_LISTING',
          'marketplace_listings',
          listingId,
          JSON.stringify({
            listing_id: listingId,
            approved_by: session.user.username
          }),
          ipAddress
        ]
      )

      return res.status(200).json({
        success: true,
        message: 'Listing approved successfully',
        data: { listing_id: listingId }
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    if (idempotencyLock) await releaseIdempotencyLock(idempotencyLock)
    console.error('Error approving listing:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
