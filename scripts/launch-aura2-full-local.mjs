import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const logPath = path.join(root, "aura2-full-local.log");
const pidPath = path.join(root, "aura2-full-local.pid");
const out = fs.openSync(logPath, "a");

const child = spawn(
  "cmd.exe",
  ["/c", "node_modules\\.bin\\tsx.CMD", "scripts\\run-aura2-full-local.ts"],
  {
    cwd: root,
    env: {
      ...process.env,
      PORT: process.env.PORT ?? "5173",
      NODE_ENV: process.env.NODE_ENV ?? "development",
      DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://localhost/aura2",
      MYSQL_HOST: process.env.MYSQL_HOST ?? "190.102.43.61",
      MYSQL_PORT: process.env.MYSQL_PORT ?? "3306",
      MYSQL_USER: process.env.MYSQL_USER ?? "website",
      MYSQL_DATABASE: process.env.MYSQL_DATABASE ?? "website",
      ADMIN_USERNAME: process.env.ADMIN_USERNAME ?? "ercamaral",
    },
    detached: true,
    stdio: ["ignore", out, out],
    windowsHide: true,
  },
);

fs.writeFileSync(pidPath, String(child.pid));
child.unref();
console.log(`Aura2 local server starting on http://localhost:${process.env.PORT ?? "5173"}/`);
console.log(`Log: ${logPath}`);
