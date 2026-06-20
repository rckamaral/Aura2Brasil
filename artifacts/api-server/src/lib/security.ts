const DEVELOPMENT_JWT_SECRET = "aura2-development-only-secret";

export function getJwtSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();

  if (secret && secret.length >= 32) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must contain at least 32 characters in production");
  }

  return DEVELOPMENT_JWT_SECRET;
}

export function getAdminUsername(): string {
  const username = process.env.ADMIN_USERNAME?.trim();

  if (username) return username;

  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_USERNAME is required in production");
  }

  return "admin";
}
