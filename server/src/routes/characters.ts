import { Router } from "express";
import type { Request, Response } from "express";
import { db } from "../db.js";
import { requireAuth } from "../auth.js";
import type { CharacterRow, ChargenSystem } from "../types.js";

export const charactersRouter = Router();

charactersRouter.use(requireAuth);

function toClient(row: CharacterRow) {
  return {
    id: row.id,
    name: row.name,
    system: row.system,
    data: JSON.parse(row.data),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

charactersRouter.get("/", (req: Request, res: Response) => {
  const rows = db
    .prepare("SELECT * FROM characters WHERE user_id = ? ORDER BY updated_at DESC")
    .all(req.session.userId) as CharacterRow[];
  res.json(rows.map(toClient));
});

charactersRouter.get("/:id", (req: Request, res: Response) => {
  const row = db
    .prepare("SELECT * FROM characters WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.session.userId) as CharacterRow | undefined;
  if (!row) return res.status(404).json({ error: "not found" });
  res.json(toClient(row));
});

charactersRouter.post("/", (req: Request, res: Response) => {
  const { name, system, data } = req.body ?? {};
  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "name is required" });
  }
  if (system !== "priority" && system !== "lifepath") {
    return res.status(400).json({ error: "system must be 'priority' or 'lifepath'" });
  }

  const info = db
    .prepare("INSERT INTO characters (user_id, name, system, data) VALUES (?, ?, ?, ?)")
    .run(req.session.userId, name.trim(), system as ChargenSystem, JSON.stringify(data ?? {}));

  const row = db
    .prepare("SELECT * FROM characters WHERE id = ?")
    .get(info.lastInsertRowid) as CharacterRow;
  res.status(201).json(toClient(row));
});

charactersRouter.put("/:id", (req: Request, res: Response) => {
  const existing = db
    .prepare("SELECT * FROM characters WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.session.userId) as CharacterRow | undefined;
  if (!existing) return res.status(404).json({ error: "not found" });

  const { name, data } = req.body ?? {};
  const nextName = typeof name === "string" && name.trim() ? name.trim() : existing.name;
  const nextData = data !== undefined ? JSON.stringify(data) : existing.data;

  db.prepare(
    "UPDATE characters SET name = ?, data = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(nextName, nextData, existing.id);

  const row = db.prepare("SELECT * FROM characters WHERE id = ?").get(existing.id) as CharacterRow;
  res.json(toClient(row));
});

charactersRouter.delete("/:id", (req: Request, res: Response) => {
  const info = db
    .prepare("DELETE FROM characters WHERE id = ? AND user_id = ?")
    .run(req.params.id, req.session.userId);
  if (info.changes === 0) return res.status(404).json({ error: "not found" });
  res.status(204).end();
});
