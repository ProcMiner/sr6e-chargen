// Custom Cyberdecks (Hack & Slash pp.34-39, "Getting Down to Work"): a
// deckmeister-built deck assembled from three priced components - Core
// (sets Device Rating), Attack Module, and Sleaze Module - within a Core
// Slot budget, plus optional extra program slots. Everything here is pure
// math over CharacterData["gear"][n].customCyberdeck (see character.ts),
// same "derive, never store computed values" convention as every other
// picker in this project.
//
// The "Building Your Own" DIY path (p.35) is also modeled, simplified: RAW
// gates it behind an extended Matrix Search test (find the plans) and an
// extended Electronics + Logic test (print and assemble), with "each Karma
// you spend covers 4,000 nuyen of the component's cost." At chargen, the
// build happens before play starts and the time those tests would take
// doesn't matter - confirmed with the user rather than assumed - so this
// app skips both rolls and just lets Karma substitute for nuyen at that
// same 4,000:1 rate (5,000:1 with the Deck Builder quality - see
// diyNuyenPerKarma() below), blended across the whole deck rather than
// tracked per-component (Core/Attack/Sleaze) the way RAW's extended tests
// would. Scoped to the custom deck only, not the Cyberhack the book also
// allows building this way - that stays a flat nuyen catalog purchase for
// now.
//
// Deliberately out of scope, same "no dice-rolling engine, no crafting
// simulation" boundary as everywhere else in this app: the 7 case types
// and 5 case mods (concealment flavor, no mechanical stat), Response
// Increase/Reality Filter/Turbo-Charger/Cyberjack Boosters (optional
// accessories, not needed to "build a deck"), and Dedicated Program Slots
// (tied to one specific program - this app has no per-slot program
// binding for anything). Also out of scope: enforcing the book's
// Availability/Contact gating ("max Availability you can acquire is your
// Matrix contact's Connection + Loyalty... limited to Availability 6 for
// illegal items at chargen") - this app has never enforced Availability as
// a chargen restriction for anyone (see
// [[priority_power_level_variants]]/[[custom_deck]]), so
// availabilityDisplay() below is reference text only, same treatment.
import type { CharacterData, GearLine } from "./character";

export interface CustomCyberdeckStats {
  coreRating: number;
  attackRating: number;
  sleazeRating: number;
  extraProgramSlots: number;
}

/** Nuyen covered per Karma spent on the DIY build path (p.35, "each Karma you spend covers 4,000 nuyen of the component's cost") - 5,000 instead with the Deck Builder quality ("each point of Karma is worth 5,000 nuyen (instead of 4,000)," Hack & Slash p.81). */
export function diyNuyenPerKarma(data: CharacterData): number {
  return data.qualities.some((q) => q.id === "deck-builder") ? 5_000 : 4_000;
}

export const CORE_RATING_MIN = 1;
export const CORE_RATING_MAX = 6;

/** Core component cost (p.39 table): flat per-rating below 5, flat lump sums at 5 and 6. */
export function coreCost(rating: number): number {
  if (rating >= 6) return 150_000;
  if (rating === 5) return 50_000;
  return rating * 5_000;
}

/** Attack/Sleaze Module cost - both modules share this exact cost curve (p.39 table). */
export function moduleCost(rating: number): number {
  if (rating >= 9) return 90_000;
  if (rating >= 5) return rating * 5_000;
  return rating * 2_000;
}

/** Core Slots an Attack/Sleaze Module consumes: Rating/3, rounded up (p.39 table), except the flat 3 slots at rating 9. */
export function moduleCoreSlots(rating: number): number {
  if (rating >= 9) return 3;
  return Math.ceil(rating / 3);
}

/** "The rating of an individual Attack or Sleaze module cannot be higher than the deck's Device Rating x 2" (p.36) - capped at 9, the top of the printed cost table. */
export function maxModuleRating(coreRating: number): number {
  return Math.min(9, coreRating * 2);
}

/** "A cyberdeck has a number of available core slots equal to its Device Rating x 3" (p.36). */
export function totalCoreSlotBudget(coreRating: number): number {
  return coreRating * 3;
}

/** Each extra Internal Program Slot costs 1 Core Slot and 2,000¥ (p.39 table); a deck starts with free slots equal to its Device Rating (p.36), not counted here. */
export function programSlotCoreSlots(extraProgramSlots: number): number {
  return extraProgramSlots;
}

export function programSlotCost(extraProgramSlots: number): number {
  return extraProgramSlots * 2_000;
}

/** Core Slots spent on Attack + Sleaze Modules + extra program slots - the Core itself spends none ("—" in its own Core Slots column). */
export function coreSlotsUsed(stats: CustomCyberdeckStats): number {
  return moduleCoreSlots(stats.attackRating) + moduleCoreSlots(stats.sleazeRating) + programSlotCoreSlots(stats.extraProgramSlots);
}

export function coreSlotsRemaining(stats: CustomCyberdeckStats): number {
  return totalCoreSlotBudget(stats.coreRating) - coreSlotsUsed(stats);
}

export function totalCost(stats: CustomCyberdeckStats): number {
  return coreCost(stats.coreRating) + moduleCost(stats.attackRating) + moduleCost(stats.sleazeRating) + programSlotCost(stats.extraProgramSlots);
}

/** Nuyen still owed after `karmaSpent` Karma covered part of the build cost via the DIY path, floored at 0. */
export function karmaFundedNuyenCost(cost: number, karmaSpent: number, nuyenPerKarma: number): number {
  return Math.max(0, cost - karmaSpent * nuyenPerKarma);
}

/** The most Karma it's ever useful to spend on a given cost - beyond this, the nuyen owed is already 0. */
export function maxUsefulKarma(cost: number, nuyenPerKarma: number): number {
  return Math.ceil(cost / nuyenPerKarma);
}

/** Sum of Karma spent DIY-building every owned custom cyberdeck - feeds into the shared Karma pool the same way spell/complex-form/Initiation Karma costs do (see tailSteps.tsx's extraKarmaSpent). */
export function customCyberdeckKarmaTotal(gear: GearLine[]): number {
  return gear.reduce((sum, line) => sum + (line.customCyberdeck?.karmaSpent ?? 0), 0);
}

/** Active program slots: the free allotment (= Device Rating) plus any extra Internal Program Slots bought. */
export function activeProgramSlots(stats: CustomCyberdeckStats): number {
  return stats.coreRating + stats.extraProgramSlots;
}

/** Reference-only display string ("6(I)") - not enforced anywhere, see this file's header comment. */
export function availabilityDisplay(stats: CustomCyberdeckStats): string {
  return `${Math.max(stats.coreRating, stats.attackRating, stats.sleazeRating)}(I)`;
}

export function defaultCustomCyberdeckStats(): CustomCyberdeckStats {
  return { coreRating: 1, attackRating: 1, sleazeRating: 1, extraProgramSlots: 0 };
}
