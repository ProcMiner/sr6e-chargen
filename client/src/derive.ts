// Mirrors server/src/rules/derive.ts - see that file for the sourcebook
// citation. SR6 has no Limit attributes (that's SR5); don't add them here.
import type { Attributes } from "./rules";

export interface DerivedStats {
  physicalMonitor: number;
  stunMonitor: number;
  initiative: number;
  initiativeDice: number;
}

export function deriveStats(attributes: Attributes): DerivedStats {
  return {
    physicalMonitor: Math.ceil(attributes.body / 2) + 8,
    stunMonitor: Math.ceil(attributes.willpower / 2) + 8,
    initiative: attributes.reaction + attributes.intuition,
    initiativeDice: 1,
  };
}

// "Attribute-Only Tests" (core rulebook p. 68): a handful of named tests use
// two summed attributes instead of skill + attribute. Kept as standalone
// functions (not folded into DerivedStats) since a couple only apply to
// certain characters (astral projection needs a Magic rating) rather than
// every character unconditionally.

/** Willpower + Charisma (core rulebook p. 68). */
export function composure(attributes: Attributes): number {
  return attributes.willpower + attributes.charisma;
}

/** Willpower + Intuition (core rulebook p. 68). */
export function judgeIntentions(attributes: Attributes): number {
  return attributes.willpower + attributes.intuition;
}

/** Logic + Intuition (core rulebook p. 68). */
export function memory(attributes: Attributes): number {
  return attributes.logic + attributes.intuition;
}

/** Body + Willpower (core rulebook p. 68). */
export function liftCarry(attributes: Attributes): number {
  return attributes.body + attributes.willpower;
}

/** Reaction + Intuition - the dice pool rolled on a Defense Test (core rulebook p. 55 combat example), distinct from Defense Rating (Body + Armor, see deriveGear-adjacent armor total). */
export function defenseTestPool(attributes: Attributes): number {
  return attributes.reaction + attributes.intuition;
}

/**
 * Total Minor Actions per combat round: the base 1 Minor Action, plus 1
 * more per Initiative Die (core rulebook p. 40 - "Players get 1 additional
 * Minor Action for every Initiative Die they have").
 */
export function minorActions(derived: DerivedStats): number {
  return 1 + derived.initiativeDice;
}

/**
 * Astral projection Initiative rank: Logic + Intuition, +2D6 Initiative
 * Dice (core rulebook p. 160's Astral Combat block) - distinct from both
 * physical Initiative (Reaction + Intuition, +1D6) and a technomancer's
 * Living Persona Initiative (Logic + Intuition, +1D6 - see
 * deriveLivingPersona.ts). Only meaningful for a magically active
 * character (astral projection requires a Magic rating), so callers should
 * check `attributes.magic !== undefined` before using this.
 */
export function astralInitiative(attributes: Attributes): number {
  return attributes.logic + attributes.intuition;
}
