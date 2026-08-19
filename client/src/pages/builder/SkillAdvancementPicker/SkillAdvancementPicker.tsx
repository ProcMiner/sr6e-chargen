// Chargen Skill/Specialization Karma spend - core rulebook p.66, "Spend
// Customization Karma": Step Four's 50-point pool is explicitly for
// "skills, attributes, qualities, and additional funds... See Character
// Advancement (p. 68) for the price of buying these advances." This picker
// covers the "skills" half (Attributes/Qualities already have their own
// chargen-native pickers; see [[skill_karma_at_chargen]] for why Attributes
// wasn't added here too). Reuses the exact same Character Advancement
// table (skillAdvanceCost, same x5 formula) and deriveSpecializations.ts's
// rules that pages/play/Advancement.tsx already uses in career mode,
// writing to the SAME data.advancement/data.specializations/
// data.specializationLog fields - a chargen-time purchase just becomes
// part of the same itemized history, same "one log spans chargen and
// career mode" precedent as deriveInitiation.ts's InitiationEntry.
//
// Two restrictions here that career mode's Advancement.tsx does NOT have,
// both confirmed from the book rather than assumed:
// - Skill ranks cap at 6 (7 with Aptitude), not career mode's 9/10 -
//   "During character creation, skills can be purchased up to rank 6...
//   During gameplay, those skills can reach 9" (p.65). See
//   deriveAdvancement.ts's chargenSkillMax().
// - Expertise is flatly unavailable at chargen: "you cannot acquire an
//   expertise" (p.65, in the Priority Chart's own specialization rules,
//   read here as a general chargen restriction, not Priority-specific).
//   This component omits the Upgrade-to-Expertise action entirely rather
//   than gating it - the "second specialization" tier (which requires an
//   existing expertise) is therefore unreachable here too, by the same
//   omission. New specializations ARE allowed (one per skill, same
//   SPECIALIZATION_KARMA_COST as career mode) - nothing in the book
//   restricts Customization-Karma-funded specializations differently from
//   skill-point-funded ones, and Life Path has no specialization rule of
//   its own to contradict this (confirmed in [[specializations_expertise]]).
import { useState } from "react";
import type { AdvancementEntry, CharacterData, SpecializationEntry } from "../../../character";
import type { PriorityRulesResponse } from "../../../rules";
import { karmaRemaining } from "../../../deriveGear";
import { chargenSkillMax, skillAdvanceCost } from "../../../deriveAdvancement";
import {
  EXOTIC_WEAPONS_SKILL,
  SKILL_SPECIALIZATION_SUGGESTIONS,
  SPECIALIZATION_KARMA_COST,
  canAddSpecialization,
  exoticWeaponsNeedsSpecialization,
} from "../../../deriveSpecializations";
import { generateId } from "../../../id";

interface Props {
  priorityRules: PriorityRulesResponse;
  data: CharacterData;
  onChange: (data: CharacterData) => void;
  /** Karma already committed outside this picker (spells, complex forms, Initiation, custom cyberdecks, etc.), same convention as every other Customization Karma picker - so this picker's afford checks reflect the whole shared pool. */
  extraKarmaSpent?: number;
}

export function SkillAdvancementPicker({ priorityRules, data, onChange, extraKarmaSpent = 0 }: Props) {
  const [specSkill, setSpecSkill] = useState(priorityRules.skillList[0] ?? "");
  const [specFocus, setSpecFocus] = useState("");

  const available = karmaRemaining(data, extraKarmaSpent);
  const specializations = data.specializations ?? [];
  const skillLog = [...(data.advancement ?? [])].filter((e) => e.type === "skill").reverse();
  const specializationLog = [...(data.specializationLog ?? [])].reverse();

  function increaseSkill(name: string) {
    const current = data.skills[name] ?? 0;
    const max = chargenSkillMax(data, name);
    const next = current + 1;
    if (next > max) return;
    const cost = skillAdvanceCost(next);
    if (cost > available) return;
    onChange({
      ...data,
      skills: { ...data.skills, [name]: next },
      advancement: [
        ...(data.advancement ?? []),
        { id: generateId(), type: "skill", key: name, fromRating: current, toRating: next, karmaCost: cost, date: new Date().toISOString() },
      ],
    });
  }

  /** Only the most recent purchase for a given skill can be undone, so undoing never strands a later purchase built on top of it - same rule as career mode's Advancement.tsx. */
  function canUndoSkill(entry: AdvancementEntry): boolean {
    return (data.skills[entry.key] ?? 0) === entry.toRating;
  }

  function undoSkill(entry: AdvancementEntry) {
    if (!canUndoSkill(entry)) return;
    onChange({
      ...data,
      skills: { ...data.skills, [entry.key]: entry.fromRating },
      advancement: (data.advancement ?? []).filter((e) => e.id !== entry.id),
    });
  }

  function buySpecialization(skill: string, focus: string) {
    if (!focus.trim() || !canAddSpecialization(data, skill) || SPECIALIZATION_KARMA_COST > available) return;
    const specEntry = { id: generateId(), skill, focus: focus.trim(), tier: "specialization" as const };
    const logEntry: SpecializationEntry = {
      id: generateId(),
      skill,
      focus: focus.trim(),
      action: "new",
      karmaCost: SPECIALIZATION_KARMA_COST,
      date: new Date().toISOString(),
    };
    onChange({
      ...data,
      specializations: [...specializations, specEntry],
      specializationLog: [...(data.specializationLog ?? []), logEntry],
    });
    setSpecFocus("");
  }

  function canUndoSpecialization(entry: SpecializationEntry): boolean {
    return specializations.some((s) => s.skill === entry.skill && s.focus === entry.focus);
  }

  function undoSpecialization(entry: SpecializationEntry) {
    if (!canUndoSpecialization(entry)) return;
    onChange({
      ...data,
      specializations: specializations.filter((s) => !(s.skill === entry.skill && s.focus === entry.focus)),
      specializationLog: (data.specializationLog ?? []).filter((e) => e.id !== entry.id),
    });
  }

  return (
    <div className="skill-advancement-picker">
      <h2>Skills &amp; Specializations</h2>
      <p className="hint">
        Customization Karma can also buy skill ranks and new specializations, at the same prices as post-creation
        Character Advancement (core p.66, 68-69): {skillAdvanceCost(1)} Karma per new rating (new rating x 5), or{" "}
        {SPECIALIZATION_KARMA_COST} Karma for a specialization. Skills cap at 6 at chargen (7 for the Aptitude
        skill) - the higher 9/10 ceiling only opens up once play starts. Expertise can't be bought at chargen at
        all ("you cannot acquire an expertise," p.65) - that has to wait for career mode.
      </p>

      <div className="skill-editor">
        {priorityRules.skillList.map((skill) => {
          const current = data.skills[skill] ?? 0;
          const max = chargenSkillMax(data, skill);
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
                title={atMax ? `At chargen maximum (${max})` : `Raise to ${current + 1} for ${cost} Karma`}
              >
                {atMax ? "Max" : `+1 (${cost})`}
              </button>
              {skill === EXOTIC_WEAPONS_SKILL && exoticWeaponsNeedsSpecialization(data) && (
                <span className="hint danger-text">
                  Needs a specialization below to be usable (p. 95) - ranks alone can't be rolled with any weapon.
                </span>
              )}
            </label>
          );
        })}
      </div>

      {skillLog.length > 0 && (
        <ul className="module-slots">
          {skillLog.map((entry) => (
            <li key={entry.id}>
              <div className="module-instance">
                <div className="module-instance-header">
                  <strong>
                    {entry.key}: {entry.fromRating} to {entry.toRating} ({entry.karmaCost} Karma)
                  </strong>
                  <button className="danger" disabled={!canUndoSkill(entry)} onClick={() => undoSkill(entry)}>
                    Undo
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h3>Specializations</h3>
      <p className="hint">
        A specialization is +2 dice on tests in that narrow area. One per skill at chargen ({SPECIALIZATION_KARMA_COST}{" "}
        Karma).
      </p>
      {specializations.length > 0 && (
        <ul className="module-slots">
          {specializations.map((s) => (
            <li key={s.id}>
              <div className="module-instance">
                <strong>
                  {s.skill}: {s.focus}
                </strong>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="inline-field">
        <select value={specSkill} onChange={(e) => setSpecSkill(e.target.value)}>
          {priorityRules.skillList.map((skill) => (
            <option key={skill} value={skill}>
              {skill}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Focus (e.g. Light Pistols)"
          value={specFocus}
          onChange={(e) => setSpecFocus(e.target.value)}
        />
        <button
          onClick={() => buySpecialization(specSkill, specFocus)}
          disabled={!canAddSpecialization(data, specSkill) || !specFocus.trim() || SPECIALIZATION_KARMA_COST > available}
          title={!canAddSpecialization(data, specSkill) ? "This skill already has a specialization" : undefined}
        >
          Add specialization ({SPECIALIZATION_KARMA_COST})
        </button>
      </div>
      {(SKILL_SPECIALIZATION_SUGGESTIONS[specSkill] ?? []).length > 0 && (
        <div className="chip-row">
          {SKILL_SPECIALIZATION_SUGGESTIONS[specSkill]!.map((s) => (
            <button key={s} type="button" className="chip" onClick={() => setSpecFocus(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      {specializationLog.length > 0 && (
        <ul className="module-slots">
          {specializationLog.map((entry) => (
            <li key={entry.id}>
              <div className="module-instance">
                <div className="module-instance-header">
                  <strong>
                    {entry.skill}: {entry.focus} ({entry.karmaCost} Karma)
                  </strong>
                  <button
                    className="danger"
                    disabled={!canUndoSpecialization(entry)}
                    onClick={() => undoSpecialization(entry)}
                  >
                    Undo
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
