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

export interface AttributePoints {
  total: number;
  remaining: number;
}

/** The Attributes step's own point pool (core rulebook p.63-64) - separate
 * from Adjustment Points above, which only cover Edge/special-racial/Magic
 * overflow. Used by both AttributesStep.tsx itself and the step rail's
 * per-step state label. */
export function attributePointsRemaining(data: CharacterData, rules: PriorityRulesResponse): AttributePoints {
  const state = (data.systemState as PrioritySystemState)?.priorities
    ? (data.systemState as PrioritySystemState)
    : { priorities: {} };

  const attributeRow = rules.priorityTable.find(
    (r) => r.priority === effectivePriorityLetter(state.priorities.attributes, state.powerLevel)
  );
  const metatypeInfo = effectiveMetatypeInfo(data, rules.metatypeAttributes, rules.metavariants);
  const adjustmentFundedAttributes = state.adjustmentFundedAttributes ?? [];

  const spent = CORE_ATTRIBUTE_KEYS.reduce((sum, key) => {
    if (isSpecialAttribute(metatypeInfo, key) && adjustmentFundedAttributes.includes(key)) return sum;
    return sum + (Math.min(data.attributes[key], normalCap(metatypeInfo, key)) - 1);
  }, 0);
  const total = attributeRow?.attributePoints ?? 0;
  return { total, remaining: total - spent };
}

/** The Skills step's own point pool (core rulebook p.65-66) - grouped here
 * alongside attributePointsRemaining above since both are small Priority
 * chargen point-pool helpers shared between their step component and the
 * step rail's per-step state label, despite this file's Adjustment Points
 * focus otherwise. */
export function skillPointsRemaining(data: CharacterData, rules: PriorityRulesResponse): AttributePoints {
  const state = (data.systemState as PrioritySystemState)?.priorities
    ? (data.systemState as PrioritySystemState)
    : { priorities: {} };
  const skillRow = rules.priorityTable.find(
    (r) => r.priority === effectivePriorityLetter(state.priorities.skills, state.powerLevel)
  );
  const specializations = data.specializations ?? [];
  const spent = Object.values(data.skills).reduce((sum, v) => sum + v, 0) + specializations.length;
  const total = skillRow?.skillPoints ?? 0;
  return { total, remaining: total - spent };
}
