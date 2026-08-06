import { useState } from "react";
import type { CharacterData, GearLine } from "../../../character";
import type { GearCatalogEntry, GearRulesResponse } from "../../../rules";
import { findGearEntry, gearCostTotal, gearUnitCost, nuyenRemaining, ratingFor } from "../../../deriveGear";

interface Props {
  rules: GearRulesResponse;
  data: CharacterData;
  onChange: (data: CharacterData) => void;
}

export function GearPicker({ rules, data, onChange }: Props) {
  const catalog = rules.gear;
  const selected = data.gear;
  const remaining = nuyenRemaining(data);

  const [search, setSearch] = useState("");
  const [customName, setCustomName] = useState("");
  const [customQty, setCustomQty] = useState(1);
  const [customCost, setCustomCost] = useState(0);
  const [customEssenceCost, setCustomEssenceCost] = useState(0);

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

  function canAdd(entry: GearCatalogEntry) {
    return gearUnitCost(entry, entry.levels?.min) <= remaining;
  }

  function addFromCatalog(entry: GearCatalogEntry) {
    if (!canAdd(entry)) return;
    const rating = entry.levels?.min;
    applyGear([
      ...selected,
      {
        itemId: entry.id,
        name: entry.name,
        qty: 1,
        unitCost: gearUnitCost(entry, rating),
        rating,
        essenceCost: entry.essenceCost,
      },
    ]);
  }

  function removeAt(index: number) {
    const next = [...selected];
    next.splice(index, 1);
    applyGear(next);
  }

  /** Budget left for a given line if it were removed first, i.e. what's available to spend on it. */
  function budgetFor(index: number): number {
    const line = selected[index];
    return data.nuyen - (gearCostTotal(selected) - line.qty * line.unitCost);
  }

  function updateQty(index: number, qty: number) {
    const line = selected[index];
    const budget = budgetFor(index);
    const maxQty = line.unitCost > 0 ? Math.floor(budget / line.unitCost) : qty;
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
    const budget = budgetFor(index);
    const maxQty = unitCost > 0 ? Math.floor(budget / unitCost) : line.qty;
    const qty = Math.max(1, Math.min(line.qty, Math.max(1, maxQty)));
    const next = [...selected];
    next[index] = { ...line, rating: clampedRating, unitCost, qty };
    applyGear(next);
  }

  function addCustom() {
    const name = customName.trim();
    if (!name || customQty < 1 || customCost < 0 || customEssenceCost < 0) return;
    if (customCost * customQty > remaining) return;
    applyGear([
      ...selected,
      {
        name,
        qty: customQty,
        unitCost: customCost,
        essenceCost: customEssenceCost > 0 ? customEssenceCost : undefined,
      },
    ]);
    setCustomName("");
    setCustomQty(1);
    setCustomCost(0);
    setCustomEssenceCost(0);
  }

  return (
    <div className="gear-picker">
      <h2>Gear</h2>
      <p className="hint">
        {data.nuyen.toLocaleString()}¥ earned - {gearCostTotal(selected).toLocaleString()}¥ spent ={" "}
        {remaining.toLocaleString()}¥ remaining
      </p>

      {selected.length > 0 && (
        <ul className="module-slots">
          {selected.map((line, i) => {
            const entry = line.itemId ? findGearEntry(line.itemId, catalog) : undefined;
            return (
              <li key={i}>
                <div className="module-instance">
                  <div className="module-instance-header">
                    <strong>
                      {line.name} ({(line.qty * line.unitCost).toLocaleString()}¥)
                    </strong>
                    <button className="danger" onClick={() => removeAt(i)}>
                      Remove
                    </button>
                  </div>
                  {entry && <p className="hint">{entry.summary}</p>}
                  <label className="inline-field">
                    Qty
                    <input
                      type="number"
                      min={1}
                      value={line.qty}
                      onChange={(e) => updateQty(i, Number(e.target.value))}
                    />
                  </label>
                  {entry?.levels && (
                    <label className="inline-field">
                      Rating
                      <select
                        value={line.rating ?? entry.levels.min}
                        onChange={(e) => updateRating(i, Number(e.target.value))}
                      >
                        {Array.from(
                          { length: entry.levels.max - entry.levels.min + 1 },
                          (_, n) => entry.levels!.min + n
                        ).map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
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
                disabled={!canAdd(entry)}
                onClick={() => addFromCatalog(entry)}
                title={entry.summary}
              >
                {entry.name} ({entry.cost.toLocaleString()}
                {entry.levels ? "/level" : ""}¥)
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
            <input
              type="number"
              min={1}
              value={customQty}
              onChange={(e) => setCustomQty(Math.max(1, Number(e.target.value)))}
            />
          </label>
          <label className="inline-field">
            Unit cost (¥)
            <input
              type="number"
              min={0}
              value={customCost}
              onChange={(e) => setCustomCost(Math.max(0, Number(e.target.value)))}
            />
          </label>
          <label className="inline-field">
            Essence cost
            <input
              type="number"
              min={0}
              step={0.1}
              value={customEssenceCost}
              onChange={(e) => setCustomEssenceCost(Math.max(0, Number(e.target.value)))}
            />
          </label>
          <button onClick={addCustom} disabled={!customName.trim() || customCost * customQty > remaining}>
            Add
          </button>
        </div>
      </details>
    </div>
  );
}
