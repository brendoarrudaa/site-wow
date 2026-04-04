// ============================================================================
// API: GET /api/sidebar-counts
// ============================================================================
// Returns notification counts for sidebar badges (GM level 1+ only)

import { getSession } from '../../lib/session'
import { getPool } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const session = await getSession(req, res)
  if (!session?.user) {
    return res.status(200).json({ success: true, tickets: 0, approvals: 0, deliveries: 0, audit: 0 })
  }

  const pool = getPool()
  const connection = await pool.getConnection()

  try {
    // Tickets count (all users)
    const [ticketRows] = await connection.query(
      `SELECT COUNT(*) AS cnt FROM acore_auth.tickets
       WHERE account_id = ? AND status IN ('open', 'in-progress')`,
      [session.user.id]
    )
    const tickets = ticketRows[0]?.cnt ?? 0

    // Check if admin
    const [access] = await connection.query(
      'SELECT gmlevel FROM acore_auth.account_access WHERE id = ? AND gmlevel >= 1',
      [session.user.id]
    )

    if (access.length === 0) {
      return res.status(200).json({ success: true, tickets, approvals: 0, deliveries: 0, audit: 0 })
    }

    const [approvalRows] = await connection.query(
      `SELECT COUNT(*) AS cnt FROM wow_marketplace.marketplace_listings
       WHERE status = 'PENDING_APPROVAL'`
    )

    const [deliveryRows] = await connection.query(
      `SELECT COUNT(*) AS cnt FROM wow_marketplace.fulfillment_queue
       WHERE status IN ('PENDING', 'IN_PROGRESS')`
    )

    const [auditRows] = await connection.query(
      `SELECT COUNT(*) AS cnt FROM wow_marketplace.audit_log
       WHERE action_type IN (
         'BAN_ACCOUNT','GM_SOAP_KICK','GM_SOAP_ANNOUNCE','GM_MODIFY_MONEY','GM_SET_LEVEL'
       )
       AND created_at >= NOW() - INTERVAL 24 HOUR`
    )

    return res.status(200).json({
      success: true,
      tickets: Number(tickets),
      approvals: Number(approvalRows[0]?.cnt ?? 0),
      deliveries: Number(deliveryRows[0]?.cnt ?? 0),
      audit: Number(auditRows[0]?.cnt ?? 0),
    })
  } catch (error) {
    console.error('[sidebar-counts]', error)
    return res.status(200).json({ success: true, tickets: 0, approvals: 0, deliveries: 0, audit: 0 })
  } finally {
    connection.release()
  }
}
