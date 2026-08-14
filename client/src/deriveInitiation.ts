// Small pure helpers for Initiation (Magic) and Submersion (Resonance) -
// raising a character's Initiate/Submersion Grade during play, which in turn
// raises Magic/Resonance's natural maximum (see deriveEssence.ts's
// magicMax/resonanceMax). Mirrors deriveAdvancement.ts's pattern: nothing
// here is stored as "remaining," it's derived from `data.initiations`, the
// itemized purchase log.
//
// Core rulebook, "Initiation": "Your Initiate Grade can never exceed your
// Magic rating. [...] To start initiation, make a [...] Extended test [...]
// and spend (10 + desired Initiate Grade) Karma." Submersion mirrors this
// exactly with Resonance in place of Magic (same "6 + Grade" natural-max
// phrasing in deriveEssence.ts's header comment).
import type { CharacterData, InitiationEntry } from "./character";

export function initiationCost(desiredGrade: number): number {
  return 10 + desiredGrade;
}

export function initiationKarmaTotal(entries: InitiationEntry[] | undefined): number {
  return (entries ?? []).reduce((sum, e) => sum + e.karmaCost, 0);
}

/** True once Magic's rating is high enough to support the next Initiate Grade ("Grade can never exceed Magic rating"). */
export function canInitiate(data: CharacterData): boolean {
  const nextGrade = (data.initiateGrade ?? 0) + 1;
  return (data.attributes.magic ?? 0) >= nextGrade;
}

/** Same gate as canInitiate, mirrored onto Resonance. */
export function canSubmerge(data: CharacterData): boolean {
  const nextGrade = (data.submersionGrade ?? 0) + 1;
  return (data.attributes.resonance ?? 0) >= nextGrade;
}
