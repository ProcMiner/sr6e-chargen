// GM-only NPC stat block - deliberately lightweight (flat fields, mostly
// free text) rather than the full Priority/Life Path CharacterData shape,
// since a GM needs to create and reference many of these quickly during
// play rather than run each through full chargen. Mirrors character.ts's
// emptyCharacterData() convention.

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
