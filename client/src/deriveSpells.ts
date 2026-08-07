// Small pure helpers for the Spell picker/summary, mirroring deriveGear.ts.
//
// Free spell allotment (core rulebook p. 65-66, "Learning Spells" p. 130):
// "Sorcerers select a number of free spells or rituals equal to their Magic
// x2 - the rating used is the Magic in the Priority table, not as altered
// with any points, Karma, or adjustments." This is stated only for
// Priority-built characters (Full and Aspected magicians; Mystic Adepts get
// the same formula per p. 66, though RAW has them spend Magic on adept
// powers first - not modeled here since Adept Powers isn't built yet, see
// README's deferred items). No equivalent free-grant text exists for the
// Life Path chapter, so Life Path characters get 0 free spells and pay the
// standard 5 Karma per spell for everything, same as any spell learned
// beyond the free allotment ("New Spells", p. 69-70).
import type { CharacterData, PrioritySystemState } from "./character";
import type { PriorityRulesResponse } from "./rules";

export const KARMA_PER_SPELL = 5;

const FREE_ALLOTMENT_OPTIONS = new Set(["Full", "Aspected", "Mystic Adept"]);

export function freeSpellAllotment(data: CharacterData, priorityRules: PriorityRulesResponse | undefined): number {
  const state = data.systemState as PrioritySystemState;
  const magicOption = state?.magicOption;
  if (!magicOption || !FREE_ALLOTMENT_OPTIONS.has(magicOption)) return 0;
  if (!priorityRules || !state.priorities?.magic) return 0;

  const magicRow = priorityRules.priorityTable.find((r) => r.priority === state.priorities.magic);
  const option = magicRow?.magic.find((m) => m.option === magicOption);
  return (option?.rating ?? 0) * 2;
}

export function spellKarmaCost(data: CharacterData, priorityRules: PriorityRulesResponse | undefined): number {
  const known = data.spells?.length ?? 0;
  const free = freeSpellAllotment(data, priorityRules);
  return Math.max(0, known - free) * KARMA_PER_SPELL;
}
