import type { CharacterData } from "../character";

interface Props {
  data: CharacterData;
  onChange: (data: CharacterData) => void;
}

/** Sex/Age/Height/Weight - the free-text "Personal Data" fields the printed
 * character sheet has blank cells for (see pdfSheet.ts's drawPage1). Purely
 * descriptive, so plain always-editable inputs rather than EditableName's
 * click-to-edit dance - there's no single prominent display of these values
 * elsewhere that editing needs to match. */
export function PersonalDataFields({ data, onChange }: Props) {
  function set(field: "sex" | "age" | "height" | "weight", value: string) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div className="personal-data-fields">
      <label className="inline-field">
        Sex
        <input value={data.sex ?? ""} onChange={(e) => set("sex", e.target.value)} placeholder="e.g. F" />
      </label>
      <label className="inline-field">
        Age
        <input value={data.age ?? ""} onChange={(e) => set("age", e.target.value)} placeholder="e.g. 27" />
      </label>
      <label className="inline-field">
        Height
        <input value={data.height ?? ""} onChange={(e) => set("height", e.target.value)} placeholder={`e.g. 5'8"`} />
      </label>
      <label className="inline-field">
        Weight
        <input value={data.weight ?? ""} onChange={(e) => set("weight", e.target.value)} placeholder="e.g. 150 lbs" />
      </label>
    </div>
  );
}
