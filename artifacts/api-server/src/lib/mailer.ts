import nodemailer from "nodemailer";
import { logger } from "./logger";

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    logger.warn("SMTP not configured — e-mail sending disabled");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const transport = createTransport();
  if (!transport) {
    logger.warn({ to }, "SMTP not configured, skipping e-mail");
    return;
  }

  const from = process.env.SMTP_USER;

  await transport.sendMail({
    from: `"Aura2 - Season 1" <${from}>`,
    to,
    subject: "Recuperação de Senha — Aura2",
    html: `
      <div style="background:#0d0a06;color:#fff;font-family:Arial,sans-serif;padding:40px;max-width:500px;margin:auto;border-radius:8px">
        <h1 style="color:#d4a017;text-align:center">AURA 2</h1>
        <h2 style="text-align:center;margin-bottom:24px">Recuperação de Senha</h2>
        <p>Recebemos um pedido para redefinir a senha da tua conta.</p>
        <p>Clica no botão abaixo para criar uma nova senha:</p>
        <div style="text-align:center;margin:32px 0">
          <a href="${resetUrl}" style="background:#d4a017;color:#000;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block">
            Redefinir Senha
          </a>
        </div>
        <p style="color:#888;font-size:12px">Este link expira em 1 hora. Se não pediste a recuperação, ignora este e-mail.</p>
      </div>
    `,
  });

  logger.info({ to }, "Password reset e-mail sent");
}

export async function sendPartnerApplicationEmail(data: {
  channelName: string;
  platform: string;
  channelUrl: string;
  avgViewers: string;
  schedule: string;
  motivation: string;
  discordTag: string;
}) {
  const transport = createTransport();
  if (!transport) {
    logger.warn("SMTP not configured, skipping partner application e-mail");
    return;
  }

  const from = process.env.SMTP_USER;
  const to = "aura2brasil@gmail.com";

  const platformLabel: Record<string, string> = {
    twitch: "Twitch",
    youtube: "YouTube",
    kick: "Kick",
    other: "Outro",
  };

  await transport.sendMail({
    from: `"Aura2 - Season 1" <${from}>`,
    to,
    subject: `[Parceiros] Nova Candidatura — ${data.channelName}`,
    html: `
      <div style="background:#0d0a06;color:#fff;font-family:Arial,sans-serif;padding:40px;max-width:580px;margin:auto;border-radius:8px;border:1px solid #2a1e08">
        <h1 style="color:#d4a017;text-align:center;margin:0 0 4px">AURA 2</h1>
        <p style="text-align:center;color:#888;margin:0 0 28px;font-size:13px">Programa de Parceiros — Temporada 1</p>
        <h2 style="color:#fff;border-bottom:1px solid #2a1e08;padding-bottom:12px;margin-bottom:24px">Nova Candidatura de Parceiro</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:10px 0;color:#888;font-size:13px;width:160px">Canal</td>
            <td style="padding:10px 0;color:#fff;font-weight:bold">${data.channelName}</td>
          </tr>
          <tr style="border-top:1px solid #1a1208">
            <td style="padding:10px 0;color:#888;font-size:13px">Plataforma</td>
            <td style="padding:10px 0;color:#fff">${platformLabel[data.platform] ?? data.platform}</td>
          </tr>
          <tr style="border-top:1px solid #1a1208">
            <td style="padding:10px 0;color:#888;font-size:13px">Link</td>
            <td style="padding:10px 0"><a href="${data.channelUrl}" style="color:#d4a017">${data.channelUrl}</a></td>
          </tr>
          <tr style="border-top:1px solid #1a1208">
            <td style="padding:10px 0;color:#888;font-size:13px">Viewers médios</td>
            <td style="padding:10px 0;color:#fff">${data.avgViewers}</td>
          </tr>
          <tr style="border-top:1px solid #1a1208">
            <td style="padding:10px 0;color:#888;font-size:13px">Frequência</td>
            <td style="padding:10px 0;color:#fff">${data.schedule}</td>
          </tr>
          <tr style="border-top:1px solid #1a1208">
            <td style="padding:10px 0;color:#888;font-size:13px">Discord</td>
            <td style="padding:10px 0;color:#fff">${data.discordTag}</td>
          </tr>
          <tr style="border-top:1px solid #1a1208">
            <td style="padding:10px 0;color:#888;font-size:13px;vertical-align:top">Motivação</td>
            <td style="padding:10px 0;color:#fff;line-height:1.6">${data.motivation.replace(/\n/g, "<br>")}</td>
          </tr>
        </table>
        <p style="color:#555;font-size:11px;margin-top:28px;text-align:center">Aura2 — Sistema automático de candidaturas</p>
      </div>
    `,
  });

  logger.info({ channelName: data.channelName }, "Partner application e-mail sent");
}
