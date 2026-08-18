import type { CharacterData, PrioritySystemState } from "../../../../character";
import type { PriorityRulesResponse } from "../../../../rules";
import { NumberStepper } from "../../../../components/NumberStepper";
import { effectiveMetatypeInfo, findMetavariant } from "../../../../deriveMetavariant";
import { effectivePriorityLetter } from "../../../../derivePriorityVariant";
import { deriveAdjustmentPoints } from "../../../../deriveAdjustmentPoints";

interface Props {
  rules: PriorityRulesResponse;
  data: CharacterData;
  onChange: (data: CharacterData) => void;
}

export function MetatypeStep({ rules, data, onChange }: Props) {
  const state = (data.systemState as PrioritySystemState)?.priorities
    ? (data.systemState as PrioritySystemState)
    : { priorities: {} };

  const metatypeRow = rules.priorityTable.find(
    (r) => r.priority === effectivePriorityLetter(state.priorities.metatype, state.powerLevel)
  );
  const metatypeInfo = effectiveMetatypeInfo(data, rules.metatypeAttributes, rules.metavariants);
  const selectedMetavariant = findMetavariant(data, rules.metavariants);
  const effectiveMetatypeLetter = effectivePriorityLetter(state.priorities.metatype, state.powerLevel);
  const availableMetavariants = rules.metavariants.filter(
    (m) =>
      m.parentMetatype === data.metatype &&
      (!effectiveMetatypeLetter || m.adjustmentPoints[effectiveMetatypeLetter] !== undefined)
  );

  const adjustmentPoints = deriveAdjustmentPoints(data, rules);

  if (!metatypeRow) {
    return (
      <div className="priority-builder">
        <p className="hint">Assign a Priority letter to Metatype first.</p>
      </div>
    );
  }

  return (
    <div className="priority-builder">
      <section>
        <h2>Metatype</h2>
        <div className="chip-row">
          {metatypeRow.metatype.map((m) => (
            <button
              key={m.metatype}
              className={data.metatype === m.metatype ? "chip selected" : "chip"}
              onClick={() => onChange({ ...data, metatype: m.metatype, metavariant: undefined })}
            >
              {m.metatype} ({m.adjustmentPoints} adj. pts)
            </button>
          ))}
        </div>
        {availableMetavariants.length > 0 && (
          <>
            <h4>Metavariant (optional)</h4>
            <p className="hint">
              Overrides attribute ranges and Adjustment Points; its Karma cost is deducted from your
              customization Karma pool (see Spend Customization Karma).
            </p>
            <div className="chip-row">
              <button
                className={!data.metavariant ? "chip selected" : "chip"}
                onClick={() => onChange({ ...data, metavariant: undefined })}
              >
                Base {data.metatype}
              </button>
              {availableMetavariants.map((m) => (
                <button
                  key={m.id}
                  className={data.metavariant === m.id ? "chip selected" : "chip"}
                  onClick={() => onChange({ ...data, metavariant: m.id })}
                  title={m.racialTraits.join(", ")}
                >
                  {m.name} ({m.karma} Karma
                  {effectiveMetatypeLetter ? `, ${m.adjustmentPoints[effectiveMetatypeLetter]} adj. pts` : ""})
                </button>
              ))}
            </div>
            {selectedMetavariant?.karmaNote && <p className="hint">{selectedMetavariant.karmaNote}</p>}
          </>
        )}
      </section>

      {metatypeInfo && (
        <section>
          <h3>
            Adjustment Points ({adjustmentPoints.remaining} / {adjustmentPoints.total} remaining)
          </h3>
          <p className="hint">
            Spent on Edge (here), on pushing a special racial attribute past 6 (Attributes step), and on
            boosting Magic/Resonance above its base rating up to 6 (Magic/Resonance step).
          </p>
          <div className="attribute-editor">
            <label>
              edge
              <NumberStepper
                label="edge"
                min={metatypeInfo.edge.min}
                max={metatypeInfo.edge.max}
                value={data.attributes.edge}
                onChange={(next) => onChange({ ...data, attributes: { ...data.attributes, edge: next } })}
              />
              <span className="range-hint">
                {metatypeInfo.edge.min}-{metatypeInfo.edge.max}
              </span>
            </label>
          </div>
        </section>
      )}
    </div>
  );
}
