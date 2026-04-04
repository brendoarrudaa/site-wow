// ============================================================================
// API: POST /api/admin-gm-soap
// ============================================================================
// Executa comandos GM via SOAP do AzerothCore (worldserver precisa estar online)
// Actions: announce | notify | kick | saveall | revive | summon
//
// worldserver.conf:
//   SOAP.Enabled = 1
//   SOAP.IP      = 127.0.0.1
//   SOAP.Port    = 7878

import { getSession } from '../../lib/session'
import { getPool } from '../../lib/db'
import { assertSameOrigin } from '../../lib/requestSecurity'
import rateLimit from '../../lib/rateLimit'

const limiter = rateLimit({ limit: 20, interval: 60 * 1000 })

// Nível mínimo por ação
const ACTION_MIN_LEVEL = {
  announce: 1,
  notify:   1,
  saveall:  1,
  kick:     2,
  revive:   2,
  summon:   2,
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

async function soapCommand(command) {
  const host = process.env.WS_SOAP_HOST || '127.0.0.1'
  const port = process.env.WS_SOAP_PORT || '7878'
  const user = process.env.WS_SOAP_USER || ''
  const pass = process.env.WS_SOAP_PASS || ''

  if (!user || !pass) {
    throw new Error('SOAP não configurado. Defina WS_SOAP_USER e WS_SOAP_PASS no .env.local')
  }

  const auth = Buffer.from(`${user}:${pass}`).toString('base64')
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="urn:AC">
  <SOAP-ENV:Body>
    <ns1:executeCommand>
      <command>${escapeXml(command)}</command>
    </ns1:executeCommand>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`

  const response = await fetch(`http://${host}:${port}/`, {
    method:  'POST',
    headers: {
      'Content-Type':  'text/xml; charset=utf-8',
      'Authorization': `Basic ${auth}`,
      'SOAPAction':    '',
    },
    body,
    signal: AbortSignal.timeout(6000),
  })

  const text = await response.text()

  if (!response.ok) {
    if (response.status === 401) throw new Error('SOAP: credenciais inválidas. Verifique WS_SOAP_USER e WS_SOAP_PASS.')
    throw new Error(`SOAP retornou HTTP ${response.status}`)
  }

  // Extrai <result>...</result>
  const match = text.match(/<result>([\s\S]*?)<\/result>/)
  return match ? match[1].trim() : 'Comando executado.'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }
  if (!assertSameOrigin(req, res)) return
  if (!limiter.check(req, res)) return

  const session = await getSession(req, res)
  if (!session?.user) {
    return res.status(401).json({ success: false, error: 'Not authenticated' })
  }

  const pool = getPool()
  const connection = await pool.getConnection()

  try {
    const { action } = req.body ?? {}
    if (!action) {
      return res.status(400).json({ success: false, error: 'action é obrigatório.' })
    }

    const minLevel = ACTION_MIN_LEVEL[action] ?? 2
    const [access] = await connection.query(
      `SELECT gmlevel FROM acore_auth.account_access WHERE id = ? AND gmlevel >= ${minLevel}`,
      [session.user.id]
    )
    if (access.length === 0) {
      return res.status(403).json({ success: false, error: `GM level ${minLevel}+ required.` })
    }
    const actorLevel = access[0].gmlevel
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'

    let command = ''
    let logDetails = {}

    // ── ANNOUNCE ────────────────────────────────────────────────────────────
    if (action === 'announce') {
      const { message } = req.body
      if (!message?.trim()) return res.status(400).json({ success: false, error: 'message é obrigatório.' })
      command = `announce ${message.trim().slice(0, 255)}`
      logDetails = { message: message.trim() }
    }

    // ── NOTIFY ──────────────────────────────────────────────────────────────
    else if (action === 'notify') {
      const { message } = req.body
      if (!message?.trim()) return res.status(400).json({ success: false, error: 'message é obrigatório.' })
      command = `notify ${message.trim().slice(0, 255)}`
      logDetails = { message: message.trim() }
    }

    // ── KICK ────────────────────────────────────────────────────────────────
    else if (action === 'kick') {
      const { character, reason } = req.body
      if (!character?.trim()) return res.status(400).json({ success: false, error: 'character é obrigatório.' })
      const r = reason?.trim() ? ` ${reason.trim()}` : ''
      command = `kick ${character.trim()}${r}`
      logDetails = { character: character.trim(), reason: reason?.trim() ?? '' }
    }

    // ── SAVEALL ─────────────────────────────────────────────────────────────
    else if (action === 'saveall') {
      command = 'saveall'
      logDetails = {}
    }

    // ── REVIVE ──────────────────────────────────────────────────────────────
    else if (action === 'revive') {
      const { character } = req.body
      if (!character?.trim()) return res.status(400).json({ success: false, error: 'character é obrigatório.' })
      command = `revive ${character.trim()}`
      logDetails = { character: character.trim() }
    }

    // ── SUMMON ──────────────────────────────────────────────────────────────
    else if (action === 'summon') {
      const { character } = req.body
      if (!character?.trim()) return res.status(400).json({ success: false, error: 'character é obrigatório.' })
      command = `summon ${character.trim()}`
      logDetails = { character: character.trim() }
    }

    else {
      return res.status(400).json({ success: false, error: `Ação "${action}" desconhecida.` })
    }

    let result
    let soapOk = true
    try {
      result = await soapCommand(command)
    } catch (soapError) {
      soapOk = false
      result = soapError.message
    }

    // Audit log independente do resultado SOAP
    await connection.query(
      `INSERT INTO wow_marketplace.audit_log
       (account_id, actor_role, action_type, details, ip_address)
       VALUES (?, ?, ?, ?, ?)`,
      [
        session.user.id,
        `GM${actorLevel}`,
        `GM_SOAP_${action.toUpperCase()}`,
        JSON.stringify({ command, result, ...logDetails }),
        ip,
      ]
    )

    if (!soapOk) {
      return res.status(503).json({ success: false, error: result })
    }

    return res.status(200).json({ success: true, message: result || 'Comando executado com sucesso.' })
  } catch (error) {
    console.error('[admin-gm-soap]', error)
    return res.status(500).json({ success: false, error: 'Erro interno.' })
  } finally {
    connection.release()
  }
}
