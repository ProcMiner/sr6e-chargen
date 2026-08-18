// Knowledge and Language skills (core rulebook p.67, p.97-99; Sixth World
// Companion p.31). Knowledge topics don't have ranks - just known or not.
// Language skills are "Knowledge skills with specialization ranks": four
// levels (Basic/Specialist/Expert/Native). The two build systems grant them
// very differently:
// - Priority/Point Buy: a free pool of Logic slots, plus one free Native
//   language granted outside that pool (CharacterData.nativeLanguage). A
//   slot buys either a new knowledge topic, a new language's Basic level, or
//   one further level of an existing language (Specialist=2 slots total,
//   Expert=3 total) - Native is never bought this way.
// - Life Path: knowledge/language skills come entirely from life module
//   `knowledgeChoice` grants (LifepathBuilder.tsx), not from Logic at all
//   (Companion p.31: "you do not gain additional ones based on your Logic
//   attribute"). Life Path characters also get the same free Native
//   language, tracked the same way.
//
// Post-chargen ("career mode") purchases of new Knowledge/Language skills:
// 3 Karma flat per the Advancement Costs table, p.71 - "New Knowledge skills
// cost 3 Karma." Covers a brand-new knowledge topic or a new language at its
// Basic level; the book doesn't give a separate rate for raising an
// already-known language's level further during play, so that's not
// modeled here (see pages/play/Advancement.tsx).
import type { KnowledgePurchaseEntry, KnowledgeSkillLine, LanguageLevel } from "./character";
import { generateId } from "./id";

export const KNOWLEDGE_PURCHASE_KARMA_COST = 3;

export function knowledgePurchaseKarmaTotal(entries: KnowledgePurchaseEntry[] | undefined): number {
  return (entries ?? []).reduce((sum, e) => sum + e.karmaCost, 0);
}

/** Slots consumed by one line - a knowledge topic or a language's first (Basic) level costs 1; each further language level costs 1 more. Native (level 4) never appears here - see CharacterData.nativeLanguage. */
export function knowledgeSkillSlotCost(line: KnowledgeSkillLine): number {
  if (line.type === "knowledge") return 1;
  return line.level ?? 1;
}

export function knowledgeSlotsSpent(lines: KnowledgeSkillLine[]): number {
  return lines.reduce((sum, l) => sum + knowledgeSkillSlotCost(l), 0);
}

/** Priority/Point Buy free Knowledge/Language pool (core rulebook p.67). */
export function priorityKnowledgeSlotPool(logic: number): number {
  return logic;
}

/** The highest level a language may reach through the general pool/module grants - Expert (3). Native (4) is only ever the one guaranteed free language. */
export const MAX_PURCHASABLE_LANGUAGE_LEVEL: LanguageLevel = 3;

/**
 * Normalizes a saved character's `knowledgeSkills` into the current
 * KnowledgeSkillLine[] shape. Older saves stored a flat `string[]` with no
 * type/level distinction - each is treated as a plain knowledge topic (the
 * safe default, since the old data never recorded whether it was meant as a
 * language), matching the fidelity that actually existed before this
 * migration. Already-current-shape data passes through unchanged (each line
 * gets an id if one is somehow missing).
 */
export function normalizeKnowledgeSkills(raw: unknown): KnowledgeSkillLine[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((entry): KnowledgeSkillLine => {
    if (typeof entry === "string") {
      return { id: generateId(), name: entry, type: "knowledge" };
    }
    const e = entry as Partial<KnowledgeSkillLine>;
    return {
      id: e.id ?? generateId(),
      name: e.name ?? "",
      type: e.type === "language" ? "language" : "knowledge",
      level: e.type === "language" ? (e.level ?? 1) : undefined,
    };
  });
}
