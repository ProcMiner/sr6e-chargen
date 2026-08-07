import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError, type CharacterSummary } from "../../api";
import type { CharacterData } from "../../character";
import { emptyCharacterData } from "../../character";
import type {
  PriorityRulesResponse,
  LifepathRulesResponse,
  QualityRulesResponse,
  GearRulesResponse,
  PackRulesResponse,
} from "../../rules";
import { PriorityBuilder } from "./PriorityBuilder/PriorityBuilder";
import { LifepathBuilder } from "./LifepathBuilder/LifepathBuilder";
import { QualityPicker } from "./QualityPicker/QualityPicker";
import { GearPicker } from "./GearPicker/GearPicker";
import { PackPicker } from "./PackPicker/PackPicker";
import { SummarySheet } from "./SummarySheet";

export function BuilderRoot() {
  const { id } = useParams();
  const [character, setCharacter] = useState<CharacterSummary | null>(null);
  const [data, setData] = useState<CharacterData | null>(null);
  const [priorityRules, setPriorityRules] = useState<PriorityRulesResponse | null>(null);
  const [lifepathRules, setLifepathRules] = useState<LifepathRulesResponse | null>(null);
  const [qualityRules, setQualityRules] = useState<QualityRulesResponse | null>(null);
  const [gearRules, setGearRules] = useState<GearRulesResponse | null>(null);
  const [packRules, setPackRules] = useState<PackRulesResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.getCharacter(Number(id)).then((c) => {
      setCharacter(c);
      const raw = c.data as Partial<CharacterData>;
      setData({ ...emptyCharacterData(), ...raw });
    });
    api.priorityTables().then(setPriorityRules);
    api.lifepathModules().then(setLifepathRules);
    api.qualities().then(setQualityRules);
    api.gear().then(setGearRules);
    api.packs().then(setPackRules);
  }, [id]);

  async function handleSave() {
    if (!character || !data) return;
    setSaving(true);
    setSaveError(null);
    try {
      await api.updateCharacter(character.id, { data });
      setLastSaved(new Date());
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Failed to save - please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!character || !data || !priorityRules || !lifepathRules || !qualityRules || !gearRules || !packRules) {
    return (
      <div className="page">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="page builder-page">
      <header className="page-header">
        <Link to="/characters">&larr; Characters</Link>
        <h1>{character.name}</h1>
        <div className="header-actions">
          <button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          {saveError && <span className="save-error">{saveError}</span>}
          {!saveError && lastSaved && (
            <span className="saved-at">Saved {lastSaved.toLocaleTimeString()}</span>
          )}
        </div>
      </header>

      <div className="builder-layout">
        <div className="builder-main">
          {character.system === "priority" ? (
            <PriorityBuilder rules={priorityRules} data={data} onChange={setData} />
          ) : (
            <LifepathBuilder
              rules={lifepathRules}
              metatypeAttributes={priorityRules.metatypeAttributes}
              skillList={priorityRules.skillList}
              data={data}
              onChange={setData}
            />
          )}
          <QualityPicker
            rules={qualityRules}
            metatypeAttributes={priorityRules.metatypeAttributes}
            skillList={priorityRules.skillList}
            data={data}
            onChange={setData}
          />
          <PackPicker packRules={packRules} gearRules={gearRules} data={data} onChange={setData} />
          <GearPicker rules={gearRules} data={data} onChange={setData} />
        </div>
        <aside className="builder-sidebar">
          <SummarySheet data={data} qualityRules={qualityRules} metatypeAttributes={priorityRules.metatypeAttributes} />
        </aside>
      </div>
    </div>
  );
}
