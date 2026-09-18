// Resolves catalog StatModifier entries (which may use "rating" as a
// per-level multiplier) into concrete ResolvedModifier bonuses snapshotted
// onto GearLine/AdeptPowerLine at purchase time, and sums those snapshotted
// bonuses across a character's gear + adept powers into a single per-target
// bonus map for deriveStats. Mirrors deriveGear.ts/deriveAdeptPowers.ts's
// "small pure helpers" pattern, and GearLine.essenceCost's snapshot
// convention (resolved once at purchase time, never re-derived from the
// catalog later).
//
// "choice"-target modifiers (e.g. Improved Physical Attribute) and
// "netHits"-amount modifiers (spells) are dropped here, not resolved - see
// character.ts's ResolvedModifier and rules.ts's StatModifier comments for
// why (both need a concept - a resolved param, an active casting roll -
// that this app doesn't have yet).
import type { AdeptPowerCatalogEntry, GearCatalogEntry, ModifierTarget, SpellCatalogEntry, StatModifier } from "./rules";
import type { ResolvedModifier } from "./character";
import type { SustainedSpell } from "./playState";
import { ratingFor as gearRatingFor } from "./deriveGear";
import { ratingFor as adeptRatingFor } from "./deriveAdeptPowers";

function resolveAmount(amount: StatModifier["amount"], rating: number): number | undefined {
  if (amount === "rating") return rating;
  if (amount === "netHits") return undefined;
  return amount;
}

function resolve(modifiers: StatModifier[] | undefined, rating: number): ResolvedModifier[] | undefined {
  if (!modifiers) return undefined;
  const resolved = modifiers.flatMap((m): ResolvedModifier[] => {
    if (m.target === "choice") return [];
    const amount = resolveAmount(m.amount, rating);
    if (amount === undefined) return [];
    return [{ target: m.target, amount, stackingGroup: m.stackingGroup }];
  });
  return resolved.length > 0 ? resolved : undefined;
}

export function resolveGearModifiers(entry: GearCatalogEntry, rating: number | undefined): ResolvedModifier[] | undefined {
  return resolve(entry.modifiers, gearRatingFor(entry, rating));
}

export function resolveAdeptPowerModifiers(entry: AdeptPowerCatalogEntry, level: number | undefined): ResolvedModifier[] | undefined {
  return resolve(entry.modifiers, adeptRatingFor(entry, level));
}

/**
 * Sums resolved modifiers from gear + adept power lines into a per-target
 * bonus map, enforcing SR6's mutual-exclusivity groups (stackingGroup): only
 * the single highest amount within a group applies (e.g. Wired Reflexes and
 * Synaptic Booster can't combine); everything else stacks additively.
 */
export function modifierBonuses(
  gear: { modifiers?: ResolvedModifier[]; qty: number }[],
  adeptPowers: { modifiers?: ResolvedModifier[] }[]
): Partial<Record<ModifierTarget, number>> {
  const instances: ResolvedModifier[] = [];
  for (const line of gear) {
    for (const m of line.modifiers ?? []) {
      instances.push({ ...m, amount: m.amount * line.qty });
    }
  }
  for (const line of adeptPowers) {
    for (const m of line.modifiers ?? []) {
      instances.push(m);
    }
  }

  // Group by target+stackingGroup; ungrouped instances each get a unique key
  // so they always stack instead of competing against each other.
  const groups = new Map<string, number>();
  let ungroupedIndex = 0;
  for (const inst of instances) {
    const key = `${inst.target}::${inst.stackingGroup ?? `__ungrouped_${ungroupedIndex++}`}`;
    const current = groups.get(key);
    groups.set(key, current === undefined ? inst.amount : Math.max(current, inst.amount));
  }

  const bonuses: Partial<Record<ModifierTarget, number>> = {};
  for (const [key, amount] of groups) {
    const target = key.split("::")[0] as ModifierTarget;
    bonuses[target] = (bonuses[target] ?? 0) + amount;
  }
  return bonuses;
}

/**
 * The one spell whose "netHits" modifier is a penalty, not a bonus
 * (spells.ts: "this is a PENALTY - a future consumer needs to apply it as
 * negative net hits, not add it like every other modifier in this
 * catalog"). Special-cased by id rather than adding a schema field since
 * it's the only spell in the catalog that needs it.
 */
const NEGATIVE_NET_HITS_SPELL_ID = "spell-decrease-attribute";

/**
 * Resolves currently-sustained spells (PlayState.sustainedSpells) into the
 * same per-target bonus shape modifierBonuses() produces, so Magic.tsx and
 * AttributesDerivedCard can fold a live "this spell is currently active"
 * effect into Reaction/Initiative Dice/Armor - the piece deferred when
 * StatModifier's "netHits" amount was first introduced (see
 * stat-modifiers memory / rules.ts's StatModifier comment). Unlike
 * gear/adept-power modifiers, these are computed fresh every render from
 * the player-entered netHits, not snapshotted, since a casting's net hits
 * are only known at cast time and can't be looked up from a catalog.
 * "choice"-target spells (Increase/Decrease Attribute) resolve against the
 * instance's own `targetAttribute` instead of being dropped.
 */
export function sustainedSpellBonuses(
  sustained: SustainedSpell[],
  spellCatalog: SpellCatalogEntry[]
): Partial<Record<ModifierTarget, number>> {
  const bonuses: Partial<Record<ModifierTarget, number>> = {};
  for (const s of sustained) {
    const entry = spellCatalog.find((sp) => sp.id === s.spellId);
    if (!entry?.modifiers) continue;
    const sign = entry.id === NEGATIVE_NET_HITS_SPELL_ID ? -1 : 1;
    for (const m of entry.modifiers) {
      if (m.amount !== "netHits") continue;
      const target = m.target === "choice" ? s.targetAttribute : m.target;
      if (!target) continue;
      bonuses[target] = (bonuses[target] ?? 0) + s.netHits * sign;
    }
  }
  return bonuses;
}

/** Sums any number of per-target bonus maps (modifierBonuses(), sustainedSpellBonuses()) into one - a plain additive merge, since the two sources never need stacking-group mutual exclusivity against each other. */
export function combineBonuses(
  ...maps: Partial<Record<ModifierTarget, number>>[]
): Partial<Record<ModifierTarget, number>> {
  const result: Partial<Record<ModifierTarget, number>> = {};
  for (const map of maps) {
    for (const [key, value] of Object.entries(map)) {
      const target = key as ModifierTarget;
      result[target] = (result[target] ?? 0) + (value ?? 0);
    }
  }
  return result;
}
