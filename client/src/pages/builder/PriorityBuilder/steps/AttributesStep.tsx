import type { CharacterData, PrioritySystemState } from "../../../../character";
import type { PriorityRulesResponse } from "../../../../rules";
import { NumberStepper } from "../../../../components/NumberStepper";
import { effectiveMetatypeInfo } from "../../../../deriveMetavariant";
import { effectivePriorityLetter } from "../../../../derivePriorityVariant";
import { CORE_ATTRIBUTE_KEYS, deriveAdjustmentPoints, isSpecialAttribute, normalCap } from "../../../../deriveAdjustmentPoints";

interface Props {
  rules: PriorityRulesResponse;
  data: CharacterData;
  onChange: (data: CharacterData) => void;
}

export function AttributesStep({ rules, data, onChange }: Props) {
  const state = (data.systemState as PrioritySystemState)?.priorities
    ? (data.systemState as PrioritySystemState)
    : { priorities: {} };

  const attributeRow = rules.priorityTable.find(
    (r) => r.priority === effectivePriorityLetter(state.priorities.attributes, state.powerLevel)
  );
  const metatypeInfo = effectiveMetatypeInfo(data, rules.metatypeAttributes, rules.metavariants);

  const adjustmentFundedAttributes = state.adjustmentFundedAttributes ?? [];
  function isAdjustmentFunded(key: (typeof CORE_ATTRIBUTE_KEYS)[number]) {
    return adjustmentFundedAttributes.includes(key);
  }
  function toggleAdjustmentFunding(key: (typeof CORE_ATTRIBUTE_KEYS)[number]) {
    const next = isAdjustmentFunded(key)
      ? adjustmentFundedAttributes.filter((k) => k !== key)
      : [...adjustmentFundedAttributes, key];
    onChange({ ...data, systemState: { ...state, adjustmentFundedAttributes: next } });
  }

  const attributePointsSpent = CORE_ATTRIBUTE_KEYS.reduce((sum, key) => {
    if (isSpecialAttribute(metatypeInfo, key) && isAdjustmentFunded(key)) return sum;
    return sum + (Math.min(data.attributes[key], normalCap(metatypeInfo, key)) - 1);
  }, 0);
  const attributePointsTotal = attributeRow?.attributePoints ?? 0;
  const attributePointsRemaining = attributePointsTotal - attributePointsSpent;
  const adjustmentPoints = deriveAdjustmentPoints(data, rules);

  if (!attributeRow || !metatypeInfo) {
    return (
      <div className="priority-builder">
        <p className="hint">Assign a Priority letter to Attributes and pick a Metatype first.</p>
      </div>
    );
  }

  return (
    <div className="priority-builder">
      <section>
        <h3>
          Attributes ({attributePointsRemaining} / {attributePointsTotal} points remaining)
        </h3>
        <p className="hint">
          Values above 6 are "special racial attributes" and are normally paid for from Adjustment
          Points ({adjustmentPoints.remaining} remaining) past 6 only. House rule: check "fund from
          Adjustment Points" on a special attribute to pay for its full value from Adjustment Points
          instead, freeing these points for other attributes.
        </p>
        <div className="attribute-editor">
          {CORE_ATTRIBUTE_KEYS.map((key) => {
            const range = metatypeInfo[key];
            const value = data.attributes[key];
            return (
              <div key={key} className="attribute-editor-row">
                <label>
                  {key}
                  <NumberStepper
                    label={key}
                    min={range.min}
                    max={range.max}
                    value={value}
                    onChange={(next) =>
                      onChange({
                        ...data,
                        attributes: { ...data.attributes, [key]: next },
                      })
                    }
                  />
                  <span className="range-hint">
                    {range.min}-{range.max}
                  </span>
                </label>
                {isSpecialAttribute(metatypeInfo, key) && (
                  <label className="inline-field">
                    <input
                      type="checkbox"
                      checked={isAdjustmentFunded(key)}
                      onChange={() => toggleAdjustmentFunding(key)}
                    />
                    fund from Adjustment Points
                  </label>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
