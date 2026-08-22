import { useState } from "react";
import type { CharacterData, PrioritySystemState, SkillSpecialization } from "../../../../character";
import type { PriorityRulesResponse } from "../../../../rules";
import { NumberStepper } from "../../../../components/NumberStepper";
import {
  EXOTIC_WEAPONS_SKILL,
  SKILL_SPECIALIZATION_SUGGESTIONS,
  exoticWeaponsNeedsSpecialization,
  newSpecializationBlockReason,
} from "../../../../deriveSpecializations";
import { effectivePriorityLetter } from "../../../../derivePriorityVariant";
import { skillPointsRemaining as computeSkillPointsRemaining } from "../../../../deriveAdjustmentPoints";
import { chargenSkillEffectiveMax } from "../../../../deriveAdvancement";
import { generateId } from "../../../../id";

interface Props {
  rules: PriorityRulesResponse;
  data: CharacterData;
  onChange: (data: CharacterData) => void;
}

export function SkillsStep({ rules, data, onChange }: Props) {
  const [specSkill, setSpecSkill] = useState(rules.skillList[0] ?? "");
  const [specFocus, setSpecFocus] = useState("");

  const state = (data.systemState as PrioritySystemState)?.priorities
    ? (data.systemState as PrioritySystemState)
    : { priorities: {} };

  const skillRow = rules.priorityTable.find(
    (r) => r.priority === effectivePriorityLetter(state.priorities.skills, state.powerLevel)
  );

  // A specialization costs the same as one rank of a skill (p. 65-66), so
  // it draws from the same skill-point budget as raising a skill's rank.
  const specializations = data.specializations ?? [];
  const skillPointsRemaining = computeSkillPointsRemaining(data, rules).remaining;

  // Priority chargen allows one specialization per skill (core p. 65-66:
  // "You cannot acquire more than one specialization in a skill at
  // character creation") - no expertise, ever, at chargen in either build
  // system.
  function canAddSpecializationAtChargen(skill: string): boolean {
    return (data.skills[skill] ?? 0) >= 1 && !specializations.some((s) => s.skill === skill);
  }

  function addSpecialization() {
    const focus = specFocus.trim();
    if (!focus || !canAddSpecializationAtChargen(specSkill) || skillPointsRemaining < 1) return;
    const entry: SkillSpecialization = { id: generateId(), skill: specSkill, focus, tier: "specialization" };
    onChange({ ...data, specializations: [...specializations, entry] });
    setSpecFocus("");
  }

  function removeSpecialization(id: string) {
    onChange({ ...data, specializations: specializations.filter((s) => s.id !== id) });
  }

  if (!skillRow) {
    return (
      <div className="priority-builder">
        <p className="hint">Assign a Priority letter to Skills first.</p>
      </div>
    );
  }

  return (
    <div className="priority-builder">
      <section>
        <h3>
          Skills ({skillPointsRemaining} / {skillRow.skillPoints} points remaining)
        </h3>
        <p className="hint">
          Skills cap at 6 at chargen (7 for the Aptitude skill), and only one skill total can sit at that maximum
          - "Only one skill can be put at that maximum level" (core p. 65).
        </p>
        <div className="skill-editor">
          {rules.skillList.map((skill) => (
            <label key={skill}>
              {skill}
              <NumberStepper
                label={skill}
                min={0}
                max={chargenSkillEffectiveMax(data, skill, data.skills)}
                value={data.skills[skill] ?? 0}
                onChange={(next) => onChange({ ...data, skills: { ...data.skills, [skill]: next } })}
              />
              {skill === EXOTIC_WEAPONS_SKILL && exoticWeaponsNeedsSpecialization(data) && (
                <span className="hint danger-text">
                  Needs a specialization below to be usable (p. 95) - ranks alone can't be rolled with any weapon.
                </span>
              )}
            </label>
          ))}
        </div>

        <h4>Specializations</h4>
        <p className="hint">
          One skill point each, one per skill at character creation ("+2 dice on tests in that area" - core p.
          92). Expertise (upgrading to +3) can only be bought after creation, during play.
        </p>
        {specializations.length > 0 && (
          <ul className="module-slots">
            {specializations.map((s) => (
              <li key={s.id}>
                <div className="module-instance">
                  <div className="module-instance-header">
                    <strong>
                      {s.skill}: {s.focus}
                    </strong>
                    <button className="danger" onClick={() => removeSpecialization(s.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="inline-field">
          <select value={specSkill} onChange={(e) => setSpecSkill(e.target.value)}>
            {rules.skillList.map((skill) => (
              <option
                key={skill}
                value={skill}
                disabled={!canAddSpecializationAtChargen(skill)}
                title={newSpecializationBlockReason(data, skill)}
              >
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
            onClick={addSpecialization}
            disabled={!specFocus.trim() || !canAddSpecializationAtChargen(specSkill) || skillPointsRemaining < 1}
            title={
              newSpecializationBlockReason(data, specSkill) ??
              (skillPointsRemaining < 1
                ? "No skill points remaining."
                : !specFocus.trim()
                  ? "Enter a focus name first."
                  : undefined)
            }
          >
            Add
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
      </section>
    </div>
  );
}
