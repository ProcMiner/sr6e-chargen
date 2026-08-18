// Small pure helpers for the Complex Form picker/summary, mirroring
// deriveSpells.ts almost exactly - complex forms are technomancers'
// equivalent of spells.
//
// Free complex form allotment differs by build system:
// - Priority (core rulebook p. 189-190, character creation step
//   "Resonance," p. 68): "When they select their Resonance Priority, they
//   also select a number of complex forms equal to Resonance x 2 (using the
//   Resonance figure from the Priority table, not the number as adjusted)" -
//   the full Resonance x2 is free.
// - Life Path (Sixth World Companion p. 31, "Adept Powers, Complex Forms,
//   and Spells"): "Technomancers gain a number of complex forms equal to
//   Resonance and may purchase additional complex forms (up to a maximum of
//   Resonance x 2) for 5 Karma each" - only Resonance x1 is free; the rest
//   of the way to the same Resonance x2 ceiling costs Karma like any other
//   post-allotment complex form ("New Complex Forms," p. 70). Uses current
//   effective Resonance (Essence-capped), same as deriveAdeptPowers.ts's
//   Power Point pool, since Life Path has no frozen Priority-table rating to
//   read instead.
import type { CharacterData, LifepathSystemState, PrioritySystemState } from "./character";
import type { PriorityRulesResponse } from "./rules";
import { effectiveResonance } from "./deriveEssence";

export const KARMA_PER_COMPLEX_FORM = 5;

export function freeComplexFormAllotment(
  data: CharacterData,
  priorityRules: PriorityRulesResponse | undefined
): number {
  const state = data.systemState as PrioritySystemState & LifepathSystemState;

  if (state?.magicOption === "Technomancer") {
    if (!priorityRules || !state.priorities?.magic) return 0;
    const magicRow = priorityRules.priorityTable.find((r) => r.priority === state.priorities.magic);
    const option = magicRow?.magic.find((m) => m.option === "Technomancer");
    const resonanceBase = option?.rating ?? 0;
    return resonanceBase * 2;
  }

  if (state?.awakenedType === "Emerged") {
    return effectiveResonance(data);
  }

  return 0;
}

export function complexFormKarmaCost(data: CharacterData, priorityRules: PriorityRulesResponse | undefined): number {
  const known = data.complexForms?.length ?? 0;
  const free = freeComplexFormAllotment(data, priorityRules);
  return Math.max(0, known - free) * KARMA_PER_COMPLEX_FORM;
}
