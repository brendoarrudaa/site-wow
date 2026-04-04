// ============================================================================
// API: GET /api/wallet-transactions
// ============================================================================
// Retorna o histórico de transações do usuário

import { getSession } from '../../lib/session'
import { getPool } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    // Verifica sessão
    const session = await getSession(req, res)
    if (!session.user) {
      return res
        .status(401)
        .json({ success: false, error: 'Not authenticated' })
    }

    // Parse query params
    const page = parseInt(req.query.page) || 1
    const perPage = Math.min(parseInt(req.query.perPage) || 20, 100)
    const offset = (page - 1) * perPage

    const pool = getPool()
    const connection = await pool.getConnection()

    try {
      // Busca transações
      const [transactions] = await connection.query(
        `SELECT * FROM wow_marketplace.wallet_transactions
         WHERE account_id = ?
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [session.user.id, perPage, offset]
      )

      // Conta total
      const [countResult] = await connection.query(
        'SELECT COUNT(*) as total FROM wow_marketplace.wallet_transactions WHERE account_id = ?',
        [session.user.id]
      )

      return res.status(200).json({
        success: true,
        data: {
          transactions,
          total: countResult[0].total,
          page,
          perPage
        }
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Error fetching wallet transactions:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
