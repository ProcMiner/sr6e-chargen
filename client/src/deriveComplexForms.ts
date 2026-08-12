// Small pure helpers for the Complex Form picker/summary, mirroring
// deriveSpells.ts almost exactly - complex forms are technomancers'
// equivalent of spells.
//
// Free complex form allotment (core rulebook p. 189-190, character creation
// step "Resonance," p. 68): "When they select their Resonance Priority, they
// also select a number of complex forms equal to Resonance x 2 (using the
// Resonance figure from the Priority table, not the number as adjusted)."
// Priority-only, same as free spells - no equivalent grant text exists for
// the Life Path chapter (its "Emerged" awakenedType, see
// deriveAdeptPowers.ts's getMagicOrAwakenedType), so Life Path technomancers
// get 0 free complex forms and pay the standard 5 Karma for every one
// ("New Complex Forms," p. 70).
import type { CharacterData, PrioritySystemState } from "./character";
import type { PriorityRulesResponse } from "./rules";

export const KARMA_PER_COMPLEX_FORM = 5;

export function freeComplexFormAllotment(
  data: CharacterData,
  priorityRules: PriorityRulesResponse | undefined
): number {
  const state = data.systemState as PrioritySystemState;
  if (state?.magicOption !== "Technomancer") return 0;
  if (!priorityRules || !state.priorities?.magic) return 0;

  const magicRow = priorityRules.priorityTable.find((r) => r.priority === state.priorities.magic);
  const option = magicRow?.magic.find((m) => m.option === "Technomancer");
  const resonanceBase = option?.rating ?? 0;

  return resonanceBase * 2;
}

export function complexFormKarmaCost(data: CharacterData, priorityRules: PriorityRulesResponse | undefined): number {
  const known = data.complexForms?.length ?? 0;
  const free = freeComplexFormAllotment(data, priorityRules);
  return Math.max(0, known - free) * KARMA_PER_COMPLEX_FORM;
}
