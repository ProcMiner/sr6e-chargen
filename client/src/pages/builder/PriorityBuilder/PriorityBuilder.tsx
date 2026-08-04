import type { CharacterData, PrioritySystemState } from "../../../character";
import type { PriorityLetter, PriorityRulesResponse } from "../../../rules";

const LETTERS: PriorityLetter[] = ["A", "B", "C", "D", "E"];
const CATEGORIES = [
  ["metatype", "Metatype"],
  ["attributes", "Attributes"],
  ["skills", "Skills"],
  ["magic", "Magic or Resonance"],
  ["resources", "Resources"],
] as const;

const ATTRIBUTE_KEYS = [
  "body",
  "agility",
  "reaction",
  "strength",
  "willpower",
  "logic",
  "intuition",
  "charisma",
  "edge",
] as const;

interface Props {
  rules: PriorityRulesResponse;
  data: CharacterData;
  onChange: (data: CharacterData) => void;
}

export function PriorityBuilder({ rules, data, onChange }: Props) {
  const state = (data.systemState as PrioritySystemState)?.priorities
    ? (data.systemState as PrioritySystemState)
    : { priorities: {} };

  function setPriorities(next: PrioritySystemState["priorities"]) {
    onChange({ ...data, systemState: { ...state, priorities: next } });
  }

  function usedLetters(exceptCategory?: string) {
    return new Set(
      Object.entries(state.priorities)
        .filter(([cat]) => cat !== exceptCategory)
        .map(([, letter]) => letter)
        .filter(Boolean)
    );
  }

  const metatypeRow = rules.priorityTable.find((r) => r.priority === state.priorities.metatype);
  const attributeRow = rules.priorityTable.find((r) => r.priority === state.priorities.attributes);
  const skillRow = rules.priorityTable.find((r) => r.priority === state.priorities.skills);
  const magicRow = rules.priorityTable.find((r) => r.priority === state.priorities.magic);
  const resourcesRow = rules.priorityTable.find((r) => r.priority === state.priorities.resources);

  const metatypeInfo = data.metatype
    ? rules.metatypeAttributes.find((m) => m.metatype === data.metatype)
    : undefined;

  const attributePointsSpent = ATTRIBUTE_KEYS.reduce((sum, key) => sum + (data.attributes[key] - 1), 0);
  const attributePointsTotal = attributeRow?.attributePoints ?? 0;
  const attributePointsRemaining = attributePointsTotal - attributePointsSpent;

  const skillPointsSpent = Object.values(data.skills).reduce((sum, v) => sum + v, 0);
  const skillPointsRemaining = (skillRow?.skillPoints ?? 0) - skillPointsSpent;

  return (
    <div className="priority-builder">
      <h2>Priority Assignment</h2>
      <table className="priority-assign-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          {CATEGORIES.map(([key, label]) => {
            const used = usedLetters(key);
            const current = state.priorities[key];
            return (
              <tr key={key}>
                <td>{label}</td>
                <td>
                  <select
                    value={current ?? ""}
                    onChange={(e) =>
                      setPriorities({ ...state.priorities, [key]: e.target.value || undefined })
                    }
                  >
                    <option value="">-</option>
                    {LETTERS.map((letter) => (
                      <option key={letter} value={letter} disabled={used.has(letter) && letter !== current}>
                        {letter}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {metatypeRow && (
        <section>
          <h3>Metatype</h3>
          <div className="chip-row">
            {metatypeRow.metatype.map((m) => (
              <button
                key={m.metatype}
                className={data.metatype === m.metatype ? "chip selected" : "chip"}
                onClick={() => onChange({ ...data, metatype: m.metatype })}
              >
                {m.metatype} ({m.adjustmentPoints} adj. pts)
              </button>
            ))}
          </div>
        </section>
      )}

      {attributeRow && metatypeInfo && (
        <section>
          <h3>
            Attributes ({attributePointsRemaining} / {attributePointsTotal} points remaining)
          </h3>
          <div className="attribute-editor">
            {ATTRIBUTE_KEYS.map((key) => {
              const range = key === "edge" ? metatypeInfo.edge : metatypeInfo[key];
              const value = data.attributes[key];
              return (
                <label key={key}>
                  {key}
                  <input
                    type="number"
                    min={range.min}
                    max={range.max}
                    value={value}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      if (Number.isNaN(next)) return;
                      onChange({
                        ...data,
                        attributes: { ...data.attributes, [key]: next },
                      });
                    }}
                  />
                  <span className="range-hint">
                    {range.min}-{range.max}
                  </span>
                </label>
              );
            })}
          </div>
        </section>
      )}

      {skillRow && (
        <section>
          <h3>
            Skills ({skillPointsRemaining} / {skillRow.skillPoints} points remaining)
          </h3>
          <div className="skill-editor">
            {rules.skillList.map((skill) => (
              <label key={skill}>
                {skill}
                <input
                  type="number"
                  min={0}
                  max={6}
                  value={data.skills[skill] ?? 0}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    if (Number.isNaN(next)) return;
                    onChange({ ...data, skills: { ...data.skills, [skill]: next } });
                  }}
                />
              </label>
            ))}
          </div>
        </section>
      )}

      {magicRow && (
        <section>
          <h3>Magic or Resonance</h3>
          <div className="chip-row">
            {magicRow.magic.map((m) => (
              <button
                key={m.option}
                className={state.magicOption === m.option ? "chip selected" : "chip"}
                onClick={() => {
                  const attrs = { ...data.attributes };
                  delete attrs.magic;
                  delete attrs.resonance;
                  if (m.option === "Technomancer") attrs.resonance = m.rating;
                  else if (m.option !== "Mundane") attrs.magic = m.rating;
                  onChange({
                    ...data,
                    attributes: attrs,
                    systemState: { ...state, magicOption: m.option },
                  });
                }}
              >
                {m.option}
                {m.rating ? ` (${m.rating})` : ""}
              </button>
            ))}
          </div>
        </section>
      )}

      {resourcesRow && (
        <section>
          <h3>Resources</h3>
          <p>{resourcesRow.resources.toLocaleString()}¥ starting nuyen.</p>
          {data.nuyen !== resourcesRow.resources && (
            <button onClick={() => onChange({ ...data, nuyen: resourcesRow.resources })}>
              Apply {resourcesRow.resources.toLocaleString()}¥
            </button>
          )}
        </section>
      )}
    </div>
  );
}
