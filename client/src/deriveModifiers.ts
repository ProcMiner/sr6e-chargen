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
import type { AdeptPowerCatalogEntry, GearCatalogEntry, ModifierTarget, StatModifier } from "./rules";
import type { ResolvedModifier } from "./character";
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
