// ============================================================================
// API: GET/POST /api/admin-fulfillment
// ============================================================================
// Lista fila de fulfillment e entrega itens automaticamente via SOAP (GM level 1+)

import { getSession } from '../../lib/session'
import { getPool } from '../../lib/db'
import { assertSameOrigin } from '../../lib/requestSecurity'
import rateLimit from '../../lib/rateLimit'
import { soapCommand } from '../../lib/soap'
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
        data: { queue, total: queue.length }
      })
    }

    // POST - Entrega item via SOAP e marca como entregue
    if (req.method === 'POST') {
      const { fulfillment_id, delivery_notes } = req.body

      if (!fulfillment_id) {
        return res.status(400).json({
          success: false,
          error: 'Missing required field: fulfillment_id'
        })
      }

      idempotencyLock = await acquireIdempotencyLock(req, res, {
        scope: 'admin-fulfillment-post',
        userId: session.user.id,
        windowMs: 15_000
      })

      if (!idempotencyLock) return

      // Busca fulfillment com dados do personagem
      const [items] = await connection.query(
        `SELECT fq.*, c.name AS character_name
         FROM wow_marketplace.fulfillment_queue fq
         LEFT JOIN acore_characters.characters c ON c.guid = fq.character_guid
         WHERE fq.id = ? AND fq.status IN ('PENDING', 'IN_PROGRESS')`,
        [fulfillment_id]
      )

      if (items.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Item não encontrado ou já entregue'
        })
      }

      const item = items[0]

      if (!item.character_name) {
        return res.status(400).json({
          success: false,
          error: 'Personagem não encontrado no banco'
        })
      }

      // Marca como IN_PROGRESS
      await connection.query(
        `UPDATE wow_marketplace.fulfillment_queue
         SET status = 'IN_PROGRESS', assigned_to = ?
         WHERE id = ?`,
        [session.user.id, fulfillment_id]
      )

      // Envia item via SOAP: .send items CharacterName "Assunto" "Corpo" entry:count
      const subject = 'Entrega do Marketplace'
      const body = delivery_notes?.trim() || 'Item solicitado no marketplace.'
      const command = `send items ${item.character_name} "${subject}" "${body}" ${item.item_entry}:${item.item_count}`

      let soapResult
      try {
        soapResult = await soapCommand(command)
      } catch (soapError) {
        // Reverte para PENDING em caso de falha
        await connection.query(
          `UPDATE wow_marketplace.fulfillment_queue
           SET status = 'PENDING', assigned_to = NULL
           WHERE id = ?`,
          [fulfillment_id]
        )
        return res.status(503).json({
          success: false,
          error: `Falha ao enviar via SOAP: ${soapError.message}`
        })
      }

      // Marca como DELIVERED
      await connection.query(
        `UPDATE wow_marketplace.fulfillment_queue
         SET status = 'DELIVERED', delivered_at = NOW(),
             delivery_method = 'SOAP_AUTO', delivery_notes = ?
         WHERE id = ?`,
        [delivery_notes || null, fulfillment_id]
      )

      // Audit log
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress
      await connection.query(
        `INSERT INTO wow_marketplace.audit_log
         (account_id, action_type, entity_type, entity_id, details, ip_address)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          session.user.id,
          'DELIVER_SOAP',
          'fulfillment_queue',
          fulfillment_id,
          JSON.stringify({
            fulfillment_id,
            character: item.character_name,
            item_entry: item.item_entry,
            item_count: item.item_count,
            soap_result: soapResult,
            gm: session.user.username
          }),
          ipAddress
        ]
      )

      return res.status(200).json({
        success: true,
        message: `Item enviado para ${item.character_name} via correio do jogo.`,
        data: { fulfillment_id, soap_result: soapResult }
      })
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' })
  } catch (error) {
    if (idempotencyLock) await releaseIdempotencyLock(idempotencyLock)
    console.error('Error in fulfillment endpoint:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  } finally {
    connection.release()
  }
}
