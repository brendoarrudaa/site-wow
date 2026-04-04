// ============================================================================
// API: GET /api/wallet-balance
// ============================================================================
// Retorna o saldo atual do usuário (DP e VP)

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

    const pool = getPool()
    const connection = await pool.getConnection()

    try {
      // Busca ou cria wallet
      let [wallets] = await connection.query(
        'SELECT * FROM wow_marketplace.wallets WHERE account_id = ?',
        [session.user.id]
      )

      // Cria wallet se não existir
      if (wallets.length === 0) {
        await connection.query(
          'INSERT INTO wow_marketplace.wallets (account_id, dp, vp) VALUES (?, 0, 0)',
          [session.user.id]
        )
        ;[wallets] = await connection.query(
          'SELECT * FROM wow_marketplace.wallets WHERE account_id = ?',
          [session.user.id]
        )
      }

      const wallet = wallets[0]

      return res.status(200).json({
        success: true,
        data: {
          dp: wallet.dp,
          vp: wallet.vp,
          lastUpdated: wallet.updated_at
        }
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Error fetching wallet balance:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
