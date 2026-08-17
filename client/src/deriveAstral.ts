// The Astral Plane (core rulebook p.159-163): Assensing, Astral Projection,
// Astral Combat, Astral Tracking, Mana Barriers. Like Conjuring
// (deriveSpirits.ts), this app has no dice-rolling engine anywhere, so
// opposed/extended tests stay reference formulas - only what's directly
// computable from the character's own attributes (Astral Combat's Attack/
// Defense Rating, Astral Projection's time limit) is derived as a real
// number. Astral Initiative itself already lives in derive.ts
// (astralInitiative()) since it's shared with Living Persona.
//
// Drain resistance (p. 128, "Magic Basics" - not actually part of the
// Astral Plane chapter) lives here too, purely for UI colocation: it's
// shown in the same LivePlay panel as Astral Combat since both key off the
// same Tradition Attribute choice. Two distinct formulas exist per the
// book: "Those characters roll their tradition Attribute + Willpower" for
// spellcasting/conjuring/enchanting drain, vs. "Adepts... resist [drain]
// with Body + Willpower" (p. 163) for drain from activating an adept
// power - a Mystic Adept needs both, a pure Adept only the second, a
// Full/Aspected Magician only the first.
import type { Attributes } from "./rules";

export type TraditionAttribute = "logic" | "charisma";

/** Astral Projection's built-in time limit before Essence loss begins - "your Magic rating x 2" hours (p.160). Essence drops 1/hour past this, recovering 1/hour after return; hitting 0 kills the physical body. */
export function astralProjectionMaxHours(magic: number): number {
  return magic * 2;
}

/** Astral Combat Attack Rating: Magic + tradition attribute (p.161). */
export function astralAttackRating(attributes: Attributes, traditionAttribute: TraditionAttribute): number {
  return (attributes.magic ?? 0) + attributes[traditionAttribute];
}

/** Astral Combat Defense Rating: Intuition + innate armor - metahumans have no innate astral armor ("that's why they have a physical body"), so this is just Intuition unless a future feature (e.g. the Mystic Armor spell) adds astral armor. */
export function astralDefenseRating(attributes: Attributes): number {
  return attributes.intuition;
}

/** Base Damage Value of an unarmed astral attack: tradition attribute / 2, rounded up (p.161) - net hits add 1 per hit on top, same as any other test in this app (player-reported, not rolled). */
export function astralUnarmedDamage(attributes: Attributes, traditionAttribute: TraditionAttribute): number {
  return Math.ceil(attributes[traditionAttribute] / 2);
}

/** Drain resistance for spellcasting/conjuring/enchanting: Willpower + tradition attribute (p.128). Reduces drain damage by 1 per hit, minimum 0. */
export function traditionDrainResistancePool(attributes: Attributes, traditionAttribute: TraditionAttribute): number {
  return attributes.willpower + attributes[traditionAttribute];
}

/** Drain resistance for activating an adept power: Body + Willpower (p.163) - a different formula from the tradition-based one above, since adepts channel mana internally rather than through a tradition. */
export function adeptDrainResistancePool(attributes: Attributes): number {
  return attributes.body + attributes.willpower;
}

export const ASSENSING_TABLE: { hits: string; info: string[] }[] = [
  { hits: "0", info: ["None"] },
  {
    hits: "1",
    info: [
      "General state of subject's health (whether they are healthy or ill)",
      "General emotional state of subject (happy, sad, angry, etc.)",
      "Whether the subject is mundane or Awakened",
    ],
  },
  {
    hits: "2",
    info: [
      "Presence and location of any standard-grade cyberware implants",
      "The general class or type of magic that is active (fire spirit, Manipulation spell, power focus, etc.)",
      "If this aura has been seen before, it may be recognized, even if hidden or disguised, with a Memory test",
    ],
  },
  {
    hits: "3",
    info: [
      "Presence and location of alphaware implants",
      "Whether the subject's Essence and Magic are higher, lower, or equal to the viewer's Magic",
      "Whether the subject's Force is higher, lower, or equal to the viewer's Magic",
      "A general diagnosis of any maladies the subject is experiencing, such as illness or the effect of toxins",
      "Any astral signatures present on the subject",
    ],
  },
  {
    hits: "4",
    info: [
      "Presence and location of bioware and betaware implants",
      "The exact Essence, Magic, and Force of the subject",
      "The general cause of an existing astral signature (Combat spell, air spirit, etc.)",
    ],
  },
  {
    hits: "5+",
    info: [
      "The presence and location of deltaware implants, gene treatments, and nanotech",
      "An accurate diagnosis of any disease or toxins affecting the subject",
      "The fact that the subject is a technomancer or Monad",
    ],
  },
];

export const ASTRAL_TRACKING_MODIFIERS: { condition: string; modifier: string }[] = [
  { condition: "Each hour passed since astral link was active", modifier: "+1" },
  { condition: "Target behind mana barrier", modifier: "+ (Force of barrier)" },
  { condition: "Tracking master by spirit", modifier: "+2" },
];

export const MANA_BARRIERS_TABLE: { barrier: string; astralOrPhysical: string; reference: string }[] = [
  { barrier: "Circle of Protection ritual", astralOrPhysical: "Both", reference: "p. 144" },
  { barrier: "Magical lodge", astralOrPhysical: "Both", reference: "p. 129" },
  { barrier: "Mana Barrier spell", astralOrPhysical: "Either", reference: "p. 141" },
  { barrier: "Ward ritual", astralOrPhysical: "Both", reference: "p. 145" },
];
