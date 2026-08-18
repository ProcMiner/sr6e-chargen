// Shared modifier types for catalog entries (cyberware/bioware, adept
// powers, spells) that change an attribute or derived stat by a fixed
// amount. Mirrored into client/src/rules.ts, same duplication convention as
// every other catalog-entry interface in this project (see that file's
// header comment).

/**
 * What a StatModifier changes. Mostly attributes and the derived stats
 * deriveStats actually consumes (see server/src/rules/derive.ts) - other
 * skill-rating/dice-pool bonuses (Reflex Recorder, Synthacardium, etc.) are
 * still out of scope, see augmentations.ts's per-entry notes for what was
 * left out of this pass. "attackRating" is the one exception: it's not fed
 * into deriveStats at all, since unlike every other target here it isn't a
 * character-wide bonus - a Weapon Accessory's `modifiers` only apply to the
 * specific weapon line it's attached to (GearLine.attachedTo), resolved by
 * client/src/deriveCombat.ts's weaponAttackRatings(), not deriveModifiers.ts's
 * global modifierBonuses(). Only for accessories whose bonus is always-on
 * once mounted (Smartgun System, Laser Sight) - accessories whose bonus is
 * conditional on a temporary state (Bipod/Tripod only "when deployed",
 * Gas-Vent/Shock Pad/Gyro Mount changing firing-mode penalties rather than
 * adding a flat number) are deliberately left as reference text instead,
 * same "no dice-rolling engine" boundary as everywhere else in this app -
 * see weaponAttackRatings()'s own header comment.
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
  | "attackRating"
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
