// Small pure helpers for the Spell picker/summary, mirroring deriveGear.ts.
//
// Free spell allotment (core rulebook p. 65-66, "Learning Spells" p. 130):
// "Sorcerers select a number of free spells or rituals equal to their Magic
// x2 - the rating used is the Magic in the Priority table, not as altered
// with any points, Karma, or adjustments." This is stated only for
// Priority-built characters (Full and Aspected magicians get the flat Magic
// x2 formula). Mystic Adepts split their Magic between spells and adept
// powers first (p. 158-159): "spells equal to the amount of Magic dedicated
// to being a mage x 2" - i.e. (base Magic - mysticAdeptPowerPoints) x 2, see
// deriveAdeptPowers.ts for the other half of that split. No equivalent
// free-grant text exists for the Life Path chapter, so Life Path characters
// get 0 free spells and pay the standard 5 Karma per spell for everything,
// same as any spell learned beyond the free allotment ("New Spells", p.
// 69-70).
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
  const magicBase = option?.rating ?? 0;

  if (magicOption === "Mystic Adept") {
    const powerPoints = Math.min(data.mysticAdeptPowerPoints ?? 0, magicBase);
    return Math.max(0, magicBase - powerPoints) * 2;
  }
  return magicBase * 2;
}

export function spellKarmaCost(data: CharacterData, priorityRules: PriorityRulesResponse | undefined): number {
  const known = data.spells?.length ?? 0;
  const free = freeSpellAllotment(data, priorityRules);
  return Math.max(0, known - free) * KARMA_PER_SPELL;
}
