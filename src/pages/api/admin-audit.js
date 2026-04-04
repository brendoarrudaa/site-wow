// ============================================================================
// API: GET /api/admin-audit
// ============================================================================
// Lista audit log com dados enriquecidos (GM level 3+ apenas)
// ?format=csv  → exporta CSV filtrado
// ?critical=1  → filtra apenas ações sensíveis

import { getSession } from '../../lib/session'
import { getPool } from '../../lib/db'

const CRITICAL_ACTIONS = [
  'APPROVE_LISTING', 'REJECT_LISTING', 'AUCTION_CLOSED_GM',
  'FULFILLMENT_DELIVERED', 'CREDIT_DP', 'CREDIT_VP',
  'ADMIN_ADJUSTMENT', 'BID_REFUND', 'MARKETPLACE_PURCHASE', 'AUCTION_WIN',
]

// Mapeia gmlevel → papel legível
function gmRole(level) {
  if (!level || level === 0) return 'PLAYER'
  if (level === 1) return 'GM1'
  if (level === 2) return 'GM2'
  if (level === 3) return 'GM3'
  return `GM${level}`
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const session = await getSession(req, res)
    if (!session?.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' })
    }

    const pool = getPool()
    const connection = await pool.getConnection()

    try {
      // Verifica permissão admin (GM level 3+)
      const [access] = await connection.query(
        'SELECT gmlevel FROM acore_auth.account_access WHERE id = ? AND gmlevel >= 3',
        [session.user.id]
      )
      if (access.length === 0) {
        return res.status(403).json({ success: false, error: 'Insufficient permissions.' })
      }

      // Parse filtros
      const {
        action_type, account_id, date_from, date_to,
        critical, format,
        page = 1, perPage = 50,
      } = req.query

      const limit = Math.min(parseInt(perPage), 200)
      const offset = (parseInt(page) - 1) * limit

      // Query enriquecida: junta username + gmlevel do ator
      let query = `
        SELECT
          al.id,
          al.account_id,
          al.actor_role,
          al.action_type,
          al.entity_type,
          al.entity_id,
          al.target_type,
          al.target_id,
          al.details,
          al.before_state,
          al.after_state,
          al.ip_address,
          al.user_agent,
          al.correlation_id,
          al.created_at,
          a.username  AS actor_username,
          aa.gmlevel  AS actor_gmlevel
        FROM wow_marketplace.audit_log al
        LEFT JOIN acore_auth.account a  ON a.id = al.account_id
        LEFT JOIN acore_auth.account_access aa ON aa.id = al.account_id
        WHERE 1=1
      `
      const params = []

      if (action_type) {
        query += ' AND al.action_type = ?'
        params.push(action_type)
      }

      if (account_id) {
        query += ' AND al.account_id = ?'
        params.push(parseInt(account_id))
      }

      if (date_from) {
        query += ' AND al.created_at >= ?'
        params.push(date_from)
      }

      if (date_to) {
        query += ' AND al.created_at < DATE_ADD(?, INTERVAL 1 DAY)'
        params.push(date_to)
      }

      if (critical === '1') {
        query += ` AND al.action_type IN (${CRITICAL_ACTIONS.map(() => '?').join(',')})`
        params.push(...CRITICAL_ACTIONS)
      }

      // CSV export (sem paginação)
      if (format === 'csv') {
        const [rows] = await connection.query(
          query + ' ORDER BY al.created_at DESC LIMIT 5000',
          params
        )

        const header = ['ID','Ator','Username','Papel','Ação','Tipo Alvo','ID Alvo','Detalhes','IP','Correlation ID','Data']
        const lines = [header.join(',')]

        for (const r of rows) {
          const role = r.actor_role || gmRole(r.actor_gmlevel)
          const details = r.details ? JSON.stringify(r.details).replace(/"/g, '""') : ''
          lines.push([
            r.id,
            r.account_id,
            `"${r.actor_username || ''}"`,
            role,
            r.action_type,
            r.target_type || r.entity_type || '',
            r.target_id || r.entity_id || '',
            `"${details}"`,
            r.ip_address || '',
            r.correlation_id || '',
            new Date(r.created_at).toISOString(),
          ].join(','))
        }

        res.setHeader('Content-Type', 'text/csv; charset=utf-8')
        res.setHeader('Content-Disposition', `attachment; filename="audit-${Date.now()}.csv"`)
        return res.status(200).send('\uFEFF' + lines.join('\n')) // BOM para Excel
      }

      // Paginado
      const countParams = [...params]
      let countQuery = `
        SELECT COUNT(*) as total
        FROM wow_marketplace.audit_log al
        WHERE 1=1
      `
      if (action_type) { countQuery += ' AND al.action_type = ?'; }
      if (account_id)  { countQuery += ' AND al.account_id = ?'; }
      if (date_from)   { countQuery += ' AND al.created_at >= ?'; }
      if (date_to)     { countQuery += ' AND al.created_at < DATE_ADD(?, INTERVAL 1 DAY)'; }
      if (critical === '1') {
        countQuery += ` AND al.action_type IN (${CRITICAL_ACTIONS.map(() => '?').join(',')})`
        countParams.push(...CRITICAL_ACTIONS)
      }

      query += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?'
      params.push(limit, offset)

      const [[{ total }], [logs]] = await Promise.all([
        connection.query(countQuery, countParams),
        connection.query(query, params),
      ])

      // Enriquece actor_role a partir do gmlevel se não gravado
      const enriched = logs.map(r => ({
        ...r,
        actor_role: r.actor_role || gmRole(r.actor_gmlevel),
        is_critical: CRITICAL_ACTIONS.includes(r.action_type),
      }))

      return res.status(200).json({
        success: true,
        data: {
          logs: enriched,
          total,
          page: parseInt(page),
          perPage: limit,
          total_pages: Math.ceil(total / limit),
          critical_actions: CRITICAL_ACTIONS,
        },
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('[admin-audit]', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
