import http from "http";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || "3000", 10);
const PUBLIC_DIR = path.join(__dirname, "public");
const API_URL = process.env.API_URL?.replace(/\/$/, "");

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".json": "application/json",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".webp": "image/webp",
};

function serve(req, res) {
  if (API_URL && req.url.startsWith("/api")) {
    const upstream = new URL(req.url, API_URL);
    const client = upstream.protocol === "https:" ? https : http;
    const proxyReq = client.request(
      upstream,
      {
        method: req.method,
        headers: {
          ...req.headers,
          host: upstream.host,
        },
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
        proxyRes.pipe(res);
      },
    );

    proxyReq.on("error", () => {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "API unavailable" }));
    });

    req.pipe(proxyReq);
    return;
  }

  const url = req.url.split("?")[0];
  const filePath = path.join(PUBLIC_DIR, url === "/" ? "index.html" : url);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      fs.readFile(path.join(PUBLIC_DIR, "index.html"), (err2, html) => {
        if (err2) { res.writeHead(500); res.end("error"); return; }
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
      });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
}

http.createServer(serve).listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
