// "Different Levels of Play" (core rulebook p.63 sidebar) - two optional
// power-level variants for the Priority System only (the sidebar sits in
// the Priority chargen chapter; Life Path/Point Buy have no equivalent).
//
// Street-level: "select your priorities as normal from the Priority Table,
// but then apply the values from one row lower than the one you chose...
// Since you can't go any lower than row E, that means you would have two
// selections from that row." The assigned letters (and their A-E
// uniqueness) are untouched - only which row's table values get read.
//
// Prime Runner: "simply double the amount of customization Karma... from
// 50 to 100." Priorities are read normally; only the Karma pool changes.
import type { CharacterData, PrioritySystemState } from "./character";
import type { PriorityLetter } from "./rules";

const LETTER_ORDER: PriorityLetter[] = ["A", "B", "C", "D", "E"];

/** The row whose table values should actually be read for a chosen letter - shifted one worse (floored at E) under Street-level, unchanged otherwise. */
export function effectivePriorityLetter(
  letter: PriorityLetter | undefined,
  powerLevel: PrioritySystemState["powerLevel"]
): PriorityLetter | undefined {
  if (!letter || powerLevel !== "street") return letter;
  const idx = LETTER_ORDER.indexOf(letter);
  return LETTER_ORDER[Math.min(idx + 1, LETTER_ORDER.length - 1)];
}

/** Base customization Karma pool (core rulebook p.66 / Companion p.31: 50 for everyone) - doubled to 100 under Prime Runner. Safe to call for a Life Path character too: their systemState never has `powerLevel`, so this always returns 50 there. */
export function startingKarma(data: CharacterData): number {
  const powerLevel = (data.systemState as Partial<PrioritySystemState>)?.powerLevel;
  return powerLevel === "prime" ? 100 : 50;
}
