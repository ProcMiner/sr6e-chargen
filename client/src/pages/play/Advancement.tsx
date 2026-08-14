// Post-chargen ("career mode") Karma spending: raising attributes/skills one
// rating at a time while a character is in play, plus the Karma-award input
// a GM/player uses to log Karma earned from a run. See deriveAdvancement.ts
// for the cost formulas and the itemized-log rationale.
import { useState } from "react";
import type { AdvancementEntry, CharacterData } from "../../character";
import type { PriorityRulesResponse } from "../../rules";
import { karmaRemaining } from "../../deriveGear";
import { spellKarmaCost } from "../../deriveSpells";
import { complexFormKarmaCost } from "../../deriveComplexForms";
import { metavariantKarmaCost } from "../../deriveMetavariant";
import {
  CORE_ATTRIBUTE_KEYS,
  advancementKarmaTotal,
  attributeAdvanceCost,
  attributeMax,
  skillAdvanceCost,
  skillMax,
  type CoreAttributeKey,
} from "../../deriveAdvancement";

interface Props {
  data: CharacterData;
  onChange: (next: CharacterData) => void;
  priorityRules: PriorityRulesResponse;
}

export function Advancement({ data, onChange, priorityRules }: Props) {
  const [karmaAward, setKarmaAward] = useState("");

  const spellKarma = spellKarmaCost(data, priorityRules);
  const complexFormKarma = complexFormKarmaCost(data, priorityRules);
  const metavariantKarma = metavariantKarmaCost(data, priorityRules.metavariants);
  const advancementKarma = advancementKarmaTotal(data.advancement);
  const available = karmaRemaining(data, spellKarma + complexFormKarma + metavariantKarma + advancementKarma);

  const log = [...(data.advancement ?? [])].reverse();

  function awardKarma() {
    const amount = Number(karmaAward);
    if (!Number.isFinite(amount) || amount <= 0) return;
    onChange({ ...data, karma: data.karma + amount });
    setKarmaAward("");
  }

  function increaseAttribute(key: CoreAttributeKey) {
    const current = data.attributes[key] ?? 1;
    const max = attributeMax(data, key, priorityRules.metatypeAttributes, priorityRules.metavariants);
    const next = current + 1;
    if (next > max) return;
    const cost = attributeAdvanceCost(next);
    if (cost > available) return;
    onChange({
      ...data,
      attributes: { ...data.attributes, [key]: next },
      advancement: [
        ...(data.advancement ?? []),
        { id: crypto.randomUUID(), type: "attribute", key, fromRating: current, toRating: next, karmaCost: cost, date: new Date().toISOString() },
      ],
    });
  }

  function increaseSkill(name: string) {
    const current = data.skills[name] ?? 0;
    const max = skillMax(data, name);
    const next = current + 1;
    if (next > max) return;
    const cost = skillAdvanceCost(next);
    if (cost > available) return;
    onChange({
      ...data,
      skills: { ...data.skills, [name]: next },
      advancement: [
        ...(data.advancement ?? []),
        { id: crypto.randomUUID(), type: "skill", key: name, fromRating: current, toRating: next, karmaCost: cost, date: new Date().toISOString() },
      ],
    });
  }

  /** Only the most recent purchase for a given key can be undone, so undoing never strands a later purchase built on top of it. */
  function canUndo(entry: AdvancementEntry): boolean {
    const currentRating = entry.type === "attribute" ? data.attributes[entry.key as CoreAttributeKey] : data.skills[entry.key];
    return (currentRating ?? 0) === entry.toRating;
  }

  function undoEntry(entry: AdvancementEntry) {
    if (!canUndo(entry)) return;
    const nextData: CharacterData = {
      ...data,
      advancement: (data.advancement ?? []).filter((e) => e.id !== entry.id),
    };
    if (entry.type === "attribute") {
      nextData.attributes = { ...data.attributes, [entry.key]: entry.fromRating };
    } else {
      nextData.skills = { ...data.skills, [entry.key]: entry.fromRating };
    }
    onChange(nextData);
  }

  return (
    <div className="advancement-panel">
      <h2>Karma &amp; Advancement</h2>
      <p className="hint">
        {data.karma.toLocaleString()} Karma earned - {(data.karma - available).toLocaleString()} committed ={" "}
        {available.toLocaleString()} available to spend
      </p>

      <form
        className="inline-field"
        onSubmit={(e) => {
          e.preventDefault();
          awardKarma();
        }}
      >
        <input
          type="text"
          inputMode="numeric"
          placeholder="Karma earned from a run"
          value={karmaAward}
          onChange={(e) => setKarmaAward(e.target.value.replace(/[^0-9]/g, ""))}
        />
        <button type="submit" disabled={!karmaAward}>
          Award Karma
        </button>
      </form>

      <h3>Attributes</h3>
      <div className="attribute-editor">
        {CORE_ATTRIBUTE_KEYS.map((key) => {
          const current = data.attributes[key] ?? 1;
          const max = attributeMax(data, key, priorityRules.metatypeAttributes, priorityRules.metavariants);
          const atMax = current >= max;
          const cost = attributeAdvanceCost(current + 1);
          const afford = cost <= available;
          return (
            <label key={key}>
              {key} ({current}/{max})
              <button
                type="button"
                className="chip"
                disabled={atMax || !afford}
                onClick={() => increaseAttribute(key)}
                title={atMax ? `At natural maximum (${max})` : `Raise to ${current + 1} for ${cost} Karma`}
              >
                {atMax ? "Max" : `+1 (${cost})`}
              </button>
            </label>
          );
        })}
      </div>

      <h3>Skills</h3>
      <div className="skill-editor">
        {priorityRules.skillList.map((skill) => {
          const current = data.skills[skill] ?? 0;
          const max = skillMax(data, skill);
          const atMax = current >= max;
          const cost = skillAdvanceCost(current + 1);
          const afford = cost <= available;
          return (
            <label key={skill}>
              {skill} ({current})
              <button
                type="button"
                className="chip"
                disabled={atMax || !afford}
                onClick={() => increaseSkill(skill)}
                title={atMax ? `At natural maximum (${max})` : `Raise to ${current + 1} for ${cost} Karma`}
              >
                {atMax ? "Max" : `+1 (${cost})`}
              </button>
            </label>
          );
        })}
      </div>

      {log.length > 0 && (
        <>
          <h3>Advancement Log</h3>
          <ul className="module-slots">
            {log.map((entry) => (
              <li key={entry.id}>
                <div className="module-instance">
                  <div className="module-instance-header">
                    <strong>
                      {entry.key} {entry.fromRating} &rarr; {entry.toRating} ({entry.karmaCost} Karma)
                    </strong>
                    <button className="danger" disabled={!canUndo(entry)} onClick={() => undoEntry(entry)}>
                      Undo
                    </button>
                  </div>
                  <p className="hint">{new Date(entry.date).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
