import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, type CharacterSummary } from "../../api";
import type { CharacterData } from "../../character";
import { emptyCharacterData } from "../../character";
import type { PriorityRulesResponse, LifepathRulesResponse } from "../../rules";
import { PriorityBuilder } from "./PriorityBuilder/PriorityBuilder";
import { LifepathBuilder } from "./LifepathBuilder/LifepathBuilder";
import { SummarySheet } from "./SummarySheet";

export function BuilderRoot() {
  const { id } = useParams();
  const [character, setCharacter] = useState<CharacterSummary | null>(null);
  const [data, setData] = useState<CharacterData | null>(null);
  const [priorityRules, setPriorityRules] = useState<PriorityRulesResponse | null>(null);
  const [lifepathRules, setLifepathRules] = useState<LifepathRulesResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (!id) return;
    api.getCharacter(Number(id)).then((c) => {
      setCharacter(c);
      const raw = c.data as Partial<CharacterData>;
      setData({ ...emptyCharacterData(), ...raw });
    });
    api.priorityTables().then(setPriorityRules);
    api.lifepathModules().then(setLifepathRules);
  }, [id]);

  async function handleSave() {
    if (!character || !data) return;
    setSaving(true);
    try {
      await api.updateCharacter(character.id, { data });
      setLastSaved(new Date());
    } finally {
      setSaving(false);
    }
  }

  if (!character || !data || !priorityRules || !lifepathRules) {
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
          {lastSaved && <span className="saved-at">Saved {lastSaved.toLocaleTimeString()}</span>}
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
        </div>
        <aside className="builder-sidebar">
          <SummarySheet data={data} />
        </aside>
      </div>
    </div>
  );
}
