// Small pure helpers for the Qualities picker/summary, mirroring the style
// of derive.ts. Chargen rule (core rulebook p. 66, Companion p. 30, verified
// against both PDFs): net bonus Karma from qualities is capped at 20 - if
// negative qualities would grant more than that after subtracting positive
// quality costs, the excess bonus simply isn't granted (the quality itself
// is still valid to take).
//
// Post-chargen ("career mode") Qualities actions - core rulebook
// "Improvement Cost" table, p. 71: "Purchasing a positive quality requires
// spending twice the normal Karma cost. New negative qualities cannot be
// 'purchased'... but negative qualities the character already has can be
// eliminated by paying twice the base Karma bonus." See pages/play/Advancement.tsx.
import type { QualityPurchaseEntry, SelectedQuality } from "./character";
import type { QualityCatalogEntry, QualityRulesResponse } from "./rules";

const NET_BONUS_CAP = 20;

export function combineQualityCatalog(rules: QualityRulesResponse): QualityCatalogEntry[] {
  return [...rules.positiveQualities, ...rules.negativeQualities];
}

export function findQualityEntry(
  id: string,
  catalog: QualityCatalogEntry[]
): QualityCatalogEntry | undefined {
  return catalog.find((q) => q.id === id);
}

export function ratingFor(sel: SelectedQuality, entry: QualityCatalogEntry): number {
  if (!entry.levels) return 1;
  const { min, max } = entry.levels;
  return Math.max(min, Math.min(max, sel.rating ?? min));
}

/** Unsigned Karma magnitude for a selected quality (cost or bonus, before sign). */
export function qualityKarmaAmount(sel: SelectedQuality, entry: QualityCatalogEntry): number {
  return entry.karma * ratingFor(sel, entry);
}

function signedKarma(sel: SelectedQuality, entry: QualityCatalogEntry): number {
  const amount = qualityKarmaAmount(sel, entry);
  return entry.category === "positive" ? -amount : amount;
}

/** Net Karma contribution from all selected qualities, clamped to the +20 chargen cap. */
export function qualityKarmaTotal(selected: SelectedQuality[], catalog: QualityCatalogEntry[]): number {
  const net = selected.reduce((sum, sel) => {
    const entry = findQualityEntry(sel.id, catalog);
    return entry ? sum + signedKarma(sel, entry) : sum;
  }, 0);
  return Math.min(net, NET_BONUS_CAP);
}

/** Post-creation cost to purchase a new positive quality: 2x its normal Karma amount. Not meaningful for negative qualities (can't be purchased) or leveled qualities beyond their chosen rating. */
export function qualityPurchaseCost(sel: SelectedQuality, entry: QualityCatalogEntry): number {
  return qualityKarmaAmount(sel, entry) * 2;
}

export function qualityPurchaseKarmaTotal(entries: QualityPurchaseEntry[] | undefined): number {
  return (entries ?? []).reduce((sum, e) => sum + e.karmaCost, 0);
}

export function qualityDisplayName(sel: SelectedQuality, catalog: QualityCatalogEntry[]): string {
  const entry = findQualityEntry(sel.id, catalog);
  if (!entry) return sel.id;

  let base = entry.name;
  if (entry.requiresParam && sel.param) {
    // Substitute the catalog name's placeholder parenthetical (e.g. "Aptitude
    // (Skill)", "Addiction (Substance, 1 to 6)") with the chosen target.
    base = /\([^)]*\)/.test(base) ? base.replace(/\([^)]*\)/, `(${sel.param})`) : `${base} (${sel.param})`;
  } else if (entry.levels) {
    // Strip a trailing "(min to max)" range placeholder, e.g. "Built Tough
    // (1 to 4)" -> "Built Tough", so the chosen rating isn't shown twice.
    base = base.replace(/\s*\([^)]*\)\s*$/, "");
  }
  return entry.levels ? `${base} ${ratingFor(sel, entry)}` : base;
}
