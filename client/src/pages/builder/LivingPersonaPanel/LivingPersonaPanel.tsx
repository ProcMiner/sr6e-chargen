import type { CharacterData, LivingPersonaAllocation } from "../../../character";
import {
  MATRIX_ATTRIBUTE_KEYS,
  MATRIX_ATTRIBUTE_LABELS,
  livingPersonaAllocation,
  livingPersonaAttribute,
  livingPersonaBonusPool,
  livingPersonaBonusSpent,
  livingPersonaInitiative,
  livingPersonaMaxBonus,
} from "../../../deriveLivingPersona";
import { NumberStepper } from "../../../components/NumberStepper";

interface Props {
  data: CharacterData;
  onChange: (data: CharacterData) => void;
}

export function LivingPersonaPanel({ data, onChange }: Props) {
  if (data.attributes.resonance === undefined) return null;

  const pool = livingPersonaBonusPool(data);
  const spent = livingPersonaBonusSpent(data);
  const remaining = pool - spent;
  const allocation = livingPersonaAllocation(data);

  function updateAllocation(key: keyof LivingPersonaAllocation, value: number) {
    onChange({
      ...data,
      livingPersonaAllocation: { ...allocation, [key]: value },
    });
  }

  return (
    <div className="living-persona-panel">
      <h2>Living Persona</h2>
      <p className="hint">
        Matrix attributes derived from your Mental attributes, plus {pool.toLocaleString()} bonus points from
        Resonance - {spent.toLocaleString()} allocated = {remaining.toLocaleString()} remaining. Each attribute
        caps at +50% of its base rating (rounded up), max +4.
      </p>

      <dl className="attribute-grid">
        {MATRIX_ATTRIBUTE_KEYS.map((key) => {
          const maxBonus = livingPersonaMaxBonus(data, key);
          const stepperMax = Math.max(allocation[key], Math.min(maxBonus, allocation[key] + remaining));
          return (
            <div key={key}>
              <dt>
                {MATRIX_ATTRIBUTE_LABELS[key]} ({livingPersonaAttribute(data, key)})
              </dt>
              <dd>
                <NumberStepper
                  value={allocation[key]}
                  min={0}
                  max={stepperMax}
                  onChange={(v) => updateAllocation(key, v)}
                  label={`${MATRIX_ATTRIBUTE_LABELS[key]} bonus`}
                />
              </dd>
            </div>
          );
        })}
      </dl>

      <p className="hint">
        Initiative {livingPersonaInitiative(data)} + 1d6 (plus Matrix mode adjustments). Uses your Stun Condition
        Monitor in place of a Matrix Condition Monitor.
      </p>
    </div>
  );
}
