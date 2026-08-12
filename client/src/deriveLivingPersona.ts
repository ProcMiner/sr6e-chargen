// Small pure helpers for the Living Persona panel, mirroring
// deriveAdeptPowers.ts's Power Point pool pattern.
//
// Core rulebook p. 189: "A technomancer's living persona has Matrix
// attributes based on their Mental attributes... plus a number of bonus
// points equal to their Resonance. A single attribute cannot be raised by
// more than 50 percent of its base rating (rounded up, to a maximum of +4)."
// The Matrix/Mental Attribute Equivalency table maps Attack->Charisma,
// Sleaze->Intuition, Data Processing->Logic, Firewall->Willpower. Like Power
// Points (which track current effective Magic, not the frozen Priority-table
// base), the bonus pool here uses effectiveResonance - Essence loss reduces
// it live, same as everywhere else Resonance is capped in this app.
import type { CharacterData, LivingPersonaAllocation } from "./character";
import { effectiveResonance } from "./deriveEssence";

export type MatrixAttributeKey = "attack" | "sleaze" | "dataProcessing" | "firewall";

export const MATRIX_ATTRIBUTE_LABELS: Record<MatrixAttributeKey, string> = {
  attack: "Attack",
  sleaze: "Sleaze",
  dataProcessing: "Data Processing",
  firewall: "Firewall",
};

const MENTAL_ATTRIBUTE_FOR: Record<MatrixAttributeKey, keyof CharacterData["attributes"]> = {
  attack: "charisma",
  sleaze: "intuition",
  dataProcessing: "logic",
  firewall: "willpower",
};

export const MATRIX_ATTRIBUTE_KEYS: MatrixAttributeKey[] = ["attack", "sleaze", "dataProcessing", "firewall"];

/** Bonus points available to distribute: current effective Resonance (Essence-capped). */
export function livingPersonaBonusPool(data: CharacterData): number {
  return effectiveResonance(data);
}

/** Max bonus a single Matrix attribute can receive: 50% of its base Mental attribute (rounded up), capped at +4. */
export function livingPersonaMaxBonus(data: CharacterData, key: MatrixAttributeKey): number {
  const base = data.attributes[MENTAL_ATTRIBUTE_FOR[key]] ?? 0;
  return Math.min(4, Math.ceil(base * 0.5));
}

export function livingPersonaAllocation(data: CharacterData): Record<MatrixAttributeKey, number> {
  const raw: LivingPersonaAllocation = data.livingPersonaAllocation ?? {};
  return {
    attack: raw.attack ?? 0,
    sleaze: raw.sleaze ?? 0,
    dataProcessing: raw.dataProcessing ?? 0,
    firewall: raw.firewall ?? 0,
  };
}

export function livingPersonaBonusSpent(data: CharacterData): number {
  const alloc = livingPersonaAllocation(data);
  return alloc.attack + alloc.sleaze + alloc.dataProcessing + alloc.firewall;
}

/** The Matrix attribute's total value: base Mental attribute + its (capped) allocated bonus. */
export function livingPersonaAttribute(data: CharacterData, key: MatrixAttributeKey): number {
  const base = data.attributes[MENTAL_ATTRIBUTE_FOR[key]] ?? 0;
  const bonus = Math.min(livingPersonaAllocation(data)[key], livingPersonaMaxBonus(data, key));
  return base + bonus;
}

/** Living Persona Initiative rank (core rulebook p. 189): Logic + Intuition, distinct from the physical Reaction + Intuition initiative in derive.ts. Initiative Dice is 1D6 (plus Matrix-mode adjustments this app doesn't track). */
export function livingPersonaInitiative(data: CharacterData): number {
  return (data.attributes.logic ?? 0) + (data.attributes.intuition ?? 0);
}
