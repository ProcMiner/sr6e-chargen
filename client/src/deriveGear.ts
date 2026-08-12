// Small pure helpers for the Gear picker/summary, mirroring deriveQualities.ts.
//
// `data.nuyen` itself is never renamed or mutated here - it keeps meaning
// "total nuyen ever earned," exactly as Priority's "Apply X¥" button and Life
// Path's module accumulation already set it. Remaining spending money is
// always derived from nuyen minus gear cost, never stored, so a future
// career-mode nuyen-earning feature just adds to `data.nuyen` and this math
// keeps working unchanged. Lifestyle purchases (see deriveLifestyle.ts's
// lifestyleCostTotal) also spend from this same pool - callers thread it in
// as `nuyenRemaining`'s optional second argument, same pattern as
// `karmaRemaining`'s extraKarmaSpent below.
//
// `data.karma` follows the same pattern for a second, independent pool:
// QualityPicker.tsx sets it to (starting Karma + net quality Karma) - that's
// the character's total available Karma pool, untouched here. Magical foci
// additionally cost Karma to bond (see GearCatalogEntry.bondingKarma below),
// so `karmaRemaining` derives the pool minus gear-based bonding costs, never
// stored, exactly mirroring `nuyenRemaining`. Learning spells beyond the
// free allotment also spends from this same pool (see deriveSpells.ts's
// spellKarmaCost) - callers that need that too pass it as the optional
// second argument, since computing it here would require pulling in
// PriorityRulesResponse for a file that's otherwise gear-only.
import type { CharacterData, GearLine } from "./character";
import type { GearCatalogEntry } from "./rules";

export function findGearEntry(id: string, catalog: GearCatalogEntry[]): GearCatalogEntry | undefined {
  return catalog.find((g) => g.id === id);
}

export function gearCostTotal(gear: GearLine[]): number {
  return gear.reduce((sum, line) => sum + line.qty * line.unitCost, 0);
}

export function nuyenRemaining(data: CharacterData, extraNuyenSpent = 0): number {
  return data.nuyen - gearCostTotal(data.gear) - extraNuyenSpent;
}

export function gearBondingKarmaTotal(gear: GearLine[]): number {
  return gear.reduce((sum, line) => sum + (line.bondingKarma ?? 0) * line.qty, 0);
}

export function karmaRemaining(data: CharacterData, extraKarmaSpent = 0): number {
  return data.karma - gearBondingKarmaTotal(data.gear) - extraKarmaSpent;
}

export function ratingFor(entry: GearCatalogEntry, rating: number | undefined): number {
  if (!entry.levels) return 1;
  const { min, max } = entry.levels;
  return Math.max(min, Math.min(max, rating ?? min));
}

/** Unit cost for a catalog entry at a given rating (rating is ignored for flat-cost entries). */
export function gearUnitCost(entry: GearCatalogEntry, rating: number | undefined): number {
  return entry.levels ? entry.cost * ratingFor(entry, rating) : entry.cost;
}

/** Essence cost for a catalog entry at a given rating, same per-level convention as gearUnitCost. */
export function gearUnitEssenceCost(entry: GearCatalogEntry, rating: number | undefined): number | undefined {
  if (entry.essenceCost === undefined) return undefined;
  return entry.levels ? entry.essenceCost * ratingFor(entry, rating) : entry.essenceCost;
}

/** Karma bonding cost for a catalog entry at a given rating, same per-level convention as gearUnitCost. */
export function gearUnitBondingKarma(entry: GearCatalogEntry, rating: number | undefined): number | undefined {
  if (entry.bondingKarma === undefined) return undefined;
  return entry.levels ? entry.bondingKarma * ratingFor(entry, rating) : entry.bondingKarma;
}
