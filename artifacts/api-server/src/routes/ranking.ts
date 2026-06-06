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
const QUEST_TABLE = "`player`.`quest`";
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
        LIMIT ${limit}
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

router.get("/ranking/guilds", async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);

  try {
    const hasGuild = await tableExists("player", "guild");
    const hasGuildMember = await tableExists("player", "guild_member");
    const hasPlayerIndex = await tableExists("player", "player_index");

    if (!hasGuild) {
      res.json({ guilds: [] });
      return;
    }

    const joins = [
      `LEFT JOIN ${PLAYER_TABLE} leader ON leader.id = g.master`,
      hasGuildMember
        ? `LEFT JOIN ${GUILD_MEMBER_TABLE} gm ON gm.guild_id = g.id`
        : "",
      hasPlayerIndex
        ? `LEFT JOIN ${PLAYER_INDEX_TABLE} pi ON pi.id = leader.account_id`
        : "",
    ].filter(Boolean).join(" ");

    const where: string[] = [];
    const params: Array<string | number> = [];

    if (search) {
      where.push("(g.name LIKE ? OR leader.name LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    const empireSelect = hasPlayerIndex ? "pi.empire" : "NULL";
    const empireGroupBy = hasPlayerIndex ? ", pi.empire" : "";

    const [rows] = await pool.execute(
      `
        SELECT
          g.id,
          g.name,
          g.level,
          leader.name AS leader,
          ${empireSelect} AS empire,
          ${hasGuildMember ? "COUNT(gm.pid)" : "0"} AS members
        FROM ${GUILD_TABLE} g
        ${joins}
        ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
        GROUP BY g.id, g.name, g.level, leader.name${empireGroupBy}
        ORDER BY g.level DESC, members DESC, g.id ASC
        LIMIT ${limit}
      `,
      params
    ) as [any[], unknown];

    const guilds = rows.map((row, index) => ({
      rank: index + 1,
      id: Number(row.id),
      name: row.name || "-",
      leader: row.leader || "-",
      members: Number(row.members || 0),
      kingdom: KINGDOM_BY_EMPIRE[Number(row.empire)] || "-",
      wins: 0,
      level: Number(row.level || 0),
    }));

    res.json({ guilds });
  } catch (err) {
    req.log.error({ err }, "Error loading guild ranking");
    res.status(503).json({ error: "Erro ao buscar ranking de guilds." });
  }
});

router.get("/ranking/pvp", async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);

  try {
    const hasQuest = await tableExists("player", "quest");
    const hasPlayerIndex = await tableExists("player", "player_index");

    if (!hasQuest) {
      res.json({ players: [] });
      return;
    }

    const joins = [
      `JOIN ${PLAYER_TABLE} p ON p.id = q.dwPID`,
      `LEFT JOIN ${ACCOUNT_TABLE} a ON a.id = p.account_id`,
      hasPlayerIndex ? `LEFT JOIN ${PLAYER_INDEX_TABLE} pi ON pi.id = p.account_id` : "",
      `LEFT JOIN (
        SELECT dwPID, MAX(lValue) AS deaths
        FROM ${QUEST_TABLE}
        WHERE szName = 'rankplayer'
          AND szState IN ('player_dead', 'player_death', 'death', 'deaths')
        GROUP BY dwPID
      ) d ON d.dwPID = q.dwPID`,
    ].filter(Boolean).join(" ");

    const where: string[] = [
      "q.szName = 'rankplayer'",
      "q.szState = 'player_kill'",
      "q.lValue > 0",
      "COALESCE(a.status, 'OK') = 'OK'",
      "COALESCE(a.web_admin, 0) = 0",
      "COALESCE(a.user_admin, 0) = 0",
    ];
    const params: Array<string | number> = [];

    if (search) {
      where.push("(p.name LIKE ? OR a.login LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.execute(
      `
        SELECT
          p.id,
          p.name,
          p.job,
          ${hasPlayerIndex ? "pi.empire" : "NULL AS empire"},
          q.lValue AS kills,
          COALESCE(d.deaths, 0) AS deaths
        FROM ${QUEST_TABLE} q
        ${joins}
        WHERE ${where.join(" AND ")}
        ORDER BY q.lValue DESC, deaths ASC, p.id ASC
        LIMIT ${limit}
      `,
      params
    ) as [any[], unknown];

    const players = rows.map((row, index) => {
      const kills = Number(row.kills || 0);
      const deaths = Number(row.deaths || 0);
      return {
        rank: index + 1,
        id: Number(row.id),
        name: row.name || "-",
        class: CLASS_BY_JOB[Number(row.job)] || "Guerreiro",
        kingdom: KINGDOM_BY_EMPIRE[Number(row.empire)] || "-",
        kills,
        deaths,
        ratio: deaths > 0 ? (kills / deaths).toFixed(1) : kills.toFixed(1),
      };
    });

    res.json({ players });
  } catch (err) {
    req.log.error({ err }, "Error loading PvP ranking");
    res.status(503).json({ error: "Erro ao buscar ranking PvP." });
  }
});

router.get("/ranking/bosses", async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);

  try {
    const hasQuest = await tableExists("player", "quest");
    const hasPlayerIndex = await tableExists("player", "player_index");

    if (!hasQuest) {
      res.json({ players: [] });
      return;
    }

    const joins = [
      `JOIN ${PLAYER_TABLE} p ON p.id = q.dwPID`,
      `LEFT JOIN ${ACCOUNT_TABLE} a ON a.id = p.account_id`,
      hasPlayerIndex ? `LEFT JOIN ${PLAYER_INDEX_TABLE} pi ON pi.id = p.account_id` : "",
    ].filter(Boolean).join(" ");

    const where: string[] = [
      "q.szName = 'rankplayer'",
      "q.szState = 'boss'",
      "q.lValue > 0",
      "COALESCE(a.status, 'OK') = 'OK'",
      "COALESCE(a.web_admin, 0) = 0",
      "COALESCE(a.user_admin, 0) = 0",
    ];
    const params: Array<string | number> = [];

    if (search) {
      where.push("(p.name LIKE ? OR a.login LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.execute(
      `
        SELECT
          p.id,
          p.name,
          p.job,
          ${hasPlayerIndex ? "pi.empire" : "NULL AS empire"},
          q.lValue AS bosses
        FROM ${QUEST_TABLE} q
        ${joins}
        WHERE ${where.join(" AND ")}
        ORDER BY q.lValue DESC, p.id ASC
        LIMIT ${limit}
      `,
      params
    ) as [any[], unknown];

    const players = rows.map((row, index) => ({
      rank: index + 1,
      id: Number(row.id),
      name: row.name || "-",
      class: CLASS_BY_JOB[Number(row.job)] || "Guerreiro",
      kingdom: KINGDOM_BY_EMPIRE[Number(row.empire)] || "-",
      bosses: Number(row.bosses || 0),
    }));

    res.json({ players });
  } catch (err) {
    req.log.error({ err }, "Error loading boss ranking");
    res.status(503).json({ error: "Erro ao buscar ranking de bosses." });
  }
});

export default router;
