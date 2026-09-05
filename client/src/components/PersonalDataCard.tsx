import type { CharacterData } from "../character";
import { findMetavariant } from "../deriveMetavariant";
import type { PriorityRulesResponse } from "../rules";

type PersonalField = "playerName" | "sex" | "age" | "height" | "weight" | "ethnicity";

const FIELDS: [PersonalField, string][] = [
  ["playerName", "Player"],
  ["sex", "Sex"],
  ["age", "Age"],
  ["height", "Height"],
  ["weight", "Weight"],
  ["ethnicity", "Ethnicity"],
];

interface Props {
  data: CharacterData;
  priorityRules: PriorityRulesResponse;
  onChange: (next: CharacterData) => void;
}

export function PersonalDataCard({ data, priorityRules, onChange }: Props) {
  const selectedMetavariant = findMetavariant(data, priorityRules.metavariants);
  const metatypeLine = data.metatype
    ? selectedMetavariant
      ? `${data.metatype} (${selectedMetavariant.name})`
      : data.metatype
    : "—";

  function setField(field: PersonalField, value: string) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div className="sheet-card">
      <div className="rules-kicker">Personal Data</div>
      <div className="personal-data-grid">
        {FIELDS.map(([field, label]) => (
          <div key={field} className="field-sm">
            <label htmlFor={`personal-${field}`}>{label}</label>
            <input
              id={`personal-${field}`}
              type="text"
              value={data[field] ?? ""}
              onChange={(e) => setField(field, e.target.value)}
            />
          </div>
        ))}
        <div className="field-sm">
          <label>Metatype</label>
          <div className="val">{metatypeLine}</div>
        </div>
      </div>
      <div className="hr" />
      <div className="field-sm">
        <label htmlFor="personal-notes">Notes</label>
        <textarea
          id="personal-notes"
          rows={2}
          value={data.notes ?? ""}
          onChange={(e) => onChange({ ...data, notes: e.target.value })}
        />
      </div>
    </div>
  );
}
