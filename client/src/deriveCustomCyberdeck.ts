// Custom Cyberdecks (Hack & Slash pp.34-39, "Getting Down to Work"): a
// deckmeister-built deck assembled from three priced components - Core
// (sets Device Rating), Attack Module, and Sleaze Module - within a Core
// Slot budget, plus optional extra program slots. Everything here is pure
// math over CharacterData["gear"][n].customCyberdeck (see character.ts),
// same "derive, never store computed values" convention as every other
// picker in this project.
//
// Deliberately out of scope, same "no dice-rolling engine, no crafting
// simulation" boundary as everywhere else in this app: the 7 case types
// and 5 case mods (concealment flavor, no mechanical stat), Response
// Increase/Reality Filter/Turbo-Charger/Cyberjack Boosters (optional
// accessories, not needed to "build a deck"), Dedicated Program Slots
// (tied to one specific program - this app has no per-slot program
// binding for anything), and the DIY Karma-for-nuyen build path (an
// Electronics + Logic extended test this app doesn't simulate). Also
// out of scope: enforcing the book's Availability/Contact gating
// ("max Availability you can acquire is your Matrix contact's Connection
// + Loyalty... limited to Availability 6 for illegal items at chargen") -
// this app has never enforced Availability as a chargen restriction for
// anyone (see [[priority_power_level_variants]]/[[custom_deck]]), so
// availabilityDisplay() below is reference text only, same treatment.
export interface CustomCyberdeckStats {
  coreRating: number;
  attackRating: number;
  sleazeRating: number;
  extraProgramSlots: number;
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
