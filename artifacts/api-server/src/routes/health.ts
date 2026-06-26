import { Router, type IRouter } from "express";
import jwt from "jsonwebtoken";
import { HealthCheckResponse } from "@workspace/api-zod";
import pool from "../lib/mysql";
import { getAdminUsername, getJwtSecret } from "../lib/security";

const router: IRouter = Router();
const JWT_SECRET = getJwtSecret();
const ADMIN_USERNAME = getAdminUsername();
const MYSQL_GAME_ACCOUNT_DB = process.env.MYSQL_GAME_ACCOUNT_DB || "account";

function verifyAdmin(authHeader: string | undefined): boolean {
  if (!authHeader?.startsWith("Bearer ")) return false;
  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as { username: string; role?: string };
    return payload.role === "admin" || payload.username === ADMIN_USERNAME;
  } catch {
    return false;
  }
}

async function tableExists(schema: string, table: string): Promise<boolean> {
  const [rows] = await pool.execute(
    "SELECT COUNT(*) AS total FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?",
    [schema, table],
  ) as [{ total: number | string }[], unknown];

  return Number(rows[0]?.total || 0) > 0;
}

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/admin/db-health", async (req, res) => {
  if (!verifyAdmin(req.headers.authorization)) {
    res.status(403).json({ error: "Acesso negado." });
    return;
  }

  const config = {
    hostConfigured: Boolean(process.env.MYSQL_HOST),
    port: Number(process.env.MYSQL_PORT) || 3306,
    userConfigured: Boolean(process.env.MYSQL_USER),
    passwordConfigured: Boolean(process.env.MYSQL_PASSWORD),
    defaultDatabase: process.env.MYSQL_DATABASE || null,
    accountDatabase: MYSQL_GAME_ACCOUNT_DB,
  };

  try {
    await pool.execute("SELECT 1");

    const tables = {
      account: await tableExists(MYSQL_GAME_ACCOUNT_DB, "account"),
      player: await tableExists("player", "player"),
      playerIndex: await tableExists("player", "player_index"),
      guild: await tableExists("player", "guild"),
      guildMember: await tableExists("player", "guild_member"),
    };

    res.json({ mysql: "ok", config, tables });
  } catch (err) {
    const error = err instanceof Error ? err.message : "Erro desconhecido";
    req.log.error({ err }, "MySQL admin health check failed");
    res.status(503).json({ mysql: "error", config, error });
  }
});

export default router;
