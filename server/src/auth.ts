import bcrypt from "bcrypt";
import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import { db } from "./db.js";
import type { User } from "./types.js";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

const SALT_ROUNDS = 12;

export const authRouter = Router();

authRouter.post("/register", async (req: Request, res: Response) => {
  const { username, password } = req.body ?? {};
  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "username and password are required" });
  }
  if (username.trim().length < 3) {
    return res.status(400).json({ error: "username must be at least 3 characters" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "password must be at least 8 characters" });
  }

  const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
  if (existing) {
    return res.status(409).json({ error: "username already taken" });
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const info = db
    .prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)")
    .run(username, hash);

  req.session.userId = Number(info.lastInsertRowid);
  res.status(201).json({ id: req.session.userId, username });
});

authRouter.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body ?? {};
  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "username and password are required" });
  }

  const user = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username) as User | undefined;
  if (!user) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  req.session.userId = user.id;
  res.json({ id: user.id, username: user.username });
});

authRouter.post("/logout", (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.status(204).end();
  });
});

authRouter.get("/me", (req: Request, res: Response) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "not logged in" });
  }
  const user = db
    .prepare("SELECT id, username FROM users WHERE id = ?")
    .get(req.session.userId);
  if (!user) {
    return res.status(401).json({ error: "not logged in" });
  }
  res.json(user);
});

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "not logged in" });
  }
  next();
}
