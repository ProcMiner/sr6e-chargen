import { useState } from "react";
import type { AdeptPowerLine, CharacterData } from "../../../character";
import type { AdeptPowerCatalogEntry, AdeptPowerRulesResponse } from "../../../rules";
import {
  adeptPowerPointPool,
  adeptPowerPointsSpent,
  adeptPowerUnitCost,
  findAdeptPowerEntry,
  isAdept,
  isMysticAdept,
  ratingFor,
} from "../../../deriveAdeptPowers";
import { effectiveMagic } from "../../../deriveEssence";

interface Props {
  rules: AdeptPowerRulesResponse;
  data: CharacterData;
  onChange: (data: CharacterData) => void;
}

export function AdeptPowerPicker({ rules, data, onChange }: Props) {
  const adept = isAdept(data);
  const mysticAdept = isMysticAdept(data);

  const catalog = rules.adeptPowers;
  const known = data.adeptPowers;
  const pool = adeptPowerPointPool(data);
  const spent = adeptPowerPointsSpent(known, catalog);
  const remaining = pool - spent;
  const magic = effectiveMagic(data);

  const [search, setSearch] = useState("");
  const searchTerm = search.trim().toLowerCase();

  function matchesSearch(entry: AdeptPowerCatalogEntry) {
    if (!searchTerm) return true;
    return entry.name.toLowerCase().includes(searchTerm) || entry.summary.toLowerCase().includes(searchTerm);
  }

  const byBook = new Map<string, AdeptPowerCatalogEntry[]>();
  for (const entry of catalog) {
    if (!matchesSearch(entry)) continue;
    if (!byBook.has(entry.book)) byBook.set(entry.book, []);
    byBook.get(entry.book)!.push(entry);
  }

  function applyPowers(next: AdeptPowerLine[]) {
    onChange({ ...data, adeptPowers: next });
  }

  function canAdd(entry: AdeptPowerCatalogEntry) {
    const level = entry.levels?.min;
    return adeptPowerUnitCost(entry, level) <= remaining;
  }

  function addPower(entry: AdeptPowerCatalogEntry) {
    if (!canAdd(entry)) return;
    applyPowers([...known, { powerId: entry.id, level: entry.levels?.min }]);
  }

  function removeAt(index: number) {
    const next = [...known];
    next.splice(index, 1);
    applyPowers(next);
  }

  /** PP remaining as if this line were removed first, i.e. what's available to spend re-leveling it. */
  function remainingFor(index: number): number {
    const line = known[index];
    const entry = findAdeptPowerEntry(line.powerId, catalog);
    const currentCost = entry ? adeptPowerUnitCost(entry, line.level) : 0;
    return remaining + currentCost;
  }

  function updateLevel(index: number, level: number) {
    const line = known[index];
    const entry = findAdeptPowerEntry(line.powerId, catalog);
    if (!entry?.levels) return;
    const clamped = ratingFor(entry, level);
    if (adeptPowerUnitCost(entry, clamped) > remainingFor(index)) return;
    const next = [...known];
    next[index] = { ...line, level: clamped };
    applyPowers(next);
  }

  function updateNotes(index: number, notes: string) {
    const next = [...known];
    next[index] = { ...known[index], notes: notes || undefined };
    applyPowers(next);
  }

  function updateMysticAdeptPoints(value: number) {
    const clamped = Math.max(0, Math.min(magic, value));
    onChange({ ...data, mysticAdeptPowerPoints: clamped });
  }

  if (!adept && !mysticAdept) return null;

  return (
    <div className="adept-power-picker">
      <h2>Adept Powers</h2>
      {mysticAdept && (
        <p className="hint">
          <label className="inline-field">
            Power Points dedicated to the adept side (0-{magic})
            <input
              type="number"
              min={0}
              max={magic}
              value={data.mysticAdeptPowerPoints ?? 0}
              onChange={(e) => updateMysticAdeptPoints(Number(e.target.value))}
            />
          </label>{" "}
          - the rest of your Magic doubles into free spells (see Spells).
        </p>
      )}
      <p className="hint">
        {pool.toLocaleString()} Power Point pool - {spent.toLocaleString()} spent = {remaining.toLocaleString()}{" "}
        remaining
      </p>

      {known.length > 0 && (
        <ul className="module-slots">
          {known.map((line, i) => {
            const entry = findAdeptPowerEntry(line.powerId, catalog);
            const cost = entry ? adeptPowerUnitCost(entry, line.level) : 0;
            return (
              <li key={i}>
                <div className="module-instance">
                  <div className="module-instance-header">
                    <strong>
                      {entry?.name ?? line.powerId} ({cost.toLocaleString()} PP)
                    </strong>
                    <button className="danger" onClick={() => removeAt(i)}>
                      Remove
                    </button>
                  </div>
                  {entry && (
                    <p className="hint">
                      {entry.activation} - {entry.summary}
                    </p>
                  )}
                  {entry?.levels && (
                    <label className="inline-field">
                      Level
                      <select value={line.level ?? entry.levels.min} onChange={(e) => updateLevel(i, Number(e.target.value))}>
                        {Array.from(
                          { length: entry.levels.max - entry.levels.min + 1 },
                          (_, n) => entry.levels!.min + n
                        ).map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {lvl}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <label className="inline-field">
                    Notes (sub-choice, if any)
                    <input
                      type="text"
                      value={line.notes ?? ""}
                      onChange={(e) => updateNotes(i, e.target.value)}
                      placeholder="e.g. attribute, skill, or element"
                    />
                  </label>
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
        placeholder="Search adept powers by name or description..."
        aria-label="Search adept powers"
      />

      {[...byBook.entries()].map(([book, entries]) => (
        <details key={book} className="quality-section" open={!!searchTerm}>
          <summary>{book}</summary>
          <div className="module-picker">
            {entries.map((entry) => (
              <button
                key={entry.id}
                className="chip"
                disabled={!canAdd(entry)}
                onClick={() => addPower(entry)}
                title={`${entry.activation} - ${entry.summary}`}
              >
                {entry.name} ({entry.cost.toLocaleString()}
                {entry.levels ? "/level" : ""} PP)
              </button>
            ))}
          </div>
        </details>
      ))}
      {searchTerm && byBook.size === 0 && <p className="hint">No adept powers match "{search}".</p>}
    </div>
  );
}
