import { getIronSession } from 'iron-session'
import { getPool } from '@/lib/db'
import { sessionOptions } from '@/lib/session'
import { Resend } from 'resend'

const ADMIN_EMAIL = 'brendo.arruda@gmail.com'
const VALID_CATEGORIES = ['bug', 'account', 'character', 'report', 'suggestion', 'other']
const VALID_PRIORITIES = ['low', 'medium', 'high']

const CATEGORY_LABELS = {
  bug: 'Bug Report',
  account: 'Conta',
  character: 'Personagem',
  report: 'Denúncia',
  suggestion: 'Sugestão',
  other: 'Outro',
}

const PRIORITY_LABELS = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
}

async function sendTicketNotification(ticket) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM || 'onboarding@resend.dev'
  const appName = process.env.APP_NAME || 'Azeroth Legacy'

  const priorityColor = {
    low: '#22c55e',
    medium: '#eab308',
    high: '#ef4444',
  }

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #1a1a2e; color: #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; text-align: center;">
        <h1 style="margin: 0; color: white; font-size: 20px;">🎫 Novo Ticket de Suporte</h1>
        <p style="margin: 4px 0 0; color: rgba(255,255,255,0.8); font-size: 13px;">${appName}</p>
      </div>
      <div style="padding: 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #a0a0a0; width: 120px;">Ticket #</td>
            <td style="padding: 8px 0; font-weight: bold;">${ticket.id}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #a0a0a0;">Usuário</td>
            <td style="padding: 8px 0;">${ticket.username}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #a0a0a0;">Email</td>
            <td style="padding: 8px 0;">${ticket.email || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #a0a0a0;">Categoria</td>
            <td style="padding: 8px 0;">${CATEGORY_LABELS[ticket.category] || ticket.category}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #a0a0a0;">Prioridade</td>
            <td style="padding: 8px 0;">
              <span style="background: ${priorityColor[ticket.priority]}22; color: ${priorityColor[ticket.priority]}; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: bold;">
                ${PRIORITY_LABELS[ticket.priority] || ticket.priority}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #a0a0a0;">Assunto</td>
            <td style="padding: 8px 0; font-weight: bold;">${ticket.subject}</td>
          </tr>
        </table>
        <div style="margin-top: 16px; padding: 16px; background: #16213e; border-radius: 6px; border-left: 3px solid #667eea;">
          <p style="margin: 0 0 4px; font-size: 12px; color: #a0a0a0;">Mensagem:</p>
          <p style="margin: 0; font-size: 14px; white-space: pre-wrap;">${ticket.message}</p>
        </div>
      </div>
      <div style="padding: 16px 24px; background: #16213e; text-align: center; font-size: 12px; color: #666;">
        ${appName} — Sistema de Tickets
      </div>
    </div>
  `

  if (!apiKey) {
    console.log('[tickets] RESEND_API_KEY não configurada. Email do ticket:')
    console.log(`  Para: ${ADMIN_EMAIL}`)
    console.log(`  Assunto: [Ticket #${ticket.id}] ${ticket.subject}`)
    console.log(`  De: ${ticket.username} (${ticket.email})`)
    return
  }

  try {
    const resend = new Resend(apiKey)
    await resend.emails.send({
      from: `${appName} <${from}>`,
      to: ADMIN_EMAIL,
      subject: `[Ticket #${ticket.id}] ${ticket.subject} — ${ticket.username}`,
      html,
    })
  } catch (err) {
    console.error('[tickets] Erro ao enviar email:', err)
  }
}

export default async function handler(req, res) {
  const session = await getIronSession(req, res, sessionOptions)
  if (!session.user) return res.status(401).json({ error: 'Não autenticado.' })

  const pool = getPool()

  // ── GET: list tickets ──────────────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const [tickets] = await pool.query(
        `SELECT id, category, priority, subject, status, created_at, updated_at
         FROM acore_auth.tickets
         WHERE account_id = ?
         ORDER BY updated_at DESC`,
        [session.user.id]
      )

      // Fetch message counts
      if (tickets.length > 0) {
        const ids = tickets.map((t) => t.id)
        const [counts] = await pool.query(
          `SELECT ticket_id, COUNT(*) AS count
           FROM acore_auth.ticket_messages
           WHERE ticket_id IN (?)
           GROUP BY ticket_id`,
          [ids]
        )
        const countMap = Object.fromEntries(counts.map((r) => [r.ticket_id, r.count]))
        for (const t of tickets) {
          t.messageCount = countMap[t.id] || 0
        }
      }

      return res.status(200).json({ tickets })
    } catch (err) {
      console.error('[tickets GET]', err)
      return res.status(500).json({ error: 'Erro interno.' })
    }
  }

  // ── POST: create ticket ────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { category, priority, subject, message } = req.body

    if (typeof subject !== 'string' || typeof message !== 'string') {
      return res.status(400).json({ error: 'Assunto e mensagem são obrigatórios.' })
    }
    if (subject.trim().length < 3 || subject.trim().length > 200) {
      return res.status(400).json({ error: 'O assunto deve ter entre 3 e 200 caracteres.' })
    }
    if (message.trim().length < 10) {
      return res.status(400).json({ error: 'A mensagem deve ter pelo menos 10 caracteres.' })
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Categoria inválida.' })
    }
    if (!VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: 'Prioridade inválida.' })
    }

    try {
      const [result] = await pool.query(
        `INSERT INTO acore_auth.tickets (account_id, username, email, category, priority, subject)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          session.user.id,
          session.user.username,
          session.user.email || '',
          category,
          priority,
          subject.trim(),
        ]
      )

      const ticketId = result.insertId

      await pool.query(
        `INSERT INTO acore_auth.ticket_messages (ticket_id, author, content, is_staff)
         VALUES (?, ?, ?, 0)`,
        [ticketId, session.user.username, message.trim()]
      )

      // Send email to admin
      await sendTicketNotification({
        id: ticketId,
        username: session.user.username,
        email: session.user.email || '',
        category,
        priority,
        subject: subject.trim(),
        message: message.trim(),
      })

      return res.status(201).json({ ticketId })
    } catch (err) {
      console.error('[tickets POST]', err)
      return res.status(500).json({ error: 'Erro interno.' })
    }
  }

  return res.status(405).end()
}
