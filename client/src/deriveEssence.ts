// Essence tracking, mirroring deriveGear.ts's pattern. Essence isn't a
// Priority/Karma-purchased attribute - every character starts at 6.00 and it
// only drops via Essence-costing gear (cyberware/bioware), so it's derived
// from `data.gear` the same way `nuyenRemaining` is derived from `data.gear`.
//
// SR6 core rulebook states, with identical phrasing for both attributes:
// "Your maximum Magic rank is 6 + Initiate Grade (reduced by one for every
// full point of Essence lost)." / "The natural maximum for your Resonance
// attribute is 6 + your Submersion grade (reduced by one for every full
// point of Essence lost)." Initiate/Submersion Grade aren't tracked yet
// (post-creation Karma advancement, not built) - `essenceMax` below is the
// Grade-0 case of that same formula, not a different one; a future
// Grade-tracking feature just adds `+ grade` here with no call-site changes.
import type { CharacterData, GearLine } from "./character";

const STARTING_ESSENCE = 6;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function essenceUsed(gear: GearLine[]): number {
  return round2(gear.reduce((sum, line) => sum + (line.essenceCost ?? 0) * line.qty, 0));
}

export function currentEssence(data: CharacterData): number {
  return Math.max(0, round2(STARTING_ESSENCE - essenceUsed(data.gear)));
}

export function essenceMax(data: CharacterData): number {
  const pointsLost = STARTING_ESSENCE - currentEssence(data);
  return Math.max(0, STARTING_ESSENCE - Math.floor(pointsLost));
}

export function effectiveMagic(data: CharacterData): number {
  return Math.min(data.attributes.magic ?? 0, essenceMax(data));
}

export function effectiveResonance(data: CharacterData): number {
  return Math.min(data.attributes.resonance ?? 0, essenceMax(data));
}
