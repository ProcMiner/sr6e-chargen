import { Router } from "express";
import type { Request, Response } from "express";
import { db } from "../db.js";
import { requireAuth } from "../auth.js";
import type { BoundSpirit, CharacterPlayStateRow, CharacterRow, ChargenSystem, CompiledSprite, StatusEffect } from "../types.js";

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

  if (Array.isArray(d.specializations)) {
    for (const line of d.specializations as unknown[]) {
      if (line === null || typeof line !== "object") return false;
      const s = line as Record<string, unknown>;
      if (typeof s.skill !== "string" || !s.skill) return false;
      if (typeof s.focus !== "string" || !s.focus) return false;
      if (s.tier !== "specialization" && s.tier !== "expertise") return false;
    }
  }

  if (Array.isArray(d.specializationLog)) {
    for (const line of d.specializationLog as unknown[]) {
      if (line === null || typeof line !== "object") return false;
      const s = line as Record<string, unknown>;
      if (typeof s.skill !== "string" || !s.skill) return false;
      if (typeof s.focus !== "string" || !s.focus) return false;
      if (s.action !== "new" && s.action !== "expertise" && s.action !== "second") return false;
      if (!isFiniteInRange(s.karmaCost, 0, Infinity)) return false;
    }
  }

  if (Array.isArray(d.knowledgePurchases)) {
    for (const line of d.knowledgePurchases as unknown[]) {
      if (line === null || typeof line !== "object") return false;
      const k = line as Record<string, unknown>;
      if (typeof k.knowledgeLineId !== "string" || !k.knowledgeLineId) return false;
      if (typeof k.name !== "string" || !k.name) return false;
      if (k.type !== "knowledge" && k.type !== "language") return false;
      if (!isFiniteInRange(k.karmaCost, 0, Infinity)) return false;
    }
  }

  if (Array.isArray(d.qualityPurchases)) {
    for (const line of d.qualityPurchases as unknown[]) {
      if (line === null || typeof line !== "object") return false;
      const q = line as Record<string, unknown>;
      if (q.action !== "purchased" && q.action !== "eliminated") return false;
      if (typeof q.name !== "string" || !q.name) return false;
      if (q.quality === null || typeof q.quality !== "object") return false;
      if (typeof (q.quality as Record<string, unknown>).id !== "string") return false;
      if (!isFiniteInRange(q.karmaCost, 0, Infinity)) return false;
    }
  }

  if (Array.isArray(d.contactAdvancement)) {
    for (const line of d.contactAdvancement as unknown[]) {
      if (line === null || typeof line !== "object") return false;
      const c = line as Record<string, unknown>;
      if (typeof c.contactId !== "string" || !c.contactId) return false;
      if (c.field !== "connection" && c.field !== "loyalty") return false;
      if (!isFiniteInRange(c.fromRating, 0, 12)) return false;
      if (!isFiniteInRange(c.toRating, 0, 12)) return false;
      if (!isFiniteInRange(c.karmaCost, 0, Infinity)) return false;
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

export interface OverwatchLogEntry {
  id: string;
  reason: string;
  delta: number;
}

export interface PlayStateClient {
  physicalDamage: number;
  stunDamage: number;
  edgeAvailable: number;
  statusEffects: StatusEffect[];
  boundSpirits: BoundSpirit[];
  compiledSprites: CompiledSprite[];
  /** Matrix Condition Monitor damage per owned Matrix device, keyed by the device's gear-line name (matrixDevices() in deriveDeckerPersona.ts) - see that file's matrixConditionMonitor() for the max. Technomancers have no Matrix Condition Monitor (Matrix damage applies to Stun instead), so this stays empty for them. */
  matrixDamageByDevice: Record<string, number>;
  matrixProgramsRunning: Record<string, boolean>;
  matrixReconfigured: boolean;
  overwatchScore: number;
  overwatchLog: OverwatchLogEntry[];
  matrixEdgeSpentScene: number;
  matrixLinkLocked: boolean;
  matrixBackdoorActive: boolean;
}

function ownedCharacter(id: string, userId: number | undefined): CharacterRow | undefined {
  return db.prepare("SELECT * FROM characters WHERE id = ? AND user_id = ?").get(id, userId) as
    | CharacterRow
    | undefined;
}

/** True if `userId` GMs a session that `characterId` has joined - mirrors
 * the join `play.ts`'s leave-session route already uses. A session has
 * exactly one GM (`play_sessions.gm_user_id`, set at creation). */
function isSessionGmFor(characterId: number, userId: number | undefined): boolean {
  if (!userId) return false;
  const row = db
    .prepare(
      `SELECT 1 FROM session_characters sc
       JOIN play_sessions ps ON ps.id = sc.session_id
       WHERE sc.character_id = ? AND ps.gm_user_id = ?`
    )
    .get(characterId, userId);
  return !!row;
}

/** Play-state read/write needs a broader check than plain ownership: the
 * group plays with paper character sheets, so the GM of a session a
 * character has joined needs write access to that character's playState too
 * - not just the character's own owner. Every other character.ts endpoint
 * (chargen data, deletion, etc.) stays owner-only; this is deliberately
 * scoped to play-state alone. */
function ownedOrGmCharacter(id: string, userId: number | undefined): CharacterRow | undefined {
  const owned = ownedCharacter(id, userId);
  if (owned) return owned;
  const characterId = Number(id);
  if (!Number.isFinite(characterId) || !isSessionGmFor(characterId, userId)) return undefined;
  return db.prepare("SELECT * FROM characters WHERE id = ?").get(characterId) as CharacterRow | undefined;
}

/** In-memory only, deliberately not persisted - see the redesign plan's
 * decision #6: this is a single-process app on one Lightsail instance, and
 * "undo my mis-tap" is a convenience, not an audit log. Lost on server
 * restart, which is fine for that purpose. Keyed by character id since only
 * one field's worth of undo needs to be remembered per character at a time. */
interface PlayStateUndoRecord {
  field: "physicalDamage" | "stunDamage" | "edgeAvailable";
  previousValue: number;
  at: number;
}
const lastPlayStateChange = new Map<number, PlayStateUndoRecord>();

function writePlayState(characterId: number, state: PlayStateClient): void {
  db.prepare(
    `INSERT INTO character_play_state (character_id, physical_damage, stun_damage, edge_available, status_effects, bound_spirits, compiled_sprites, matrix_damage_by_device, matrix_programs_running, matrix_reconfigured, overwatch_score, overwatch_log, matrix_edge_spent_scene, matrix_link_locked, matrix_backdoor_active, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(character_id) DO UPDATE SET
       physical_damage = excluded.physical_damage,
       stun_damage = excluded.stun_damage,
       edge_available = excluded.edge_available,
       status_effects = excluded.status_effects,
       bound_spirits = excluded.bound_spirits,
       compiled_sprites = excluded.compiled_sprites,
       matrix_damage_by_device = excluded.matrix_damage_by_device,
       matrix_programs_running = excluded.matrix_programs_running,
       matrix_reconfigured = excluded.matrix_reconfigured,
       overwatch_score = excluded.overwatch_score,
       overwatch_log = excluded.overwatch_log,
       matrix_edge_spent_scene = excluded.matrix_edge_spent_scene,
       matrix_link_locked = excluded.matrix_link_locked,
       matrix_backdoor_active = excluded.matrix_backdoor_active,
       updated_at = excluded.updated_at`
  ).run(
    characterId,
    state.physicalDamage,
    state.stunDamage,
    state.edgeAvailable,
    JSON.stringify(state.statusEffects),
    JSON.stringify(state.boundSpirits),
    JSON.stringify(state.compiledSprites),
    JSON.stringify(state.matrixDamageByDevice),
    JSON.stringify(state.matrixProgramsRunning),
    state.matrixReconfigured ? 1 : 0,
    state.overwatchScore,
    JSON.stringify(state.overwatchLog),
    state.matrixEdgeSpentScene,
    state.matrixLinkLocked ? 1 : 0,
    state.matrixBackdoorActive ? 1 : 0
  );
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
    compiledSprites: JSON.parse(row.compiled_sprites) as CompiledSprite[],
    matrixDamageByDevice: JSON.parse(row.matrix_damage_by_device) as Record<string, number>,
    matrixProgramsRunning: JSON.parse(row.matrix_programs_running) as Record<string, boolean>,
    matrixReconfigured: !!row.matrix_reconfigured,
    overwatchScore: row.overwatch_score,
    overwatchLog: JSON.parse(row.overwatch_log) as OverwatchLogEntry[],
    matrixEdgeSpentScene: row.matrix_edge_spent_scene,
    matrixLinkLocked: !!row.matrix_link_locked,
    matrixBackdoorActive: !!row.matrix_backdoor_active,
  };
}

charactersRouter.get("/:id/play-state", (req: Request, res: Response) => {
  const character = ownedOrGmCharacter(req.params.id, req.session.userId);
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
    compiledSprites: [],
    matrixDamageByDevice: {},
    matrixProgramsRunning: {},
    matrixReconfigured: false,
    overwatchScore: 0,
    overwatchLog: [],
    matrixEdgeSpentScene: 0,
    matrixLinkLocked: false,
    matrixBackdoorActive: false,
  });
});

charactersRouter.put("/:id/play-state", (req: Request, res: Response) => {
  const character = ownedOrGmCharacter(req.params.id, req.session.userId);
  if (!character) return res.status(404).json({ error: "not found" });

  const maxEdge = maxEdgeFor(character);
  const existingRow = db
    .prepare("SELECT * FROM character_play_state WHERE character_id = ?")
    .get(character.id) as CharacterPlayStateRow | undefined;
  const current: PlayStateClient = existingRow
    ? playStateFromRow(existingRow)
    : {
        physicalDamage: 0,
        stunDamage: 0,
        edgeAvailable: maxEdge,
        statusEffects: [],
        boundSpirits: [],
        compiledSprites: [],
        matrixDamageByDevice: {},
        matrixProgramsRunning: {},
        matrixReconfigured: false,
        overwatchScore: 0,
        overwatchLog: [],
        matrixEdgeSpentScene: 0,
        matrixLinkLocked: false,
        matrixBackdoorActive: false,
      };

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

  let compiledSprites = current.compiledSprites;
  if (body.compiledSprites !== undefined) {
    if (
      !Array.isArray(body.compiledSprites) ||
      body.compiledSprites.some((s) => {
        if (s === null || typeof s !== "object") return true;
        if (typeof s.id !== "string" || typeof s.spriteTypeId !== "string" || typeof s.name !== "string") return true;
        if (typeof s.level !== "number" || !Number.isFinite(s.level) || s.level < 1) return true;
        if (typeof s.tasksRemaining !== "number" || !Number.isFinite(s.tasksRemaining)) return true;
        if (typeof s.registered !== "boolean") return true;
        if (typeof s.overwatchScore !== "number" || !Number.isFinite(s.overwatchScore) || s.overwatchScore < 0) {
          return true;
        }
        if (typeof s.matrixDamage !== "number" || !Number.isFinite(s.matrixDamage) || s.matrixDamage < 0) return true;
        if (typeof s.compiledAt !== "string") return true;
        return false;
      })
    ) {
      return res.status(400).json({
        error:
          "compiledSprites must be an array of { id, spriteTypeId, name, level, tasksRemaining, registered, overwatchScore, matrixDamage, compiledAt }",
      });
    }
    compiledSprites = body.compiledSprites;
  }

  let matrixDamageByDevice = current.matrixDamageByDevice;
  if (body.matrixDamageByDevice !== undefined) {
    const entries = Object.entries(body.matrixDamageByDevice as Record<string, unknown>);
    if (
      typeof body.matrixDamageByDevice !== "object" ||
      body.matrixDamageByDevice === null ||
      Array.isArray(body.matrixDamageByDevice) ||
      entries.some(([, v]) => typeof v !== "number" || !Number.isFinite(v) || v < 0)
    ) {
      return res.status(400).json({
        error: "matrixDamageByDevice must be an object mapping device name to a finite non-negative number",
      });
    }
    matrixDamageByDevice = body.matrixDamageByDevice as Record<string, number>;
  }

  let matrixProgramsRunning = current.matrixProgramsRunning;
  if (body.matrixProgramsRunning !== undefined) {
    const entries = Object.entries(body.matrixProgramsRunning as Record<string, unknown>);
    if (
      typeof body.matrixProgramsRunning !== "object" ||
      body.matrixProgramsRunning === null ||
      Array.isArray(body.matrixProgramsRunning) ||
      entries.some(([, v]) => typeof v !== "boolean")
    ) {
      return res.status(400).json({
        error: "matrixProgramsRunning must be an object mapping program name to a boolean",
      });
    }
    matrixProgramsRunning = body.matrixProgramsRunning as Record<string, boolean>;
  }

  let matrixReconfigured = current.matrixReconfigured;
  if (body.matrixReconfigured !== undefined) {
    if (typeof body.matrixReconfigured !== "boolean") {
      return res.status(400).json({ error: "matrixReconfigured must be a boolean" });
    }
    matrixReconfigured = body.matrixReconfigured;
  }

  const overwatchScore = numOrCurrent(body.overwatchScore, current.overwatchScore, 40);
  if (overwatchScore === undefined) {
    return res.status(400).json({ error: "overwatchScore must be a finite number between 0 and 40" });
  }

  let overwatchLog = current.overwatchLog;
  if (body.overwatchLog !== undefined) {
    if (
      !Array.isArray(body.overwatchLog) ||
      body.overwatchLog.length > 4 ||
      body.overwatchLog.some(
        (e) =>
          e === null ||
          typeof e !== "object" ||
          typeof e.id !== "string" ||
          typeof e.reason !== "string" ||
          typeof e.delta !== "number" ||
          !Number.isFinite(e.delta)
      )
    ) {
      return res.status(400).json({ error: "overwatchLog must be an array of at most 4 { id, reason, delta }" });
    }
    overwatchLog = body.overwatchLog;
  }

  const matrixEdgeSpentScene = numOrCurrent(body.matrixEdgeSpentScene, current.matrixEdgeSpentScene);
  if (matrixEdgeSpentScene === undefined) {
    return res.status(400).json({ error: "matrixEdgeSpentScene must be a finite non-negative number" });
  }

  let matrixLinkLocked = current.matrixLinkLocked;
  if (body.matrixLinkLocked !== undefined) {
    if (typeof body.matrixLinkLocked !== "boolean") {
      return res.status(400).json({ error: "matrixLinkLocked must be a boolean" });
    }
    matrixLinkLocked = body.matrixLinkLocked;
  }

  let matrixBackdoorActive = current.matrixBackdoorActive;
  if (body.matrixBackdoorActive !== undefined) {
    if (typeof body.matrixBackdoorActive !== "boolean") {
      return res.status(400).json({ error: "matrixBackdoorActive must be a boolean" });
    }
    matrixBackdoorActive = body.matrixBackdoorActive;
  }

  // Undo tracking: only meaningful when exactly one of the three numeric
  // fields actually changed - the GM Bar's steppers always send one field
  // per request, so this never fires for LivePlay's multi-field saves or
  // for statusEffects-only writes.
  const numericFieldsTouched = (["physicalDamage", "stunDamage", "edgeAvailable"] as const).filter(
    (f) => body[f] !== undefined
  );
  if (numericFieldsTouched.length === 1) {
    const field = numericFieldsTouched[0];
    const nextValue = { physicalDamage, stunDamage, edgeAvailable }[field];
    if (nextValue !== current[field]) {
      lastPlayStateChange.set(character.id, { field, previousValue: current[field], at: Date.now() });
    }
  }

  writePlayState(character.id, {
    physicalDamage,
    stunDamage,
    edgeAvailable,
    statusEffects,
    boundSpirits,
    compiledSprites,
    matrixDamageByDevice,
    matrixProgramsRunning,
    matrixReconfigured,
    overwatchScore,
    overwatchLog,
    matrixEdgeSpentScene,
    matrixLinkLocked,
    matrixBackdoorActive,
  });

  res.json({
    physicalDamage,
    stunDamage,
    edgeAvailable,
    statusEffects,
    boundSpirits,
    compiledSprites,
    matrixDamageByDevice,
    matrixProgramsRunning,
    matrixReconfigured,
    overwatchScore,
    overwatchLog,
    matrixEdgeSpentScene,
    matrixLinkLocked,
    matrixBackdoorActive,
  });
});

charactersRouter.post("/:id/play-state/undo", (req: Request, res: Response) => {
  const character = ownedOrGmCharacter(req.params.id, req.session.userId);
  if (!character) return res.status(404).json({ error: "not found" });

  const record = lastPlayStateChange.get(character.id);
  if (!record) return res.status(404).json({ error: "no recent change to undo" });
  lastPlayStateChange.delete(character.id);

  const maxEdge = maxEdgeFor(character);
  const existingRow = db
    .prepare("SELECT * FROM character_play_state WHERE character_id = ?")
    .get(character.id) as CharacterPlayStateRow | undefined;
  const current: PlayStateClient = existingRow
    ? playStateFromRow(existingRow)
    : {
        physicalDamage: 0,
        stunDamage: 0,
        edgeAvailable: maxEdge,
        statusEffects: [],
        boundSpirits: [],
        compiledSprites: [],
        matrixDamageByDevice: {},
        matrixProgramsRunning: {},
        matrixReconfigured: false,
        overwatchScore: 0,
        overwatchLog: [],
        matrixEdgeSpentScene: 0,
        matrixLinkLocked: false,
        matrixBackdoorActive: false,
      };

  const reverted: PlayStateClient = { ...current, [record.field]: record.previousValue };
  writePlayState(character.id, reverted);
  res.json(reverted);
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
