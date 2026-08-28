import type { Request, Response, NextFunction } from "express";
import { timingSafeEqual } from "node:crypto";

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Read-only bearer-token auth for the assistant export API (routes/assistant.ts).
 * Deliberately separate from the session-cookie auth in auth.ts: a single
 * shared secret from ASSISTANT_READ_TOKEN, not scoped to a user account or
 * character, since only the maintainer's own coding-assistant session is
 * meant to hold it. Fails closed (401) if the token isn't configured.
 */
export function requireAssistantToken(req: Request, res: Response, next: NextFunction) {
  const configured = process.env.ASSISTANT_READ_TOKEN;
  const header = req.header("authorization") ?? "";
  const match = /^Bearer (.+)$/.exec(header);

  if (!configured || !match || !safeEqual(match[1], configured)) {
    return res.status(401).json({ error: "unauthorized" });
  }
  next();
}
