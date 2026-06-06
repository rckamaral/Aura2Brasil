import crypto from "crypto";

interface EmailChangeTokenEntry {
  username: string;
  oldEmail: string;
  newEmail: string;
  expiresAt: number;
}

const tokens = new Map<string, EmailChangeTokenEntry>();

export function createEmailChangeToken(username: string, oldEmail: string, newEmail: string): string {
  const token = crypto.randomBytes(32).toString("hex");
  tokens.set(token, {
    username,
    oldEmail,
    newEmail,
    expiresAt: Date.now() + 60 * 60 * 1000,
  });
  return token;
}

export function consumeEmailChangeToken(token: string): EmailChangeTokenEntry | null {
  const entry = tokens.get(token);
  if (!entry) return null;
  tokens.delete(token);
  if (Date.now() > entry.expiresAt) return null;
  return entry;
}
