// ============================================================================
// API: GET /api/marketplace-list
// ============================================================================
// Lista itens no marketplace (apenas ACTIVE)

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
      // Parse filtros
      const { category, minPrice, maxPrice, search, status } = req.query

      // v_active_marketplace filtra apenas ACTIVE.
      // Quando status específico é passado (ex: PENDING_APPROVAL para admin),
      // consulta a tabela diretamente para ter acesso a todos os status.
      const ALLOWED_STATUSES = ['ACTIVE', 'PENDING_APPROVAL', 'SOLD', 'CANCELLED', 'REJECTED']
      const useDirectTable = status && ALLOWED_STATUSES.includes(status)

      let query, params

      if (useDirectTable) {
        query = 'SELECT * FROM wow_marketplace.marketplace_listings WHERE status = ?'
        params = [status]
      } else {
        query = 'SELECT * FROM wow_marketplace.v_active_marketplace WHERE 1=1'
        params = []
      }

      if (category) {
        query += ' AND category = ?'
        params.push(category)
      }

      if (minPrice) {
        query += ' AND price >= ?'
        params.push(parseInt(minPrice))
      }

      if (maxPrice) {
        query += ' AND price <= ?'
        params.push(parseInt(maxPrice))
      }

      if (search) {
        query += ' AND item_name LIKE ?'
        params.push(`%${search}%`)
      }

      query += ' ORDER BY created_at DESC'

      const [listings] = await connection.query(query, params)

      return res.status(200).json({
        success: true,
        data: {
          listings,
          total: listings.length
        }
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Error fetching marketplace listings:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
