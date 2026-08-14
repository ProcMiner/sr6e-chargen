// Small pure helpers for Conjuring - resolving a spirits.ts catalog entry's
// Force-relative stats at a chosen Force, mirroring deriveGear.ts's pattern
// of deriving rather than storing computed values. See BoundSpirit
// (playState.ts) for the summoned-spirit tracking this feeds.
import type { SpiritAttributeMods, SpiritCatalogEntry } from "./rules";

/** "Spirits' attribute cannot be lower than one, even if the adjustment listed would make it so." (core rulebook p. 147) */
export function spiritAttributes(entry: SpiritCatalogEntry, force: number): Record<keyof SpiritAttributeMods, number> {
  const resolve = (mod: number) => Math.max(1, force + mod);
  return {
    body: resolve(entry.attributeMods.body),
    agility: resolve(entry.attributeMods.agility),
    reaction: resolve(entry.attributeMods.reaction),
    strength: resolve(entry.attributeMods.strength),
    willpower: resolve(entry.attributeMods.willpower),
    logic: resolve(entry.attributeMods.logic),
    intuition: resolve(entry.attributeMods.intuition),
    charisma: resolve(entry.attributeMods.charisma),
  };
}

/** Condition Monitor = (Force/2, rounded up) + 8 - identical for all six core-rulebook spirit types (p. 147). */
export function spiritConditionMonitor(force: number): number {
  return Math.ceil(force / 2) + 8;
}

export function spiritDefenseRating(entry: SpiritCatalogEntry, force: number): number {
  return force + entry.defenseRatingMod;
}

/** "An optional power for every 3 full points of Force" (p. 147): Force 1-2 -> 0, 3-5 -> 1, 6-8 -> 2, etc. */
export function optionalPowerCount(force: number): number {
  return Math.floor(force / 3);
}

/** Substitutes the literal "F" placeholder in a formula/attack template string with a chosen Force, e.g. "(F x 2) + 4" at Force 6 -> "(6 x 2) + 4". Word-bounded so it never touches an "F" that's part of a longer word (e.g. "Fatigue"). */
export function resolveForceTemplate(template: string, force: number): string {
  return template.replace(/\bF\b/g, String(force));
}

/** "Characters must... have active spirits whose combined Force [not be] greater than (summoner's Magic x 3) at any one time." (p. 146) */
export function maxBoundForce(magic: number): number {
  return magic * 3;
}
