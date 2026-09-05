// Essence tracking, mirroring deriveGear.ts's pattern. Essence isn't a
// Priority/Karma-purchased attribute - every character starts at 6.00 and it
// only drops via Essence-costing gear (cyberware/bioware), so it's derived
// from `data.gear` the same way `nuyenRemaining` is derived from `data.gear`.
//
// SR6 core rulebook states, with identical phrasing for both attributes:
// "Your maximum Magic rank is 6 + Initiate Grade (reduced by one for every
// full point of Essence lost)." / "The natural maximum for your Resonance
// attribute is 6 + your Submersion grade (reduced by one for every full
// point of Essence lost)." Grade is tracked in data.initiateGrade/
// submersionGrade (see character.ts's InitiationEntry and
// deriveInitiation.ts) - `essenceMax` below is the Grade-0 case of that
// formula; `magicMax`/`resonanceMax` add the Grade on *before* the
// Essence-loss floor is applied, matching the book's "(6 + Grade) reduced by
// Essence loss" phrasing exactly (adding Grade after clamping essenceMax at
// 0 would under-count once Essence loss alone would have floored it).
import type { CharacterData, GearLine } from "./character";

const STARTING_ESSENCE = 6;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Strips trailing zeros, e.g. 6 -> "6", 5.8 -> "5.8", 4.25 -> "4.25". */
export function formatEssence(n: number): string {
  return n.toFixed(2).replace(/\.?0+$/, "");
}

export function essenceUsed(gear: GearLine[]): number {
  return round2(gear.reduce((sum, line) => sum + (line.essenceCost ?? 0) * line.qty, 0));
}

export function currentEssence(data: CharacterData): number {
  return Math.max(0, round2(STARTING_ESSENCE - essenceUsed(data.gear)));
}

function naturalMax(data: CharacterData, grade: number): number {
  const pointsLost = STARTING_ESSENCE - currentEssence(data);
  return Math.max(0, STARTING_ESSENCE + grade - Math.floor(pointsLost));
}

export function essenceMax(data: CharacterData): number {
  return naturalMax(data, 0);
}

export function magicMax(data: CharacterData): number {
  return naturalMax(data, data.initiateGrade ?? 0);
}

export function resonanceMax(data: CharacterData): number {
  return naturalMax(data, data.submersionGrade ?? 0);
}

export function effectiveMagic(data: CharacterData): number {
  return Math.min(data.attributes.magic ?? 0, magicMax(data));
}

export function effectiveResonance(data: CharacterData): number {
  return Math.min(data.attributes.resonance ?? 0, resonanceMax(data));
}
