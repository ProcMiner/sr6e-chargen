// Mirrors server/src/rules/derive.ts - see that file for the sourcebook
// citation. SR6 has no Limit attributes (that's SR5); don't add them here.
import type { Attributes } from "./rules";

export interface DerivedStats {
  physicalMonitor: number;
  stunMonitor: number;
  initiative: number;
  initiativeDice: number;
}

export function deriveStats(attributes: Attributes): DerivedStats {
  return {
    physicalMonitor: Math.ceil(attributes.body / 2) + 8,
    stunMonitor: Math.ceil(attributes.willpower / 2) + 8,
    initiative: attributes.reaction + attributes.intuition,
    initiativeDice: 1,
  };
}
