import { getIronSession } from 'iron-session'
import { getPool } from '@/lib/db'
import { sessionOptions } from '@/lib/session'

export default async function handler(req, res) {
  const session = await getIronSession(req, res, sessionOptions)
  if (!session.user) return res.status(401).json({ error: 'Não autenticado.' })

  const pool = getPool()

  // ── GET: list messages for a ticket ────────────────────────────────────────
  if (req.method === 'GET') {
    const ticketId = parseInt(req.query.ticketId)
    if (!ticketId) return res.status(400).json({ error: 'ticketId obrigatório.' })

    try {
      // Verify ticket belongs to this account
      const [tickets] = await pool.query(
        'SELECT id, status FROM acore_auth.tickets WHERE id = ? AND account_id = ?',
        [ticketId, session.user.id]
      )
      if (tickets.length === 0) {
        return res.status(404).json({ error: 'Ticket não encontrado.' })
      }

      const [messages] = await pool.query(
        `SELECT author, content, is_staff, created_at
         FROM acore_auth.ticket_messages
         WHERE ticket_id = ?
         ORDER BY created_at ASC`,
        [ticketId]
      )

      return res.status(200).json({
        status: tickets[0].status,
        messages: messages.map((m) => ({
          author: m.author,
          content: m.content,
          isStaff: m.is_staff === 1,
          date: m.created_at,
        })),
      })
    } catch (err) {
      console.error('[ticket-messages GET]', err)
      return res.status(500).json({ error: 'Erro interno.' })
    }
  }

  // ── POST: reply to a ticket ────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { ticketId, content } = req.body

    if (typeof ticketId !== 'number' || typeof content !== 'string') {
      return res.status(400).json({ error: 'Dados inválidos.' })
    }
    if (content.trim().length < 1) {
      return res.status(400).json({ error: 'Mensagem não pode ser vazia.' })
    }

    try {
      // Verify ticket belongs to this account and is open
      const [tickets] = await pool.query(
        'SELECT id, status FROM acore_auth.tickets WHERE id = ? AND account_id = ?',
        [ticketId, session.user.id]
      )
      if (tickets.length === 0) {
        return res.status(404).json({ error: 'Ticket não encontrado.' })
      }
      if (tickets[0].status === 'closed' || tickets[0].status === 'resolved') {
        return res.status(400).json({ error: 'Este ticket já foi fechado.' })
      }

      await pool.query(
        `INSERT INTO acore_auth.ticket_messages (ticket_id, author, content, is_staff)
         VALUES (?, ?, ?, 0)`,
        [ticketId, session.user.username, content.trim()]
      )

      // Touch updated_at
      await pool.query(
        'UPDATE acore_auth.tickets SET updated_at = NOW() WHERE id = ?',
        [ticketId]
      )

      return res.status(201).json({ success: true })
    } catch (err) {
      console.error('[ticket-messages POST]', err)
      return res.status(500).json({ error: 'Erro interno.' })
    }
  }

  return res.status(405).end()
}
