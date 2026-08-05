import { Router } from "express";
import type { Request, Response } from "express";
import { db } from "../db.js";
import { requireAuth } from "../auth.js";
import { maxEdgeFor, playStateFromRow } from "./characters.js";
import { deriveStats } from "../rules/derive.js";
import type { Attributes, CharacterPlayStateRow, CharacterRow, PlaySessionRow } from "../types.js";

export const playRouter = Router();

playRouter.use(requireAuth);

const JOIN_CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function randomJoinCode(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += JOIN_CODE_CHARS[Math.floor(Math.random() * JOIN_CODE_CHARS.length)];
  }
  return code;
}

function generateUniqueJoinCode(): string {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = randomJoinCode();
    const existing = db.prepare("SELECT id FROM play_sessions WHERE join_code = ?").get(code);
    if (!existing) return code;
  }
  throw new Error("failed to generate a unique join code after 10 attempts");
}

function sessionToClient(row: PlaySessionRow) {
  return { id: row.id, name: row.name, joinCode: row.join_code, createdAt: row.created_at };
}

playRouter.post("/sessions", (req: Request, res: Response) => {
  const { name } = req.body ?? {};
  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "name is required" });
  }

  const joinCode = generateUniqueJoinCode();
  const info = db
    .prepare("INSERT INTO play_sessions (gm_user_id, name, join_code) VALUES (?, ?, ?)")
    .run(req.session.userId, name.trim(), joinCode);

  const row = db.prepare("SELECT * FROM play_sessions WHERE id = ?").get(info.lastInsertRowid) as PlaySessionRow;
  res.status(201).json(sessionToClient(row));
});

playRouter.get("/sessions", (req: Request, res: Response) => {
  const rows = db
    .prepare("SELECT * FROM play_sessions WHERE gm_user_id = ? ORDER BY created_at DESC")
    .all(req.session.userId) as PlaySessionRow[];
  res.json(rows.map(sessionToClient));
});

playRouter.get("/sessions/:id", (req: Request, res: Response) => {
  const session = db.prepare("SELECT * FROM play_sessions WHERE id = ?").get(req.params.id) as
    | PlaySessionRow
    | undefined;
  if (!session) return res.status(404).json({ error: "not found" });
  if (session.gm_user_id !== req.session.userId) {
    return res.status(403).json({ error: "not the GM of this session" });
  }

  const joined = db
    .prepare(
      `SELECT c.id, c.name, c.system, c.data, u.username AS owner_username
       FROM session_characters sc
       JOIN characters c ON c.id = sc.character_id
       JOIN users u ON u.id = c.user_id
       WHERE sc.session_id = ?
       ORDER BY c.name`
    )
    .all(session.id) as { id: number; name: string; system: string; data: string; owner_username: string }[];

  const characters = joined.map((c) => {
    const parsedData = JSON.parse(c.data) as { attributes?: Partial<Attributes> };
    const maxEdge = maxEdgeFor(c);
    const derived = deriveStats({
      body: 1,
      agility: 1,
      reaction: 1,
      strength: 1,
      willpower: 1,
      logic: 1,
      intuition: 1,
      charisma: 1,
      edge: 1,
      ...parsedData.attributes,
    });

    const playRow = db.prepare("SELECT * FROM character_play_state WHERE character_id = ?").get(c.id) as
      | CharacterPlayStateRow
      | undefined;
    const playState = playRow
      ? playStateFromRow(playRow)
      : { physicalDamage: 0, stunDamage: 0, edgeAvailable: maxEdge, statusEffects: [] };

    return {
      id: c.id,
      name: c.name,
      owner: c.owner_username,
      system: c.system,
      maxPhysical: derived.physicalMonitor,
      maxStun: derived.stunMonitor,
      maxEdge,
      playState,
    };
  });

  res.json({ ...sessionToClient(session), characters });
});

playRouter.post("/sessions/join", (req: Request, res: Response) => {
  const { joinCode, characterId } = req.body ?? {};
  if (typeof joinCode !== "string" || !joinCode.trim() || typeof characterId !== "number") {
    return res.status(400).json({ error: "joinCode and characterId are required" });
  }

  const session = db.prepare("SELECT * FROM play_sessions WHERE join_code = ?").get(joinCode.trim().toUpperCase()) as
    | PlaySessionRow
    | undefined;
  if (!session) return res.status(404).json({ error: "no session with that join code" });

  const character = db
    .prepare("SELECT * FROM characters WHERE id = ? AND user_id = ?")
    .get(characterId, req.session.userId) as CharacterRow | undefined;
  if (!character) return res.status(404).json({ error: "character not found" });

  db.prepare("INSERT OR IGNORE INTO session_characters (session_id, character_id) VALUES (?, ?)").run(
    session.id,
    character.id
  );
  res.status(201).json(sessionToClient(session));
});

playRouter.post("/sessions/:id/leave", (req: Request, res: Response) => {
  const { characterId } = req.body ?? {};
  if (typeof characterId !== "number") {
    return res.status(400).json({ error: "characterId is required" });
  }

  const session = db.prepare("SELECT * FROM play_sessions WHERE id = ?").get(req.params.id) as
    | PlaySessionRow
    | undefined;
  if (!session) return res.status(404).json({ error: "not found" });

  const character = db.prepare("SELECT * FROM characters WHERE id = ?").get(characterId) as CharacterRow | undefined;
  if (!character) return res.status(404).json({ error: "character not found" });

  const isGm = session.gm_user_id === req.session.userId;
  const isOwner = character.user_id === req.session.userId;
  if (!isGm && !isOwner) return res.status(403).json({ error: "not allowed" });

  db.prepare("DELETE FROM session_characters WHERE session_id = ? AND character_id = ?").run(
    session.id,
    characterId
  );
  res.status(204).end();
});

playRouter.delete("/sessions/:id", (req: Request, res: Response) => {
  const info = db
    .prepare("DELETE FROM play_sessions WHERE id = ? AND gm_user_id = ?")
    .run(req.params.id, req.session.userId);
  if (info.changes === 0) return res.status(404).json({ error: "not found" });
  res.status(204).end();
});
