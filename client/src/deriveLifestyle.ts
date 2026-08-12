// Small pure helpers for the Lifestyle picker, mirroring deriveGear.ts.
//
// This covers only the Core Rulebook's basic six-tier lifestyle rules (p.
// 56-57): flat monthly cost, no per-category customization. The Sixth World
// Companion's deeper "build your own home" Lifestyle Points system
// (Neighborhood/Necessities/Comforts/Security/Entertainment/Space + buyable
// Lifestyle Qualities, p. 178+) is a separate, much larger follow-on chunk -
// deliberately not attempted here, same staged approach as Spells before
// Adept Powers.
import type { LifestyleLine } from "./character";
import type { LifestyleCatalogEntry } from "./rules";

export function findLifestyleEntry(id: string, catalog: LifestyleCatalogEntry[]): LifestyleCatalogEntry | undefined {
  return catalog.find((l) => l.id === id);
}

export function lifestyleCostTotal(lifestyles: LifestyleLine[]): number {
  return lifestyles.reduce((sum, line) => sum + line.monthsPrepaid * line.costPerMonth, 0);
}
