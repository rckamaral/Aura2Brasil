import http from "http";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || "3000", 10);
const PUBLIC_DIR = path.join(__dirname, "public");
const API_URL = process.env.API_URL?.replace(/\/$/, "");
const ROOT_DOMAIN = "aura2.com.br";
const CANONICAL_DOMAIN = "www.aura2.com.br";

const SECURITY_HEADERS = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-site",
  "Content-Security-Policy": "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https:; media-src 'self'; connect-src 'self'; upgrade-insecure-requests",
};

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
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

function streamFile(req, res, filePath, stat) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || "application/octet-stream";
  const isVideo = ext === ".mp4" || ext === ".webm";
  const range = isVideo ? req.headers.range : undefined;

  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match) {
      res.writeHead(416, {
        ...SECURITY_HEADERS,
        "Content-Range": `bytes */${stat.size}`,
      });
      res.end();
      return;
    }

    const start = match[1] ? Number(match[1]) : 0;
    const end = match[2] ? Math.min(Number(match[2]), stat.size - 1) : stat.size - 1;
    if (start > end || start >= stat.size) {
      res.writeHead(416, { "Content-Range": `bytes */${stat.size}` });
      res.end();
      return;
    }

    res.writeHead(206, {
      ...SECURITY_HEADERS,
      "Accept-Ranges": "bytes",
      "Content-Range": `bytes ${start}-${end}/${stat.size}`,
      "Content-Length": end - start + 1,
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    });
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    fs.createReadStream(filePath, { start, end }).pipe(res);
    return;
  }

  res.writeHead(200, {
    ...SECURITY_HEADERS,
    "Content-Type": contentType,
    "Content-Length": stat.size,
    ...(isVideo ? { "Accept-Ranges": "bytes" } : {}),
  });
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  fs.createReadStream(filePath).pipe(res);
}

function serve(req, res) {
  const forwardedHost = req.headers["x-forwarded-host"];
  const requestHost = (Array.isArray(forwardedHost)
    ? forwardedHost[0]
    : forwardedHost || req.headers.host || ""
  )
    .split(",")[0]
    .trim()
    .split(":")[0]
    .toLowerCase();

  if (requestHost === ROOT_DOMAIN) {
    res.writeHead(308, {
      ...SECURITY_HEADERS,
      Location: `https://${CANONICAL_DOMAIN}${req.url || "/"}`,
    });
    res.end();
    return;
  }

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
      res.writeHead(502, {
        ...SECURITY_HEADERS,
        "Content-Type": "application/json",
      });
      res.end(JSON.stringify({ error: "API unavailable" }));
    });

    req.pipe(proxyReq);
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { ...SECURITY_HEADERS, Allow: "GET, HEAD" });
    res.end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url || "/", "http://localhost").pathname);
  } catch {
    res.writeHead(400, SECURITY_HEADERS);
    res.end("bad request");
    return;
  }

  const relativePath = pathname.replace(/^[/\\]+/, "") || "index.html";
  const filePath = path.resolve(PUBLIC_DIR, relativePath);
  const publicRoot = `${path.resolve(PUBLIC_DIR)}${path.sep}`;
  if (!filePath.startsWith(publicRoot)) {
    res.writeHead(404, SECURITY_HEADERS);
    res.end("not found");
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      const indexPath = path.join(PUBLIC_DIR, "index.html");
      fs.stat(indexPath, (err2, indexStat) => {
        if (err2) {
          res.writeHead(500, SECURITY_HEADERS);
          res.end("error");
          return;
        }
        streamFile(req, res, indexPath, indexStat);
      });
      return;
    }
    streamFile(req, res, filePath, stat);
  });
}

http.createServer(serve).listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
