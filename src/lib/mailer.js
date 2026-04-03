import nodemailer from 'nodemailer'

function getTransporter() {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587')
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) return null

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

/**
 * Envia e-mail de recuperação de senha.
 * Se SMTP não estiver configurado, imprime o link no console (útil em dev).
 */
export async function sendResetEmail(email, resetUrl) {
  const transporter = getTransporter()
  const from = process.env.SMTP_FROM || 'noreply@azerothlegacy.com'

  if (!transporter) {
    console.log(`[mailer] SMTP não configurado. Link de reset para ${email}:\n${resetUrl}`)
    return
  }

  await transporter.sendMail({
    from: `"Azeroth Legacy" <${from}>`,
    to: email,
    subject: 'Recuperação de senha — Azeroth Legacy',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#c8a349">Azeroth Legacy</h2>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
        <p>Clique no botão abaixo para criar uma nova senha. O link expira em <strong>1 hora</strong>.</p>
        <a href="${resetUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#c8a349;color:#000;text-decoration:none;border-radius:6px;font-weight:bold">
          Redefinir Senha
        </a>
        <p style="color:#888;font-size:12px">Se você não solicitou isso, ignore este e-mail. Sua senha não será alterada.</p>
        <p style="color:#888;font-size:12px">Link: ${resetUrl}</p>
      </div>
    `,
  })
}
