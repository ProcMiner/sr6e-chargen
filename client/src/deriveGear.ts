// Small pure helpers for the Gear picker/summary, mirroring deriveQualities.ts.
//
// `data.nuyen` itself is never renamed or mutated here - it keeps meaning
// "total nuyen ever earned," exactly as Priority's "Apply X¥" button and Life
// Path's module accumulation already set it. Remaining spending money is
// always derived from nuyen minus gear cost, never stored, so a future
// career-mode nuyen-earning feature just adds to `data.nuyen` and this math
// keeps working unchanged. Lifestyle purchases (see deriveLifestyle.ts's
// lifestyleCostTotal) also spend from this same pool - callers thread it in
// as `nuyenRemaining`'s optional second argument, same pattern as
// `karmaRemaining`'s extraKarmaSpent below.
//
// `data.karma` follows the same pattern for a second, independent pool:
// QualityPicker.tsx sets it to (starting Karma + net quality Karma) - that's
// the character's total available Karma pool, untouched here. Magical foci
// additionally cost Karma to bond (see GearCatalogEntry.bondingKarma below),
// so `karmaRemaining` derives the pool minus gear-based bonding costs, never
// stored, exactly mirroring `nuyenRemaining`. Learning spells beyond the
// free allotment also spends from this same pool (see deriveSpells.ts's
// spellKarmaCost) - callers that need that too pass it as the optional
// second argument, since computing it here would require pulling in
// PriorityRulesResponse for a file that's otherwise gear-only.
//
// One Karma pool spend feeds nuyen back in the other direction: chargen's
// "Spend Customization Karma" step (core rulebook p.66) lets Karma convert
// to nuyen at a flat rate. That's tracked as its own field
// (CharacterData.karmaSpentOnNuyen) rather than by mutating `data.nuyen`
// directly, matching every other Karma spend's convention - both
// nuyenRemaining and karmaRemaining fold it in automatically, so callers
// never need to know it exists.
import type { CharacterData, GearLine } from "./character";
import type { GearCatalogEntry } from "./rules";

export function findGearEntry(id: string, catalog: GearCatalogEntry[]): GearCatalogEntry | undefined {
  return catalog.find((g) => g.id === id);
}

const NON_WEAPON_ITEM_SUBCATEGORIES = new Set(["Weapon Accessories", "Ammunition", "Explosives"]);

/** A wieldable weapon (melee or ranged) a Weapon Accessory could plausibly be mounted on - the weapon catalog's "weapon" category minus its own accessories/ammo/explosives subcategories. */
export function isWeapon(entry: GearCatalogEntry | undefined): boolean {
  return !!entry && entry.category === "weapon" && !NON_WEAPON_ITEM_SUBCATEGORIES.has(entry.subcategory ?? "");
}

export function isWeaponAccessory(entry: GearCatalogEntry | undefined): boolean {
  return !!entry && entry.category === "weapon" && entry.subcategory === "Weapon Accessories";
}

/**
 * Whether a gear line can be mounted on a weapon via `GearLine.attachedTo`.
 * Catalog Weapon Accessories always qualify; a custom/freeform item (no
 * catalog `entry` at all, since findGearEntry only resolves `itemId`) also
 * qualifies, since a homebrewed accessory a player types in by name (e.g. a
 * house-ruled scope or a joke item like "the Enloudener") has no catalog
 * subcategory to check but is just as legitimate to mount as a cataloged
 * one. Any other cataloged item (armor, drugs, cyberware, etc.) doesn't
 * qualify - only weapons themselves are excluded implicitly, since a
 * cataloged weapon entry is never classified "Weapon Accessories".
 */
export function canAttachToWeapon(entry: GearCatalogEntry | undefined): boolean {
  return !entry || isWeaponAccessory(entry);
}

/**
 * Stable reference for one gear line, used by a Weapon Accessory's
 * `attachedTo` to point at the weapon it's mounted on. Prefers the line's
 * own `id` (every line created after attachment shipped has one - see
 * GearPicker.tsx's addFromCatalog/addCustom), falling back to itemId/name
 * for older saved lines that predate it - stable enough for this purpose
 * since neither changes after purchase, though it can't tell apart two
 * older lines that are exact duplicates (same itemId, no id yet).
 */
export function gearLineKey(line: GearLine): string {
  return line.id ?? line.itemId ?? line.name;
}

export function gearCostTotal(gear: GearLine[]): number {
  return gear.reduce((sum, line) => sum + (line.free ? 0 : line.qty * line.unitCost), 0);
}

/** 2,000 nuyen per Karma point normally, or 5,000 with the In Debt quality (core rulebook p.66, "in-debt" quality entry). */
export function karmaToNuyenRate(data: CharacterData): number {
  return data.qualities.some((q) => q.id === "in-debt") ? 5000 : 2000;
}

/** Nuyen gained from converting Karma at chargen - see CharacterData.karmaSpentOnNuyen. */
export function nuyenFromKarmaConversion(data: CharacterData): number {
  return (data.karmaSpentOnNuyen ?? 0) * karmaToNuyenRate(data);
}

/**
 * The In Debt quality's other half (core rulebook p.66, "in-debt" quality
 * entry): each Karma point converted to nuyen "also adds 5,000 nuyen of
 * debt plus a 500 nuyen/Karma-spent monthly interest payment." Reference
 * numbers only, same as Lifestyle's monthly cost - this app doesn't
 * simulate a calendar of payments, just surfaces what's owed so the
 * player/GM can track it.
 */
export function inDebtPrincipal(data: CharacterData): number {
  if (!data.qualities.some((q) => q.id === "in-debt")) return 0;
  return (data.karmaSpentOnNuyen ?? 0) * 5000;
}

export function inDebtMonthlyInterest(data: CharacterData): number {
  if (!data.qualities.some((q) => q.id === "in-debt")) return 0;
  return (data.karmaSpentOnNuyen ?? 0) * 500;
}

export function nuyenRemaining(data: CharacterData, extraNuyenSpent = 0): number {
  return data.nuyen + nuyenFromKarmaConversion(data) - gearCostTotal(data.gear) - extraNuyenSpent;
}

export function gearBondingKarmaTotal(gear: GearLine[]): number {
  return gear.reduce((sum, line) => sum + (line.bondingKarma ?? 0) * line.qty, 0);
}

export function karmaRemaining(data: CharacterData, extraKarmaSpent = 0): number {
  return data.karma - gearBondingKarmaTotal(data.gear) - (data.karmaSpentOnNuyen ?? 0) - extraKarmaSpent;
}

export function ratingFor(entry: GearCatalogEntry, rating: number | undefined): number {
  if (!entry.levels) return 1;
  const { min, max } = entry.levels;
  return Math.max(min, Math.min(max, rating ?? min));
}

/** Unit cost for a catalog entry at a given rating (rating is ignored for flat-cost entries). */
export function gearUnitCost(entry: GearCatalogEntry, rating: number | undefined): number {
  return entry.levels ? entry.cost * ratingFor(entry, rating) : entry.cost;
}

/** Essence cost for a catalog entry at a given rating, same per-level convention as gearUnitCost. */
export function gearUnitEssenceCost(entry: GearCatalogEntry, rating: number | undefined): number | undefined {
  if (entry.essenceCost === undefined) return undefined;
  return entry.levels ? entry.essenceCost * ratingFor(entry, rating) : entry.essenceCost;
}

/** Karma bonding cost for a catalog entry at a given rating, same per-level convention as gearUnitCost. */
export function gearUnitBondingKarma(entry: GearCatalogEntry, rating: number | undefined): number | undefined {
  if (entry.bondingKarma === undefined) return undefined;
  return entry.levels ? entry.bondingKarma * ratingFor(entry, rating) : entry.bondingKarma;
}
