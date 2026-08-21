import type { CharacterData, PrioritySystemState } from "../../../../character";
import type { PriorityLetter, PriorityRulesResponse, QualityRulesResponse } from "../../../../rules";
import { effectivePriorityLetter, startingKarma } from "../../../../derivePriorityVariant";
import { combineQualityCatalog, qualityKarmaTotal } from "../../../../deriveQualities";

const LETTERS: PriorityLetter[] = ["A", "B", "C", "D", "E"];
const CATEGORIES = [
  ["metatype", "Metatype"],
  ["attributes", "Attributes"],
  ["skills", "Skills"],
  ["magic", "Magic or Resonance"],
  ["resources", "Resources"],
] as const;

interface Props {
  rules: PriorityRulesResponse;
  qualityRules: QualityRulesResponse;
  data: CharacterData;
  onChange: (data: CharacterData) => void;
}

export function PowerLevelStep({ qualityRules, data, onChange }: Props) {
  const state = (data.systemState as PrioritySystemState)?.priorities
    ? (data.systemState as PrioritySystemState)
    : { priorities: {} };

  function setPriorities(next: PrioritySystemState["priorities"]) {
    onChange({ ...data, systemState: { ...state, priorities: next } });
  }

  // "Different Levels of Play" (core rulebook p.63 sidebar). Street-level
  // reads every priority row's table values one row worse than the letter
  // actually assigned; Prime Runner doubles the customization Karma pool.
  // Toggling recomputes karma from scratch (starting pool + actual net
  // quality Karma), mirroring QualityPicker.tsx's own applySelection() -
  // an absolute recompute rather than preserving a delta off data.karma,
  // which broke if data.karma ever started out of sync with startingKarma()
  // (as it did before emptyCharacterData() was fixed to seed karma: 50).
  function setPowerLevel(next: PrioritySystemState["powerLevel"]) {
    const nextData = { ...data, systemState: { ...state, powerLevel: next } };
    const catalog = combineQualityCatalog(qualityRules);
    onChange({ ...nextData, karma: startingKarma(nextData) + qualityKarmaTotal(data.qualities, catalog) });
  }

  function usedLetters(exceptCategory?: string) {
    return new Set(
      Object.entries(state.priorities)
        .filter(([cat]) => cat !== exceptCategory)
        .map(([, letter]) => letter)
        .filter(Boolean)
    );
  }

  return (
    <div className="priority-builder">
      <h2>Power Level</h2>
      <p className="hint">
        Optional variants (core rulebook p.63). Street-level: assign priorities as normal, but every
        category's table values are read one row worse than the letter you picked (Priority B reads as
        C, and so on - can't go lower than E). Prime Runner: keep standard priorities, but double your
        customization Karma from 50 to 100.
      </p>
      <div className="chip-row">
        <button className={!state.powerLevel ? "chip selected" : "chip"} onClick={() => setPowerLevel(undefined)}>
          Standard
        </button>
        <button
          className={state.powerLevel === "street" ? "chip selected" : "chip"}
          onClick={() => setPowerLevel("street")}
        >
          Street-level
        </button>
        <button
          className={state.powerLevel === "prime" ? "chip selected" : "chip"}
          onClick={() => setPowerLevel("prime")}
        >
          Prime Runner
        </button>
      </div>

      <h2>Priority Assignment</h2>
      <table className="priority-assign-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Priority</th>
            {state.powerLevel === "street" && <th>Values read from</th>}
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
                {state.powerLevel === "street" && <td>{effectivePriorityLetter(current, state.powerLevel) ?? "-"}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
