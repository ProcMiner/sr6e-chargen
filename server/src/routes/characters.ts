import { Router } from "express";
import type { Request, Response } from "express";
import { db } from "../db.js";
import { requireAuth } from "../auth.js";
import type { BoundSpirit, CharacterPlayStateRow, CharacterRow, ChargenSystem, StatusEffect } from "../types.js";

export const charactersRouter = Router();

charactersRouter.use(requireAuth);

// Coarse sanity bounds, not per-metatype precision (the client already
// clamps to the selected metatype's exact range) - this just catches
// obviously-invalid payloads (e.g. a Body of 20) regardless of how they
// were sent, since the client's clamping can't be trusted as the only
// line of defense. Bounds are a little more generous than any single
// metatype's actual max (Troll tops out at Body/Strength 9, Human at Edge
// 7) so legitimate characters are never rejected.
const CORE_ATTR_KEYS = [
  "body",
  "agility",
  "reaction",
  "strength",
  "willpower",
  "logic",
  "intuition",
  "charisma",
] as const;

function isFiniteInRange(value: unknown, min: number, max: number): boolean {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

function isValidCharacterData(data: unknown): boolean {
  if (data === null || typeof data !== "object") return true;
  const d = data as Record<string, unknown>;

  if (d.attributes && typeof d.attributes === "object") {
    const attrs = d.attributes as Record<string, unknown>;
    for (const key of CORE_ATTR_KEYS) {
      if (key in attrs && !isFiniteInRange(attrs[key], 1, 10)) return false;
    }
    if ("edge" in attrs && !isFiniteInRange(attrs.edge, 1, 8)) return false;
    // Magic/Resonance's natural max grows with Initiate/Submersion Grade
    // (6 + Grade - see deriveEssence.ts) - not bounded tightly to a
    // metatype/priority table here, same "coarse sanity, not per-metatype
    // precision" philosophy as CORE_ATTR_KEYS's (1, 10) above.
    if ("magic" in attrs && attrs.magic !== undefined && !isFiniteInRange(attrs.magic, 0, 20)) return false;
    if ("resonance" in attrs && attrs.resonance !== undefined && !isFiniteInRange(attrs.resonance, 0, 20)) {
      return false;
    }
  }

  if (d.skills && typeof d.skills === "object") {
    // Natural post-chargen max is 9 (10 with the Aptitude quality) via
    // pages/play/Advancement.tsx, above chargen's own 6/7 cap.
    for (const value of Object.values(d.skills as Record<string, unknown>)) {
      if (!isFiniteInRange(value, 0, 10)) return false;
    }
  }

  if (d.initiateGrade !== undefined && !isFiniteInRange(d.initiateGrade, 0, 50)) return false;
  if (d.submersionGrade !== undefined && !isFiniteInRange(d.submersionGrade, 0, 50)) return false;

  if (Array.isArray(d.initiations)) {
    for (const line of d.initiations as unknown[]) {
      if (line === null || typeof line !== "object") return false;
      const i = line as Record<string, unknown>;
      if (i.type !== "initiation" && i.type !== "submersion") return false;
      if (!isFiniteInRange(i.grade, 1, 50)) return false;
      if (typeof i.metamagicName !== "string" || !i.metamagicName) return false;
      if (!isFiniteInRange(i.karmaCost, 0, Infinity)) return false;
    }
  }

  if (d.spells !== undefined) {
    if (!Array.isArray(d.spells) || d.spells.some((s) => typeof s !== "string")) return false;
  }

  if (d.mysticAdeptPowerPoints !== undefined && !isFiniteInRange(d.mysticAdeptPowerPoints, 0, 8)) return false;

  if (Array.isArray(d.adeptPowers)) {
    for (const line of d.adeptPowers as unknown[]) {
      if (line === null || typeof line !== "object") return false;
      const p = line as Record<string, unknown>;
      if (typeof p.powerId !== "string") return false;
      if (p.level !== undefined && !isFiniteInRange(p.level, 0, 20)) return false;
    }
  }

  if (Array.isArray(d.gear)) {
    for (const line of d.gear as unknown[]) {
      if (line === null || typeof line !== "object") return false;
      const g = line as Record<string, unknown>;
      if (typeof g.qty !== "number" || !Number.isFinite(g.qty) || g.qty < 0) return false;
      if (typeof g.unitCost !== "number" || !Number.isFinite(g.unitCost) || g.unitCost < 0) return false;
      if (g.essenceCost !== undefined && !isFiniteInRange(g.essenceCost, 0, Infinity)) return false;
      if (g.bondingKarma !== undefined && !isFiniteInRange(g.bondingKarma, 0, Infinity)) return false;
      if (g.free !== undefined && typeof g.free !== "boolean") return false;
    }
  }

  if (Array.isArray(d.advancement)) {
    for (const line of d.advancement as unknown[]) {
      if (line === null || typeof line !== "object") return false;
      const a = line as Record<string, unknown>;
      if (a.type !== "attribute" && a.type !== "skill") return false;
      if (typeof a.key !== "string" || !a.key) return false;
      if (!isFiniteInRange(a.fromRating, 0, 20)) return false;
      if (!isFiniteInRange(a.toRating, 0, 20)) return false;
      if (!isFiniteInRange(a.karmaCost, 0, Infinity)) return false;
    }
  }

  return true;
}

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
  if (!isValidCharacterData(data)) {
    return res.status(400).json({ error: "attributes/skills values out of allowed range" });
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
  if (data !== undefined && !isValidCharacterData(data)) {
    return res.status(400).json({ error: "attributes/skills values out of allowed range" });
  }
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

export interface PlayStateClient {
  physicalDamage: number;
  stunDamage: number;
  edgeAvailable: number;
  statusEffects: StatusEffect[];
  boundSpirits: BoundSpirit[];
}

function ownedCharacter(id: string, userId: number | undefined): CharacterRow | undefined {
  return db.prepare("SELECT * FROM characters WHERE id = ? AND user_id = ?").get(id, userId) as
    | CharacterRow
    | undefined;
}

export function maxEdgeFor(character: { data: string }): number {
  const data = JSON.parse(character.data) as { attributes?: { edge?: unknown } };
  const edge = data.attributes?.edge;
  return typeof edge === "number" && Number.isFinite(edge) ? edge : 0;
}

export function playStateFromRow(row: CharacterPlayStateRow): PlayStateClient {
  return {
    physicalDamage: row.physical_damage,
    stunDamage: row.stun_damage,
    edgeAvailable: row.edge_available,
    statusEffects: JSON.parse(row.status_effects) as StatusEffect[],
    boundSpirits: JSON.parse(row.bound_spirits) as BoundSpirit[],
  };
}

charactersRouter.get("/:id/play-state", (req: Request, res: Response) => {
  const character = ownedCharacter(req.params.id, req.session.userId);
  if (!character) return res.status(404).json({ error: "not found" });

  const row = db
    .prepare("SELECT * FROM character_play_state WHERE character_id = ?")
    .get(character.id) as CharacterPlayStateRow | undefined;

  if (row) return res.json(playStateFromRow(row));

  res.json({
    physicalDamage: 0,
    stunDamage: 0,
    edgeAvailable: maxEdgeFor(character),
    statusEffects: [],
    boundSpirits: [],
  });
});

charactersRouter.put("/:id/play-state", (req: Request, res: Response) => {
  const character = ownedCharacter(req.params.id, req.session.userId);
  if (!character) return res.status(404).json({ error: "not found" });

  const maxEdge = maxEdgeFor(character);
  const existingRow = db
    .prepare("SELECT * FROM character_play_state WHERE character_id = ?")
    .get(character.id) as CharacterPlayStateRow | undefined;
  const current: PlayStateClient = existingRow
    ? playStateFromRow(existingRow)
    : { physicalDamage: 0, stunDamage: 0, edgeAvailable: maxEdge, statusEffects: [], boundSpirits: [] };

  const body = (req.body ?? {}) as Partial<PlayStateClient>;

  // physicalDamage/stunDamage have no hard cap here - overflow past the
  // monitor max is allowed and shown in the UI, not enforced server-side.
  function numOrCurrent(value: unknown, fallback: number, max?: number): number | undefined {
    if (value === undefined) return fallback;
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return undefined;
    if (max !== undefined && value > max) return undefined;
    return value;
  }

  const physicalDamage = numOrCurrent(body.physicalDamage, current.physicalDamage);
  const stunDamage = numOrCurrent(body.stunDamage, current.stunDamage);
  const edgeAvailable = numOrCurrent(body.edgeAvailable, current.edgeAvailable, maxEdge);
  if (physicalDamage === undefined || stunDamage === undefined || edgeAvailable === undefined) {
    return res.status(400).json({
      error: "physicalDamage/stunDamage/edgeAvailable must be finite non-negative numbers; edgeAvailable is capped at the character's max Edge",
    });
  }

  let statusEffects = current.statusEffects;
  if (body.statusEffects !== undefined) {
    if (
      !Array.isArray(body.statusEffects) ||
      body.statusEffects.some(
        (e) => e === null || typeof e !== "object" || typeof e.id !== "string" || typeof e.name !== "string"
      )
    ) {
      return res.status(400).json({ error: "statusEffects must be an array of { id, name }" });
    }
    statusEffects = body.statusEffects;
  }

  let boundSpirits = current.boundSpirits;
  if (body.boundSpirits !== undefined) {
    if (
      !Array.isArray(body.boundSpirits) ||
      body.boundSpirits.some((s) => {
        if (s === null || typeof s !== "object") return true;
        if (typeof s.id !== "string" || typeof s.spiritTypeId !== "string" || typeof s.name !== "string") return true;
        if (typeof s.force !== "number" || !Number.isFinite(s.force) || s.force < 1) return true;
        if (typeof s.servicesRemaining !== "number" || !Number.isFinite(s.servicesRemaining) || s.servicesRemaining < 0) {
          return true;
        }
        if (typeof s.conditionDamage !== "number" || !Number.isFinite(s.conditionDamage) || s.conditionDamage < 0) {
          return true;
        }
        if (!Array.isArray(s.optionalPowersChosen) || s.optionalPowersChosen.some((p: unknown) => typeof p !== "string")) {
          return true;
        }
        if (typeof s.summonedAt !== "string") return true;
        return false;
      })
    ) {
      return res.status(400).json({
        error:
          "boundSpirits must be an array of { id, spiritTypeId, name, force, servicesRemaining, conditionDamage, optionalPowersChosen, summonedAt }",
      });
    }
    boundSpirits = body.boundSpirits;
  }

  db.prepare(
    `INSERT INTO character_play_state (character_id, physical_damage, stun_damage, edge_available, status_effects, bound_spirits, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(character_id) DO UPDATE SET
       physical_damage = excluded.physical_damage,
       stun_damage = excluded.stun_damage,
       edge_available = excluded.edge_available,
       status_effects = excluded.status_effects,
       bound_spirits = excluded.bound_spirits,
       updated_at = excluded.updated_at`
  ).run(
    character.id,
    physicalDamage,
    stunDamage,
    edgeAvailable,
    JSON.stringify(statusEffects),
    JSON.stringify(boundSpirits)
  );

  res.json({ physicalDamage, stunDamage, edgeAvailable, statusEffects, boundSpirits });
});

charactersRouter.get("/:id/sessions", (req: Request, res: Response) => {
  const character = ownedCharacter(req.params.id, req.session.userId);
  if (!character) return res.status(404).json({ error: "not found" });

  const rows = db
    .prepare(
      `SELECT ps.id, ps.name, ps.join_code, ps.created_at
       FROM play_sessions ps
       JOIN session_characters sc ON sc.session_id = ps.id
       WHERE sc.character_id = ?
       ORDER BY ps.created_at DESC`
    )
    .all(character.id) as { id: number; name: string; join_code: string; created_at: string }[];

  res.json(rows.map((r) => ({ id: r.id, name: r.name, joinCode: r.join_code, createdAt: r.created_at })));
});
