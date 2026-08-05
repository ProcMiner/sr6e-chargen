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

// Edge is deliberately excluded here: per the core rulebook (p. 63), Edge
// is funded entirely by Metatype Adjustment Points, not the Attributes
// priority's point pool.
const CORE_ATTRIBUTE_KEYS = [
  "body",
  "agility",
  "reaction",
  "strength",
  "willpower",
  "logic",
  "intuition",
  "charisma",
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

  // Normal attribute points can only raise a core attribute up to 6, even
  // if the metatype's max is higher - anything above 6 ("special racial
  // attributes" per p. 63) draws from Adjustment Points instead.
  function normalCap(key: (typeof CORE_ATTRIBUTE_KEYS)[number]) {
    return metatypeInfo ? Math.min(6, metatypeInfo[key].max) : 6;
  }

  const attributePointsSpent = CORE_ATTRIBUTE_KEYS.reduce(
    (sum, key) => sum + (Math.min(data.attributes[key], normalCap(key)) - 1),
    0
  );
  const attributePointsTotal = attributeRow?.attributePoints ?? 0;
  const attributePointsRemaining = attributePointsTotal - attributePointsSpent;

  const skillPointsSpent = Object.values(data.skills).reduce((sum, v) => sum + v, 0);
  const skillPointsRemaining = (skillRow?.skillPoints ?? 0) - skillPointsSpent;

  // Adjustment Points (from the Metatype priority) fund three things:
  // Edge, pushing a "special racial attribute" above 6, and boosting
  // Magic/Resonance above its base rating - up to a hard cap of 6 (p. 65).
  const adjustmentPointsTotal = metatypeRow?.metatype.find((m) => m.metatype === data.metatype)?.adjustmentPoints ?? 0;

  const edgeSpent = (data.attributes.edge ?? 1) - 1;

  const racialOverflowSpent = metatypeInfo
    ? CORE_ATTRIBUTE_KEYS.reduce((sum, key) => sum + Math.max(0, data.attributes[key] - 6), 0)
    : 0;

  const selectedMagicOption = state.magicOption
    ? magicRow?.magic.find((m) => m.option === state.magicOption)
    : undefined;
  const magicBaseRating = selectedMagicOption?.rating ?? 0;
  const magicIsResonance = selectedMagicOption?.option === "Technomancer";
  const currentMagicOrResonance = magicIsResonance
    ? (data.attributes.resonance ?? 0)
    : (data.attributes.magic ?? 0);
  const magicBoostSpent =
    selectedMagicOption && selectedMagicOption.option !== "Mundane"
      ? Math.max(0, currentMagicOrResonance - magicBaseRating)
      : 0;

  const adjustmentPointsSpent = edgeSpent + racialOverflowSpent + magicBoostSpent;
  const adjustmentPointsRemaining = adjustmentPointsTotal - adjustmentPointsSpent;

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
          <p className="hint">
            Values above 6 are "special racial attributes" and are paid for from Adjustment Points
            (below), not from these points.
          </p>
          <div className="attribute-editor">
            {CORE_ATTRIBUTE_KEYS.map((key) => {
              const range = metatypeInfo[key];
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
                      const clamped = Math.min(range.max, Math.max(range.min, next));
                      onChange({
                        ...data,
                        attributes: { ...data.attributes, [key]: clamped },
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
                    const clamped = Math.min(6, Math.max(0, next));
                    onChange({ ...data, skills: { ...data.skills, [skill]: clamped } });
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

      {metatypeRow && metatypeInfo && (
        <section>
          <h3>
            Adjustment Points ({adjustmentPointsRemaining} / {adjustmentPointsTotal} points remaining)
          </h3>
          <p className="hint">
            Spent on Edge, on pushing a special racial attribute (above) past 6, and on boosting
            Magic/Resonance above its base rating (up to 6).
          </p>
          <div className="attribute-editor">
            <label>
              edge
              <input
                type="number"
                min={metatypeInfo.edge.min}
                max={metatypeInfo.edge.max}
                value={data.attributes.edge}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  if (Number.isNaN(next)) return;
                  const clamped = Math.min(metatypeInfo.edge.max, Math.max(metatypeInfo.edge.min, next));
                  onChange({ ...data, attributes: { ...data.attributes, edge: clamped } });
                }}
              />
              <span className="range-hint">
                {metatypeInfo.edge.min}-{metatypeInfo.edge.max}
              </span>
            </label>
            {selectedMagicOption && selectedMagicOption.option !== "Mundane" && (
              <label>
                {magicIsResonance ? "resonance" : "magic"}
                <input
                  type="number"
                  min={magicBaseRating}
                  max={6}
                  value={currentMagicOrResonance}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    if (Number.isNaN(next)) return;
                    const clamped = Math.min(6, Math.max(magicBaseRating, next));
                    onChange({
                      ...data,
                      attributes: {
                        ...data.attributes,
                        [magicIsResonance ? "resonance" : "magic"]: clamped,
                      },
                    });
                  }}
                />
                <span className="range-hint">{magicBaseRating}-6</span>
              </label>
            )}
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
