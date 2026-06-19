import express, { type Express, type RequestHandler } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
app.set("trust proxy", 1);

type RateLimitEntry = { count: number; resetAt: number };

function rateLimit(windowMs: number, maxRequests: number): RequestHandler {
  const requests = new Map<string, RateLimitEntry>();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const current = requests.get(key);

    if (!current || current.resetAt <= now) {
      requests.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (current.count >= maxRequests) {
      res.setHeader("Retry-After", Math.ceil((current.resetAt - now) / 1000));
      res.status(429).json({ error: "Muitas tentativas. Aguarde e tente novamente." });
      return;
    }

    current.count += 1;
    next();
  };
}
const ALLOWED_ORIGINS = new Set([
  "https://www.aura2.com.br",
  "https://aura2.com.br",
]);

app.use((_req, res, next) => {
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({
  origin(origin, callback) {
    if (
      !origin ||
      ALLOWED_ORIGINS.has(origin) ||
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    ) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
}));
app.use("/api/auth/login", rateLimit(15 * 60 * 1000, 15));
app.use("/api/auth/register", rateLimit(60 * 60 * 1000, 8));
app.use("/api/auth/forgot-password", rateLimit(60 * 60 * 1000, 8));
app.use("/api/auth/reset-password", rateLimit(60 * 60 * 1000, 12));
app.use("/api/partners/apply", rateLimit(60 * 60 * 1000, 8));
app.use("/api/donations/create-pix", rateLimit(5 * 60 * 1000, 20));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
