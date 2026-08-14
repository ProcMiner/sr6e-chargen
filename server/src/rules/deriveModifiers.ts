// Server mirror of client/src/deriveModifiers.ts's modifierBonuses - see
// that file for the full rationale. Only the summing half is needed here:
// the server never constructs gear/adept-power lines (that only happens in
// the client's pickers before a character is saved), it just reads back
// already-resolved modifiers from stored character JSON (see
// server/src/routes/play.ts) and sums them for deriveStats.
import type { ModifierTarget } from "./modifiers.js";

export interface ResolvedModifier {
  target: Exclude<ModifierTarget, "choice">;
  amount: number;
  stackingGroup?: string;
}

/**
 * Sums resolved modifiers from gear + adept power lines into a per-target
 * bonus map, enforcing SR6's mutual-exclusivity groups (stackingGroup): only
 * the single highest amount within a group applies; everything else stacks
 * additively.
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
