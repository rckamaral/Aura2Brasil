import { Router } from "express";
import jwt from "jsonwebtoken";
import pool from "../lib/mysql";
import { getJwtSecret } from "../lib/security";

const router = Router();
const JWT_SECRET = getJwtSecret();
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

const CITY_BY_EMPIRE: Record<number, { mapIndex: number; x: number; y: number }> = {
  1: { mapIndex: 1, x: 469300, y: 964200 },
  2: { mapIndex: 21, x: 55700, y: 157900 },
  3: { mapIndex: 41, x: 969600, y: 278400 },
};

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

async function getAccountId(username: string): Promise<number | null> {
  const [accountRows] = await pool.execute(
    `SELECT id FROM ${ACCOUNT_TABLE} WHERE login = ? LIMIT 1`,
    [username]
  ) as [{ id: number | string }[], unknown];

  return accountRows.length ? Number(accountRows[0].id) : null;
}

router.get("/account/characters", async (req, res) => {
  const username = getAuthUsername(req.headers.authorization);
  if (!username) {
    res.status(401).json({ error: "Nao autenticado." });
    return;
  }

  try {
    const accountId = await getAccountId(username);

    if (!accountId) {
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
      [accountId]
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

router.post("/account/characters/:id/move-city", async (req, res) => {
  const username = getAuthUsername(req.headers.authorization);
  if (!username) {
    res.status(401).json({ error: "Nao autenticado." });
    return;
  }

  const characterId = Number(req.params.id);
  if (!Number.isInteger(characterId) || characterId <= 0) {
    res.status(400).json({ error: "Personagem invalido." });
    return;
  }

  try {
    const accountId = await getAccountId(username);
    if (!accountId) {
      res.status(404).json({ error: "Conta nao encontrada." });
      return;
    }

    const [rows] = await pool.execute(
      `
        SELECT
          p.id,
          p.name,
          p.empire,
          p.last_play,
          CASE
            WHEN p.last_play IS NULL OR p.last_play = '0000-00-00 00:00:00' THEN 999
            ELSE TIMESTAMPDIFF(MINUTE, p.last_play, NOW())
          END AS minutes_offline
        FROM ${PLAYER_TABLE} p
        WHERE p.id = ? AND p.account_id = ?
        LIMIT 1
      `,
      [characterId, accountId]
    ) as [any[], unknown];

    if (!rows.length) {
      res.status(404).json({ error: "Personagem nao encontrado." });
      return;
    }

    const minutesOffline = Number(rows[0].minutes_offline || 0);
    if (minutesOffline < 5) {
      res.status(400).json({ error: "Aguarde 5 minutos depois de deslogar para mover o personagem." });
      return;
    }

    const city = CITY_BY_EMPIRE[Number(rows[0].empire)] || CITY_BY_EMPIRE[1];
    await pool.execute(
      `
        UPDATE ${PLAYER_TABLE}
        SET x = ?, y = ?, map_index = ?, exit_x = ?, exit_y = ?, exit_map_index = ?
        WHERE id = ? AND account_id = ?
      `,
      [city.x, city.y, city.mapIndex, city.x, city.y, city.mapIndex, characterId, accountId]
    );

    res.json({ message: `${rows[0].name || "Personagem"} foi movido para a cidade.` });
  } catch (err) {
    req.log.error({ err, username, characterId }, "Error moving character to city");
    res.status(503).json({ error: "Nao foi possivel mover o personagem agora." });
  }
});

router.post("/account/character-delete-code", async (req, res) => {
  const username = getAuthUsername(req.headers.authorization);
  if (!username) {
    res.status(401).json({ error: "Nao autenticado." });
    return;
  }

  const code = typeof req.body?.code === "string" ? req.body.code.trim() : "";
  if (!/^[0-9]{7}$/.test(code)) {
    res.status(400).json({ error: "Use uma senha numerica de exatamente 7 digitos." });
    return;
  }

  try {
    const [result] = await pool.execute(
      `UPDATE ${ACCOUNT_TABLE} SET social_id = ? WHERE login = ?`,
      [code, username]
    ) as [any, unknown];

    if (!result.affectedRows) {
      res.status(404).json({ error: "Conta nao encontrada." });
      return;
    }

    res.json({ message: "Senha de exclusao do personagem atualizada." });
  } catch (err) {
    req.log.error({ err, username }, "Error updating character delete code");
    res.status(503).json({ error: "Nao foi possivel atualizar a senha agora." });
  }
});

export default router;
