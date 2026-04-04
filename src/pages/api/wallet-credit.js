// ============================================================================
// API: POST /api/wallet-credit
// ============================================================================
// Adiciona DP/VP a uma conta (ADMIN ONLY)

import { getSession } from '../../lib/session'
import { getPool } from '../../lib/db'
import { assertSameOrigin } from '../../lib/requestSecurity'
import rateLimit from '../../lib/rateLimit'

const limiter = rateLimit({ limit: 20, interval: 60 * 1000 })

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  if (!assertSameOrigin(req, res)) return
  if (!limiter.check(req, res)) return

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
      // Verifica se é admin (GM level 3+)
      const [access] = await connection.query(
        'SELECT * FROM acore_auth.account_access WHERE id = ? AND gmlevel >= 3',
        [session.user.id]
      )

      if (access.length === 0) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions. Admin access required.'
        })
      }

      // Parse request body
      const { accountId, currency, amount, notes } = req.body

      // Validações
      if (!accountId || !currency || !amount) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: accountId, currency, amount'
        })
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Amount must be positive'
        })
      }

      if (!['DP', 'VP'].includes(currency)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid currency. Must be DP or VP'
        })
      }

      // Executa crédito em transaction
      await connection.beginTransaction()

      try {
        // Busca ou cria wallet com lock
        let [wallets] = await connection.query(
          'SELECT * FROM wow_marketplace.wallets WHERE account_id = ? FOR UPDATE',
          [accountId]
        )

        if (wallets.length === 0) {
          await connection.query(
            'INSERT INTO wow_marketplace.wallets (account_id, dp, vp) VALUES (?, 0, 0)',
            [accountId]
          )
          ;[wallets] = await connection.query(
            'SELECT * FROM wow_marketplace.wallets WHERE account_id = ? FOR UPDATE',
            [accountId]
          )
        }

        const wallet = wallets[0]
        const balanceBefore = currency === 'DP' ? wallet.dp : wallet.vp
        const balanceAfter = balanceBefore + amount

        // Atualiza wallet
        const field = currency === 'DP' ? 'dp' : 'vp'
        await connection.query(
          `UPDATE wow_marketplace.wallets SET ${field} = ? WHERE account_id = ?`,
          [balanceAfter, accountId]
        )

        // Insere transaction log
        const transactionType = currency === 'DP' ? 'CREDIT_DP' : 'CREDIT_VP'
        const ipAddress =
          req.headers['x-forwarded-for'] || req.socket.remoteAddress

        await connection.query(
          `INSERT INTO wow_marketplace.wallet_transactions
           (account_id, type, amount, balance_before, balance_after, currency,
            reference_type, notes, created_by, ip_address)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            accountId,
            transactionType,
            amount,
            balanceBefore,
            balanceAfter,
            currency,
            'ADMIN_CREDIT',
            notes || `Manual credit by admin ${session.user.username}`,
            session.user.id,
            ipAddress
          ]
        )

        await connection.commit()

        return res.status(200).json({
          success: true,
          message: `Successfully credited ${amount} ${currency} to account ${accountId}`,
          data: {
            accountId,
            currency,
            amount,
            newBalance: balanceAfter
          }
        })
      } catch (error) {
        await connection.rollback()
        throw error
      }
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Error crediting wallet:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
