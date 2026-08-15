// Small pure helpers for a decker's Matrix persona - the non-technomancer
// mirror of deriveLivingPersona.ts. Core rulebook p.174, 178: "If you're a
// decker, your Matrix attributes are determined by the device you're using
// to access the Matrix. If the device doesn't possess one or more of the
// Matrix attributes, then the applicable attribute is treated as if it
// were 0. You can rotate any non-zero attributes through your persona,
// even if they originated from different devices." Confirmed by the
// Slamm-0!/Jack worked example (p.178): a cyberdeck's printed 4/3 pair and
// a commlink's printed 3/1 pair combine into one ASDF set ("4 3 1 3"),
// freely reassignable ("3 4 1 3" for a stealthier build) - this app models
// that one-time assignment as a build-time choice, the same treatment
// Living Persona gets, rather than the live turn-by-turn Reconfigure
// Matrix Attribute action (which stays reference text in Matrix.tsx, like
// every other test in this app).
import type { CharacterData, DeckerPersonaAllocation } from "./character";
import type { GearRulesResponse } from "./rules";
import { MATRIX_ATTRIBUTE_KEYS, type MatrixAttributeKey } from "./deriveLivingPersona";

export { MATRIX_ATTRIBUTE_KEYS, MATRIX_ATTRIBUTE_LABELS, type MatrixAttributeKey } from "./deriveLivingPersona";

export interface MatrixDevice {
  name: string;
  deviceRating: number;
  /** The device's two printed non-zero Matrix-attribute values (a cyberdeck's Attack/Sleaze pair, or a commlink/cyberjack's Data Processing/Firewall pair) - order doesn't carry meaning once pooled, since either number can go to either matching slot. */
  values: number[];
}

function parsePair(raw: string | undefined): number[] {
  if (!raw) return [];
  return raw
    .split("/")
    .map((n) => Number(n))
    .filter((n) => Number.isFinite(n) && n > 0);
}

/** Every gear line the character owns that grants Matrix attributes (cyberdecks, commlinks, cyberjacks) - core rulebook p.174, 177-178. */
export function matrixDevices(data: CharacterData, gearRules: GearRulesResponse): MatrixDevice[] {
  const devices: MatrixDevice[] = [];
  for (const line of data.gear) {
    const entry = gearRules.gear.find((g) => g.id === line.itemId);
    const asPair = parsePair(entry?.stats?.attributesAS);
    const pair = asPair.length ? asPair : parsePair(entry?.stats?.attributesDF);
    if (!entry || pair.length === 0) continue;
    devices.push({
      name: line.name,
      deviceRating: Number(entry.stats?.deviceRating) || 0,
      values: pair,
    });
  }
  return devices;
}

/** The full multiset of numbers available to distribute across the four named Matrix attributes - every non-zero value from every owned Matrix-capable device. */
export function availableMatrixValues(devices: MatrixDevice[]): number[] {
  return devices.flatMap((d) => d.values);
}

export function deckerAllocation(data: CharacterData): DeckerPersonaAllocation {
  return data.deckerPersonaAllocation ?? {};
}

/** Values still available for a given slot: the full pool minus whatever's already assigned to every OTHER slot (so each physical number is only ever used once). Pass the slot being edited as `excludeKey` so its own current value doesn't count against itself. */
export function remainingMatrixValues(
  available: number[],
  allocation: DeckerPersonaAllocation,
  excludeKey: MatrixAttributeKey
): number[] {
  const pool = [...available];
  for (const key of MATRIX_ATTRIBUTE_KEYS) {
    if (key === excludeKey) continue;
    const used = allocation[key];
    if (used === undefined) continue;
    const idx = pool.indexOf(used);
    if (idx !== -1) pool.splice(idx, 1);
  }
  return pool;
}

export function deckerAttribute(allocation: DeckerPersonaAllocation, key: MatrixAttributeKey): number {
  return allocation[key] ?? 0;
}

/** Attack Rating: persona's Attack + Sleaze (core rulebook p.175). */
export function deckerAttackRating(allocation: DeckerPersonaAllocation): number {
  return deckerAttribute(allocation, "attack") + deckerAttribute(allocation, "sleaze");
}

/** Defense Rating: persona's Data Processing + Firewall (core rulebook p.175). */
export function deckerDefenseRating(allocation: DeckerPersonaAllocation): number {
  return deckerAttribute(allocation, "dataProcessing") + deckerAttribute(allocation, "firewall");
}

/** Matrix Condition Monitor for a device: (Device Rating / 2, rounded up) + 8 (core rulebook p.174, 179). */
export function matrixConditionMonitor(deviceRating: number): number {
  return Math.ceil(deviceRating / 2) + 8;
}

/**
 * Matrix Initiative (core rulebook p.179) - three variants depending on
 * interface mode; dice are on top of the usual 1D6, capped at 5D6 total
 * same as physical Initiative.
 */
export function deckerMatrixInitiativeAR(attributes: CharacterData["attributes"]): number {
  return (attributes.reaction ?? 0) + (attributes.intuition ?? 0);
}
export function deckerMatrixInitiativeVRCold(attributes: CharacterData["attributes"], allocation: DeckerPersonaAllocation): number {
  return (attributes.intuition ?? 0) + deckerAttribute(allocation, "dataProcessing");
}
export function deckerMatrixInitiativeVRHot(attributes: CharacterData["attributes"], allocation: DeckerPersonaAllocation): number {
  return deckerMatrixInitiativeVRCold(attributes, allocation);
}
