// Mirrors server/src/rules/derive.ts - see that file for the sourcebook
// citation. SR6 has no Limit attributes (that's SR5); don't add them here.
import type { Attributes, ModifierTarget } from "./rules";

export interface DerivedStats {
  physicalMonitor: number;
  stunMonitor: number;
  initiative: number;
  initiativeDice: number;
  /** Bonus Defense Rating from bioware/cyberware/adept powers (e.g. Orthoskin) - see deriveModifiers.ts. Does NOT include worn armor gear, which keeps displaying per-item as it always has (see armor.ts's free-text stats.defenseRating). */
  armor: number;
}

/**
 * Natural attributes + modifierBonuses(), merged into an Attributes-shaped
 * object - the "what the character can currently do" numbers (Attack
 * Rating, Astral Combat, Matrix Initiative, the Summary/Advancement/PDF
 * attribute display, etc. all want this, not the raw natural value alone).
 * `edge`/`magic`/`resonance` pass through unchanged - none are valid
 * ModifierTarget values (SR6 has no augmentation that boosts them).
 */
export function effectiveAttributes(attributes: Attributes, bonuses: Partial<Record<ModifierTarget, number>>): Attributes {
  return {
    ...attributes,
    body: attributes.body + (bonuses.body ?? 0),
    agility: attributes.agility + (bonuses.agility ?? 0),
    reaction: attributes.reaction + (bonuses.reaction ?? 0),
    strength: attributes.strength + (bonuses.strength ?? 0),
    willpower: attributes.willpower + (bonuses.willpower ?? 0),
    logic: attributes.logic + (bonuses.logic ?? 0),
    intuition: attributes.intuition + (bonuses.intuition ?? 0),
    charisma: attributes.charisma + (bonuses.charisma ?? 0),
  };
}

/**
 * `bonuses` is a summed per-target modifier map from deriveModifiers.ts's
 * modifierBonuses (installed cyberware/bioware/adept powers) - omit it for
 * an unmodified read of the raw attributes. Only feeds the fields above;
 * the "Attribute-Only Test" helpers below (composure, defenseTestPool, etc.)
 * intentionally keep using raw `attributes` - see this file's header in the
 * project plan for why that's a deliberate scope boundary, not an oversight.
 * For a general "current effective attribute" read elsewhere, use
 * effectiveAttributes() above instead.
 */
export function deriveStats(attributes: Attributes, bonuses: Partial<Record<ModifierTarget, number>> = {}): DerivedStats {
  const body = attributes.body + (bonuses.body ?? 0);
  const willpower = attributes.willpower + (bonuses.willpower ?? 0);
  const reaction = attributes.reaction + (bonuses.reaction ?? 0);
  const intuition = attributes.intuition + (bonuses.intuition ?? 0);

  return {
    physicalMonitor: Math.ceil(body / 2) + 8,
    stunMonitor: Math.ceil(willpower / 2) + 8,
    initiative: reaction + intuition,
    initiativeDice: 1 + (bonuses.initiativeDice ?? 0),
    armor: bonuses.armor ?? 0,
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

/**
 * Wound modifier (core rulebook p. 38): "Condition Monitors are a series of
 * boxes set in rows of three... When a row of boxes on a monitor is
 * filled, the character takes a -1 dice pool penalty to all tests except
 * Damage Resistance. Each row filled on either monitor increases the
 * penalty by 1." The two monitors are independent (a filled Physical row
 * and a filled Stun row both contribute), then summed - not a single
 * combined-total tier lookup. Returns a non-positive number (0 = no
 * penalty).
 */
export function woundModifier(physicalDamage: number, stunDamage: number): number {
  return -(Math.floor(physicalDamage / 3) + Math.floor(stunDamage / 3));
}
