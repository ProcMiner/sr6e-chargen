import type { CharacterData } from "./character";

// GM-only NPC stat block - deliberately lightweight (flat fields, mostly
// free text) rather than the full Priority/Life Path CharacterData shape,
// since a GM needs to create and reference many of these quickly during
// play rather than run each through full chargen. Mirrors character.ts's
// emptyCharacterData() convention.
//
// `fullBuild` is the opt-in exception: for the rare NPC that deserves a
// real, complete build (a BBEG, a named rival), it holds an entire
// CharacterData - the exact same shape a player character uses, built
// through the exact same Priority/Life Path builder (see NpcBuilder.tsx).
// The simple fields above stay independent and still drive quick damage
// tracking on the roster card either way; a full build's own computed
// Condition Monitor/Defense Rating/etc. are just reference numbers the GM
// can copy into those fields by hand, not a live sync (see the "Builder
// only" scope decision - live tracking off a full build is a possible
// future step, not this one).

export interface NpcData {
  /** Role/flavor blurb, e.g. "Ganger enforcer, hot-headed". */
  description: string;
  physicalMonitor: number;
  stunMonitor: number;
  /** Ticked during play; not reset automatically between sessions since NPCs are a GM-wide library, not session-scoped. */
  physicalDamage: number;
  stunDamage: number;
  armor: number;
  /** Free text, e.g. "8 + 1d6" - no attribute breakdown modeled. */
  initiative: string;
  /** Free text: dice pools, weapons, Attack Ratings. */
  combat: string;
  /** Tactics, loot, anything else. */
  notes: string;
  /** Optional full character build - see the header comment above. Undefined until the GM opts in via "Build Full Character". */
  fullBuild?: {
    system: "priority" | "lifepath";
    characterData: CharacterData;
  };
}

export function emptyNpcData(): NpcData {
  return {
    description: "",
    physicalMonitor: 8,
    stunMonitor: 8,
    physicalDamage: 0,
    stunDamage: 0,
    armor: 0,
    initiative: "",
    combat: "",
    notes: "",
  };
}
