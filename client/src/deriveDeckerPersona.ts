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
//
// One device is the exception to all of the above: a custom cyberdeck
// (Hack & Slash pp.34-39 - see deriveCustomCyberdeck.ts). Its rule is the
// opposite of the stock-gear quote above - "you may not rotate out your
// Attack and Sleaze attributes." A custom deck's two values are marked
// `locked` below and excluded from the poolable multiset entirely;
// resolveDeckerAllocation() force-assigns them straight to the Attack/
// Sleaze slots instead, leaving Data Processing/Firewall (from whatever
// separate cyberjack/cyberhack the character owns) as the only slots still
// freely poolable.
import type { CharacterData, DeckerPersonaAllocation } from "./character";
import type { GearRulesResponse } from "./rules";
import { MATRIX_ATTRIBUTE_KEYS, type MatrixAttributeKey } from "./deriveLivingPersona";

export { MATRIX_ATTRIBUTE_KEYS, MATRIX_ATTRIBUTE_LABELS, type MatrixAttributeKey } from "./deriveLivingPersona";

export interface MatrixDevice {
  name: string;
  deviceRating: number;
  /** The device's two printed non-zero Matrix-attribute values (a cyberdeck's Attack/Sleaze pair, or a commlink/cyberjack's Data Processing/Firewall pair) - order doesn't carry meaning once pooled, since either number can go to either matching slot (except a locked device - see below). */
  values: number[];
  /** A cyberjack's printed "VR Matrix Init Dice" bonus (e.g. Rating 6's +2) - 0 for devices without one. */
  vrInitBonus: number;
  /** True only for a custom cyberdeck: `values` is always `[attack, sleaze]` in that order, force-assigned rather than pooled - see this file's header comment. */
  locked?: boolean;
  /**
   * False for a device with no printed Device Rating - an implanted cyberjack
   * (core rulebook p.176's stat table has Attributes(D/F)/VR Init Dice/Avail/
   * Ess/Cost, no Device Rating column at all), as opposed to an external
   * cyberhack (Hack & Slash p.34, which does print one). A cyberjack only
   * feeds Data Processing/Firewall into whatever deck it's wired to - core
   * p.174's "device an individual is using to access the Matrix" and p.175's
   * Bricked Devices both describe something a persona runs on and that gets
   * ejected/dumpshocked when it bricks; a cyberjack isn't that, the deck it's
   * plugged into is. Still contributes its values to the pool below - just
   * excluded from the Matrix Condition Monitor bar/reference list.
   */
  hasConditionMonitor: boolean;
}

function parsePair(raw: string | undefined): number[] {
  if (!raw) return [];
  return raw
    .split("/")
    .map((n) => Number(n))
    .filter((n) => Number.isFinite(n) && n > 0);
}

function parseBonus(raw: string | undefined): number {
  if (!raw) return 0;
  const n = Number(raw.replace("+", ""));
  return Number.isFinite(n) ? n : 0;
}

/** Every gear line the character owns that grants Matrix attributes (cyberdecks, commlinks, cyberjacks, custom cyberdecks) - core rulebook p.174, 177-178; Hack & Slash pp.34-39 for custom decks. */
export function matrixDevices(data: CharacterData, gearRules: GearRulesResponse): MatrixDevice[] {
  const devices: MatrixDevice[] = [];
  for (const line of data.gear) {
    if (line.customCyberdeck) {
      const { coreRating, attackRating, sleazeRating } = line.customCyberdeck;
      devices.push({
        name: line.name,
        deviceRating: coreRating,
        values: [attackRating, sleazeRating],
        vrInitBonus: 0,
        locked: true,
        hasConditionMonitor: true,
      });
      continue;
    }
    const entry = gearRules.gear.find((g) => g.id === line.itemId);
    const asPair = parsePair(entry?.stats?.attributesAS);
    const pair = asPair.length ? asPair : parsePair(entry?.stats?.attributesDF);
    if (!entry || pair.length === 0) continue;
    devices.push({
      name: line.name,
      deviceRating: Number(entry.stats?.deviceRating) || 0,
      values: pair,
      vrInitBonus: parseBonus(entry.stats?.["VR Matrix Init Dice"]),
      hasConditionMonitor: entry.stats?.deviceRating !== undefined,
    });
  }
  return devices;
}

/** The full multiset of numbers available to distribute across the four named Matrix attributes - every non-zero value from every owned Matrix-capable device, excluding any locked (custom cyberdeck) device. */
export function availableMatrixValues(devices: MatrixDevice[]): number[] {
  return devices
    .filter((d) => !d.locked)
    .flatMap((d) => d.values);
}

/** The fixed Attack/Sleaze pair from an owned custom cyberdeck, if any - only the first one counts (a decker uses one deck at a time). Undefined if no locked device is owned. */
export function lockedAttackSleaze(devices: MatrixDevice[]): { attack: number; sleaze: number } | undefined {
  const locked = devices.find((d) => d.locked);
  if (!locked) return undefined;
  return { attack: locked.values[0] ?? 0, sleaze: locked.values[1] ?? 0 };
}

export function deckerAllocation(data: CharacterData): DeckerPersonaAllocation {
  return data.deckerPersonaAllocation ?? {};
}

/** Overlays a custom cyberdeck's locked Attack/Sleaze (if any) onto the player's stored pool allocation - callers should always pass this resolved allocation to deckerAttribute/deckerAttackRating/etc. below, never the raw stored one, so a custom deck's numbers can't be edited away. */
export function resolveDeckerAllocation(devices: MatrixDevice[], allocation: DeckerPersonaAllocation): DeckerPersonaAllocation {
  const locked = lockedAttackSleaze(devices);
  if (!locked) return allocation;
  return { ...allocation, attack: locked.attack, sleaze: locked.sleaze };
}

/** Values still available for a given slot: the full pool minus whatever's already assigned to every OTHER poolable slot (so each physical number is only ever used once). Pass the slot being edited as `excludeKey` so its own current value doesn't count against itself. A custom cyberdeck's locked Attack/Sleaze (see resolveDeckerAllocation) live in the same allocation object but were never drawn from `available` - if a locked value happens to numerically match a real pool entry (e.g. a custom deck's Attack 8 and a cyberjack's Firewall 8), subtracting it here would wrongly remove that unrelated device's legitimate value. Pass `lockedKeys` (attack/sleaze, when a custom cyberdeck is owned) so those get skipped instead of subtracted. */
export function remainingMatrixValues(
  available: number[],
  allocation: DeckerPersonaAllocation,
  excludeKey: MatrixAttributeKey,
  lockedKeys: ReadonlySet<MatrixAttributeKey> = new Set()
): number[] {
  const pool = [...available];
  for (const key of MATRIX_ATTRIBUTE_KEYS) {
    if (key === excludeKey || lockedKeys.has(key)) continue;
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

/** Sum of every owned device's "VR Matrix Init Dice" bonus (a cyberjack's, typically) - added on top of the base VR dice count below. */
export function matrixVrInitBonusDice(devices: MatrixDevice[]): number {
  return devices.reduce((sum, d) => sum + d.vrInitBonus, 0);
}

/** VR Initiative dice count for a given base (1 cold-sim, 2 hot-sim), plus any device bonus, capped at 5D6 total same as physical Initiative (core rulebook p.179). */
export function matrixVrInitDice(baseDice: number, devices: MatrixDevice[]): number {
  return Math.min(5, baseDice + matrixVrInitBonusDice(devices));
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
