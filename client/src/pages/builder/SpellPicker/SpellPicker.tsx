import { useState } from "react";
import type { CharacterData } from "../../../character";
import type { PriorityRulesResponse, SpellCatalogEntry, SpellRulesResponse } from "../../../rules";
import { karmaRemaining } from "../../../deriveGear";
import { KARMA_PER_SPELL, freeSpellAllotment, spellKarmaCost } from "../../../deriveSpells";
import { metavariantKarmaCost } from "../../../deriveMetavariant";

const CATEGORIES: SpellCatalogEntry["category"][] = ["Combat", "Detection", "Health", "Illusion", "Manipulation"];

interface Props {
  rules: SpellRulesResponse;
  priorityRules: PriorityRulesResponse;
  data: CharacterData;
  onChange: (data: CharacterData) => void;
}

function statLine(entry: SpellCatalogEntry): string {
  const parts = [entry.range, entry.type, entry.duration, `DV ${entry.drainValue}`];
  if (entry.damage) parts.push(entry.damage);
  return parts.join(" • ");
}

export function SpellPicker({ rules, priorityRules, data, onChange }: Props) {
  const known = data.spells;
  const free = freeSpellAllotment(data, priorityRules);
  const currentSpellKarma = spellKarmaCost(data, priorityRules);
  const karmaBudget = karmaRemaining(
    data,
    currentSpellKarma + metavariantKarmaCost(data, priorityRules.metavariants)
  );

  const [search, setSearch] = useState("");
  const searchTerm = search.trim().toLowerCase();

  function matchesSearch(entry: SpellCatalogEntry) {
    if (!searchTerm) return true;
    return entry.name.toLowerCase().includes(searchTerm) || entry.summary.toLowerCase().includes(searchTerm);
  }

  function findEntry(id: string): SpellCatalogEntry | undefined {
    return rules.spells.find((s) => s.id === id);
  }

  function marginalKarmaCost(): number {
    return known.length < free ? 0 : KARMA_PER_SPELL;
  }

  function canAdd(entry: SpellCatalogEntry) {
    if (known.includes(entry.id)) return false;
    return marginalKarmaCost() <= karmaBudget;
  }

  function addSpell(entry: SpellCatalogEntry) {
    if (!canAdd(entry)) return;
    onChange({ ...data, spells: [...known, entry.id] });
  }

  function removeSpell(id: string) {
    onChange({ ...data, spells: known.filter((s) => s !== id) });
  }

  const byCategory = new Map<string, SpellCatalogEntry[]>();
  for (const entry of rules.spells) {
    if (!matchesSearch(entry)) continue;
    const key = entry.category;
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)!.push(entry);
  }

  return (
    <div className="spell-picker">
      <h2>Spells</h2>
      <p className="hint">
        {Math.min(known.length, free)} / {free} free spells used
        {known.length > free ? ` - ${known.length - free} extra x ${KARMA_PER_SPELL} Karma` : ""} -{" "}
        {data.karma.toLocaleString()} Karma pool - {currentSpellKarma.toLocaleString()} spent on spells ={" "}
        {karmaBudget.toLocaleString()} remaining
      </p>
      {free === 0 && (
        <p className="hint">
          No free spell allotment on record (only Priority-built Full, Aspected, or Mystic Adept magicians get one -
          see core rulebook p. 65-66). Every spell below costs {KARMA_PER_SPELL} Karma.
        </p>
      )}

      {known.length > 0 && (
        <ul className="module-slots">
          {known.map((id) => {
            const entry = findEntry(id);
            return (
              <li key={id}>
                <div className="module-instance">
                  <div className="module-instance-header">
                    <strong>{entry?.name ?? id}</strong>
                    <button className="danger" onClick={() => removeSpell(id)}>
                      Remove
                    </button>
                  </div>
                  {entry && (
                    <p className="hint">
                      {statLine(entry)} - {entry.summary}
                    </p>
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
        placeholder="Search spells by name or description..."
        aria-label="Search spells"
      />

      {CATEGORIES.map((category) => {
        const entries = byCategory.get(category);
        if (!entries || entries.length === 0) return null;
        return (
          <details key={category} className="quality-section" open={!!searchTerm}>
            <summary>{category}</summary>
            <div className="module-picker">
              {entries.map((entry) => (
                <button
                  key={entry.id}
                  className="chip"
                  disabled={!canAdd(entry)}
                  onClick={() => addSpell(entry)}
                  title={`${statLine(entry)} - ${entry.summary} (${entry.book})`}
                >
                  {entry.name}
                  {known.includes(entry.id) ? " (known)" : ""}
                </button>
              ))}
            </div>
          </details>
        );
      })}
      {searchTerm && byCategory.size === 0 && <p className="hint">No spells match "{search}".</p>}
    </div>
  );
}
