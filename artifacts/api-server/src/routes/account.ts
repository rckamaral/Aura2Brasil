import { Router } from "express";
import jwt from "jsonwebtoken";
import pool from "../lib/mysql";

const router = Router();
const JWT_SECRET = process.env.SESSION_SECRET || "aura2-secret-fallback";
const MYSQL_GAME_ACCOUNT_DB = process.env.MYSQL_GAME_ACCOUNT_DB || "account";

function mysqlIdent(name: string): string {
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    throw new Error(`Invalid MySQL identifier: ${name}`);
  }
  return `\`${name}\``;
}

const ACCOUNT_TABLE = `${mysqlIdent(MYSQL_GAME_ACCOUNT_DB)}.\`account\``;
const PLAYER_TABLE = "`player`.`player`";
const GUILD_TABLE = "`player`.`guild`";
const GUILD_MEMBER_TABLE = "`player`.`guild_member`";

const CLASS_BY_JOB: Record<number, string> = {
  0: "Guerreiro",
  1: "Ninja",
  2: "Shura",
  3: "Shaman",
  4: "Guerreiro",
  5: "Ninja",
  6: "Shura",
  7: "Shaman",
};

function getAuthUsername(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;

  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as { username?: string };
    return typeof payload.username === "string" ? payload.username : null;
  } catch {
    return null;
  }
}

async function tableExists(schema: string, table: string): Promise<boolean> {
  const [rows] = await pool.execute(
    "SELECT COUNT(*) AS total FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?",
    [schema, table]
  ) as [{ total: number | string }[], unknown];

  return Number(rows[0]?.total || 0) > 0;
}

router.get("/account/characters", async (req, res) => {
  const username = getAuthUsername(req.headers.authorization);
  if (!username) {
    res.status(401).json({ error: "Nao autenticado." });
    return;
  }

  try {
    const [accountRows] = await pool.execute(
      `SELECT id FROM ${ACCOUNT_TABLE} WHERE login = ? LIMIT 1`,
      [username]
    ) as [{ id: number | string }[], unknown];

    if (!accountRows.length) {
      res.json({ characters: [] });
      return;
    }

    const hasGuild = await tableExists("player", "guild") && await tableExists("player", "guild_member");
    const guildJoin = hasGuild
      ? `LEFT JOIN ${GUILD_MEMBER_TABLE} gm ON gm.pid = p.id LEFT JOIN ${GUILD_TABLE} g ON g.id = gm.guild_id`
      : "";

    const [rows] = await pool.execute(
      `
        SELECT
          p.id,
          p.name,
          p.job,
          p.level,
          p.playtime,
          p.last_play,
          ${hasGuild ? "g.name AS guild" : "NULL AS guild"}
        FROM ${PLAYER_TABLE} p
        ${guildJoin}
        WHERE p.account_id = ?
        ORDER BY p.level DESC, p.exp DESC, p.id ASC
      `,
      [Number(accountRows[0].id)]
    ) as [any[], unknown];

    const characters = rows.map((row) => ({
      id: Number(row.id),
      name: row.name || "-",
      class: CLASS_BY_JOB[Number(row.job)] || "Guerreiro",
      level: Number(row.level || 0),
      guild: row.guild || "-",
      playtime: Number(row.playtime || 0),
      lastPlay: row.last_play || null,
    }));

    res.json({ characters });
  } catch (err) {
    req.log.error({ err, username }, "Error loading account characters");
    res.status(503).json({ error: "Nao foi possivel carregar os personagens agora." });
  }
});

export default router;
