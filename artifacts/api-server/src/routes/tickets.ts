import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db, ticketsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { notifyNewTicket } from "../discord/notifications.js";
import { getAdminUsername, getJwtSecret } from "../lib/security";

const router = Router();
const JWT_SECRET = getJwtSecret();
const ADMIN_USERNAME = getAdminUsername();

function verifyToken(authHeader: string | undefined): { username: string; role: string } | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as { username: string; role?: string };
    return { username: payload.username, role: payload.role || "player" };
  } catch {
    return null;
  }
}

function isAdmin(auth: { username: string; role: string } | null): boolean {
  if (!auth) return false;
  return auth.role === "admin" || auth.username === ADMIN_USERNAME;
}

const createTicketSchema = z.object({
  subject: z.string().min(3).max(120),
  message: z.string().min(10).max(2000),
});

const replySchema = z.object({
  reply: z.string().min(1).max(2000),
});

router.post("/tickets", async (req, res) => {
  const auth = verifyToken(req.headers.authorization);
  if (!auth) { res.status(401).json({ error: "Não autenticado." }); return; }

  const parsed = createTicketSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Dados inválidos." }); return; }

  try {
    const [ticket] = await db.insert(ticketsTable).values({
      username: auth.username,
      subject: parsed.data.subject,
      message: parsed.data.message,
      status: "open",
    }).returning();

    req.log.info({ id: ticket.id, username: auth.username }, "Ticket created");
    void notifyNewTicket(ticket.id, auth.username, parsed.data.subject, parsed.data.message);
    res.status(201).json({ ticket });
  } catch (err) {
    req.log.error({ err }, "DB error creating ticket");
    res.status(503).json({ error: "Erro ao criar ticket." });
  }
});

router.get("/tickets/mine", async (req, res) => {
  const auth = verifyToken(req.headers.authorization);
  if (!auth) { res.status(401).json({ error: "Não autenticado." }); return; }

  try {
    const tickets = await db
      .select()
      .from(ticketsTable)
      .where(eq(ticketsTable.username, auth.username))
      .orderBy(desc(ticketsTable.createdAt))
      .limit(20);

    res.json({ tickets });
  } catch (err) {
    req.log.error({ err }, "DB error fetching user tickets");
    res.status(503).json({ error: "Erro ao buscar tickets." });
  }
});

router.get("/admin/tickets", async (req, res) => {
  const auth = verifyToken(req.headers.authorization);
  if (!isAdmin(auth)) { res.status(403).json({ error: "Acesso negado." }); return; }

  try {
    const tickets = await db
      .select()
      .from(ticketsTable)
      .orderBy(desc(ticketsTable.createdAt))
      .limit(100);

    res.json({ tickets });
  } catch (err) {
    req.log.error({ err }, "DB error fetching all tickets");
    res.status(503).json({ error: "Erro ao buscar tickets." });
  }
});

router.post("/admin/tickets/:id/reply", async (req, res) => {
  const auth = verifyToken(req.headers.authorization);
  if (!isAdmin(auth)) { res.status(403).json({ error: "Acesso negado." }); return; }

  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "ID inválido." }); return; }

  const parsed = replySchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Resposta inválida." }); return; }

  try {
    const [updated] = await db
      .update(ticketsTable)
      .set({ adminReply: parsed.data.reply, status: "answered", updatedAt: new Date() })
      .where(eq(ticketsTable.id, id))
      .returning();

    if (!updated) { res.status(404).json({ error: "Ticket não encontrado." }); return; }
    req.log.info({ id, admin: auth!.username }, "Ticket replied");
    res.json({ ticket: updated });
  } catch (err) {
    req.log.error({ err }, "DB error replying to ticket");
    res.status(503).json({ error: "Erro ao responder ticket." });
  }
});

router.post("/admin/tickets/:id/close", async (req, res) => {
  const auth = verifyToken(req.headers.authorization);
  if (!isAdmin(auth)) { res.status(403).json({ error: "Acesso negado." }); return; }

  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "ID inválido." }); return; }

  try {
    const [updated] = await db
      .update(ticketsTable)
      .set({ status: "closed", updatedAt: new Date() })
      .where(eq(ticketsTable.id, id))
      .returning();

    if (!updated) { res.status(404).json({ error: "Ticket não encontrado." }); return; }
    res.json({ ticket: updated });
  } catch (err) {
    req.log.error({ err }, "DB error closing ticket");
    res.status(503).json({ error: "Erro ao fechar ticket." });
  }
});

export default router;
