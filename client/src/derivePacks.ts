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
import type { GearLine, LifestyleLine } from "./character";
import type { GearCatalogEntry, LifestyleCatalogEntry, PackCatalogEntry } from "./rules";
import { findGearEntry, gearUnitBondingKarma, gearUnitCost, gearUnitEssenceCost, ratingFor } from "./deriveGear";
import { findLifestyleEntry } from "./deriveLifestyle";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Complete Character PACKs nest another PACK inside themselves ("Included
 * PACK: Shadowrunner Starter PACK") - resolved one level deep here (no PACK
 * in the book nests two levels) so the nested PACK's items appear as their
 * own real GearLines too, folded into the SAME bundle-adjustment line as
 * the outer PACK's own items, rather than charging the nested PACK's own
 * flat price a second time.
 */
export function explodePackToGearLines(
  pack: PackCatalogEntry,
  catalog: GearCatalogEntry[],
  allPacks: PackCatalogEntry[] = []
): GearLine[] {
  const lines: GearLine[] = [];
  let rawTotal = 0;

  function addItems(items: PackCatalogEntry["items"]) {
    for (const item of items) {
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
  }

  if (pack.includesPackId) {
    const nested = allPacks.find((p) => p.id === pack.includesPackId);
    if (nested) addItems(nested.items);
  }
  addItems(pack.items);

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

/**
 * The one month of lifestyle a Complete Character PACK grants, if any. A
 * PACK's own `lifestyle` overrides (doesn't stack with) whatever its nested
 * PACK would have granted - matches the book's "upgraded from starter PACK"
 * language, where e.g. Full Magician's Medium lifestyle replaces the
 * Starter PACK's own Low lifestyle rather than adding to it.
 */
export function packLifestyleLine(
  pack: PackCatalogEntry,
  allPacks: PackCatalogEntry[],
  lifestyleCatalog: LifestyleCatalogEntry[]
): LifestyleLine | undefined {
  const nested = pack.includesPackId ? allPacks.find((p) => p.id === pack.includesPackId) : undefined;
  const source = pack.lifestyle ?? nested?.lifestyle;
  if (!source) return undefined;

  const entry = findLifestyleEntry(source.itemId, lifestyleCatalog);
  if (!entry) return undefined;

  return { itemId: entry.id, name: entry.name, monthsPrepaid: source.months, costPerMonth: entry.costPerMonth };
}

/** Whether a PACK can be bought right now, given remaining nuyen. */
export function canAffordPack(pack: PackCatalogEntry, remaining: number): boolean {
  return pack.cost <= remaining;
}
