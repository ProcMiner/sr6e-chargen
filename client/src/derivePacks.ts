// PACK purchase expansion. Buying a PACK isn't its own kind of purchase -
// it expands into real GearLines using the exact same per-item pricing
// helpers as a manual purchase (gearUnitCost/gearUnitEssenceCost/
// gearUnitBondingKarma from deriveGear.ts), so Essence/Karma/nuyen
// accounting for PACK contents is never a special case.
//
// The book's stated flat PACK price is usually a discount versus buying the
// same items individually (sometimes a premium). Rather than prorating that
// difference across every line (which would misrepresent each item's real
// price/Essence/Karma cost), one extra synthetic GearLine carries the exact
// difference - negative for a discount, the normal case. This keeps
// `gearCostTotal`/`nuyenRemaining` exactly correct while every constituent
// item stays individually visible, editable, and removable afterward, same
// as if it had been bought one at a time.
import type { GearLine } from "./character";
import type { GearCatalogEntry, PackCatalogEntry } from "./rules";
import { findGearEntry, gearUnitBondingKarma, gearUnitCost, gearUnitEssenceCost, ratingFor } from "./deriveGear";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function explodePackToGearLines(pack: PackCatalogEntry, catalog: GearCatalogEntry[]): GearLine[] {
  const lines: GearLine[] = [];
  let rawTotal = 0;

  for (const item of pack.items) {
    const entry = findGearEntry(item.itemId, catalog);
    if (!entry) continue;

    const unitCost = gearUnitCost(entry, item.rating);
    lines.push({
      itemId: entry.id,
      name: entry.name,
      qty: item.qty,
      unitCost,
      rating: entry.levels ? ratingFor(entry, item.rating) : undefined,
      essenceCost: gearUnitEssenceCost(entry, item.rating),
      bondingKarma: gearUnitBondingKarma(entry, item.rating),
      notes: item.notes,
    });
    rawTotal += unitCost * item.qty;
  }

  const adjustment = round2(pack.cost - rawTotal);
  if (adjustment !== 0) {
    lines.push({
      name: `${pack.name} bundle adjustment`,
      qty: 1,
      unitCost: adjustment,
      notes: `Applied automatically when buying the ${pack.name} PACK.`,
    });
  }

  return lines;
}

/** Whether a PACK can be bought right now, given remaining nuyen. */
export function canAffordPack(pack: PackCatalogEntry, remaining: number): boolean {
  return pack.cost <= remaining;
}
