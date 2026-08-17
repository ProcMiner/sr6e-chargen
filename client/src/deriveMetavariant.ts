// Small pure helpers for metavariant selection, mirroring deriveQualities.ts.
import type { CharacterData, SelectedQuality } from "./character";
import type { MetatypeAttributes, MetavariantCatalogEntry } from "./rules";

export function findMetavariant(
  data: CharacterData,
  metavariants: MetavariantCatalogEntry[]
): MetavariantCatalogEntry | undefined {
  if (!data.metavariant || !data.metatype) return undefined;
  const entry = metavariants.find((m) => m.id === data.metavariant);
  // A metavariant only applies while it still matches the selected base metatype
  // (e.g. after the player switches metatype without clearing the old pick).
  return entry && entry.parentMetatype === data.metatype ? entry : undefined;
}

/** The 8 Physical/Mental attribute keys the "Exceptional (Attribute)" quality can target - not Edge, Magic, or Resonance (qualities.ts's "exceptional" entry). */
const EXCEPTIONAL_ATTRIBUTE_KEYS = [
  "body",
  "agility",
  "reaction",
  "strength",
  "willpower",
  "logic",
  "intuition",
  "charisma",
] as const;

/** Raises the selected attribute's max by 1 per "Exceptional (Attribute)" quality taken for it (Companion p.132: "its maximum ... increases by 1"; "only once per attribute" is enforced by QualityPicker's already-taken guard, not re-checked here). */
function applyExceptionalQuality(info: MetatypeAttributes, qualities: SelectedQuality[]): MetatypeAttributes {
  const result = { ...info };
  for (const q of qualities) {
    if (q.id !== "exceptional") continue;
    const key = q.param as (typeof EXCEPTIONAL_ATTRIBUTE_KEYS)[number] | undefined;
    if (!key || !EXCEPTIONAL_ATTRIBUTE_KEYS.includes(key)) continue;
    result[key] = { ...result[key], max: result[key].max + 1 };
  }
  return result;
}

/** Attribute ranges to use for display/validation: the metavariant's if one is selected, otherwise the base metatype's - plus any "Exceptional (Attribute)" quality bump. */
export function effectiveMetatypeInfo(
  data: CharacterData,
  metatypeAttributes: MetatypeAttributes[],
  metavariants: MetavariantCatalogEntry[]
): MetatypeAttributes | undefined {
  const metavariant = findMetavariant(data, metavariants);
  const base = metavariant
    ? (() => {
        const { body, agility, reaction, strength, willpower, logic, intuition, charisma, edge } = metavariant;
        return {
          metatype: metavariant.parentMetatype,
          body,
          agility,
          reaction,
          strength,
          willpower,
          logic,
          intuition,
          charisma,
          edge,
          racialQualities: metavariant.racialTraits,
        };
      })()
    : data.metatype
      ? metatypeAttributes.find((m) => m.metatype === data.metatype)
      : undefined;
  return base ? applyExceptionalQuality(base, data.qualities) : undefined;
}

/** Free racial traits from metatype plus any selected metavariant, for display. */
export function combinedRacialQualities(
  data: CharacterData,
  metatypeAttributes: MetatypeAttributes[],
  metavariants: MetavariantCatalogEntry[]
): string[] {
  const base = data.metatype ? (metatypeAttributes.find((m) => m.metatype === data.metatype)?.racialQualities ?? []) : [];
  const metavariant = findMetavariant(data, metavariants);
  return metavariant ? metavariant.racialTraits : base;
}

/** Customization Karma cost of the selected metavariant, spent from the shared Karma pool (never stored in data.karma - see deriveGear.ts's karmaRemaining). */
export function metavariantKarmaCost(data: CharacterData, metavariants: MetavariantCatalogEntry[]): number {
  return findMetavariant(data, metavariants)?.karma ?? 0;
}
