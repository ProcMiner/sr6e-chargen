// Small pure helpers for the Adept Power picker/summary, mirroring
// deriveGear.ts's pattern.
//
// Power Points (core rulebook p. 156): "Whenever adept characters gain or
// lose a point of Magic, they also gain or lose a power point" - unlike the
// free-spell allotment (which freezes at the Priority table's base Magic
// rating), an Adept's Power Point pool tracks their CURRENT effective Magic
// (Essence-capped, same value shown everywhere else in the app), so it's
// derived fresh here rather than stored.
//
// Mystic Adepts (p. 158-159) split their Magic between the two: "They get 1
// power point for each point of Magic dedicated to the adept side, and
// spells equal to the amount of Magic dedicated to being a mage x 2." That
// split is a player choice at chargen, so `data.mysticAdeptPowerPoints`
// stores how many points of (base) Magic went to the adept side - capped by
// current effective Magic, same Essence-loss interaction as a pure Adept.
// See deriveSpells.ts's freeSpellAllotment for the other half of the split.
import type { AdeptPowerLine, CharacterData } from "./character";
import type { AdeptPowerCatalogEntry } from "./rules";
import { effectiveMagic } from "./deriveEssence";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** "Full" | "Aspected" | "Mystic Adept" | "Adept" | "Technomancer" | "Mundane" (Priority), or "Full Magician" | "Aspected Magician" | "Mystic Adept" | "Adept" | "Emerged" | "Mundane" (Life Path) - both naming schemes agree on "Adept" and "Mystic Adept", which is all this file cares about. */
export function getMagicOrAwakenedType(data: CharacterData): string | undefined {
  const state = data.systemState as { magicOption?: string; awakenedType?: string };
  return state?.magicOption ?? state?.awakenedType;
}

export function isAdept(data: CharacterData): boolean {
  return getMagicOrAwakenedType(data) === "Adept";
}

export function isMysticAdept(data: CharacterData): boolean {
  return getMagicOrAwakenedType(data) === "Mystic Adept";
}

export function findAdeptPowerEntry(id: string, catalog: AdeptPowerCatalogEntry[]): AdeptPowerCatalogEntry | undefined {
  return catalog.find((p) => p.id === id);
}

export function ratingFor(entry: AdeptPowerCatalogEntry, level: number | undefined): number {
  if (!entry.levels) return 1;
  const { min, max } = entry.levels;
  return Math.max(min, Math.min(max, level ?? min));
}

/** Power Point cost for a catalog entry at a given level (level is ignored for flat-cost entries). */
export function adeptPowerUnitCost(entry: AdeptPowerCatalogEntry, level: number | undefined): number {
  return entry.levels ? round2(entry.cost * ratingFor(entry, level)) : entry.cost;
}

/** Total Power Point pool: current effective Magic for a pure Adept, the allocated (and Magic-capped) share for a Mystic Adept, 0 otherwise. */
export function adeptPowerPointPool(data: CharacterData): number {
  const type = getMagicOrAwakenedType(data);
  const magic = effectiveMagic(data);
  if (type === "Adept") return magic;
  if (type === "Mystic Adept") return Math.max(0, Math.min(data.mysticAdeptPowerPoints ?? 0, magic));
  return 0;
}

export function adeptPowerPointsSpent(lines: AdeptPowerLine[], catalog: AdeptPowerCatalogEntry[]): number {
  return round2(
    lines.reduce((sum, line) => {
      const entry = findAdeptPowerEntry(line.powerId, catalog);
      return entry ? sum + adeptPowerUnitCost(entry, line.level) : sum;
    }, 0)
  );
}

export function adeptPowerPointsRemaining(data: CharacterData, catalog: AdeptPowerCatalogEntry[]): number {
  return round2(adeptPowerPointPool(data) - adeptPowerPointsSpent(data.adeptPowers, catalog));
}
