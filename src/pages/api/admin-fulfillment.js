// ============================================================================
// API: GET/POST /api/admin-fulfillment
// ============================================================================
// Lista fila de fulfillment e marca itens como entregues (GM level 1+)

import { getSession } from '../../lib/session'
import { getPool } from '../../lib/db'
import { assertSameOrigin } from '../../lib/requestSecurity'
import rateLimit from '../../lib/rateLimit'
import {
  acquireIdempotencyLock,
  releaseIdempotencyLock
} from '../../lib/idempotency-server'

const postLimiter = rateLimit({ limit: 30, interval: 60 * 1000 })

export default async function handler(req, res) {
  if (req.method === 'POST' && !assertSameOrigin(req, res)) return
  if (req.method === 'POST' && !postLimiter.check(req, res)) return

  let idempotencyLock = null

  const session = await getSession(req, res)
  if (!session.user) {
    return res.status(401).json({ success: false, error: 'Not authenticated' })
  }

  const pool = getPool()
  const connection = await pool.getConnection()

  try {
    // Verifica permissão GM level 1+
    const [access] = await connection.query(
      'SELECT * FROM acore_auth.account_access WHERE id = ? AND gmlevel >= 1',
      [session.user.id]
    )

    if (access.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions. GM level 1+ required.'
      })
    }

    // GET - Lista fila
    if (req.method === 'GET') {
      const { status } = req.query

      const baseQuery = `
        SELECT
          fq.*,
          c.name AS character_name,
          a.username AS account_username
        FROM wow_marketplace.fulfillment_queue fq
        LEFT JOIN acore_characters.characters c ON c.guid = fq.character_guid
        LEFT JOIN acore_auth.account a ON a.id = fq.account_id
      `
      let query
      const params = []

      if (status) {
        query = baseQuery + ' WHERE fq.status = ? ORDER BY fq.priority ASC, fq.created_at ASC'
        params.push(status)
      } else {
        query = baseQuery + " WHERE fq.status IN ('PENDING','IN_PROGRESS') ORDER BY fq.priority ASC, fq.created_at ASC"
      }

      const [queue] = await connection.query(query, params)

      return res.status(200).json({
        success: true,
        data: {
          queue,
          total: queue.length
        }
      })
    }

    // POST - Marca como entregue
    if (req.method === 'POST') {
      const { fulfillment_id, delivery_method, delivery_notes } = req.body

      if (!fulfillment_id || !delivery_method) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: fulfillment_id, delivery_method'
        })
      }

      idempotencyLock = await acquireIdempotencyLock(req, res, {
        scope: 'admin-fulfillment-post',
        userId: session.user.id,
        windowMs: 15_000
      })

      if (!idempotencyLock) return

      // Busca fulfillment
      const [items] = await connection.query(
        "SELECT * FROM wow_marketplace.fulfillment_queue WHERE id = ? AND status IN ('PENDING', 'IN_PROGRESS')",
        [fulfillment_id]
      )

      if (items.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Fulfillment item not found or already delivered'
        })
      }

      // Atualiza
      await connection.query(
        `UPDATE wow_marketplace.fulfillment_queue
         SET status = 'DELIVERED', assigned_to = ?, delivered_at = NOW(),
             delivery_method = ?, delivery_notes = ?
         WHERE id = ?`,
        [
          session.user.id,
          delivery_method,
          delivery_notes || null,
          fulfillment_id
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
          'MARK_DELIVERED',
          'fulfillment_queue',
          fulfillment_id,
          JSON.stringify({
            fulfillment_id,
            delivery_method,
            delivery_notes,
            gm: session.user.username
          }),
          ipAddress
        ]
      )

      return res.status(200).json({
        success: true,
        message: 'Item marked as delivered',
        data: { fulfillment_id }
      })
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' })
  } catch (error) {
    if (idempotencyLock) await releaseIdempotencyLock(idempotencyLock)
    console.error('Error in fulfillment endpoint:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  } finally {
    connection.release()
  }
}
