const nodemailer = require('nodemailer')

function criarTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    }
  })
}

async function enviarEmailEmprestimoPendente({ pessoa_nome, pessoa_email, produto_nome, codigo_interno, data_emprestimo, instituicao_nome }) {
  if (!pessoa_email) return

  const transporter = criarTransporter()

  await transporter.sendMail({
    from: `"${instituicao_nome || 'Almoxarifado'}" <${process.env.SMTP_USER}>`,
    to: pessoa_email,
    subject: `Lembrete: devolução pendente — ${produto_nome}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #111827;">Lembrete de devolução</h2>
        <p style="color: #374151;">Olá, <strong>${pessoa_nome}</strong>!</p>
        <p style="color: #374151;">
          Você ainda possui um item pendente de devolução no almoxarifado:
        </p>
        <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0; font-size: 16px; font-weight: 700; color: #111827;">${produto_nome}</p>
          <p style="margin: 4px 0 0; font-size: 13px; color: #6b7280;">Código: ${codigo_interno}</p>
          <p style="margin: 4px 0 0; font-size: 13px; color: #6b7280;">Retirado em: ${new Date(data_emprestimo).toLocaleDateString('pt-BR')}</p>
        </div>
        <p style="color: #374151;">
          Por favor, devolva o item ao almoxarifado assim que possível.
        </p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
          ${instituicao_nome || 'Sistema de Almoxarifado'}
        </p>
      </div>
    `
  })
}

module.exports = { enviarEmailEmprestimoPendente }