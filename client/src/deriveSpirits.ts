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

/**
 * Condition Monitor = (Force/2, rounded up) + 8 by default (p. 147) - the
 * shared formula for all six core-rulebook spirit types, and for any
 * Street Wyrd type that happens to match it (e.g. Guidance Spirits). A few
 * Street Wyrd types print a different formula entirely; see
 * SpiritCatalogEntry.conditionMonitorOverride.
 */
export function spiritConditionMonitor(entry: SpiritCatalogEntry, force: number): number {
  const override = entry.conditionMonitorOverride;
  if (!override) return Math.ceil(force / 2) + 8;
  const base = override.base === "force" ? force : spiritAttributes(entry, force)[override.base];
  const adjusted = base + (override.preOffset ?? 0);
  const applied = override.operation === "half" ? Math.ceil(adjusted / 2) : adjusted * 2;
  return applied + override.offset;
}

export function spiritDefenseRating(entry: SpiritCatalogEntry, force: number): number {
  return force * (entry.defenseRatingMultiplier ?? 1) + entry.defenseRatingMod;
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

/**
 * Astral Reputation's mechanical thresholds (Street Wyrd p.64-65) - the
 * only parts of the AsRep system that are hard numbers rather than
 * roleplay adjudication. -5 to +5 is narrative flavor only (no derived
 * effect - see ASTRAL_REPUTATION_ADJUSTMENTS below for how the score
 * moves). Returns undefined for scores with no mechanical effect.
 */
export function astralReputationEffect(asRep: number): string | undefined {
  if (asRep >= 10) return "Spirits you summon arrive at +1 Force and grant +1 service.";
  if (asRep >= 8) return "Spirits you summon arrive at +1 Force.";
  if (asRep >= 6) return "Spirits you summon grant +1 service.";
  if (asRep <= -10) return "Threshold 3 on all summoning and binding Conjuring tests.";
  if (asRep <= -8) return "Threshold 2 on all summoning and binding Conjuring tests.";
  if (asRep <= -6) return "Threshold 1 on all summoning and binding Conjuring tests.";
  return undefined;
}

/**
 * Reference table of suggested Astral Reputation adjustments (Street Wyrd
 * p.65, "AsRep Score Adjustments" + "Sample Roleplaying Adjustments") -
 * player/GM-adjudicated, not automated (this app has no dice-rolling
 * engine anywhere - see Spirits.tsx). A few reference binding techniques
 * (Binding Specialization, Fettering, Spell Binding, Alternate Control,
 * Planar Protection) this app doesn't model yet as their own mechanics
 * (deferred alongside the rest of Bound Tasks/Task Points) - still valid
 * as manual reference for adjusting the score by hand.
 */
export const ASTRAL_REPUTATION_ADJUSTMENTS: { event: string; delta: string }[] = [
  { event: "Dismissing with services remaining", delta: "+1" },
  { event: "Binding Specialization", delta: "-1" },
  { event: "Binding for a week", delta: "-1" },
  { event: "Binding for a month", delta: "-2" },
  { event: "Binding for a year", delta: "-3" },
  { event: "Fettering", delta: "+1" },
  { event: "Fettering in a death trap", delta: "-2" },
  { event: "Disrupting", delta: "-2" },
  { event: "Use of Spell Binding", delta: "-3" },
  { event: "Banishing", delta: "+1" },
  { event: "Alternate Control abuse", delta: "-1" },
  { event: "Planar Protection use", delta: "-1/use" },
  { event: "Asking their name", delta: "+1" },
  { event: "Gift of Karma", delta: "+1 per 5 points" },
  { event: "Deliberately sending a spirit to disruption", delta: "-2" },
  { event: "Frequent bad manners/ill temper", delta: "-1" },
  { event: "Disregard of spirit suggestions", delta: "-1" },
  { event: "Engagement with spirit in planning", delta: "+1" },
  { event: "Courteous treatment", delta: "+1" },
  { event: "Adjusting plans to preserve spirit safety", delta: "+1" },
];
