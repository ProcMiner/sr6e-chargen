// Derived stat formulas from the SR6e core rulebook (p. 38-39). SR6 has no
// Limit attributes (that's an SR5 concept) - don't reintroduce them here.
import type { Attributes, DerivedStats } from "../types.js";

export function deriveStats(attributes: Attributes): DerivedStats {
  const physicalMonitor = Math.ceil(attributes.body / 2) + 8;
  const stunMonitor = Math.ceil(attributes.willpower / 2) + 8;
  const initiative = attributes.reaction + attributes.intuition;
  const initiativeDice = 1;

  return {
    physicalMonitor,
    stunMonitor,
    initiative,
    initiativeDice,
  };
}
