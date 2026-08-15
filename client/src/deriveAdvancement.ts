// Small pure helpers for post-chargen ("career mode") Karma spending -
// raising attributes/skills with Karma while a character is in play (see
// pages/play/Advancement.tsx). Mirrors deriveGear.ts's pattern: nothing here
// is stored as "remaining," it's always derived from `data.advancement`, the
// itemized purchase log, the same way gear's bondingKarma total is derived
// from itemized gear lines.
//
// Core rulebook "Improvement Cost" table (p. 68-69):
//   Attribute: new rating x 5 Karma
//   Active skill: new rating x 5 Karma (same formula as Attribute - a
//   prior pass here had this at x2, an unverified guess made before this
//   app had direct rulebook-PDF access; corrected once the actual table
//   text confirmed both rows use the identical x5 formula, cross-checked
//   against the table's own cumulative rank-lookup grid on the facing page).
// CORE_ATTRIBUTE_KEYS/attributeMax below cover the 9 metatype-capped
// attributes only. Magic/Resonance use the same x5 cost but a different,
// Grade-aware ceiling (deriveEssence.ts's magicMax/resonanceMax) - see
// pages/play/Advancement.tsx, which calls attributeAdvanceCost directly for
// those two rather than going through attributeMax.
import type { AdvancementEntry, CharacterData } from "./character";
import type { MetatypeAttributes, MetavariantCatalogEntry } from "./rules";
import { effectiveMetatypeInfo } from "./deriveMetavariant";

export const CORE_ATTRIBUTE_KEYS = [
  "body",
  "agility",
  "reaction",
  "strength",
  "willpower",
  "logic",
  "intuition",
  "charisma",
  "edge",
] as const;

export type CoreAttributeKey = (typeof CORE_ATTRIBUTE_KEYS)[number];

export function attributeAdvanceCost(newRating: number): number {
  return newRating * 5;
}

export function skillAdvanceCost(newRating: number): number {
  return newRating * 5;
}

export function advancementKarmaTotal(entries: AdvancementEntry[] | undefined): number {
  return (entries ?? []).reduce((sum, e) => sum + e.karmaCost, 0);
}

/**
 * Natural attribute maximum for the character's metatype/metavariant - the
 * same ceiling PriorityBuilder's "Adjustment Points" special-attribute
 * funding uses, since chargen never lets a priority-bought rating exceed it
 * either.
 */
export function attributeMax(
  data: CharacterData,
  key: CoreAttributeKey,
  metatypeAttributes: MetatypeAttributes[],
  metavariants: MetavariantCatalogEntry[]
): number {
  const info = effectiveMetatypeInfo(data, metatypeAttributes, metavariants);
  return info ? info[key].max : 6;
}

/**
 * Natural (post-chargen) skill maximum: 9, or 10 for the one skill chosen by
 * the "Aptitude (Skill)" quality (core rulebook p. 71 aside, qualities.ts's
 * "aptitude" entry: "maximum rises to 10 instead of 9").
 */
export function skillMax(data: CharacterData, skill: string): number {
  const hasAptitude = data.qualities.some((q) => q.id === "aptitude" && q.param === skill);
  return hasAptitude ? 10 : 9;
}
