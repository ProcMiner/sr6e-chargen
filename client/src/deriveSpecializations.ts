// Small pure helpers for Skill Specializations and Expertise - core
// rulebook "Skills" chapter, "Specializations and Expertise" (p. 92) plus
// the Improvement Cost table (p. 68-69). Mirrors deriveAdvancement.ts's
// itemized-log pattern.
//
// Rules confirmed directly from the book, not guessed:
// - A specialization gives +2 dice on tests in that narrow area; an
//   expertise (an upgraded specialization) gives +3. "Once a specialization
//   is purchased, it can be turned into an expertise... If you have an
//   expertise, you are allowed to select a second specialization attached
//   to that skill. That specialization may not become an expertise, and no
//   skill can ever have more than 1 expertise and 1 specialization attached
//   to it."
// - Expertise prerequisites: the skill must already carry a specialization,
//   and the skill's rank must be at least 5.
// - Post-creation Karma costs (Improvement Cost table): a new
//   specialization is 5 Karma flat; converting to an expertise is 5 Karma
//   flat; a second specialization is also 5 Karma (same "Specializations"
//   line - it's just another specialization purchase, gated by already
//   having an expertise). None of these scale with rank, unlike
//   attributes/skills.
// - At chargen, a specialization costs one skill point (same pool as a
//   skill rank) and no expertise can ever be bought at chargen, in either
//   build system. The two systems' caps genuinely differ, confirmed from
//   both books: Priority allows one specialization *per skill* (core p.
//   65-66, "You cannot acquire more than one specialization in a skill at
//   character creation"); Life Path caps at one specialization *total for
//   the whole character* (Companion p. ~28, "You may also have no more than
//   one specialization at character creation").
import type { CharacterData, SkillSpecialization, SpecializationEntry } from "./character";

export const SPECIALIZATION_KARMA_COST = 5;
export const EXPERTISE_KARMA_COST = 5;

/** Exotic Weapons is a special case (p. 95): using it at all requires a specialization tied to a specific exotic weapon, and it can never gain an expertise. */
export const EXOTIC_WEAPONS_SKILL = "Exotic Weapons";

/**
 * The book's own example specializations per skill (p. 92-99) - shown as
 * quick-pick suggestions, not an exhaustive enum: "if players develop a
 * specialization within a skill that they would like to have, and their
 * gamemaster approves it, they can have it" (p. 92). Skills not listed here
 * (Conjuring, Piloting, etc. are listed; a couple of entries reconstructed
 * across an unambiguous PDF line-break are noted inline).
 */
export const SKILL_SPECIALIZATION_SUGGESTIONS: Record<string, string[]> = {
  Astral: ["Astral Combat", "Astral Signatures", "Emotional States", "Spirit Types"],
  Athletics: ["Archery", "Climbing", "Flying", "Gymnastics", "Sprinting", "Swimming", "Throwing"],
  Biotech: ["Biotechnology", "Cybertechnology", "First Aid", "Medicine"],
  "Close Combat": ["Blades", "Clubs", "Unarmed Combat"],
  Con: ["Acting", "Disguise", "Impersonation", "Performance"],
  Conjuring: ["Banishing", "Summoning"],
  Cracking: ["Cybercombat", "Electronic Warfare", "Hacking"],
  Electronics: ["Computer", "Hardware", "Software"],
  Enchanting: ["Alchemy", "Artificing", "Disenchanting"],
  // "Armor-" was split across a PDF line break; reconstructed as "Armorer" (standard SR terminology), flagged rather than silently assumed.
  Engineering: ["Aeronautics Mechanic", "Armorer", "Industrial Mechanic", "Lockpicking", "Nautical Mechanic"],
  "Exotic Weapons": [],
  Firearms: [
    "Tasers",
    "Hold-Outs",
    "Light Pistols",
    "Machine Pistols",
    "Heavy Pistols",
    "Submachine Guns",
    "Shotguns",
    "Rifles",
    "Machine Guns",
    "Assault Cannons",
  ],
  Influence: ["Etiquette", "Instruction", "Intimidation", "Leadership", "Negotiation"],
  Outdoors: ["Navigation", "Survival", "Tracking", "Woods", "Desert", "Urban Areas"],
  Perception: ["Visual", "Aural", "Tactile", "Woods", "Desert", "Urban"],
  Piloting: ["Ground Craft", "Aircraft", "Watercraft"],
  Sorcery: ["Counterspelling", "Ritual Spellcasting", "Spellcasting"],
  Stealth: ["Camouflage", "Palming", "Sneaking"],
  Tasking: ["Compiling", "Decompiling", "Registering"],
};

function entriesFor(data: CharacterData, skill: string): SkillSpecialization[] {
  return (data.specializations ?? []).filter((s) => s.skill === skill);
}

/**
 * Exotic Weapons (p. 95): "You must select a specialization to use this
 * skill, and you can only use this skill with weapons for which you have a
 * specialization." Ranks themselves are bought normally and apply to every
 * specialization the character has, but ranks with zero specializations are
 * unusable - flagged here so the skill picker UI can warn about it instead
 * of silently letting a player invest ranks that can't be rolled with
 * anything.
 */
export function exoticWeaponsNeedsSpecialization(data: CharacterData): boolean {
  const rank = data.skills[EXOTIC_WEAPONS_SKILL] ?? 0;
  return rank >= 1 && entriesFor(data, EXOTIC_WEAPONS_SKILL).length === 0;
}

/** Whether `skill` can take a brand-new specialization (post-creation): must have a rank, and not already carry any specialization/expertise. */
export function canAddSpecialization(data: CharacterData, skill: string): boolean {
  const rank = data.skills[skill] ?? 0;
  return rank >= 1 && entriesFor(data, skill).length === 0;
}

/**
 * Human-readable reason `skill` can't currently take a brand-new
 * specialization, or undefined if it can - mirrors canAddSpecialization()'s
 * two gates, split out so a disabled Add button can tell the player *why*
 * instead of just going gray. Shared by the Priority skill-point step and
 * the Customization Karma picker.
 */
export function newSpecializationBlockReason(data: CharacterData, skill: string): string | undefined {
  const rank = data.skills[skill] ?? 0;
  if (rank < 1) return `${skill} needs at least 1 rank before it can take a specialization.`;
  if (entriesFor(data, skill).length > 0) return `${skill} already has a specialization.`;
  return undefined;
}

/** Whether an existing specialization on `skill` can be upgraded to an expertise: needs a specialization present and skill rank >= 5. Exotic Weapons can never gain an expertise (p. 95). */
export function canUpgradeToExpertise(data: CharacterData, skill: string): boolean {
  if (skill === EXOTIC_WEAPONS_SKILL) return false;
  const rank = data.skills[skill] ?? 0;
  const entries = entriesFor(data, skill);
  return rank >= 5 && entries.some((e) => e.tier === "specialization") && !entries.some((e) => e.tier === "expertise");
}

/** Whether `skill` can take a second specialization: only once it already carries an expertise. */
export function canAddSecondSpecialization(data: CharacterData, skill: string): boolean {
  const entries = entriesFor(data, skill);
  return entries.some((e) => e.tier === "expertise") && entries.length < 2;
}

export function specializationKarmaTotal(entries: SpecializationEntry[] | undefined): number {
  return (entries ?? []).reduce((sum, e) => sum + e.karmaCost, 0);
}
