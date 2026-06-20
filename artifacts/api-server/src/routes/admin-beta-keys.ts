import { Router } from "express";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import { db, betaKeysTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getAdminUsername, getJwtSecret } from "../lib/security";

const router = Router();
const JWT_SECRET = getJwtSecret();
const ADMIN_USERNAME = getAdminUsername();

function verifyAdmin(authHeader: string | undefined): boolean {
  if (!authHeader?.startsWith("Bearer ")) return false;
  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as { username: string; role?: string };
    return payload.role === "admin" || payload.username === ADMIN_USERNAME;
  } catch {
    return false;
  }
}

function generateCode(): string {
  const part = () => randomBytes(3).toString("hex").toUpperCase();
  return `AURA2-${part()}-${part()}`;
}

router.get("/admin/beta-keys", async (req, res) => {
  if (!verifyAdmin(req.headers.authorization)) {
    res.status(403).json({ error: "Acesso negado." });
    return;
  }
  try {
    const keys = await db.select().from(betaKeysTable).orderBy(betaKeysTable.createdAt);
    res.json({ keys });
  } catch (err) {
    req.log.error({ err }, "Error fetching beta keys");
    res.status(500).json({ error: "Erro ao buscar chaves." });
  }
});

router.post("/admin/beta-keys/generate", async (req, res) => {
  if (!verifyAdmin(req.headers.authorization)) {
    res.status(403).json({ error: "Acesso negado." });
    return;
  }
  const count = Math.min(Math.max(Math.trunc(Number(req.body?.count) || 1), 1), 50);
  try {
    const codes = Array.from({ length: count }, () => ({ code: generateCode() }));
    const inserted = await db.insert(betaKeysTable).values(codes).returning();
    req.log.info({ count }, "Beta keys generated");
    res.status(201).json({ keys: inserted });
  } catch (err) {
    req.log.error({ err }, "Error generating beta keys");
    res.status(500).json({ error: "Erro ao gerar chaves." });
  }
});

router.delete("/admin/beta-keys/:id", async (req, res) => {
  if (!verifyAdmin(req.headers.authorization)) {
    res.status(403).json({ error: "Acesso negado." });
    return;
  }
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "ID invÃ¡lido." });
    return;
  }
  try {
    const deleted = await db.delete(betaKeysTable).where(eq(betaKeysTable.id, id)).returning();
    if (!deleted.length) {
      res.status(404).json({ error: "Chave não encontrada." });
      return;
    }
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Error deleting beta key");
    res.status(500).json({ error: "Erro ao remover chave." });
  }
});

export default router;
