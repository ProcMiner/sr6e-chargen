// Shared modifier types for catalog entries (cyberware/bioware, adept
// powers, spells) that change an attribute or derived stat by a fixed
// amount. Mirrored into client/src/rules.ts, same duplication convention as
// every other catalog-entry interface in this project (see that file's
// header comment).

/**
 * What a StatModifier changes. Deliberately narrow: only attributes and the
 * derived stats deriveStats actually consumes (see server/src/rules/
 * derive.ts) - skill-rating and dice-pool bonuses (Reflex Recorder,
 * Synthacardium, etc.) are out of scope, see augmentations.ts's per-entry
 * notes for what was left out of this pass.
 */
export type ModifierTarget =
  | "body"
  | "agility"
  | "reaction"
  | "strength"
  | "willpower"
  | "logic"
  | "intuition"
  | "charisma"
  | "initiativeDice"
  | "armor"
  /**
   * Player picks the actual target at purchase time (e.g. Improved Physical
   * Attribute) - see the owning line's `notes` field, same convention as
   * other free-text sub-choices elsewhere in this project. Not resolved
   * automatically by deriveModifiers.ts.
   */
  | "choice";

export interface StatModifier {
  target: ModifierTarget;
  /**
   * Fixed flat amount; "rating" if it equals whatever level/rating was
   * purchased (same convention as GearCatalogEntry.levels-scaled cost); or
   * "netHits" for a spell whose magnitude is set by the casting roll, not
   * fixed chargen data. Negative numbers are a penalty (e.g. Decrease
   * Attribute).
   */
  amount: number | "rating" | "netHits";
  /**
   * Mutually-exclusive group key mirroring SR6's "incompatible with other
   * X" text (Wired Reflexes/Synaptic Booster/Reaction Enhancers/Improved
   * Reflexes all fight over Reaction+Initiative Dice). Only the single
   * highest amount within a group applies - enforced in deriveModifiers.ts.
   */
  stackingGroup?: string;
}
