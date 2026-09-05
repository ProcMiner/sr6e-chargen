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

/**
 * A currently-compiled sprite (core rulebook "Technomancers," p. 191-195 -
 * see server/src/rules/sprites.ts for the catalog). Lives in PlayState, not
 * CharacterData, same reasoning as BoundSpirit: session-transient, not a
 * permanent part of the character sheet. Unlike a bound spirit, a sprite
 * has no fixed lifespan tracked here - an unregistered one's "(Level x 2)
 * hours unless registered" clock (p. 192) is reference text the player
 * self-tracks, same "no dice-rolling engine, no clock" treatment as every
 * other timed effect in this app (see StatusEffect.roundsRemaining, which
 * is also just a manually-counted-down number, not an automatic timer).
 */
export interface CompiledSprite {
  id: string;
  /** server/src/rules/sprites.ts id. */
  spriteTypeId: string;
  /** Player-given label, e.g. "Static" - distinct from the type name so a technomancer can tell two same-type sprites apart. */
  name: string;
  level: number;
  /** Net hits from the compiling test - what the sprite "owes" (p. 191). Registered Sprite Tasks (Loaned/Remote/Re-register/Standby/Sustain Complex Form, p. 193) all spend from this same pool - see Sprites.tsx's reference text for what each spends it on. */
  tasksRemaining: number;
  /** False until a successful Registering test (p. 192) - gates the five Registered Sprite Tasks and lifts the unregistered existence time limit. */
  registered: boolean;
  /** Accumulates like any Matrix entity's OS (p. 192) - Standby resets it to 0 (p. 193). */
  overwatchScore: number;
  /** Damage marked against the sprite's Matrix Condition Monitor ((Level/2 rounded up) + 8 - p. 192). */
  matrixDamage: number;
  compiledAt: string;
}

/** One reasoned addition to Overwatch Score (Matrix.tsx's OS tracker) - manual +1/-1 taps don't log, only the three named-reason quick-add buttons do, capped at the 4 most recent. */
export interface OverwatchLogEntry {
  id: string;
  reason: string;
  delta: number;
}

export interface PlayState {
  physicalDamage: number;
  stunDamage: number;
  edgeAvailable: number;
  statusEffects: StatusEffect[];
  boundSpirits: BoundSpirit[];
  compiledSprites: CompiledSprite[];
  /** Matrix Condition Monitor damage per owned Matrix device, keyed by the device's gear-line name (matrixDevices() in deriveDeckerPersona.ts) - see that file's matrixConditionMonitor() for the max. Technomancers have no Matrix Condition Monitor (Matrix damage applies to Stun instead), so this stays empty for them. */
  matrixDamageByDevice: Record<string, number>;
  /** Which named Matrix programs (deriveMatrix.ts's MATRIX_PROGRAMS, plus "Agent") are currently loaded/running, keyed by name - session-transient, decker-only. */
  matrixProgramsRunning: Record<string, boolean>;
  /** Reconfigure Matrix Attribute (core rulebook p.175, Minor Action, no test): swapped Data Processing/Firewall. Attack/Sleaze aren't offered here - a custom cyberdeck's pair is always locked, and a stock deck's is set once at chargen. */
  matrixReconfigured: boolean;
  /** Overwatch Score (core rulebook p.176), 0-40 - Matrix.tsx's live tracker for the same OS the reference section on that tab explains. */
  overwatchScore: number;
  overwatchLog: OverwatchLogEntry[];
  /** Edge spent on Matrix Edge Actions so far this scene - manually reset, since this app has no scene/combat-round boundary concept. */
  matrixEdgeSpentScene: number;
  matrixLinkLocked: boolean;
  matrixBackdoorActive: boolean;
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
