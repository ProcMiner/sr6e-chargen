// Small pure helpers for the Gear picker/summary, mirroring deriveQualities.ts.
//
// `data.nuyen` itself is never renamed or mutated here - it keeps meaning
// "total nuyen ever earned," exactly as Priority's "Apply X¥" button and Life
// Path's module accumulation already set it. Remaining spending money is
// always derived from nuyen minus gear cost, never stored, so a future
// career-mode nuyen-earning feature just adds to `data.nuyen` and this math
// keeps working unchanged.
import type { CharacterData, GearLine } from "./character";
import type { GearCatalogEntry } from "./rules";

export function findGearEntry(id: string, catalog: GearCatalogEntry[]): GearCatalogEntry | undefined {
  return catalog.find((g) => g.id === id);
}

export function gearCostTotal(gear: GearLine[]): number {
  return gear.reduce((sum, line) => sum + line.qty * line.unitCost, 0);
}

export function nuyenRemaining(data: CharacterData): number {
  return data.nuyen - gearCostTotal(data.gear);
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
