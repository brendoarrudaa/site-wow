// Utilitário para executar comandos GM via SOAP do AzerothCore
// Requer: WS_SOAP_HOST, WS_SOAP_PORT, WS_SOAP_USER, WS_SOAP_PASS no .env.local

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function soapCommand(command) {
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
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'Authorization': `Basic ${auth}`,
      'SOAPAction': '',
    },
    body,
    signal: AbortSignal.timeout(6000),
  })

  const text = await response.text()

  if (!response.ok) {
    if (response.status === 401) throw new Error('SOAP: credenciais inválidas.')
    throw new Error(`SOAP retornou HTTP ${response.status}`)
  }

  const match = text.match(/<result>([\s\S]*?)<\/result>/)
  return match ? match[1].trim() : 'Comando executado.'
}
