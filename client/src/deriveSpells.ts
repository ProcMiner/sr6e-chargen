// Small pure helpers for the Spell picker/summary, mirroring deriveGear.ts.
//
// Free spell allotment differs by build system:
// - Priority (core rulebook p. 65-66, "Learning Spells" p. 130): "Sorcerers
//   select a number of free spells or rituals equal to their Magic x2 - the
//   rating used is the Magic in the Priority table, not as altered with any
//   points, Karma, or adjustments." Full and Aspected magicians get the flat
//   Magic x2 formula. Mystic Adepts split their Magic between spells and
//   adept powers first (p. 158-159): "spells equal to the amount of Magic
//   dedicated to being a mage x 2" - i.e. (base Magic - mysticAdeptPowerPoints)
//   x 2, see deriveAdeptPowers.ts for the other half of that split.
// - Life Path (Sixth World Companion p. 31, "Adept Powers, Complex Forms,
//   and Spells"): magicians (full and aspected) gain spells equal to Magic
//   (x1, not x2) for free, with additional ones purchasable for 5 Karma each
//   up to the same Magic x2 ceiling. Mystic Adepts "must choose whether to
//   gain a power point or spell for each point of Magic" - one or the
//   other, not both - so their free spell count is
//   (Magic - mysticAdeptPowerPoints) x 1, not x2. Uses current effective
//   Magic (Essence-capped), same as deriveAdeptPowers.ts's Power Point pool,
//   since Life Path has no frozen Priority-table rating to read instead.
import type { CharacterData, LifepathSystemState, PrioritySystemState } from "./character";
import type { PriorityRulesResponse } from "./rules";
import { effectiveMagic } from "./deriveEssence";

export const KARMA_PER_SPELL = 5;

const PRIORITY_FREE_ALLOTMENT_OPTIONS = new Set(["Full", "Aspected", "Mystic Adept"]);
const LIFEPATH_FREE_ALLOTMENT_OPTIONS = new Set(["Full Magician", "Aspected Magician", "Mystic Adept"]);

export function freeSpellAllotment(data: CharacterData, priorityRules: PriorityRulesResponse | undefined): number {
  const state = data.systemState as PrioritySystemState & LifepathSystemState;

  if (state?.magicOption && PRIORITY_FREE_ALLOTMENT_OPTIONS.has(state.magicOption)) {
    if (!priorityRules || !state.priorities?.magic) return 0;
    const magicRow = priorityRules.priorityTable.find((r) => r.priority === state.priorities.magic);
    const option = magicRow?.magic.find((m) => m.option === state.magicOption);
    const magicBase = option?.rating ?? 0;

    if (state.magicOption === "Mystic Adept") {
      const powerPoints = Math.min(data.mysticAdeptPowerPoints ?? 0, magicBase);
      return Math.max(0, magicBase - powerPoints) * 2;
    }
    return magicBase * 2;
  }

  if (state?.awakenedType && LIFEPATH_FREE_ALLOTMENT_OPTIONS.has(state.awakenedType)) {
    const magicEffective = effectiveMagic(data);

    if (state.awakenedType === "Mystic Adept") {
      const powerPoints = Math.min(data.mysticAdeptPowerPoints ?? 0, magicEffective);
      return Math.max(0, magicEffective - powerPoints);
    }
    return magicEffective;
  }

  return 0;
}

export function spellKarmaCost(data: CharacterData, priorityRules: PriorityRulesResponse | undefined): number {
  const known = data.spells?.length ?? 0;
  const free = freeSpellAllotment(data, priorityRules);
  return Math.max(0, known - free) * KARMA_PER_SPELL;
}
