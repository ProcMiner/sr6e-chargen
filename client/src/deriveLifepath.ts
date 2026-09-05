// Every Life Path step funnels through this one recompute pass, which
// always rebuilds attributes/skills/nuyen/knowledgeSkills from scratch off
// the full LifepathSystemState rather than patching `data` incrementally.
// Extracted out of the old monolithic LifepathBuilder.tsx so every wizard
// step (pages/builder/LifepathBuilder/steps/*.tsx) can call the same logic
// instead of each re-deriving it. Because it always rebuilds from
// `nextState` rather than the previous `data`, step order genuinely
// doesn't matter for correctness - free step-rail navigation is safe.
import { emptyAttributes } from "./character";
import type { CharacterData, KnowledgeSkillLine, LifepathSystemState } from "./character";
import type { LifepathRulesResponse, MetatypeAttributes, MetavariantCatalogEntry } from "./rules";
import { effectiveMetatypeInfo } from "./deriveMetavariant";
import { MAX_PURCHASABLE_LANGUAGE_LEVEL } from "./deriveKnowledge";
import { generateId } from "./id";

export const BASE_ATTR_KEYS = [
  "body",
  "agility",
  "reaction",
  "strength",
  "willpower",
  "logic",
  "intuition",
  "charisma",
] as const;

export const MENTAL_ATTR_KEYS = ["willpower", "logic", "intuition", "charisma"] as const;
export const PHYSICAL_ATTR_KEYS = ["body", "agility", "reaction", "strength"] as const;

export const AWAKENED_TYPES = [
  "Mundane",
  "Full Magician",
  "Aspected Magician",
  "Mystic Adept",
  "Adept",
  "Emerged",
] as const;

export const STANDARD_ADULT_SLOTS = 8;
/** Sixth World Companion p.16, "Elite": "choose ten adult life modules instead of eight." */
export const ELITE_ADULT_SLOTS = 10;

/** Number of adult life module slots available - 10 under the Elite power level, 8 otherwise. */
export function adultSlots(state: LifepathSystemState): number {
  return state.powerLevel === "elite" ? ELITE_ADULT_SLOTS : STANDARD_ADULT_SLOTS;
}

export function isBlank(state: LifepathSystemState) {
  return !state.selectedModuleIds;
}

export function deriveLifepathState(data: CharacterData): LifepathSystemState {
  const raw = data.systemState as LifepathSystemState;
  return isBlank(raw) ? { selectedModuleIds: [], choices: {} } : raw;
}

export function instanceKey(moduleId: string, occurrence: number) {
  return `${moduleId}#${occurrence}`;
}

/** Whether the Born This Way awakened type grants a Magic or Resonance attribute - mirrors computeBaseAttributesAndSkills's own magic/resonance assignment below. */
export function magicResonancePresence(awakenedType: string | undefined): { hasMagic: boolean; hasResonance: boolean } {
  if (awakenedType === "Emerged") return { hasMagic: false, hasResonance: true };
  if (awakenedType && ["Full Magician", "Mystic Adept", "Adept", "Aspected Magician"].includes(awakenedType)) {
    return { hasMagic: true, hasResonance: false };
  }
  return { hasMagic: false, hasResonance: false };
}

/**
 * Expands a single Boost.from entry into real, pickable attribute/skill
 * names. Most tokens are already concrete (e.g. "edge", "Firearms") and
 * pass through unchanged; a handful of placeholder tokens (see
 * lifepath-modules.ts's header comment) stand in for "any X" and need
 * expanding into the actual list the player can choose from.
 */
function expandBoostToken(token: string, skillList: string[], hasMagic: boolean, hasResonance: boolean): string[] {
  switch (token) {
    case "any":
      return skillList;
    case "any-attribute":
      return [...BASE_ATTR_KEYS];
    case "any-special-attribute": {
      const specials: string[] = ["edge"];
      if (hasMagic) specials.push("magic");
      if (hasResonance) specials.push("resonance");
      return specials;
    }
    case "any-mental-attribute":
      return [...MENTAL_ATTR_KEYS];
    case "any-physical-attribute":
      return [...PHYSICAL_ATTR_KEYS];
    case "any-skill-or-attribute":
      return [...skillList, ...BASE_ATTR_KEYS];
    default:
      return [token];
  }
}

/** Expands every token in a Boost.from array and dedupes the result - a module can mix concrete names and placeholder tokens in one choice (e.g. "any-attribute" alongside "any-special-attribute"). */
export function resolveBoostOptions(from: string[], skillList: string[], hasMagic: boolean, hasResonance: boolean): string[] {
  const seen = new Set<string>();
  const options: string[] = [];
  for (const token of from) {
    for (const option of expandBoostToken(token, skillList, hasMagic, hasResonance)) {
      if (!seen.has(option)) {
        seen.add(option);
        options.push(option);
      }
    }
  }
  return options;
}

/** The 8 standard attributes plus Edge - the only boost targets this house rule caps and the only eligible redirect targets for overflow (Magic/Resonance are excluded from both, per the table below). */
export const REDIRECTABLE_ATTR_KEYS = [...BASE_ATTR_KEYS, "edge"] as const;

/** Metatype/Exceptional-quality-adjusted cap for a boost target, or undefined for anything this house rule doesn't cap (Magic/Resonance, skills) - those keep applying uncapped, as before. */
function capFor(key: string, info: MetatypeAttributes | undefined): number | undefined {
  if (!info) return undefined;
  return (REDIRECTABLE_ATTR_KEYS as readonly string[]).includes(key)
    ? info[key as (typeof REDIRECTABLE_ATTR_KEYS)[number]].max
    : undefined;
}

/**
 * Which of the 8 standard attributes + Edge a capped boost's leftover
 * point(s) may be redirected into. House rule filling a gap the Sixth World
 * Companion doesn't cover: p.31 caps at most one standard attribute at its
 * metatype maximum, and p.32's Coming of Age module sends a leftover point
 * to "another attribute of your choice" when the chosen one is already
 * capped at 5 - but no rule says what happens when an adult module boost's
 * only option is already at cap. This generalizes that Coming of Age
 * precedent: redirect targets must have room, Edge is exempt from the
 * one-max-standard-attribute rule (the book's limit never mentions it), and
 * a standard attribute is only offered if landing on it wouldn't create a
 * *second* maxed standard attribute. Magic/Resonance are never eligible.
 */
export function eligibleRedirectAttributes(
  attrs: Record<string, number>,
  info: MetatypeAttributes | undefined,
  leftover: number
): string[] {
  if (!info || leftover <= 0) return [];
  const standardAtMax = BASE_ATTR_KEYS.filter((k) => (attrs[k] ?? 0) >= info[k].max);
  return REDIRECTABLE_ATTR_KEYS.filter((key) => {
    const room = info[key as (typeof REDIRECTABLE_ATTR_KEYS)[number]].max - (attrs[key] ?? 0);
    if (room <= 0) return false;
    if (key === "edge") return true;
    const wouldReachCap = leftover >= room;
    return !wouldReachCap || standardAtMax.filter((k) => k !== key).length === 0;
  });
}

/**
 * Applies a boost, clamping standard-attribute/Edge targets at their
 * metatype cap and returning whatever couldn't fit (0 if none) so the caller
 * can offer a redirect. `key` is always a concrete attribute/skill name by
 * this point - resolveBoostOptions() expands every "any-X" placeholder
 * token into real options before a choice is ever stored, so there's
 * nothing left to resolve here.
 */
function applyBoost(
  attrs: CharacterData["attributes"],
  skills: Record<string, number>,
  key: string,
  amount: number,
  info: MetatypeAttributes | undefined
): number {
  const attrKeys = ["body", "agility", "reaction", "strength", "willpower", "logic", "intuition", "charisma", "edge", "magic", "resonance"];
  const attrsRecord = attrs as unknown as Record<string, number>;
  if (!attrKeys.includes(key)) {
    skills[key] = (skills[key] ?? 0) + amount;
    return 0;
  }
  const cap = capFor(key, info);
  if (cap === undefined) {
    attrsRecord[key] = (attrsRecord[key] ?? 0) + amount;
    return 0;
  }
  const current = attrsRecord[key] ?? 0;
  const applied = Math.min(amount, Math.max(0, cap - current));
  attrsRecord[key] = current + applied;
  return amount - applied;
}

// Derives the pre-adult-module baseline (metatype attributes, awakened
// type's magic/resonance/edge, Growing Up skills, Coming of Age skill) from
// scratch every time, so recomputeLifepathData() never has to treat
// already-boosted data as its starting point.
function computeBaseAttributesAndSkills(
  data: CharacterData,
  metatypeAttributes: MetatypeAttributes[],
  metavariants: MetavariantCatalogEntry[],
  nextState: LifepathSystemState,
  metatype: string | undefined,
  metavariantId: string | undefined
) {
  const info = effectiveMetatypeInfo(
    { ...data, metatype: metatype as CharacterData["metatype"], metavariant: metavariantId },
    metatypeAttributes,
    metavariants
  );
  const attrs: CharacterData["attributes"] = { ...emptyAttributes };
  for (const key of BASE_ATTR_KEYS) {
    attrs[key] = info && info[key].max > 6 ? 2 : 1;
  }
  attrs.edge = 1;

  const type = nextState.awakenedType;
  if (type === "Emerged") attrs.resonance = 1;
  else if (type === "Aspected Magician") attrs.magic = 2;
  else if (type && ["Full Magician", "Mystic Adept", "Adept"].includes(type)) attrs.magic = 1;
  else if (type === "Mundane") attrs.edge += 1;

  const skills: Record<string, number> = {};
  const growingUp = nextState.growingUpSkills ?? [];
  for (const s of growingUp) skills[s] = 2;
  if (nextState.comingOfAgeSkill) {
    skills[nextState.comingOfAgeSkill] = growingUp.includes(nextState.comingOfAgeSkill) ? 6 : 4;
  }

  // Coming of Age: "best attribute" gains +5, except metatypes that cap it
  // at 5 - there it's set to 5 instead, and the leftover +1 (which
  // couldn't apply without exceeding that cap) goes to another attribute of
  // the player's choice.
  const best = nextState.comingOfAgeBestAttribute as (typeof BASE_ATTR_KEYS)[number] | undefined;
  if (best && info) {
    if (info[best].max === 5) {
      attrs[best] = 5;
      const redirect = nextState.comingOfAgeRedirectAttribute as (typeof BASE_ATTR_KEYS)[number] | undefined;
      if (redirect && redirect !== best) attrs[redirect] += 1;
    } else {
      attrs[best] += 5;
    }
  }

  return { attrs, skills, info };
}

/** Shared core of recomputeLifepathData() and computeBoostOverflow() so the two never drift - the latter exists purely so AdultLifeModulesStep can find out which boost choices got clamped, without duplicating this loop. */
function computeLifepath(
  data: CharacterData,
  rules: LifepathRulesResponse,
  metatypeAttributes: MetatypeAttributes[],
  metavariants: MetavariantCatalogEntry[],
  skillList: string[],
  nextState: LifepathSystemState,
  metatype: string | undefined = data.metatype,
  metavariantId: string | undefined = data.metavariant
): { data: CharacterData; boostOverflow: Record<string, number> } {
  const allAdult = rules.adultModules;
  const { attrs, skills, info } = computeBaseAttributesAndSkills(data, metatypeAttributes, metavariants, nextState, metatype, metavariantId);
  const { hasMagic, hasResonance } = magicResonancePresence(nextState.awakenedType);
  // Coming of Age grants +25,000 nuyen; gated on the skill pick since
  // that's this module's primary "have I done this yet" signal.
  let nuyen = nextState.comingOfAgeSkill ? 25_000 : 0;
  const knowledge: KnowledgeSkillLine[] = [];

  // Companion p.31: choosing "language" for a knowledgeChoice slot either
  // starts a new language at Basic or raises one you already picked (via an
  // earlier slot) by one level, capped at Expert - repeating the same name
  // is how a level-up is expressed, not a duplicate entry.
  function addKnowledgeChoice(type: "knowledge" | "language", name: string) {
    if (type === "knowledge") {
      knowledge.push({ id: generateId(), name, type: "knowledge" });
      return;
    }
    const existing = knowledge.find((k) => k.type === "language" && k.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      existing.level = Math.min(MAX_PURCHASABLE_LANGUAGE_LEVEL, (existing.level ?? 1) + 1) as 1 | 2 | 3;
    } else {
      knowledge.push({ id: generateId(), name, type: "language", level: 1 });
    }
  }

  // Legacy saves stored knowledge slot picks as plain strings in `choices`
  // (pre-dating the knowledge/language split) - fall back to reading those
  // as knowledge topics, the only type they could have meant, so older
  // characters don't silently lose their picks.
  function resolveKnowledgeChoice(choiceKey: string): { type: "knowledge" | "language"; name: string } | undefined {
    const structured = nextState.knowledgeChoices?.[choiceKey];
    if (structured) return structured;
    const legacy = nextState.choices[choiceKey];
    return legacy ? { type: "knowledge", name: legacy } : undefined;
  }

  const boostOverflow: Record<string, number> = {};
  const occurrences: Record<string, number> = {};
  for (const id of nextState.selectedModuleIds) {
    occurrences[id] = (occurrences[id] ?? 0) + 1;
    const occurrence = occurrences[id];
    const key = instanceKey(id, occurrence);
    const mod = allAdult.find((m) => m.id === id);
    if (!mod) continue;

    nuyen += mod.resources ?? 0;

    mod.boosts?.forEach((boost, bi) => {
      const picks = boost.count ?? 1;
      const options = resolveBoostOptions(boost.from, skillList, hasMagic, hasResonance);
      for (let p = 0; p < picks; p++) {
        const choiceKey = `${key}:boost:${bi}:${p}`;
        const chosen = nextState.choices[choiceKey] ?? (options.length === 1 ? options[0] : undefined);
        if (!chosen) continue;
        // A handful of modules offer a flat +25,000 nuyen as an alternative
        // to one of their attribute/skill choices.
        if (chosen === "nuyen") {
          nuyen += 25_000;
        } else {
          const leftover = applyBoost(attrs, skills, chosen, boost.amount, info);
          if (leftover > 0) boostOverflow[choiceKey] = leftover;
        }
      }
    });

    if (mod.knowledgeChoice) {
      for (let k = 0; k < mod.knowledgeChoice.count; k++) {
        const choiceKey = `${key}:knowledge:${k}`;
        const chosen = resolveKnowledgeChoice(choiceKey);
        if (chosen?.name.trim()) addKnowledgeChoice(chosen.type, chosen.name.trim());
      }
    }
  }

  // House rule (see eligibleRedirectAttributes' comment): send any leftover
  // from a capped boost to another eligible attribute the player picked,
  // once every module's own boosts have been applied - so eligibility
  // (particularly the one-maxed-standard-attribute check) reflects the
  // character's fully-resolved attributes, not a partial mid-loop state.
  const attrsRecord = attrs as unknown as Record<string, number>;
  for (const [choiceKey, leftover] of Object.entries(boostOverflow)) {
    const redirectKey = nextState.choices[`${choiceKey}:redirect`];
    if (!redirectKey) continue;
    if (!eligibleRedirectAttributes(attrsRecord, info, leftover).includes(redirectKey)) continue;
    const current = attrsRecord[redirectKey] ?? 0;
    const cap = capFor(redirectKey, info)!;
    attrsRecord[redirectKey] = current + Math.min(leftover, cap - current);
  }

  return {
    data: {
      ...data,
      metatype: metatype as CharacterData["metatype"],
      metavariant: metavariantId,
      attributes: attrs,
      skills,
      nuyen,
      knowledgeSkills: knowledge,
      systemState: { ...nextState },
    },
    boostOverflow,
  };
}

export function recomputeLifepathData(
  data: CharacterData,
  rules: LifepathRulesResponse,
  metatypeAttributes: MetatypeAttributes[],
  metavariants: MetavariantCatalogEntry[],
  skillList: string[],
  nextState: LifepathSystemState,
  metatype: string | undefined = data.metatype,
  metavariantId: string | undefined = data.metavariant
): CharacterData {
  return computeLifepath(data, rules, metatypeAttributes, metavariants, skillList, nextState, metatype, metavariantId).data;
}

/**
 * Per-boost-choice leftover points that couldn't apply because the target
 * was already at its metatype/Edge cap, keyed the same as
 * `LifepathSystemState.choices` (`${moduleInstanceKey}:boost:${boostIndex}:${pickIndex}`).
 * AdultLifeModulesStep uses this to know when to show a "redirect leftover
 * to" picker instead of silently letting the boost overflow the cap.
 */
export function computeBoostOverflow(
  data: CharacterData,
  rules: LifepathRulesResponse,
  metatypeAttributes: MetatypeAttributes[],
  metavariants: MetavariantCatalogEntry[],
  skillList: string[],
  nextState: LifepathSystemState,
  metatype: string | undefined = data.metatype,
  metavariantId: string | undefined = data.metavariant
): Record<string, number> {
  return computeLifepath(data, rules, metatypeAttributes, metavariants, skillList, nextState, metatype, metavariantId).boostOverflow;
}
