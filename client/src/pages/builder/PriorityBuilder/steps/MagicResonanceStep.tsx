import type { CharacterData, PrioritySystemState } from "../../../../character";
import type { PriorityRulesResponse } from "../../../../rules";
import { NumberStepper } from "../../../../components/NumberStepper";
import { effectivePriorityLetter } from "../../../../derivePriorityVariant";
import { deriveAdjustmentPoints } from "../../../../deriveAdjustmentPoints";
import { LivingPersonaPanel } from "../../LivingPersonaPanel/LivingPersonaPanel";

interface Props {
  rules: PriorityRulesResponse;
  data: CharacterData;
  onChange: (data: CharacterData) => void;
}

export function MagicResonanceStep({ rules, data, onChange }: Props) {
  const state = (data.systemState as PrioritySystemState)?.priorities
    ? (data.systemState as PrioritySystemState)
    : { priorities: {} };

  const magicRow = rules.priorityTable.find(
    (r) => r.priority === effectivePriorityLetter(state.priorities.magic, state.powerLevel)
  );

  const selectedMagicOption = state.magicOption
    ? magicRow?.magic.find((m) => m.option === state.magicOption)
    : undefined;
  const magicBaseRating = selectedMagicOption?.rating ?? 0;
  const magicIsResonance = selectedMagicOption?.option === "Technomancer";
  const currentMagicOrResonance = magicIsResonance
    ? (data.attributes.resonance ?? 0)
    : (data.attributes.magic ?? 0);

  const adjustmentPoints = deriveAdjustmentPoints(data, rules);

  if (!magicRow) {
    return (
      <div className="priority-builder">
        <p className="hint">Assign a Priority letter to Magic or Resonance first.</p>
      </div>
    );
  }

  return (
    <div className="priority-builder">
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
        {data.attributes.magic !== undefined && (
          <>
            <h4>Tradition Attribute</h4>
            <p className="hint">
              Pairs with Magic for Astral Combat's Attack Rating and Drain resistance (core rulebook p.160-161) -
              Logic for a hermetic-style tradition, Charisma for a shamanic-style one. Mystic Adepts can never
              astrally project (p.158), even with this chosen.
            </p>
            <div className="chip-row">
              {(["logic", "charisma"] as const).map((attr) => (
                <button
                  key={attr}
                  className={data.traditionAttribute === attr ? "chip selected" : "chip"}
                  onClick={() => onChange({ ...data, traditionAttribute: attr })}
                >
                  {attr === "logic" ? "Logic" : "Charisma"}
                </button>
              ))}
            </div>
          </>
        )}
        {selectedMagicOption && selectedMagicOption.option !== "Mundane" && (
          <>
            <h4>
              {magicIsResonance ? "Resonance" : "Magic"} Boost ({adjustmentPoints.remaining} Adjustment
              Points remaining)
            </h4>
            <p className="hint">Boosted from Adjustment Points (from the Metatype step), up to a hard cap of 6.</p>
            <div className="attribute-editor">
              <label>
                {magicIsResonance ? "resonance" : "magic"}
                <NumberStepper
                  label={magicIsResonance ? "resonance" : "magic"}
                  min={magicBaseRating}
                  max={6}
                  value={currentMagicOrResonance}
                  onChange={(next) =>
                    onChange({
                      ...data,
                      attributes: {
                        ...data.attributes,
                        [magicIsResonance ? "resonance" : "magic"]: next,
                      },
                    })
                  }
                />
                <span className="range-hint">{magicBaseRating}-6</span>
              </label>
            </div>
          </>
        )}
      </section>

      <LivingPersonaPanel data={data} onChange={onChange} />
    </div>
  );
}
