import crypto from 'crypto'
import { Resend } from 'resend'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Gera um código numérico de 6 dígitos. */
export function generateVerificationCode() {
  return crypto.randomInt(100000, 999999).toString()
}

/** Retorna o SHA-256 hex do código — nunca persista o código puro. */
export function hashVerificationCode(code) {
  return crypto.createHash('sha256').update(code).digest('hex')
}

/** Verifica em tempo constante se o código submetido bate com o hash armazenado. */
export function verifyCode(submitted, storedHash) {
  const submittedHash = Buffer.from(hashVerificationCode(submitted), 'hex')
  const stored = Buffer.from(storedHash, 'hex')
  if (submittedHash.length !== stored.length) return false
  return crypto.timingSafeEqual(submittedHash, stored)
}

/** true se o timestamp de expiração já passou. */
export function isCodeExpired(expiresAt) {
  return new Date(expiresAt) < new Date()
}

/** true se o cooldown de reenvio ainda não terminou. */
export function isResendOnCooldown(resendAvailableAt) {
  return new Date(resendAvailableAt) > new Date()
}

/** Segundos restantes do cooldown (0 se disponível). */
export function resendCooldownSeconds(resendAvailableAt) {
  const diff = Math.ceil((new Date(resendAvailableAt) - Date.now()) / 1000)
  return diff > 0 ? diff : 0
}

// ─── E-mail ───────────────────────────────────────────────────────────────────

const APP_NAME = process.env.APP_NAME || 'Azeroth Legacy'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn('[emailVerification] RESEND_API_KEY não configurado.')
    return null
  }
  return new Resend(key)
}

/**
 * Envia o e-mail de verificação com o código de 6 dígitos.
 * Se RESEND_API_KEY não estiver configurado, imprime no console (modo dev).
 */
export async function sendVerificationEmail(email, code) {
  const from = process.env.EMAIL_FROM || 'onboarding@resend.dev'
  const resend = getResend()

  if (!resend) {
    console.log(`[emailVerification] Código para ${email}: ${code}`)
    return
  }

  await resend.emails.send({
    from,
    to: email,
    subject: `Confirme seu cadastro — ${APP_NAME}`,
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0d1117;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;padding:40px 0">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#161b22;border-radius:12px;overflow:hidden;border:1px solid #30363d">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#c8a349,#f0c55a);padding:32px 40px;text-align:center">
            <h1 style="margin:0;color:#000;font-size:22px;font-weight:800;letter-spacing:1px">${APP_NAME}</h1>
            <p style="margin:6px 0 0;color:#00000099;font-size:13px">Verificação de conta</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px">
            <p style="color:#c9d1d9;font-size:15px;margin:0 0 24px">
              Olá! Obrigado por se cadastrar no <strong style="color:#f0c55a">${APP_NAME}</strong>.
            </p>
            <p style="color:#8b949e;font-size:14px;margin:0 0 28px">
              Use o código abaixo para confirmar seu e-mail e ativar sua conta:
            </p>

            <!-- Código em destaque -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
              <tr><td align="center">
                <div style="display:inline-block;background:#0d1117;border:2px solid #c8a349;border-radius:10px;padding:20px 40px">
                  <span style="font-size:40px;font-weight:900;letter-spacing:10px;color:#f0c55a;font-family:monospace">${code}</span>
                </div>
              </td></tr>
            </table>

            <p style="color:#8b949e;font-size:13px;margin:0 0 8px;text-align:center">
              ⏱ Este código expira em <strong style="color:#c9d1d9">10 minutos</strong>.
            </p>

            <hr style="border:none;border-top:1px solid #30363d;margin:28px 0">

            <p style="color:#6e7681;font-size:12px;margin:0;text-align:center;line-height:1.6">
              Se você não criou uma conta no ${APP_NAME}, ignore este e-mail.<br>
              Nenhuma ação é necessária — sua conta não será criada.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
}
