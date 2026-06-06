import { Router } from "express";
import pool from "../lib/mysql";

const router = Router();
const MYSQL_GAME_ACCOUNT_DB = process.env.MYSQL_GAME_ACCOUNT_DB || "account";

function mysqlIdent(name: string): string {
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    throw new Error(`Invalid MySQL identifier: ${name}`);
  }
  return `\`${name}\``;
}

const PLAYER_TABLE = "`player`.`player`";
const PLAYER_INDEX_TABLE = "`player`.`player_index`";
const GUILD_TABLE = "`player`.`guild`";
const GUILD_MEMBER_TABLE = "`player`.`guild_member`";
const ACCOUNT_TABLE = `${mysqlIdent(MYSQL_GAME_ACCOUNT_DB)}.\`account\``;

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

const KINGDOM_BY_EMPIRE: Record<number, string> = {
  1: "Shinsoo",
  2: "Chunjo",
  3: "Jinno",
};

async function tableExists(schema: string, table: string): Promise<boolean> {
  const [rows] = await pool.execute(
    "SELECT COUNT(*) AS total FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?",
    [schema, table]
  ) as [{ total: number | string }[], unknown];

  return Number(rows[0]?.total || 0) > 0;
}

router.get("/ranking/players", async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);

  try {
    const hasPlayerIndex = await tableExists("player", "player_index");
    const hasGuild = await tableExists("player", "guild") && await tableExists("player", "guild_member");

    const joins = [
      `LEFT JOIN ${ACCOUNT_TABLE} a ON a.id = p.account_id`,
      hasPlayerIndex
        ? `LEFT JOIN ${PLAYER_INDEX_TABLE} pi ON pi.id = p.account_id`
        : "",
      hasGuild
        ? `LEFT JOIN ${GUILD_MEMBER_TABLE} gm ON gm.pid = p.id LEFT JOIN ${GUILD_TABLE} g ON g.id = gm.guild_id`
        : "",
    ].filter(Boolean).join(" ");

    const where: string[] = [
      "COALESCE(a.status, 'OK') = 'OK'",
      "COALESCE(a.web_admin, 0) = 0",
      "COALESCE(a.user_admin, 0) = 0",
    ];
    const params: Array<string | number> = [];

    if (search) {
      where.push("(p.name LIKE ? OR a.login LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    params.push(limit);

    const [rows] = await pool.execute(
      `
        SELECT
          p.id,
          p.name,
          p.job,
          p.level,
          p.exp,
          p.playtime,
          p.last_play,
          ${hasPlayerIndex ? "pi.empire" : "NULL AS empire"},
          ${hasGuild ? "g.name AS guild" : "NULL AS guild"}
        FROM ${PLAYER_TABLE} p
        ${joins}
        WHERE ${where.join(" AND ")}
        ORDER BY p.level DESC, p.exp DESC, p.playtime DESC, p.id ASC
        LIMIT ?
      `,
      params
    ) as [any[], unknown];

    const players = rows.map((row, index) => ({
      rank: index + 1,
      id: Number(row.id),
      name: row.name || "-",
      class: CLASS_BY_JOB[Number(row.job)] || "Guerreiro",
      level: Number(row.level || 0),
      guild: row.guild || "-",
      kingdom: KINGDOM_BY_EMPIRE[Number(row.empire)] || "-",
      playtime: Number(row.playtime || 0),
      lastPlay: row.last_play || null,
    }));

    res.json({ players });
  } catch (err) {
    req.log.error({ err }, "Error loading player ranking");
    res.status(503).json({ error: "Erro ao buscar ranking." });
  }
});

export default router;
