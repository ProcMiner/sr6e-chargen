import { useState } from "react";
import type { CharacterData, GearLine } from "../../../character";
import type { GearCatalogEntry, GearRulesResponse } from "../../../rules";
import {
  canAttachToWeapon,
  findGearEntry,
  gearBondingKarmaTotal,
  gearCostTotal,
  gearLineKey,
  gearUnitBondingKarma,
  gearUnitCost,
  gearUnitEssenceCost,
  isWeapon,
  karmaRemaining,
  karmaToNuyenRate,
  nuyenFromKarmaConversion,
  nuyenRemaining,
  ratingFor,
} from "../../../deriveGear";
import { resolveGearModifiers } from "../../../deriveModifiers";
import { NumberStepper } from "../../../components/NumberStepper";
import { generateId } from "../../../id";

interface Props {
  rules: GearRulesResponse;
  data: CharacterData;
  onChange: (data: CharacterData) => void;
  /** Karma already committed outside gear (e.g. spells beyond the free allotment - see deriveSpells.ts), so this picker's afford checks reflect the whole shared Karma pool. */
  extraKarmaSpent?: number;
  /** Nuyen already committed outside gear (e.g. lifestyle purchases - see deriveLifestyle.ts), so this picker's afford checks reflect the whole shared nuyen pool. */
  extraNuyenSpent?: number;
  /** Shows a "Free (loot from a run)" checkbox that adds items without spending nuyen - see GearLine.free. Only meaningful in play mode (pages/play/LivePlay.tsx); chargen never sets this. */
  allowFree?: boolean;
}

export function GearPicker({
  rules,
  data,
  onChange,
  extraKarmaSpent = 0,
  extraNuyenSpent = 0,
  allowFree = false,
}: Props) {
  const catalog = rules.gear;
  const selected = data.gear;
  const remaining = nuyenRemaining(data, extraNuyenSpent);
  const karmaBudget = karmaRemaining(data, extraKarmaSpent);
  const karmaSpentOnNuyen = data.karmaSpentOnNuyen ?? 0;
  const rate = karmaToNuyenRate(data);
  // Ceiling on the stepper if it were set back to 0 - what's already converted plus whatever's still free to spend.
  const maxKarmaConvertible = karmaBudget + karmaSpentOnNuyen;

  function setKarmaSpentOnNuyen(next: number) {
    onChange({ ...data, karmaSpentOnNuyen: next });
  }

  const [search, setSearch] = useState("");
  const [addFree, setAddFree] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customQty, setCustomQty] = useState(1);
  const [customCost, setCustomCost] = useState(0);
  const [customEssenceCost, setCustomEssenceCost] = useState(0);
  const [customBondingKarma, setCustomBondingKarma] = useState(0);

  const searchTerm = search.trim().toLowerCase();
  function matchesSearch(entry: GearCatalogEntry) {
    if (!searchTerm) return true;
    return entry.name.toLowerCase().includes(searchTerm) || entry.summary.toLowerCase().includes(searchTerm);
  }

  const bySubcategory = new Map<string, GearCatalogEntry[]>();
  for (const entry of catalog) {
    if (!matchesSearch(entry)) continue;
    const key = entry.subcategory ?? "Other";
    if (!bySubcategory.has(key)) bySubcategory.set(key, []);
    bySubcategory.get(key)!.push(entry);
  }

  function applyGear(next: GearLine[]) {
    onChange({ ...data, gear: next });
  }

  function canAdd(entry: GearCatalogEntry, free: boolean) {
    const rating = entry.levels?.min;
    if (!free && gearUnitCost(entry, rating) > remaining) return false;
    const bondingKarma = gearUnitBondingKarma(entry, rating);
    if (bondingKarma !== undefined && bondingKarma > karmaBudget) return false;
    return true;
  }

  function addFromCatalog(entry: GearCatalogEntry) {
    const free = allowFree && addFree;
    if (!canAdd(entry, free)) return;
    const rating = entry.levels?.min;
    // If an identical line (same catalog item, same rating, same free
    // status) is already owned, bump its Qty instead of adding a second
    // line for the same purchase - clicking "Add" on a catalog chip twice
    // used to always create two separate one-off lines, so getting "2x
    // Ruger Super Warhawk" meant two identically-named rows instead of one
    // row with Qty 2. A line that's had its rating changed via the Rating
    // dropdown deliberately won't match here (different rating = a
    // genuinely different variant, not a duplicate).
    const existingIndex = selected.findIndex(
      (line) => line.itemId === entry.id && line.rating === rating && !!line.free === free
    );
    if (existingIndex !== -1) {
      const line = selected[existingIndex];
      const maxQty = maxAffordableQty(existingIndex, line.unitCost, line.bondingKarma, !!line.free);
      const next = [...selected];
      next[existingIndex] = { ...line, qty: Math.min(line.qty + 1, Math.max(line.qty, maxQty)) };
      applyGear(next);
      return;
    }
    applyGear([
      ...selected,
      {
        id: generateId(),
        itemId: entry.id,
        name: entry.name,
        qty: 1,
        unitCost: gearUnitCost(entry, rating),
        rating,
        essenceCost: gearUnitEssenceCost(entry, rating),
        bondingKarma: gearUnitBondingKarma(entry, rating),
        modifiers: resolveGearModifiers(entry, rating),
        free: free || undefined,
      },
    ]);
  }

  function removeAt(index: number) {
    const next = [...selected];
    next.splice(index, 1);
    applyGear(next);
  }

  /** Sets/clears which weapon line (by gearLineKey) a Weapon Accessory line is mounted on. */
  function updateAttachment(index: number, targetKey: string) {
    const line = selected[index];
    const next = [...selected];
    next[index] = { ...line, attachedTo: targetKey || undefined };
    applyGear(next);
  }

  /** Nuyen budget left for a given line if it were removed first, i.e. what's available to spend on it. */
  function budgetFor(index: number): number {
    const line = selected[index];
    return data.nuyen - extraNuyenSpent - (gearCostTotal(selected) - line.qty * line.unitCost);
  }

  /** Karma budget left for a given line if it were removed first. */
  function karmaBudgetFor(index: number): number {
    const line = selected[index];
    return data.karma - (gearBondingKarmaTotal(selected) - (line.bondingKarma ?? 0) * line.qty);
  }

  function maxAffordableQty(
    index: number,
    unitCost: number,
    bondingKarma: number | undefined,
    free: boolean
  ): number {
    let maxQty = !free && unitCost > 0 ? Math.floor(budgetFor(index) / unitCost) : Infinity;
    if (bondingKarma) {
      maxQty = Math.min(maxQty, Math.floor(karmaBudgetFor(index) / bondingKarma));
    }
    return maxQty;
  }

  function updateQty(index: number, qty: number) {
    const line = selected[index];
    const maxQty = maxAffordableQty(index, line.unitCost, line.bondingKarma, !!line.free);
    const clamped = Math.max(1, Math.min(qty, Math.max(1, maxQty)));
    const next = [...selected];
    next[index] = { ...line, qty: clamped };
    applyGear(next);
  }

  function updateRating(index: number, rating: number) {
    const line = selected[index];
    const entry = line.itemId ? findGearEntry(line.itemId, catalog) : undefined;
    if (!entry) return;
    const clampedRating = ratingFor(entry, rating);
    const unitCost = gearUnitCost(entry, clampedRating);
    const essenceCost = gearUnitEssenceCost(entry, clampedRating);
    const bondingKarma = gearUnitBondingKarma(entry, clampedRating);
    const modifiers = resolveGearModifiers(entry, clampedRating);
    const maxQty = maxAffordableQty(index, unitCost, bondingKarma, !!line.free);
    const qty = Math.max(1, Math.min(line.qty, Math.max(1, maxQty)));
    const next = [...selected];
    next[index] = { ...line, rating: clampedRating, unitCost, essenceCost, bondingKarma, modifiers, qty };
    applyGear(next);
  }

  function addCustom() {
    const free = allowFree && addFree;
    const name = customName.trim();
    if (!name || customQty < 1 || customCost < 0 || customEssenceCost < 0 || customBondingKarma < 0) return;
    if (!free && customCost * customQty > remaining) return;
    if (customBondingKarma * customQty > karmaBudget) return;
    applyGear([
      ...selected,
      {
        id: generateId(),
        name,
        qty: customQty,
        unitCost: customCost,
        essenceCost: customEssenceCost > 0 ? customEssenceCost : undefined,
        bondingKarma: customBondingKarma > 0 ? customBondingKarma : undefined,
        free: free || undefined,
      },
    ]);
    setCustomName("");
    setCustomQty(1);
    setCustomCost(0);
    setCustomEssenceCost(0);
    setCustomBondingKarma(0);
  }

  const indexedSelected = selected.map((line, i) => ({
    line,
    i,
    entry: line.itemId ? findGearEntry(line.itemId, catalog) : undefined,
  }));
  const weaponLines = indexedSelected.filter((x) => isWeapon(x.entry));
  const accessoriesByTarget = new Map<string, typeof indexedSelected>();
  const attachedIndexes = new Set<number>();
  for (const acc of indexedSelected) {
    if (!canAttachToWeapon(acc.entry) || !acc.line.attachedTo) continue;
    const list = accessoriesByTarget.get(acc.line.attachedTo) ?? [];
    list.push(acc);
    accessoriesByTarget.set(acc.line.attachedTo, list);
    attachedIndexes.add(acc.i);
  }
  const weaponIndexes = new Set(weaponLines.map((w) => w.i));
  const unattachedLines = indexedSelected.filter((x) => !weaponIndexes.has(x.i) && !attachedIndexes.has(x.i));

  function renderOwnedLine({ line, i, entry }: (typeof indexedSelected)[number]) {
    return (
      <div className="module-instance">
        <div className="module-instance-header">
          <strong>
            {line.name} ({line.free ? "Free" : `${(line.qty * line.unitCost).toLocaleString()}¥`}
            {line.bondingKarma ? `, ${(line.qty * line.bondingKarma).toLocaleString()} Karma` : ""})
          </strong>
          <button className="danger" onClick={() => removeAt(i)}>
            Remove
          </button>
        </div>
        {entry && <p className="hint">{entry.summary}</p>}
        <label className="inline-field">
          Qty
          <NumberStepper
            label={`${line.name} quantity`}
            min={1}
            max={Math.max(1, maxAffordableQty(i, line.unitCost, line.bondingKarma, !!line.free))}
            value={line.qty}
            onChange={(next) => updateQty(i, next)}
          />
        </label>
        {entry?.levels && (
          <label className="inline-field">
            Rating
            <select value={line.rating ?? entry.levels.min} onChange={(e) => updateRating(i, Number(e.target.value))}>
              {Array.from({ length: entry.levels.max - entry.levels.min + 1 }, (_, n) => entry.levels!.min + n).map(
                (level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                )
              )}
            </select>
          </label>
        )}
        {canAttachToWeapon(entry) && !isWeapon(entry) && weaponLines.length > 0 && (
          <label className="inline-field">
            Mounted on
            <select value={line.attachedTo ?? ""} onChange={(e) => updateAttachment(i, e.target.value)}>
              <option value="">— unattached —</option>
              {weaponLines.map((w) => (
                <option key={w.i} value={gearLineKey(w.line)}>
                  {w.line.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    );
  }

  return (
    <details className="top-level-section" open>
      <summary>
        <h2>Gear</h2>
      </summary>
      <div className="gear-picker">
      <p className="hint">
        {data.nuyen.toLocaleString()}¥ earned
        {karmaSpentOnNuyen > 0 && ` + ${nuyenFromKarmaConversion(data).toLocaleString()}¥ from Karma`} -{" "}
        {gearCostTotal(selected).toLocaleString()}¥ spent = {remaining.toLocaleString()}¥ remaining
      </p>
      <p className="hint">
        {data.karma.toLocaleString()} Karma pool - {gearBondingKarmaTotal(selected).toLocaleString()} spent bonding
        foci
        {karmaSpentOnNuyen > 0 && ` - ${karmaSpentOnNuyen.toLocaleString()} converted to nuyen`} ={" "}
        {karmaBudget.toLocaleString()} remaining
      </p>

      {!allowFree && (
        <label className="inline-field">
          Convert Karma to nuyen
          <NumberStepper
            label="Karma converted to nuyen"
            min={0}
            max={maxKarmaConvertible}
            value={karmaSpentOnNuyen}
            onChange={setKarmaSpentOnNuyen}
          />
          <span className="hint">
            {rate.toLocaleString()}¥ per Karma point{rate === 5000 ? " (In Debt)" : ""} - core rulebook p.66
          </span>
        </label>
      )}

      {weaponLines.length > 0 && (
        <ul className="module-slots">
          {weaponLines.map((w) => (
            <li key={w.line.id ?? w.i}>
              {renderOwnedLine(w)}
              {(accessoriesByTarget.get(gearLineKey(w.line)) ?? []).length > 0 && (
                <ul className="module-slots">
                  {accessoriesByTarget.get(gearLineKey(w.line))!.map((acc) => (
                    <li key={acc.line.id ?? acc.i}>{renderOwnedLine(acc)}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}

      {unattachedLines.length > 0 && (
        <ul className="module-slots">
          {unattachedLines.map((x) => (
            <li key={x.line.id ?? x.i}>{renderOwnedLine(x)}</li>
          ))}
        </ul>
      )}

      {allowFree && (
        <label className="inline-field">
          <input type="checkbox" checked={addFree} onChange={(e) => setAddFree(e.target.checked)} />
          Free (loot from a run - doesn't spend nuyen)
        </label>
      )}

      <input
        type="text"
        className="picker-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search gear by name or description..."
        aria-label="Search gear"
      />

      {[...bySubcategory.entries()].map(([subcategory, entries]) => (
        <details key={subcategory} className="quality-section" open={!!searchTerm}>
          <summary>{subcategory}</summary>
          <div className="module-picker">
            {entries.map((entry) => (
              <button
                key={entry.id}
                className="chip"
                disabled={!canAdd(entry, allowFree && addFree)}
                onClick={() => addFromCatalog(entry)}
                title={entry.summary}
              >
                {entry.name} ({entry.cost.toLocaleString()}
                {entry.levels ? "/level" : ""}¥{allowFree && addFree ? ", free" : ""})
              </button>
            ))}
          </div>
        </details>
      ))}
      {searchTerm && bySubcategory.size === 0 && <p className="hint">No gear matches "{search}".</p>}

      <details className="quality-section">
        <summary>Add custom item</summary>
        <div className="inline-field">
          <input
            type="text"
            placeholder="Item name"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
          />
          <label className="inline-field">
            Qty
            <NumberStepper label="Custom item quantity" min={1} max={999} value={customQty} onChange={setCustomQty} />
          </label>
          <label className="inline-field">
            Unit cost (¥)
            <NumberStepper
              label="Custom item unit cost"
              min={0}
              max={999999}
              value={customCost}
              onChange={setCustomCost}
            />
          </label>
          <label className="inline-field">
            Essence cost
            <NumberStepper
              label="Custom item Essence cost"
              min={0}
              max={6}
              step={0.1}
              value={customEssenceCost}
              onChange={setCustomEssenceCost}
            />
          </label>
          <label className="inline-field">
            Bonding Karma
            <NumberStepper
              label="Custom item bonding Karma"
              min={0}
              max={999}
              value={customBondingKarma}
              onChange={setCustomBondingKarma}
            />
          </label>
          <button
            onClick={addCustom}
            disabled={
              !customName.trim() ||
              (!(allowFree && addFree) && customCost * customQty > remaining) ||
              customBondingKarma * customQty > karmaBudget
            }
          >
            Add
          </button>
        </div>
      </details>
      </div>
    </details>
  );
}
