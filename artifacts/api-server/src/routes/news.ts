import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db, newsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
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

const newsSchema = z.object({
  title: z.string().min(1).max(120),
  content: z.string().min(1).max(10000),
  imageUrl: z.string().url().max(500).refine((value) => /^https?:\/\//i.test(value)).optional().or(z.literal("")),
  published: z.boolean().optional(),
});

router.get("/news", async (req, res) => {
  try {
    const items = await db
      .select()
      .from(newsTable)
      .where(eq(newsTable.published, true))
      .orderBy(desc(newsTable.createdAt))
      .limit(20);
    res.json({ news: items });
  } catch (err) {
    req.log.error({ err }, "DB error fetching news");
    res.status(503).json({ error: "Erro ao buscar notícias." });
  }
});

router.get("/admin/news", async (req, res) => {
  const auth = verifyToken(req.headers.authorization);
  if (!isAdmin(auth)) { res.status(403).json({ error: "Acesso negado." }); return; }

  try {
    const items = await db.select().from(newsTable).orderBy(desc(newsTable.createdAt)).limit(50);
    res.json({ news: items });
  } catch (err) {
    req.log.error({ err }, "DB error fetching all news");
    res.status(503).json({ error: "Erro ao buscar notícias." });
  }
});

router.post("/admin/news", async (req, res) => {
  const auth = verifyToken(req.headers.authorization);
  if (!isAdmin(auth)) { res.status(403).json({ error: "Acesso negado." }); return; }

  const parsed = newsSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Dados inválidos." }); return; }

  const { title, content, imageUrl, published = true } = parsed.data;

  try {
    const [item] = await db.insert(newsTable).values({
      title,
      content,
      imageUrl: imageUrl || null,
      author: auth!.username,
      published,
    }).returning();

    req.log.info({ id: item.id, author: auth!.username }, "News created");
    res.status(201).json({ news: item });
  } catch (err) {
    req.log.error({ err }, "DB error creating news");
    res.status(503).json({ error: "Erro ao criar notícia." });
  }
});

router.patch("/admin/news/:id", async (req, res) => {
  const auth = verifyToken(req.headers.authorization);
  if (!isAdmin(auth)) { res.status(403).json({ error: "Acesso negado." }); return; }

  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "ID inválido." }); return; }

  const parsed = newsSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Dados inválidos." }); return; }

  try {
    const changes: Record<string, unknown> = {
      ...parsed.data,
      updatedAt: new Date(),
    };
    if ("imageUrl" in parsed.data) {
      changes.imageUrl = parsed.data.imageUrl || null;
    }

    const [updated] = await db
      .update(newsTable)
      .set(changes)
      .where(eq(newsTable.id, id))
      .returning();

    if (!updated) { res.status(404).json({ error: "Notícia não encontrada." }); return; }
    res.json({ news: updated });
  } catch (err) {
    req.log.error({ err }, "DB error updating news");
    res.status(503).json({ error: "Erro ao actualizar notícia." });
  }
});

router.delete("/admin/news/:id", async (req, res) => {
  const auth = verifyToken(req.headers.authorization);
  if (!isAdmin(auth)) { res.status(403).json({ error: "Acesso negado." }); return; }

  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "ID inválido." }); return; }

  try {
    const [deleted] = await db.delete(newsTable).where(eq(newsTable.id, id)).returning();
    if (!deleted) { res.status(404).json({ error: "Notícia não encontrada." }); return; }
    req.log.info({ id }, "News deleted");
    res.json({ message: "Notícia eliminada." });
  } catch (err) {
    req.log.error({ err }, "DB error deleting news");
    res.status(503).json({ error: "Erro ao eliminar notícia." });
  }
});

export default router;
