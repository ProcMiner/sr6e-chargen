// Adjustment Points (from the Metatype priority) fund three things: Edge,
// pushing a "special racial attribute" above 6, and boosting Magic/Resonance
// above its base rating - up to a hard cap of 6 (core rulebook p.63-65).
// Spending happens across three different chargen steps (Metatype, Attributes,
// Magic/Resonance), so this is shared by all three plus SummarySheet, which
// keeps a running "remaining" total visible no matter which of those steps
// you're on.
import type { CharacterData, PrioritySystemState } from "./character";
import type { MetatypeAttributes, PriorityRulesResponse } from "./rules";
import { effectiveMetatypeInfo, findMetavariant } from "./deriveMetavariant";
import { effectivePriorityLetter } from "./derivePriorityVariant";

// Edge is deliberately excluded here: per the core rulebook (p. 63), Edge is
// funded entirely by Metatype Adjustment Points, not the Attributes
// priority's point pool.
export const CORE_ATTRIBUTE_KEYS = [
  "body",
  "agility",
  "reaction",
  "strength",
  "willpower",
  "logic",
  "intuition",
  "charisma",
] as const;

export type CoreAttributeKeyNoEdge = (typeof CORE_ATTRIBUTE_KEYS)[number];

// Normal attribute points can only raise a core attribute up to 6, even if
// the metatype's max is higher - anything above 6 ("special racial
// attributes" per p. 63) draws from Adjustment Points instead.
export function normalCap(metatypeInfo: MetatypeAttributes | undefined, key: CoreAttributeKeyNoEdge): number {
  return metatypeInfo ? Math.min(6, metatypeInfo[key].max) : 6;
}

export function isSpecialAttribute(metatypeInfo: MetatypeAttributes | undefined, key: CoreAttributeKeyNoEdge): boolean {
  return !!metatypeInfo && metatypeInfo[key].max > 6;
}

export interface AdjustmentPoints {
  total: number;
  spent: number;
  remaining: number;
}

export function deriveAdjustmentPoints(data: CharacterData, rules: PriorityRulesResponse): AdjustmentPoints {
  const state = (data.systemState as PrioritySystemState)?.priorities
    ? (data.systemState as PrioritySystemState)
    : { priorities: {} };

  const metatypeRow = rules.priorityTable.find(
    (r) => r.priority === effectivePriorityLetter(state.priorities.metatype, state.powerLevel)
  );
  const magicRow = rules.priorityTable.find(
    (r) => r.priority === effectivePriorityLetter(state.priorities.magic, state.powerLevel)
  );

  const metatypeInfo = effectiveMetatypeInfo(data, rules.metatypeAttributes, rules.metavariants);
  const selectedMetavariant = findMetavariant(data, rules.metavariants);
  const effectiveMetatypeLetter = effectivePriorityLetter(state.priorities.metatype, state.powerLevel);

  const total = selectedMetavariant
    ? (effectiveMetatypeLetter && selectedMetavariant.adjustmentPoints[effectiveMetatypeLetter]) || 0
    : (metatypeRow?.metatype.find((m) => m.metatype === data.metatype)?.adjustmentPoints ?? 0);

  const edgeSpent = (data.attributes.edge ?? 1) - 1;

  const adjustmentFundedAttributes = state.adjustmentFundedAttributes ?? [];
  const racialAdjustmentSpent = metatypeInfo
    ? CORE_ATTRIBUTE_KEYS.reduce((sum, key) => {
        if (!isSpecialAttribute(metatypeInfo, key)) return sum;
        if (adjustmentFundedAttributes.includes(key)) return sum + (data.attributes[key] - 1);
        return sum + Math.max(0, data.attributes[key] - 6);
      }, 0)
    : 0;

  const selectedMagicOption = state.magicOption
    ? magicRow?.magic.find((m) => m.option === state.magicOption)
    : undefined;
  const magicBaseRating = selectedMagicOption?.rating ?? 0;
  const magicIsResonance = selectedMagicOption?.option === "Technomancer";
  const currentMagicOrResonance = magicIsResonance
    ? (data.attributes.resonance ?? 0)
    : (data.attributes.magic ?? 0);
  const magicBoostSpent =
    selectedMagicOption && selectedMagicOption.option !== "Mundane"
      ? Math.max(0, currentMagicOrResonance - magicBaseRating)
      : 0;

  const spent = edgeSpent + racialAdjustmentSpent + magicBoostSpent;
  return { total, spent, remaining: total - spent };
}
