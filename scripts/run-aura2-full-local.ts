import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "artifacts", "aura2-website", "dist", "public");

process.env.NODE_ENV ??= "development";
process.env.PORT ??= "5173";
process.env.DATABASE_URL ??= "postgresql://localhost/aura2";
process.env.MYSQL_HOST ??= "190.102.43.61";
process.env.MYSQL_PORT ??= "3306";
process.env.MYSQL_USER ??= "website";
process.env.MYSQL_DATABASE ??= "website";
process.env.ADMIN_USERNAME ??= "ercamaral";

const [{ default: app }, { initMySQL }, { initDiscord }, { logger }] = await Promise.all([
  import("../artifacts/api-server/src/app"),
  import("../artifacts/api-server/src/lib/mysql"),
  import("../artifacts/api-server/src/discord/index.js"),
  import("../artifacts/api-server/src/lib/logger"),
]);

await initMySQL().catch((err) => {
  logger.warn({ err }, "MySQL unavailable - server will start without database");
});

app.use(express.static(publicDir));
app.use((_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

const port = Number(process.env.PORT);
if (!Number.isFinite(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${process.env.PORT}"`);
}

if (!fs.existsSync(path.join(publicDir, "index.html"))) {
  throw new Error(`Frontend build not found at ${publicDir}`);
}

app.listen(port, "0.0.0.0", () => {
  logger.info({ port }, "Aura2 full local server listening");
});

initDiscord().catch((err) => {
  logger.warn({ err }, "Discord bot failed to start - continuing without it");
});
