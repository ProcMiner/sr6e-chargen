import type { CharacterData, PrioritySystemState } from "../../../../character";
import type { PriorityRulesResponse } from "../../../../rules";
import { effectivePriorityLetter } from "../../../../derivePriorityVariant";

interface Props {
  rules: PriorityRulesResponse;
  data: CharacterData;
  onChange: (data: CharacterData) => void;
}

export function ResourcesStep({ rules, data, onChange }: Props) {
  const state = (data.systemState as PrioritySystemState)?.priorities
    ? (data.systemState as PrioritySystemState)
    : { priorities: {} };

  const resourcesRow = rules.priorityTable.find(
    (r) => r.priority === effectivePriorityLetter(state.priorities.resources, state.powerLevel)
  );

  if (!resourcesRow) {
    return (
      <div className="priority-builder">
        <p className="hint">Assign a Priority letter to Resources first.</p>
      </div>
    );
  }

  return (
    <div className="priority-builder">
      <section>
        <h3>Resources</h3>
        <p>{resourcesRow.resources.toLocaleString()}¥ starting nuyen.</p>
        {data.nuyen !== resourcesRow.resources && (
          <button onClick={() => onChange({ ...data, nuyen: resourcesRow.resources })}>
            Apply {resourcesRow.resources.toLocaleString()}¥
          </button>
        )}
      </section>
    </div>
  );
}
