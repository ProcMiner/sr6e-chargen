import { useState } from "react";
import type { CharacterData, SelectedQuality } from "../../../character";
import type { MetatypeAttributes, MetavariantCatalogEntry, QualityCatalogEntry, QualityRulesResponse } from "../../../rules";
import {
  combineQualityCatalog,
  findQualityEntry,
  qualityDisplayName,
  qualityKarmaAmount,
  qualityKarmaTotal,
} from "../../../deriveQualities";
import { combinedRacialQualities } from "../../../deriveMetavariant";
import { startingKarma } from "../../../derivePriorityVariant";

export const MAX_QUALITIES = 6;
const NET_KARMA_CAP = 20;

// SR6e's "Exceptional (Attribute)" applies to any Physical or Mental
// attribute; Edge is included here too since the picker doesn't otherwise
// distinguish attribute categories.
export const ATTRIBUTE_NAMES = [
  "body",
  "agility",
  "reaction",
  "strength",
  "willpower",
  "logic",
  "intuition",
  "charisma",
  "edge",
];

interface Props {
  rules: QualityRulesResponse;
  metatypeAttributes: MetatypeAttributes[];
  metavariants: MetavariantCatalogEntry[];
  skillList: string[];
  data: CharacterData;
  onChange: (data: CharacterData) => void;
}

export function QualityPicker({ rules, metatypeAttributes, metavariants, skillList, data, onChange }: Props) {
  const catalog = combineQualityCatalog(rules);
  const selected = data.qualities;
  const netKarma = qualityKarmaTotal(selected, catalog);
  const atQualityCap = selected.length >= MAX_QUALITIES;

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"positive" | "negative">("positive");
  const [affordableOnly, setAffordableOnly] = useState(false);
  const searchTerm = search.trim().toLowerCase();
  function matchesSearch(entry: QualityCatalogEntry) {
    if (!searchTerm) return true;
    return entry.name.toLowerCase().includes(searchTerm) || entry.summary.toLowerCase().includes(searchTerm);
  }
  function matchesAffordable(entry: QualityCatalogEntry) {
    if (!affordableOnly || entry.category === "negative") return true;
    return data.karma >= entry.karma;
  }

  const racialQualities = combinedRacialQualities(data, metatypeAttributes, metavariants);

  function applySelection(next: SelectedQuality[]) {
    onChange({ ...data, qualities: next, karma: startingKarma(data) + qualityKarmaTotal(next, catalog) });
  }

  function canAdd(entry: QualityCatalogEntry) {
    if (atQualityCap) return false;
    const alreadyTaken = selected.some((s) => s.id === entry.id);
    // Flat qualities can only be taken once; leveled/parameterized ones may
    // be taken again at a different rating or for a different target.
    return !alreadyTaken || !!entry.levels || !!entry.requiresParam;
  }

  function addQuality(entry: QualityCatalogEntry) {
    if (!canAdd(entry)) return;
    applySelection([...selected, { id: entry.id, rating: entry.levels?.min }]);
  }

  function removeAt(index: number) {
    const next = [...selected];
    next.splice(index, 1);
    applySelection(next);
  }

  function updateAt(index: number, patch: Partial<SelectedQuality>) {
    const next = [...selected];
    next[index] = { ...next[index], ...patch };
    applySelection(next);
  }

  return (
    <div className="quality-picker">
      <h2>Qualities</h2>
      <p className="hint">
        Select up to {MAX_QUALITIES} qualities total (racial qualities from your metatype don't count
        toward this). Net Karma from qualities is capped at +{NET_KARMA_CAP} - if your negative
        qualities would grant more than that, the extra bonus isn't granted, but you can still take
        the quality.
      </p>

      {racialQualities.length > 0 && (
        <p className="hint">Free racial qualities: {racialQualities.join(", ")}</p>
      )}

      <p className="hint">
        {selected.length} / {MAX_QUALITIES} qualities selected - net Karma from qualities:{" "}
        {netKarma >= 0 ? "+" : ""}
        {netKarma} / {NET_KARMA_CAP}
      </p>

      {selected.length > 0 && (
        <ul className="module-slots">
          {selected.map((sel, i) => {
            const entry = findQualityEntry(sel.id, catalog);
            if (!entry) return null;
            const amount = qualityKarmaAmount(sel, entry);
            return (
              <li key={i}>
                <div className="module-instance">
                  <div className="module-instance-header">
                    <strong>
                      {qualityDisplayName(sel, catalog)}{" "}
                      <span className={entry.category === "positive" ? "karma-pill karma-pill--cost" : "karma-pill karma-pill--bonus"}>
                        {entry.category === "positive" ? "-" : "+"}
                        {amount}
                      </span>
                    </strong>
                    <button className="link-button" onClick={() => removeAt(i)}>
                      Remove
                    </button>
                  </div>
                  <p className="hint">{entry.effect}</p>
                  {entry.levels && (
                    <label className="inline-field">
                      Rating
                      <select
                        value={sel.rating ?? entry.levels.min}
                        onChange={(e) => updateAt(i, { rating: Number(e.target.value) })}
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
                  {entry.requiresParam && (
                    <label className="inline-field">
                      {entry.requiresParam === "skill"
                        ? "Skill"
                        : entry.requiresParam === "attribute"
                          ? "Attribute"
                          : "Specify"}
                      {entry.requiresParam === "custom" ? (
                        <input
                          value={sel.param ?? ""}
                          onChange={(e) => updateAt(i, { param: e.target.value })}
                        />
                      ) : (
                        <select value={sel.param ?? ""} onChange={(e) => updateAt(i, { param: e.target.value })}>
                          <option value="">choose...</option>
                          {(entry.requiresParam === "skill" ? skillList : ATTRIBUTE_NAMES).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}
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
        placeholder="Search qualities by name or description..."
        aria-label="Search qualities"
      />

      <div className="picker-filter-row">
        <button
          type="button"
          className={category === "positive" ? "chip selected" : "chip"}
          onClick={() => setCategory("positive")}
        >
          Positive
        </button>
        <button
          type="button"
          className={category === "negative" ? "chip selected" : "chip"}
          onClick={() => setCategory("negative")}
        >
          Negative
        </button>
        <button
          type="button"
          className={affordableOnly ? "chip selected" : "chip"}
          onClick={() => setAffordableOnly((v) => !v)}
        >
          Affordable only
        </button>
      </div>

      {(() => {
        const list = (category === "positive" ? rules.positiveQualities : rules.negativeQualities)
          .filter(matchesSearch)
          .filter(matchesAffordable);
        if (list.length === 0) {
          return <p className="hint">No qualities match{search ? ` "${search}"` : ""}.</p>;
        }
        return (
          <div className="picker-list">
            {list.map((entry) => (
              <button
                key={entry.id}
                className="picker-list-row"
                disabled={!canAdd(entry)}
                onClick={() => addQuality(entry)}
                title={entry.summary}
              >
                <span className="picker-list-row-text">
                  <span className="picker-list-row-name">{entry.name}</span>
                  <span className="picker-list-row-sub">{entry.summary}</span>
                </span>
                <span
                  className={
                    entry.category === "positive"
                      ? "picker-list-row-cost picker-list-row-cost--cost num"
                      : "picker-list-row-cost picker-list-row-cost--bonus num"
                  }
                >
                  {entry.category === "positive" ? "-" : "+"}
                  {entry.karma}
                  {entry.levels ? "/lvl" : ""}
                </span>
              </button>
            ))}
          </div>
        );
      })()}
    </div>
  );
}
