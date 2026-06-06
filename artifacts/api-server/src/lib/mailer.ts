import nodemailer from "nodemailer";
import { logger } from "./logger";

const DEFAULT_TO = "aura2brasil@gmail.com";
const RESEND_FROM = process.env.RESEND_FROM || "Aura2 <onboarding@resend.dev>";

async function sendResendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: RESEND_FROM, to, subject, html }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend e-mail failed: ${response.status} ${error}`);
  }

  return true;
}

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    logger.warn("SMTP not configured - e-mail sending disabled");
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

async function sendEmail(to: string, subject: string, html: string, logLabel: string) {
  if (await sendResendEmail(to, subject, html)) {
    logger.info({ to }, `${logLabel} sent via Resend`);
    return;
  }

  const transport = createTransport();
  if (!transport) {
    logger.warn({ to }, "No e-mail provider configured, skipping e-mail");
    return;
  }

  const from = process.env.SMTP_USER;
  await transport.sendMail({
    from: `"Aura2 - Season 1" <${from}>`,
    to,
    subject,
    html,
  });
  logger.info({ to }, `${logLabel} sent via SMTP`);
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await sendEmail(
    to,
    "Recuperacao de Senha - Aura2",
    `
      <div style="background:#0d0a06;color:#fff;font-family:Arial,sans-serif;padding:40px;max-width:500px;margin:auto;border-radius:8px">
        <h1 style="color:#d4a017;text-align:center">AURA 2</h1>
        <h2 style="text-align:center;margin-bottom:24px">Recuperacao de Senha</h2>
        <p>Recebemos um pedido para redefinir a senha da tua conta.</p>
        <p>Clique no botao abaixo para criar uma nova senha:</p>
        <div style="text-align:center;margin:32px 0">
          <a href="${resetUrl}" style="background:#d4a017;color:#000;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block">
            Redefinir Senha
          </a>
        </div>
        <p style="color:#888;font-size:12px">Este link expira em 1 hora. Se voce nao pediu a recuperacao, ignore este e-mail.</p>
      </div>
    `,
    "Password reset e-mail",
  );
}

export async function sendEmailChangeConfirmationEmail(to: string, username: string, newEmail: string, confirmUrl: string) {
  await sendEmail(
    to,
    "Confirmacao de troca de e-mail - Aura2",
    `
      <div style="background:#0d0a06;color:#fff;font-family:Arial,sans-serif;padding:40px;max-width:540px;margin:auto;border-radius:8px">
        <h1 style="color:#d4a017;text-align:center">AURA 2</h1>
        <h2 style="text-align:center;margin-bottom:24px">Confirmacao de troca de e-mail</h2>
        <p>Ola, <strong>${username}</strong>.</p>
        <p>Recebemos um pedido para trocar o e-mail da sua conta para:</p>
        <p style="color:#d4a017;font-weight:bold">${newEmail}</p>
        <p>Se foi voce, clique no botao abaixo para confirmar a alteracao.</p>
        <div style="text-align:center;margin:32px 0">
          <a href="${confirmUrl}" style="background:#d4a017;color:#000;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block">
            Confirmar troca de e-mail
          </a>
        </div>
        <p style="color:#888;font-size:12px">Este link expira em 1 hora. Se voce nao pediu essa troca, ignore este e-mail.</p>
      </div>
    `,
    "Email change confirmation",
  );
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
  const platformLabel: Record<string, string> = {
    twitch: "Twitch",
    youtube: "YouTube",
    kick: "Kick",
    other: "Outro",
  };

  await sendEmail(
    DEFAULT_TO,
    `[Parceiros] Nova Candidatura - ${data.channelName}`,
    `
      <div style="background:#0d0a06;color:#fff;font-family:Arial,sans-serif;padding:40px;max-width:580px;margin:auto;border-radius:8px;border:1px solid #2a1e08">
        <h1 style="color:#d4a017;text-align:center;margin:0 0 4px">AURA 2</h1>
        <p style="text-align:center;color:#888;margin:0 0 28px;font-size:13px">Programa de Parceiros - Temporada 1</p>
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
            <td style="padding:10px 0;color:#888;font-size:13px">Viewers medios</td>
            <td style="padding:10px 0;color:#fff">${data.avgViewers}</td>
          </tr>
          <tr style="border-top:1px solid #1a1208">
            <td style="padding:10px 0;color:#888;font-size:13px">Frequencia</td>
            <td style="padding:10px 0;color:#fff">${data.schedule}</td>
          </tr>
          <tr style="border-top:1px solid #1a1208">
            <td style="padding:10px 0;color:#888;font-size:13px">Discord</td>
            <td style="padding:10px 0;color:#fff">${data.discordTag}</td>
          </tr>
          <tr style="border-top:1px solid #1a1208">
            <td style="padding:10px 0;color:#888;font-size:13px;vertical-align:top">Motivacao</td>
            <td style="padding:10px 0;color:#fff;line-height:1.6">${data.motivation.replace(/\n/g, "<br>")}</td>
          </tr>
        </table>
        <p style="color:#555;font-size:11px;margin-top:28px;text-align:center">Aura2 - Sistema automatico de candidaturas</p>
      </div>
    `,
    "Partner application e-mail",
  );
}
