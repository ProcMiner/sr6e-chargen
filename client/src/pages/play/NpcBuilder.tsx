// Full character build for a single NPC (see npc.ts's `fullBuild` field
// header comment) - a deliberate structural mirror of
// ../builder/BuilderRoot.tsx, reusing every picker component so a GM
// building a BBEG gets the exact same builder a player does, with the same
// computed stats. Not generalized into a shared component with
// BuilderRoot.tsx: the two save to genuinely different places (a real
// character row's `system` column + data blob vs. an NPC's data blob
// alone), and this project's convention throughout has been small focused
// files over early abstraction - see this file's own history for why. If
// a new picker is ever added to BuilderRoot.tsx, mirror it here too.
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError, type NpcSummary } from "../../api";
import type { CharacterData } from "../../character";
import { emptyCharacterData } from "../../character";
import type {
  PriorityRulesResponse,
  LifepathRulesResponse,
  QualityRulesResponse,
  GearRulesResponse,
  PackRulesResponse,
  SpellRulesResponse,
  AdeptPowerRulesResponse,
  LifestyleRulesResponse,
  ComplexFormRulesResponse,
  MetamagicRulesResponse,
} from "../../rules";
import { getPrioritySteps } from "../builder/PriorityBuilder/prioritySteps";
import { getLifepathSteps } from "../builder/LifepathBuilder/lifepathSteps";
import { StepWizard } from "../../components/StepWizard";
import { SummarySheet } from "../builder/SummarySheet";
import { spellKarmaCost } from "../../deriveSpells";
import { complexFormKarmaCost } from "../../deriveComplexForms";
import { normalizeKnowledgeSkills } from "../../deriveKnowledge";
import { downloadCharacterSheetPdf, generateCharacterSheetPdf, showCharacterSheetPreview } from "../../pdfSheet";

export function NpcBuilder() {
  const { id } = useParams();
  const [npc, setNpc] = useState<NpcSummary | null>(null);
  const [system, setSystem] = useState<"priority" | "lifepath" | null>(null);
  const [activeStepId, setActiveStepId] = useState("power-level");
  const [data, setData] = useState<CharacterData | null>(null);
  const [priorityRules, setPriorityRules] = useState<PriorityRulesResponse | null>(null);
  const [lifepathRules, setLifepathRules] = useState<LifepathRulesResponse | null>(null);
  const [qualityRules, setQualityRules] = useState<QualityRulesResponse | null>(null);
  const [gearRules, setGearRules] = useState<GearRulesResponse | null>(null);
  const [packRules, setPackRules] = useState<PackRulesResponse | null>(null);
  const [spellRules, setSpellRules] = useState<SpellRulesResponse | null>(null);
  const [adeptPowerRules, setAdeptPowerRules] = useState<AdeptPowerRulesResponse | null>(null);
  const [lifestyleRules, setLifestyleRules] = useState<LifestyleRulesResponse | null>(null);
  const [complexFormRules, setComplexFormRules] = useState<ComplexFormRulesResponse | null>(null);
  const [metamagicRules, setMetamagicRules] = useState<MetamagicRulesResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [downloadingSheet, setDownloadingSheet] = useState(false);
  const [previewingSheet, setPreviewingSheet] = useState(false);
  const [sheetError, setSheetError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.listNpcs().then((list) => {
      const found = list.find((n) => n.id === Number(id));
      if (!found) return;
      setNpc(found);
      const fullBuild = found.data.fullBuild;
      if (fullBuild) {
        setSystem(fullBuild.system);
        const raw = fullBuild.characterData as Partial<CharacterData>;
        setData({ ...emptyCharacterData(), ...raw, knowledgeSkills: normalizeKnowledgeSkills(raw.knowledgeSkills) });
      }
    });
    api.priorityTables().then(setPriorityRules);
    api.lifepathModules().then(setLifepathRules);
    api.qualities().then(setQualityRules);
    api.gear().then(setGearRules);
    api.packs().then(setPackRules);
    api.spells().then(setSpellRules);
    api.adeptPowers().then(setAdeptPowerRules);
    api.lifestyles().then(setLifestyleRules);
    api.complexForms().then(setComplexFormRules);
    api.metamagics().then(setMetamagicRules);
  }, [id]);

  function startBuild(chosenSystem: "priority" | "lifepath") {
    setSystem(chosenSystem);
    setData(emptyCharacterData());
  }

  async function handleSave() {
    if (!npc || !data || !system) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await api.updateNpc(npc.id, { data: { ...npc.data, fullBuild: { system, characterData: data } } });
      setNpc(updated);
      setLastSaved(new Date());
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Failed to save - please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDownloadSheet() {
    if (!npc || !data || !priorityRules || !qualityRules || !gearRules) return;
    setDownloadingSheet(true);
    setSheetError(null);
    try {
      const bytes = await generateCharacterSheetPdf({
        characterAlias: npc.name,
        data,
        priorityRules,
        metatypeAttributes: priorityRules.metatypeAttributes,
        qualityRules,
        gearRules,
        spellKarmaSpent: spellKarmaCost(data, priorityRules),
        complexFormKarmaSpent: complexFormKarmaCost(data, priorityRules),
      });
      downloadCharacterSheetPdf(bytes, npc.name);
    } catch (err) {
      setSheetError(err instanceof Error ? err.message : "Failed to generate character sheet.");
    } finally {
      setDownloadingSheet(false);
    }
  }

  async function handlePreviewSheet() {
    if (!npc || !data || !priorityRules || !qualityRules || !gearRules) return;
    const previewWindow = window.open("", "_blank");
    setPreviewingSheet(true);
    setSheetError(null);
    try {
      const bytes = await generateCharacterSheetPdf({
        characterAlias: npc.name,
        data,
        priorityRules,
        metatypeAttributes: priorityRules.metatypeAttributes,
        qualityRules,
        gearRules,
        spellKarmaSpent: spellKarmaCost(data, priorityRules),
        complexFormKarmaSpent: complexFormKarmaCost(data, priorityRules),
      });
      if (!previewWindow) {
        setSheetError("Preview window was blocked - allow pop-ups for this site, or use Download instead.");
      } else {
        showCharacterSheetPreview(bytes, previewWindow);
      }
    } catch (err) {
      previewWindow?.close();
      setSheetError(err instanceof Error ? err.message : "Failed to generate character sheet.");
    } finally {
      setPreviewingSheet(false);
    }
  }

  if (
    !npc ||
    !priorityRules ||
    !lifepathRules ||
    !qualityRules ||
    !gearRules ||
    !packRules ||
    !spellRules ||
    !adeptPowerRules ||
    !lifestyleRules ||
    !complexFormRules ||
    !metamagicRules
  ) {
    return (
      <div className="page">
        <p>Loading...</p>
      </div>
    );
  }

  if (!system || !data) {
    return (
      <div className="page">
        <header className="page-header">
          <h1>{npc.name} - Full Build</h1>
        </header>
        <p className="hint">
          Give {npc.name} a complete character build - the same builder a player uses, with every attribute, skill,
          quality, and piece of gear. This is entirely optional; the simple stat block on the roster card works fine
          on its own for a quick mook.
        </p>
        <div className="chip-row">
          <button onClick={() => startBuild("priority")}>Priority System</button>
          <button onClick={() => startBuild("lifepath")}>Life Path (Modules)</button>
        </div>
        <p className="hint">
          <Link to="/play">Back to GM's Bar</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="page builder-page">
      <header className="page-header">
        <h1>{npc.name} - Full Build</h1>
        <div className="header-actions">
          <button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button onClick={handlePreviewSheet} disabled={previewingSheet}>
            {previewingSheet ? "Generating..." : "Preview Character Sheet"}
          </button>
          <button onClick={handleDownloadSheet} disabled={downloadingSheet}>
            {downloadingSheet ? "Generating..." : "Download Character Sheet"}
          </button>
          {saveError && <span className="save-error">{saveError}</span>}
          {sheetError && <span className="save-error">{sheetError}</span>}
          {!saveError && lastSaved && (
            <span className="saved-at">Saved {lastSaved.toLocaleTimeString()}</span>
          )}
          <Link to="/play">Back to GM's Bar</Link>
        </div>
      </header>

      <div className="builder-layout">
        <div className="builder-main">
          {system === "priority" ? (
            <StepWizard
              steps={getPrioritySteps({
                priorityRules,
                qualityRules,
                gearRules,
                packRules,
                spellRules,
                adeptPowerRules,
                lifestyleRules,
                complexFormRules,
                metamagicRules,
                data,
                onChange: setData,
              })}
              activeId={activeStepId}
              onSelect={setActiveStepId}
            />
          ) : (
            <StepWizard
              steps={getLifepathSteps({
                lifepathRules,
                priorityRules,
                qualityRules,
                gearRules,
                packRules,
                spellRules,
                adeptPowerRules,
                lifestyleRules,
                complexFormRules,
                metamagicRules,
                data,
                onChange: setData,
              })}
              activeId={activeStepId}
              onSelect={setActiveStepId}
            />
          )}
        </div>
        <aside className="builder-sidebar">
          <SummarySheet
            data={data}
            qualityRules={qualityRules}
            metatypeAttributes={priorityRules.metatypeAttributes}
            spellRules={spellRules}
            priorityRules={priorityRules}
            adeptPowerRules={adeptPowerRules}
            complexFormRules={complexFormRules}
            gearRules={gearRules}
          />
        </aside>
      </div>
    </div>
  );
}
