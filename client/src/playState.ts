// Live play-state: damage, Edge, and status effects during an actual
// session. Deliberately separate from CharacterData (character.ts) - it's
// written every few seconds during play and shouldn't touch the builder's
// save path or its validation.

export interface StatusEffect {
  id: string;
  name: string;
  roundsRemaining?: number;
  notes?: string;
}

/**
 * A currently-summoned spirit (core rulebook "Conjuring," p. 146-149 - see
 * server/src/rules/spirits.ts for the catalog). Lives in PlayState, not
 * CharacterData, because a bound spirit is session-transient: it has a
 * built-in time limit ("once one sunrise and one sunset... pass after the
 * summoning, the spirit returns to its home plane," p. 146) and never
 * persists across the character's whole career the way gear/spells do.
 */
export interface BoundSpirit {
  id: string;
  /** server/src/rules/spirits.ts id. */
  spiritTypeId: string;
  /** Player-given label, e.g. "Puck" - distinct from the type name so a summoner can tell two same-type spirits apart. */
  name: string;
  force: number;
  /** Net hits from the summoning test - see deriveSpirits.ts's optionalPowerCount for how this also caps optional power selection. */
  servicesRemaining: number;
  /** Damage marked against the spirit's Condition Monitor ((Force/2 rounded up) + 8 - core rulebook p. 147). */
  conditionDamage: number;
  /** spiritPowers.ts ids chosen from the type's optionalPowers pool at summoning time - count is capped at floor(Force / 3) and fixed once chosen ("cannot be changed once the spirit is summoned," p. 147). */
  optionalPowersChosen: string[];
  summonedAt: string;
}

export interface PlayState {
  physicalDamage: number;
  stunDamage: number;
  edgeAvailable: number;
  statusEffects: StatusEffect[];
  boundSpirits: BoundSpirit[];
}

export interface PlaySessionSummary {
  id: number;
  name: string;
  joinCode: string;
  createdAt: string;
}

export interface SessionCharacterCard {
  id: number;
  name: string;
  owner: string;
  system: "priority" | "lifepath";
  maxPhysical: number;
  maxStun: number;
  maxEdge: number;
  /** Read-only glance for the GM - see character.ts's reputation/heat fields and deriveReputation.ts. Editing happens on the player's own LivePlay page. */
  reputation: number;
  heat: number;
  playState: PlayState;
}

export interface SessionDetail extends PlaySessionSummary {
  characters: SessionCharacterCard[];
}
