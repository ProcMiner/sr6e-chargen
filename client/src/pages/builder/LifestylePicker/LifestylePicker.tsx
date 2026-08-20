import { useState } from "react";
import type { CharacterData, LifestyleLine } from "../../../character";
import type { LifestyleCatalogEntry, LifestyleRulesResponse } from "../../../rules";
import { findLifestyleEntry, lifestyleCostTotal } from "../../../deriveLifestyle";
import { nuyenRemaining } from "../../../deriveGear";
import { NumberStepper } from "../../../components/NumberStepper";

interface Props {
  rules: LifestyleRulesResponse;
  data: CharacterData;
  onChange: (data: CharacterData) => void;
}

const MAX_MONTHS_PREPAID = 60;

export function LifestylePicker({ rules, data, onChange }: Props) {
  const catalog = rules.lifestyles;
  const selected = data.lifestyles;
  const spent = lifestyleCostTotal(selected);
  const remaining = nuyenRemaining(data) - spent;

  const [customName, setCustomName] = useState("");
  const [customCostPerMonth, setCustomCostPerMonth] = useState(0);
  const [customMonths, setCustomMonths] = useState(1);

  function applyLifestyles(next: LifestyleLine[]) {
    onChange({ ...data, lifestyles: next });
  }

  function canAdd(entry: LifestyleCatalogEntry) {
    return entry.costPerMonth <= remaining;
  }

  function addFromCatalog(entry: LifestyleCatalogEntry) {
    if (!canAdd(entry)) return;
    applyLifestyles([
      ...selected,
      { itemId: entry.id, name: entry.name, monthsPrepaid: 1, costPerMonth: entry.costPerMonth },
    ]);
  }

  function removeAt(index: number) {
    const next = [...selected];
    next.splice(index, 1);
    applyLifestyles(next);
  }

  /** Nuyen budget left for a given line if it were removed first, i.e. what's available to spend on it. */
  function budgetFor(index: number): number {
    const line = selected[index];
    return nuyenRemaining(data) - (spent - line.monthsPrepaid * line.costPerMonth);
  }

  function maxAffordableMonths(index: number, costPerMonth: number): number {
    if (costPerMonth <= 0) return MAX_MONTHS_PREPAID;
    return Math.min(MAX_MONTHS_PREPAID, Math.floor(budgetFor(index) / costPerMonth));
  }

  function updateMonths(index: number, months: number) {
    const line = selected[index];
    const maxMonths = Math.max(1, maxAffordableMonths(index, line.costPerMonth));
    const clamped = Math.max(1, Math.min(months, maxMonths));
    const next = [...selected];
    next[index] = { ...line, monthsPrepaid: clamped };
    applyLifestyles(next);
  }

  function addCustom() {
    const name = customName.trim();
    if (!name || customMonths < 1 || customCostPerMonth < 0) return;
    if (customCostPerMonth * customMonths > remaining) return;
    applyLifestyles([...selected, { name, monthsPrepaid: customMonths, costPerMonth: customCostPerMonth }]);
    setCustomName("");
    setCustomCostPerMonth(0);
    setCustomMonths(1);
  }

  return (
    <details className="top-level-section" open>
      <summary>
        <h2>Lifestyle</h2>
      </summary>
      <div className="lifestyle-picker">
      <p className="hint">
        {data.nuyen.toLocaleString()}¥ earned - {spent.toLocaleString()}¥ spent on lifestyle ={" "}
        {remaining.toLocaleString()}¥ remaining
      </p>

      {selected.length > 0 && (
        <ul className="module-slots">
          {selected.map((line, i) => {
            const entry = line.itemId ? findLifestyleEntry(line.itemId, catalog) : undefined;
            return (
              <li key={i}>
                <div className="module-instance">
                  <div className="module-instance-header">
                    <strong>
                      {line.name} ({(line.monthsPrepaid * line.costPerMonth).toLocaleString()}¥)
                    </strong>
                    <button className="danger" onClick={() => removeAt(i)}>
                      Remove
                    </button>
                  </div>
                  {entry && <p className="hint">{entry.summary}</p>}
                  <label className="inline-field">
                    Months prepaid
                    <NumberStepper
                      value={line.monthsPrepaid}
                      min={1}
                      max={Math.max(1, maxAffordableMonths(i, line.costPerMonth))}
                      onChange={(months) => updateMonths(i, months)}
                      label="months prepaid"
                    />
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="module-picker">
        {catalog.map((entry) => (
          <button
            key={entry.id}
            className="chip"
            disabled={!canAdd(entry)}
            onClick={() => addFromCatalog(entry)}
            title={entry.summary}
          >
            {entry.name} ({entry.costPerMonth.toLocaleString()}¥/month)
          </button>
        ))}
      </div>

      <details className="quality-section">
        <summary>Add custom lifestyle</summary>
        <div className="inline-field">
          <input
            type="text"
            placeholder="Lifestyle name"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
          />
          <label className="inline-field">
            Cost/month (¥)
            <NumberStepper
              label="Custom lifestyle cost per month"
              min={0}
              max={999999}
              value={customCostPerMonth}
              onChange={setCustomCostPerMonth}
            />
          </label>
          <label className="inline-field">
            Months prepaid
            <NumberStepper
              label="Custom lifestyle months prepaid"
              min={1}
              max={MAX_MONTHS_PREPAID}
              value={customMonths}
              onChange={setCustomMonths}
            />
          </label>
          <button
            onClick={addCustom}
            disabled={!customName.trim() || customCostPerMonth * customMonths > remaining}
          >
            Add
          </button>
        </div>
      </details>
      </div>
    </details>
  );
}
