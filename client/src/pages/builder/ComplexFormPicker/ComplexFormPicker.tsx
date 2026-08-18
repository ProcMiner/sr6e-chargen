import { useState } from "react";
import type { CharacterData, ComplexFormLine } from "../../../character";
import type { ComplexFormCatalogEntry, ComplexFormRulesResponse, PriorityRulesResponse } from "../../../rules";
import { karmaRemaining } from "../../../deriveGear";
import { KARMA_PER_COMPLEX_FORM, complexFormKarmaCost, freeComplexFormAllotment } from "../../../deriveComplexForms";
import { metavariantKarmaCost } from "../../../deriveMetavariant";

interface Props {
  rules: ComplexFormRulesResponse;
  priorityRules: PriorityRulesResponse;
  data: CharacterData;
  onChange: (data: CharacterData) => void;
}

function statLine(entry: ComplexFormCatalogEntry): string {
  return `FV ${entry.fadeValue} • ${entry.duration}`;
}

export function ComplexFormPicker({ rules, priorityRules, data, onChange }: Props) {
  const known = data.complexForms;
  const free = freeComplexFormAllotment(data, priorityRules);
  const currentComplexFormKarma = complexFormKarmaCost(data, priorityRules);
  const karmaBudget = karmaRemaining(
    data,
    currentComplexFormKarma + metavariantKarmaCost(data, priorityRules.metavariants)
  );

  const [search, setSearch] = useState("");
  const searchTerm = search.trim().toLowerCase();

  function matchesSearch(entry: ComplexFormCatalogEntry) {
    if (!searchTerm) return true;
    return entry.name.toLowerCase().includes(searchTerm) || entry.summary.toLowerCase().includes(searchTerm);
  }

  function findEntry(id: string): ComplexFormCatalogEntry | undefined {
    return rules.complexForms.find((f) => f.id === id);
  }

  function marginalKarmaCost(): number {
    return known.length < free ? 0 : KARMA_PER_COMPLEX_FORM;
  }

  function canAdd() {
    return marginalKarmaCost() <= karmaBudget;
  }

  function applyForms(next: ComplexFormLine[]) {
    onChange({ ...data, complexForms: next });
  }

  function addForm(entry: ComplexFormCatalogEntry) {
    if (!canAdd()) return;
    applyForms([...known, { formId: entry.id }]);
  }

  function removeAt(index: number) {
    const next = [...known];
    next.splice(index, 1);
    applyForms(next);
  }

  function updateNotes(index: number, notes: string) {
    const next = [...known];
    next[index] = { ...known[index], notes: notes || undefined };
    applyForms(next);
  }

  const byBook = new Map<string, ComplexFormCatalogEntry[]>();
  for (const entry of rules.complexForms) {
    if (!matchesSearch(entry)) continue;
    if (!byBook.has(entry.book)) byBook.set(entry.book, []);
    byBook.get(entry.book)!.push(entry);
  }

  return (
    <div className="complex-form-picker">
      <h2>Complex Forms</h2>
      <p className="hint">
        {Math.min(known.length, free)} / {free} free complex forms used
        {known.length > free ? ` - ${known.length - free} extra x ${KARMA_PER_COMPLEX_FORM} Karma` : ""} -{" "}
        {data.karma.toLocaleString()} Karma pool - {currentComplexFormKarma.toLocaleString()} spent on complex forms
        = {karmaBudget.toLocaleString()} remaining
      </p>
      {free === 0 && (
        <p className="hint">
          No free complex form allotment on record (only Technomancers get one - core rulebook p. 68, Sixth World
          Companion p. 31). Every complex form below costs {KARMA_PER_COMPLEX_FORM} Karma.
        </p>
      )}

      {known.length > 0 && (
        <ul className="module-slots">
          {known.map((line, i) => {
            const entry = findEntry(line.formId);
            return (
              <li key={i}>
                <div className="module-instance">
                  <div className="module-instance-header">
                    <strong>{entry?.name ?? line.formId}</strong>
                    <button className="danger" onClick={() => removeAt(i)}>
                      Remove
                    </button>
                  </div>
                  {entry && (
                    <p className="hint">
                      {statLine(entry)} - {entry.summary}
                    </p>
                  )}
                  <label className="inline-field">
                    Notes (sub-choice, if any)
                    <input
                      type="text"
                      value={line.notes ?? ""}
                      onChange={(e) => updateNotes(i, e.target.value)}
                      placeholder="e.g. targeted attribute or program"
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
        placeholder="Search complex forms by name or description..."
        aria-label="Search complex forms"
      />

      {[...byBook.entries()].map(([book, entries]) => (
        <details key={book} className="quality-section" open={!!searchTerm}>
          <summary>{book}</summary>
          <div className="module-picker">
            {entries.map((entry) => (
              <button
                key={entry.id}
                className="chip"
                disabled={!canAdd()}
                onClick={() => addForm(entry)}
                title={`${statLine(entry)} - ${entry.summary}`}
              >
                {entry.name}
              </button>
            ))}
          </div>
        </details>
      ))}
      {searchTerm && byBook.size === 0 && <p className="hint">No complex forms match "{search}".</p>}
    </div>
  );
}
