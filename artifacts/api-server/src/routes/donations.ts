import { Router } from "express";
import { createHmac, timingSafeEqual } from "node:crypto";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db, donationsTable, accountsTable } from "@workspace/db";
import { and, eq, desc } from "drizzle-orm";
import { notifyDonation } from "../discord/notifications.js";
import pool from "../lib/mysql";
import { getAdminUsername, getJwtSecret } from "../lib/security";

const router = Router();
const JWT_SECRET = getJwtSecret();
const ADMIN_USERNAME = getAdminUsername();
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || "";
const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET || "";
const MYSQL_GAME_ACCOUNT_DB = process.env.MYSQL_GAME_ACCOUNT_DB || "account";

function mysqlIdent(name: string): string {
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    throw new Error(`Invalid MySQL identifier: ${name}`);
  }
  return `\`${name}\``;
}

const METIN_ACCOUNT_TABLE = `${mysqlIdent(MYSQL_GAME_ACCOUNT_DB)}.\`account\``;

const CASH_PACKAGES = [
  { packageLabel: "10.000 Moedas Cash", coinsAmount: 10000, priceBrl: 10 },
  { packageLabel: "22.000 Moedas Cash", coinsAmount: 22000, priceBrl: 20 },
  { packageLabel: "65.000 Moedas Cash", coinsAmount: 65000, priceBrl: 50 },
  { packageLabel: "135.000 Moedas Cash", coinsAmount: 135000, priceBrl: 100 },
  { packageLabel: "275.000 Moedas Cash", coinsAmount: 275000, priceBrl: 200 },
  { packageLabel: "420.000 Moedas Cash", coinsAmount: 420000, priceBrl: 300 },
  { packageLabel: "700.000 Moedas Cash", coinsAmount: 700000, priceBrl: 500 },
  { packageLabel: "1.000.000 Moedas Cash", coinsAmount: 1000000, priceBrl: 700 },
  { packageLabel: "1.500.000 Moedas Cash", coinsAmount: 1500000, priceBrl: 1000 },
] as const;

function verifyToken(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as { username: string };
    return payload.username;
  } catch {
    return null;
  }
}

function getWebhookUrl(): string {
  const domain =
    process.env.RAILWAY_PUBLIC_DOMAIN ||
    process.env.REPLIT_DOMAINS?.split(",")[0] ||
    "www.aura2.com.br";
  return `https://${domain}/api/webhooks/mercadopago`;
}

function getHeaderValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function hasValidMercadoPagoSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string,
): boolean {
  if (!MP_WEBHOOK_SECRET) return false;

  const signatureParts = Object.fromEntries(
    xSignature.split(",").map((part) => {
      const [key, ...value] = part.trim().split("=");
      return [key, value.join("=")];
    }),
  );
  const timestamp = signatureParts.ts;
  const receivedHash = signatureParts.v1;
  if (!timestamp || !receivedHash || !xRequestId || !dataId) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${timestamp};`;
  const expectedHash = createHmac("sha256", MP_WEBHOOK_SECRET)
    .update(manifest)
    .digest("hex");

  const received = Buffer.from(receivedHash, "utf8");
  const expected = Buffer.from(expectedHash, "utf8");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

type RouteLogger = {
  error: (obj: unknown, msg?: string) => void;
  info: (obj: unknown, msg?: string) => void;
};

async function creditGameCash(username: string, amount: number): Promise<boolean> {
  const [result] = await pool.execute(
    `UPDATE ${METIN_ACCOUNT_TABLE} SET cash = COALESCE(cash, 0) + ? WHERE login = ?`,
    [amount, username]
  ) as [{ affectedRows?: number }, unknown];

  return (result.affectedRows || 0) > 0;
}

async function approveDonationAndCreditCash(
  donation: typeof donationsTable.$inferSelect,
  notes: string,
  log: RouteLogger,
) {
  const [updated] = await db
    .update(donationsTable)
    .set({ status: "approved", notes, updatedAt: new Date() })
    .where(and(
      eq(donationsTable.id, donation.id),
      eq(donationsTable.status, "pending"),
    ))
    .returning();

  if (!updated) return null;

  try {
    const credited = await creditGameCash(updated.username, updated.coinsAmount);
    if (!credited) {
      await db.update(donationsTable)
        .set({
          notes: `${notes} | Cash NAO creditado: conta nao encontrada no MySQL do jogo.`,
          updatedAt: new Date(),
        })
        .where(eq(donationsTable.id, updated.id));
      log.error({ donationId: updated.id, username: updated.username }, "Donation approved but game account was not found");
      return updated;
    }

    await db.update(donationsTable)
      .set({
        notes: `${notes} | Cash creditado no jogo: ${updated.coinsAmount}`,
        updatedAt: new Date(),
      })
      .where(eq(donationsTable.id, updated.id));

    log.info({ donationId: updated.id, username: updated.username, cash: updated.coinsAmount }, "Donation cash credited to game account");
    return updated;
  } catch (err) {
    await db.update(donationsTable)
      .set({
        notes: `${notes} | Cash NAO creditado: erro ao acessar MySQL do jogo.`,
        updatedAt: new Date(),
      })
      .where(eq(donationsTable.id, updated.id));
    log.error({ err, donationId: updated.id, username: updated.username }, "Donation approved but cash credit failed");
    throw err;
  }
}

const createPixSchema = z.object({
  coinsAmount: z.number().int().positive(),
  priceBrl: z.number().int().positive(),
});

router.post("/donations/create-pix", async (req, res) => {
  const username = verifyToken(req.headers.authorization);
  if (!username) {
    res.status(401).json({ error: "Não autenticado." });
    return;
  }

  const parsed = createPixSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos." });
    return;
  }

  const selectedPackage = CASH_PACKAGES.find(
    (pkg) =>
      pkg.coinsAmount === parsed.data.coinsAmount &&
      pkg.priceBrl === parsed.data.priceBrl,
  );

  if (!selectedPackage) {
    req.log.warn(
      { username, body: parsed.data },
      "Rejected PIX request with invalid package values",
    );
    res.status(400).json({ error: "Pacote invÃ¡lido." });
    return;
  }

  const { packageLabel, coinsAmount, priceBrl } = selectedPackage;

  // Fetch real email from the database
  const [account] = await db
    .select({ email: accountsTable.email })
    .from(accountsTable)
    .where(eq(accountsTable.username, username))
    .limit(1);
  const payerEmail = account?.email || "jogador@aura2.com.br";

  try {
    const mpRes = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        "X-Idempotency-Key": `${username}-${Date.now()}`,
      },
      body: JSON.stringify({
        transaction_amount: priceBrl,
        description: `Aura2 - ${packageLabel}`,
        payment_method_id: "pix",
        payer: {
          email: payerEmail,
          first_name: username,
        },
        notification_url: getWebhookUrl(),
      }),
    });

    if (!mpRes.ok) {
      const err = await mpRes.text();
      req.log.error({ err, status: mpRes.status }, "MP API error creating payment");
      res.status(502).json({ error: "Erro ao gerar QR code. Tenta novamente." });
      return;
    }

    const mpData = await mpRes.json() as {
      id: number;
      point_of_interaction?: {
        transaction_data?: {
          qr_code?: string;
          qr_code_base64?: string;
          ticket_url?: string;
        };
      };
    };

    const paymentId = String(mpData.id);
    const txData = mpData.point_of_interaction?.transaction_data;
    const qrCode = txData?.qr_code;
    const qrCodeBase64 = txData?.qr_code_base64;

    const [donation] = await db.insert(donationsTable).values({
      username,
      packageLabel,
      coinsAmount,
      priceBrl,
      status: "pending",
      mpPaymentId: paymentId,
    }).returning();

    req.log.info({ username, donationId: donation.id, paymentId }, "PIX payment created");

    res.status(201).json({
      donationId: donation.id,
      paymentId,
      qrCode,
      qrCodeBase64,
    });
  } catch (err) {
    req.log.error({ err }, "Error creating PIX payment");
    res.status(503).json({ error: "Erro ao criar pagamento. Tenta novamente." });
  }
});

router.post("/webhooks/mercadopago", async (req, res) => {
  try {
    const body = req.body as { type?: string; data?: { id?: string }; action?: string };
    const queryDataId = typeof req.query["data.id"] === "string"
      ? req.query["data.id"]
      : "";
    const signatureDataId = queryDataId || String(body.data?.id || "");
    const signatureIsValid = hasValidMercadoPagoSignature(
      getHeaderValue(req.headers["x-signature"]),
      getHeaderValue(req.headers["x-request-id"]),
      signatureDataId,
    );

    if (!signatureIsValid) {
      req.log.warn({ requestId: req.headers["x-request-id"] }, "Rejected invalid Mercado Pago webhook signature");
      res.status(401).send("Invalid signature");
      return;
    }

    res.status(200).send("OK");

    if (body.type !== "payment" && body.action !== "payment.updated") return;

    const paymentId = body.data?.id;
    if (!paymentId) return;

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    });
    if (!mpRes.ok) return;

    const payment = await mpRes.json() as {
      status?: string;
      id?: number;
      transaction_amount?: number;
      currency_id?: string;
    };
    const mpStatus = payment.status;
    const isTerminal = mpStatus === "approved" || mpStatus === "cancelled" || mpStatus === "rejected";
    if (!isTerminal) return;

    const donations = await db
      .select()
      .from(donationsTable)
      .where(eq(donationsTable.mpPaymentId, String(payment.id)))
      .limit(1);

    if (!donations.length || donations[0].status !== "pending") return;

    if (
      Number(payment.transaction_amount) !== donations[0].priceBrl ||
      payment.currency_id !== "BRL"
    ) {
      req.log.error(
        {
          donationId: donations[0].id,
          paymentId,
          expectedAmount: donations[0].priceBrl,
          receivedAmount: payment.transaction_amount,
          currency: payment.currency_id,
        },
        "Rejected Mercado Pago payment with mismatched amount",
      );
      return;
    }

    const newStatus = mpStatus === "approved" ? "approved" : "cancelled";
    if (newStatus === "approved") {
      await approveDonationAndCreditCash(donations[0], `Atualizado via webhook MP: ${mpStatus}`, req.log);
    } else {
      await db
        .update(donationsTable)
        .set({ status: newStatus, notes: `Atualizado via webhook MP: ${mpStatus}`, updatedAt: new Date() })
        .where(eq(donationsTable.id, donations[0].id));
    }

    req.log.info({ donationId: donations[0].id, paymentId, newStatus }, "Donation updated via webhook");

    if (newStatus === "approved") {
      const d = donations[0];
      notifyDonation(d.username, d.packageLabel, d.coinsAmount, d.priceBrl).catch(() => {});
    }
  } catch (err) {
    req.log.error({ err }, "Error processing MP webhook");
  }
});

router.get("/donations/:id/status", async (req, res) => {
  const username = verifyToken(req.headers.authorization);
  if (!username) { res.status(401).json({ error: "Não autenticado." }); return; }

  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "ID inválido." }); return; }

  try {
    const [donation] = await db.select().from(donationsTable).where(eq(donationsTable.id, id)).limit(1);
    if (!donation) { res.status(404).json({ error: "Não encontrado." }); return; }
    if (donation.username !== username) { res.status(403).json({ error: "Acesso negado." }); return; }

    // For pending donations, cross-check with Mercado Pago in real time
    if (donation.status === "pending" && donation.mpPaymentId && MP_ACCESS_TOKEN) {
      try {
        const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${donation.mpPaymentId}`, {
          headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
        });
        if (mpRes.ok) {
          const mpData = await mpRes.json() as {
            status?: string;
            transaction_amount?: number;
            currency_id?: string;
          };
          const mpStatus = mpData.status;
          if (mpStatus === "approved") {
            if (
              Number(mpData.transaction_amount) !== donation.priceBrl ||
              mpData.currency_id !== "BRL"
            ) {
              req.log.error(
                {
                  donationId: donation.id,
                  expectedAmount: donation.priceBrl,
                  receivedAmount: mpData.transaction_amount,
                  currency: mpData.currency_id,
                },
                "Rejected polled Mercado Pago payment with mismatched amount",
              );
              res.status(409).json({ status: "pending" });
              return;
            }
            await approveDonationAndCreditCash(donation, "Confirmado via polling", req.log);
            res.json({ status: "approved" });
            return;
          } else if (mpStatus === "cancelled" || mpStatus === "rejected" || mpStatus === "expired") {
            await db.update(donationsTable)
              .set({ status: "cancelled", notes: `Expirado/cancelado via polling: ${mpStatus}`, updatedAt: new Date() })
              .where(eq(donationsTable.id, donation.id));
            res.json({ status: "cancelled" });
            return;
          }
        }
      } catch (mpErr) {
        req.log.warn({ mpErr }, "Could not check MP status during polling");
      }
    }

    res.json({ status: donation.status });
  } catch (err) {
    req.log.error({ err }, "DB error fetching donation status");
    res.status(503).json({ error: "Erro." });
  }
});

router.get("/donations/mine", async (req, res) => {
  const username = verifyToken(req.headers.authorization);
  if (!username) {
    res.status(401).json({ error: "Não autenticado." });
    return;
  }

  try {
    const donations = await db
      .select()
      .from(donationsTable)
      .where(eq(donationsTable.username, username))
      .orderBy(desc(donationsTable.createdAt))
      .limit(20);

    res.json({ donations });
  } catch (err) {
    req.log.error({ err }, "DB error fetching user donations");
    res.status(503).json({ error: "Erro ao buscar doações." });
  }
});

router.get("/admin/donations", async (req, res) => {
  const username = verifyToken(req.headers.authorization);
  if (!username || username !== ADMIN_USERNAME) {
    res.status(403).json({ error: "Acesso negado." });
    return;
  }

  try {
    const donations = await db
      .select()
      .from(donationsTable)
      .orderBy(desc(donationsTable.createdAt))
      .limit(100);

    res.json({ donations });
  } catch (err) {
    req.log.error({ err }, "DB error fetching all donations");
    res.status(503).json({ error: "Erro ao buscar doações." });
  }
});

const actionSchema = z.object({
  notes: z.string().max(2000).optional(),
});

router.post("/admin/donations/:id/approve", async (req, res) => {
  const username = verifyToken(req.headers.authorization);
  if (!username || username !== ADMIN_USERNAME) {
    res.status(403).json({ error: "Acesso negado." });
    return;
  }

  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "ID inválido." }); return; }

  const notes = actionSchema.safeParse(req.body).success ? actionSchema.parse(req.body).notes : undefined;

  try {
    const [currentDonation] = await db
      .select()
      .from(donationsTable)
      .where(eq(donationsTable.id, id))
      .limit(1);

    if (!currentDonation) {
      res.status(404).json({ error: "Doacao nao encontrada." });
      return;
    }

    if (currentDonation.status !== "pending") {
      res.json({ message: "Doacao ja processada.", donation: currentDonation });
      return;
    }

    const [updated] = await db
      .update(donationsTable)
      .set({ status: "approved", notes: notes ?? null, updatedAt: new Date() })
      .where(eq(donationsTable.id, id))
      .returning();

    if (!updated) { res.status(404).json({ error: "Doação não encontrada." }); return; }
    try {
      const credited = await creditGameCash(updated.username, updated.coinsAmount);
      await db.update(donationsTable)
        .set({
          notes: credited
            ? `${notes ?? "Aprovado manualmente"} | Cash creditado no jogo: ${updated.coinsAmount}`
            : `${notes ?? "Aprovado manualmente"} | Cash NAO creditado: conta nao encontrada no MySQL do jogo.`,
          updatedAt: new Date(),
        })
        .where(eq(donationsTable.id, updated.id));
      if (!credited) {
        req.log.error({ donationId: updated.id, username: updated.username }, "Donation approved but game account was not found");
      }
    } catch (cashErr) {
      req.log.error({ cashErr, donationId: updated.id, username: updated.username }, "Donation approved but cash credit failed");
      throw cashErr;
    }
    req.log.info({ adminUsername: username, donationId: id }, "Donation approved manually");
    res.json({ message: "Doação aprovada!", donation: updated });
    notifyDonation(updated.username, updated.packageLabel, updated.coinsAmount, updated.priceBrl).catch(() => {});
  } catch (err) {
    req.log.error({ err }, "DB error approving donation");
    res.status(503).json({ error: "Erro ao aprovar doação." });
  }
});

router.post("/admin/donations/:id/reject", async (req, res) => {
  const username = verifyToken(req.headers.authorization);
  if (!username || username !== ADMIN_USERNAME) {
    res.status(403).json({ error: "Acesso negado." });
    return;
  }

  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "ID inválido." }); return; }

  const notes = actionSchema.safeParse(req.body).success ? actionSchema.parse(req.body).notes : undefined;

  try {
    const [updated] = await db
      .update(donationsTable)
      .set({ status: "rejected", notes: notes ?? null, updatedAt: new Date() })
      .where(eq(donationsTable.id, id))
      .returning();

    if (!updated) { res.status(404).json({ error: "Doação não encontrada." }); return; }
    req.log.info({ adminUsername: username, donationId: id }, "Donation rejected manually");
    res.json({ message: "Doação rejeitada.", donation: updated });
  } catch (err) {
    req.log.error({ err }, "DB error rejecting donation");
    res.status(503).json({ error: "Erro ao rejeitar doação." });
  }
});

export default router;
