import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import pool from "../lib/mysql";
import { db, accountsTable, betaKeysTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { createResetToken, consumeResetToken } from "../lib/resetTokens";
import { createEmailChangeToken, consumeEmailChangeToken } from "../lib/emailChangeTokens";
import { sendEmailChangeConfirmationEmail, sendPasswordResetEmail } from "../lib/mailer";
import { notifyNewUser } from "../discord/notifications.js";

const router = Router();
const JWT_SECRET = process.env.SESSION_SECRET || "aura2-secret-fallback";
const JWT_EXPIRES = "7d";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const SITE_URL = (process.env.SITE_URL || "https://www.aura2.com.br").replace(/\/$/, "");

function apiBaseUrl(): string {
  const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
  return domain ? `https://${domain}` : "https://api.aura2.com.br";
}

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  betaKey: z.string().min(1),
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

function signToken(username: string, role: string = "player") {
  return jwt.sign({ username, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

async function isMySQLAvailable(): Promise<boolean> {
  try {
    await pool.execute("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

router.post("/auth/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos. Verifique todos os campos, incluindo o código beta." });
    return;
  }

  const { username, email, password, betaKey } = parsed.data;

  // Validate beta key
  const key = await db.select().from(betaKeysTable)
    .where(eq(betaKeysTable.code, betaKey.trim().toUpperCase()))
    .limit(1);

  if (!key.length) {
    res.status(403).json({ error: "Código beta inválido. Verifique se digitou corretamente." });
    return;
  }
  if (key[0].usedBy) {
    res.status(403).json({ error: "Este código beta já foi utilizado." });
    return;
  }

  const mysqlOk = await isMySQLAvailable();

  if (mysqlOk) {
    try {
      const [existing] = await pool.execute(
        "SELECT id FROM accounts WHERE username = ? OR email = ? LIMIT 1",
        [username, email]
      ) as [any[], any];

      if (existing.length > 0) {
        res.status(409).json({ error: "Usuário ou e-mail já está em uso." });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      await pool.execute(
        "INSERT INTO accounts (username, email, password_hash) VALUES (?, ?, ?)",
        [username, email, passwordHash]
      );
      await db.update(betaKeysTable).set({ usedBy: username, usedAt: new Date() }).where(eq(betaKeysTable.id, key[0].id));
      req.log.info({ username }, "New beta account registered (MySQL)");
      const token = signToken(username);
      res.status(201).json({ message: "Conta criada com sucesso!", username, token });
      notifyNewUser(username).catch(() => {});
      return;
    } catch (err) {
      req.log.error({ err }, "MySQL error during register");
    }
  }

  // Fallback: PostgreSQL
  try {
    const existing = await db.select().from(accountsTable).where(
      or(eq(accountsTable.username, username), eq(accountsTable.email, email))
    ).limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "Usuário ou e-mail já está em uso." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await db.insert(accountsTable).values({ username, email, passwordHash });
    await db.update(betaKeysTable).set({ usedBy: username, usedAt: new Date() }).where(eq(betaKeysTable.id, key[0].id));
    req.log.info({ username }, "New beta account registered (PostgreSQL fallback)");
    const token = signToken(username);
    res.status(201).json({ message: "Conta criada com sucesso!", username, token });
    notifyNewUser(username).catch(() => {});
  } catch (err) {
    req.log.error({ err }, "PG error during register");
    res.status(503).json({ error: "Servidor em manutenção. Tenta novamente em breve." });
  }
});

router.post("/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos." });
    return;
  }

  const { username, password } = parsed.data;
  const mysqlOk = await isMySQLAvailable();

  if (mysqlOk) {
    try {
      const [rows] = await pool.execute(
        "SELECT id, password_hash FROM accounts WHERE username = ? LIMIT 1",
        [username]
      ) as [any[], any];

      if (rows.length === 0) {
        res.status(401).json({ error: "Usuário ou senha incorretos." });
        return;
      }

      const valid = await bcrypt.compare(password, rows[0].password_hash);
      if (!valid) {
        res.status(401).json({ error: "Usuário ou senha incorretos." });
        return;
      }

      req.log.info({ username }, "Account logged in (MySQL)");
      const role = username === ADMIN_USERNAME ? "admin" : "player";
      const token = signToken(username, role);
      res.json({ message: "Login realizado com sucesso!", username, role, token });
      return;
    } catch (err) {
      req.log.error({ err }, "MySQL error during login");
    }
  }

  // Fallback: PostgreSQL
  try {
    const rows = await db.select().from(accountsTable).where(
      eq(accountsTable.username, username)
    ).limit(1);

    if (rows.length === 0) {
      res.status(401).json({ error: "Usuário ou senha incorretos." });
      return;
    }

    const valid = await bcrypt.compare(password, rows[0].passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Usuário ou senha incorretos." });
      return;
    }

    req.log.info({ username }, "Account logged in (PostgreSQL fallback)");
    const role = rows[0].role || "player";
    const token = signToken(username, role);
    res.json({ message: "Login realizado com sucesso!", username, role, token });
  } catch (err) {
    req.log.error({ err }, "PG error during login");
    res.status(503).json({ error: "Servidor em manutenção. Tenta novamente em breve." });
  }
});

router.post("/auth/change-password", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Não autenticado." });
    return;
  }
  const token = authHeader.slice(7);
  let username: string;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { username: string };
    username = payload.username;
  } catch {
    res.status(401).json({ error: "Token inválido ou expirado." });
    return;
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    res.status(400).json({ error: "Dados inválidos. A nova senha deve ter pelo menos 6 caracteres." });
    return;
  }

  const mysqlOk = await isMySQLAvailable();

  try {
    let storedHash: string | null = null;
    let isMySQL = false;

    if (mysqlOk) {
      const [rows] = await pool.execute(
        "SELECT password_hash FROM accounts WHERE username = ? LIMIT 1",
        [username]
      ) as [any[], any];
      if (rows.length > 0) { storedHash = rows[0].password_hash; isMySQL = true; }
    }

    if (!storedHash) {
      const rows = await db.select().from(accountsTable).where(eq(accountsTable.username, username)).limit(1);
      if (rows.length > 0) storedHash = rows[0].passwordHash;
    }

    if (!storedHash) {
      res.status(404).json({ error: "Conta não encontrada." });
      return;
    }

    const valid = await bcrypt.compare(currentPassword, storedHash);
    if (!valid) {
      res.status(401).json({ error: "Senha atual incorreta." });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    if (isMySQL) {
      await pool.execute("UPDATE accounts SET password_hash = ? WHERE username = ?", [newHash, username]);
    } else {
      await db.update(accountsTable).set({ passwordHash: newHash }).where(eq(accountsTable.username, username));
    }

    req.log.info({ username }, "Password changed successfully");
    res.json({ message: "Senha alterada com sucesso!" });
  } catch (err) {
    req.log.error({ err }, "DB error during change-password");
    res.status(503).json({ error: "Servidor em manutenção. Tenta novamente em breve." });
  }
});

router.post("/auth/change-email", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Não autenticado." });
    return;
  }
  const token = authHeader.slice(7);
  let username: string;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { username: string };
    username = payload.username;
  } catch {
    res.status(401).json({ error: "Token inválido ou expirado." });
    return;
  }

  const { newEmail, currentPassword } = req.body;
  if (!newEmail || typeof newEmail !== "string" || !currentPassword) {
    res.status(400).json({ error: "Dados inválidos." });
    return;
  }

  const emailSchema = z.string().email();
  if (!emailSchema.safeParse(newEmail).success) {
    res.status(400).json({ error: "E-mail inválido." });
    return;
  }

  const mysqlOk = await isMySQLAvailable();

  try {
    let storedHash: string | null = null;
    let currentEmail: string | null = null;
    let isMySQL = false;

    if (mysqlOk) {
      const [rows] = await pool.execute(
        "SELECT password_hash, email FROM accounts WHERE username = ? LIMIT 1",
        [username]
      ) as [any[], any];
      if (rows.length > 0) { storedHash = rows[0].password_hash; currentEmail = rows[0].email; isMySQL = true; }

      if (storedHash) {
        const [emailCheck] = await pool.execute(
          "SELECT id FROM accounts WHERE email = ? AND username != ? LIMIT 1",
          [newEmail, username]
        ) as [any[], any];
        if (emailCheck.length > 0) {
          res.status(409).json({ error: "Este e-mail já está em uso." });
          return;
        }
      }
    }

    if (!storedHash) {
      const rows = await db.select().from(accountsTable).where(eq(accountsTable.username, username)).limit(1);
      if (rows.length > 0) { storedHash = rows[0].passwordHash; currentEmail = rows[0].email; }

      if (storedHash) {
        const emailCheck = await db.select().from(accountsTable).where(eq(accountsTable.email, newEmail)).limit(1);
        if (emailCheck.length > 0 && emailCheck[0].username !== username) {
          res.status(409).json({ error: "Este e-mail já está em uso." });
          return;
        }
      }
    }

    if (!storedHash) {
      res.status(404).json({ error: "Conta não encontrada." });
      return;
    }

    const valid = await bcrypt.compare(currentPassword, storedHash);
    if (!valid) {
      res.status(401).json({ error: "Senha atual incorreta." });
      return;
    }

    if (!currentEmail) {
      res.status(404).json({ error: "E-mail atual nao encontrado." });
      return;
    }

    const emailToken = createEmailChangeToken(username, currentEmail, newEmail);
    const confirmUrl = `${apiBaseUrl()}/api/auth/confirm-email-change?token=${emailToken}`;
    await sendEmailChangeConfirmationEmail(currentEmail, username, newEmail, confirmUrl);

    req.log.info({ username }, "Email change confirmation sent");
    res.json({ message: "Enviamos um link de confirmacao para o e-mail atual da conta." });
  } catch (err) {
    req.log.error({ err }, "DB error during change-email");
    res.status(503).json({ error: "Servidor em manutenção. Tenta novamente em breve." });
  }
});

router.get("/auth/confirm-email-change", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const entry = consumeEmailChangeToken(token);
  if (!entry) {
    res.redirect(`${SITE_URL}/conta?emailChange=invalid`);
    return;
  }

  const mysqlOk = await isMySQLAvailable();

  try {
    if (mysqlOk) {
      const [emailCheck] = await pool.execute(
        "SELECT id FROM accounts WHERE email = ? AND username != ? LIMIT 1",
        [entry.newEmail, entry.username]
      ) as [any[], any];
      if (emailCheck.length > 0) {
        res.redirect(`${SITE_URL}/conta?emailChange=used`);
        return;
      }

      const [result] = await pool.execute(
        "UPDATE accounts SET email = ? WHERE username = ? AND email = ?",
        [entry.newEmail, entry.username, entry.oldEmail]
      ) as [any, any];
      if (result.affectedRows > 0) {
        res.redirect(`${SITE_URL}/conta?emailChange=success`);
        return;
      }
    }

    const emailCheck = await db.select().from(accountsTable).where(eq(accountsTable.email, entry.newEmail)).limit(1);
    if (emailCheck.length > 0 && emailCheck[0].username !== entry.username) {
      res.redirect(`${SITE_URL}/conta?emailChange=used`);
      return;
    }

    await db.update(accountsTable).set({ email: entry.newEmail }).where(eq(accountsTable.username, entry.username));
    res.redirect(`${SITE_URL}/conta?emailChange=success`);
  } catch (err) {
    req.log.error({ err, username: entry.username }, "DB error during confirm-email-change");
    res.redirect(`${SITE_URL}/conta?emailChange=error`);
  }
});

router.get("/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Não autenticado." });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { username: string };
    res.json({ username: payload.username });
  } catch {
    res.status(401).json({ error: "Token inválido ou expirado." });
  }
});

router.post("/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "E-mail inválido." });
    return;
  }

  try {
    const mysqlOk = await isMySQLAvailable();
    let userEmail: string | null = null;
    let username: string | null = null;

    if (mysqlOk) {
      const [rows] = await pool.execute(
        "SELECT username, email FROM accounts WHERE email = ? LIMIT 1",
        [email]
      ) as [any[], any];
      if (rows.length > 0) { userEmail = rows[0].email; username = rows[0].username; }
    } else {
      const rows = await db.select().from(accountsTable).where(eq(accountsTable.email, email)).limit(1);
      if (rows.length > 0) { userEmail = rows[0].email; username = rows[0].username; }
    }

    if (userEmail && username) {
      const token = createResetToken(userEmail, username);
      const resetUrl = `${SITE_URL}/redefinir-senha?token=${token}`;
      try {
        await sendPasswordResetEmail(userEmail, resetUrl);
        req.log.info({ username }, "Password reset requested");
      } catch (err) {
        req.log.error({ err }, "Failed to send reset email");
      }
    }
  } catch (err) {
    req.log.warn({ err }, "DB error during forgot-password");
  }

  res.json({ message: "Se o e-mail existir, receberás as instruções." });
});

router.post("/auth/reset-password", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password || password.length < 6) {
    res.status(400).json({ error: "Dados inválidos." });
    return;
  }

  const entry = consumeResetToken(token);
  if (!entry) {
    res.status(400).json({ error: "Link inválido ou expirado." });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const mysqlOk = await isMySQLAvailable();

  try {
    if (mysqlOk) {
      await pool.execute("UPDATE accounts SET password_hash = ? WHERE email = ?", [passwordHash, entry.email]);
    } else {
      await db.update(accountsTable).set({ passwordHash }).where(eq(accountsTable.email, entry.email));
    }
    req.log.info({ username: entry.username }, "Password reset successfully");
    res.json({ message: "Senha redefinida com sucesso!" });
  } catch (err) {
    req.log.error({ err }, "DB error during reset-password");
    res.status(503).json({ error: "Servidor em manutenção. Tenta novamente em breve." });
  }
});

export default router;
