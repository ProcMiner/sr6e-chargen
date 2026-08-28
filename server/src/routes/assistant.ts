import { Router } from "express";
import type { Request, Response } from "express";
import { db } from "../db.js";
import { requireAssistantToken } from "../assistantAuth.js";
import { maxEdgeFor, playStateFromRow } from "./characters.js";
import type { CharacterPlayStateRow, CharacterRow } from "../types.js";

/**
 * Read-only export API for the coding-assistant sync workflow (e.g. keeping
 * a Claude Artifact companion sheet in step with a character's chargen
 * data). Token-gated via requireAssistantToken instead of the session-cookie
 * auth in characters.ts, and deliberately not scoped to a single owner - see
 * assistantAuth.ts. No write endpoints here on purpose: this API only ever
 * reads.
 */
export const assistantRouter = Router();

assistantRouter.use(requireAssistantToken);

function findCharacter(id: string): CharacterRow | undefined {
  return db.prepare("SELECT * FROM characters WHERE id = ?").get(id) as CharacterRow | undefined;
}

assistantRouter.get("/characters/:id", (req: Request, res: Response) => {
  const character = findCharacter(req.params.id);
  if (!character) return res.status(404).json({ error: "not found" });
  res.json({
    id: character.id,
    name: character.name,
    system: character.system,
    data: JSON.parse(character.data),
    updatedAt: character.updated_at,
  });
});

assistantRouter.get("/characters/:id/play-state", (req: Request, res: Response) => {
  const character = findCharacter(req.params.id);
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
  });
});
