// Derived stat formulas from the SR6e core rulebook (p. 38-39). SR6 has no
// Limit attributes (that's an SR5 concept) - don't reintroduce them here.
import type { Attributes, DerivedStats } from "../types.js";
import type { ModifierTarget } from "./modifiers.js";

/**
 * `bonuses` is a summed per-target modifier map from
 * deriveModifiers.ts's modifierBonuses (installed cyberware/bioware/adept
 * powers) - omit it for an unmodified read of the raw attributes.
 */
export function deriveStats(attributes: Attributes, bonuses: Partial<Record<ModifierTarget, number>> = {}): DerivedStats {
  const body = attributes.body + (bonuses.body ?? 0);
  const willpower = attributes.willpower + (bonuses.willpower ?? 0);
  const reaction = attributes.reaction + (bonuses.reaction ?? 0);
  const intuition = attributes.intuition + (bonuses.intuition ?? 0);

  const physicalMonitor = Math.ceil(body / 2) + 8;
  const stunMonitor = Math.ceil(willpower / 2) + 8;
  const initiative = reaction + intuition;
  const initiativeDice = 1 + (bonuses.initiativeDice ?? 0);
  const armor = bonuses.armor ?? 0;

  return {
    physicalMonitor,
    stunMonitor,
    initiative,
    initiativeDice,
    armor,
  };
}
