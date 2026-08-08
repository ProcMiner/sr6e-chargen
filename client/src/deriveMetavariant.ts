// Small pure helpers for metavariant selection, mirroring deriveQualities.ts.
import type { CharacterData } from "./character";
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

/** Attribute ranges to use for display/validation: the metavariant's if one is selected, otherwise the base metatype's. */
export function effectiveMetatypeInfo(
  data: CharacterData,
  metatypeAttributes: MetatypeAttributes[],
  metavariants: MetavariantCatalogEntry[]
): MetatypeAttributes | undefined {
  const metavariant = findMetavariant(data, metavariants);
  if (metavariant) {
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
  }
  return data.metatype ? metatypeAttributes.find((m) => m.metatype === data.metatype) : undefined;
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
