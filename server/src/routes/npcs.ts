import { Router } from "express";
import type { Request, Response } from "express";
import { db } from "../db.js";
import { requireAuth } from "../auth.js";
import type { NpcRow } from "../types.js";

export const npcsRouter = Router();

npcsRouter.use(requireAuth);

const NUMERIC_FIELDS = ["physicalMonitor", "stunMonitor", "physicalDamage", "stunDamage", "armor"] as const;

function isValidNpcData(data: unknown): boolean {
  if (data === null || typeof data !== "object") return true;
  const d = data as Record<string, unknown>;
  for (const key of NUMERIC_FIELDS) {
    if (key in d) {
      const value = d[key];
      if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return false;
    }
  }
  return true;
}

function toClient(row: NpcRow) {
  return {
    id: row.id,
    name: row.name,
    data: JSON.parse(row.data),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

npcsRouter.get("/", (req: Request, res: Response) => {
  const rows = db
    .prepare("SELECT * FROM npcs WHERE gm_user_id = ? ORDER BY updated_at DESC")
    .all(req.session.userId) as NpcRow[];
  res.json(rows.map(toClient));
});

npcsRouter.post("/", (req: Request, res: Response) => {
  const { name, data } = req.body ?? {};
  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "name is required" });
  }
  if (!isValidNpcData(data)) {
    return res.status(400).json({ error: "npc stat values out of allowed range" });
  }

  const info = db
    .prepare("INSERT INTO npcs (gm_user_id, name, data) VALUES (?, ?, ?)")
    .run(req.session.userId, name.trim(), JSON.stringify(data ?? {}));

  const row = db.prepare("SELECT * FROM npcs WHERE id = ?").get(info.lastInsertRowid) as NpcRow;
  res.status(201).json(toClient(row));
});

npcsRouter.put("/:id", (req: Request, res: Response) => {
  const existing = db
    .prepare("SELECT * FROM npcs WHERE id = ? AND gm_user_id = ?")
    .get(req.params.id, req.session.userId) as NpcRow | undefined;
  if (!existing) return res.status(404).json({ error: "not found" });

  const { name, data } = req.body ?? {};
  if (data !== undefined && !isValidNpcData(data)) {
    return res.status(400).json({ error: "npc stat values out of allowed range" });
  }
  const nextName = typeof name === "string" && name.trim() ? name.trim() : existing.name;
  const nextData = data !== undefined ? JSON.stringify(data) : existing.data;

  db.prepare("UPDATE npcs SET name = ?, data = ?, updated_at = datetime('now') WHERE id = ?").run(
    nextName,
    nextData,
    existing.id
  );

  const row = db.prepare("SELECT * FROM npcs WHERE id = ?").get(existing.id) as NpcRow;
  res.json(toClient(row));
});

npcsRouter.delete("/:id", (req: Request, res: Response) => {
  const info = db
    .prepare("DELETE FROM npcs WHERE id = ? AND gm_user_id = ?")
    .run(req.params.id, req.session.userId);
  if (info.changes === 0) return res.status(404).json({ error: "not found" });
  res.status(204).end();
});
