import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, ApiError, type CharacterSummary } from "../../api";
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
} from "../../rules";
import { getPrioritySteps } from "./PriorityBuilder/prioritySteps";
import { StepWizard } from "../../components/StepWizard";
import { LifepathBuilder } from "./LifepathBuilder/LifepathBuilder";
import { QualityPicker } from "./QualityPicker/QualityPicker";
import { GearPicker } from "./GearPicker/GearPicker";
import { PackPicker } from "./PackPicker/PackPicker";
import { SpellPicker } from "./SpellPicker/SpellPicker";
import { AdeptPowerPicker } from "./AdeptPowerPicker/AdeptPowerPicker";
import { LifestylePicker } from "./LifestylePicker/LifestylePicker";
import { ComplexFormPicker } from "./ComplexFormPicker/ComplexFormPicker";
import { LivingPersonaPanel } from "./LivingPersonaPanel/LivingPersonaPanel";
import { DeckerPersonaPanel } from "./DeckerPersonaPanel/DeckerPersonaPanel";
import { SummarySheet } from "./SummarySheet";
import { spellKarmaCost } from "../../deriveSpells";
import { metavariantKarmaCost } from "../../deriveMetavariant";
import { contactsKarmaSpent } from "../../deriveContacts";
import { normalizeKnowledgeSkills } from "../../deriveKnowledge";
import { lifestyleCostTotal } from "../../deriveLifestyle";
import { complexFormKarmaCost } from "../../deriveComplexForms";
import { downloadCharacterSheetPdf, generateCharacterSheetPdf, showCharacterSheetPreview } from "../../pdfSheet";

export function BuilderRoot() {
  const { id } = useParams();
  const [character, setCharacter] = useState<CharacterSummary | null>(null);
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
  const [activeStepId, setActiveStepId] = useState("power-level");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [downloadingSheet, setDownloadingSheet] = useState(false);
  const [previewingSheet, setPreviewingSheet] = useState(false);
  const [sheetError, setSheetError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.getCharacter(Number(id)).then((c) => {
      setCharacter(c);
      const raw = c.data as Partial<CharacterData>;
      setData({ ...emptyCharacterData(), ...raw, knowledgeSkills: normalizeKnowledgeSkills(raw.knowledgeSkills) });
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

  async function handleDownloadSheet() {
    if (!character || !data || !priorityRules || !qualityRules || !gearRules) return;
    setDownloadingSheet(true);
    setSheetError(null);
    try {
      const bytes = await generateCharacterSheetPdf({
        characterAlias: character.name,
        data,
        priorityRules,
        metatypeAttributes: priorityRules.metatypeAttributes,
        qualityRules,
        gearRules,
        spellKarmaSpent: spellKarmaCost(data, priorityRules),
        complexFormKarmaSpent: complexFormKarmaCost(data, priorityRules),
      });
      downloadCharacterSheetPdf(bytes, character.name);
    } catch (err) {
      setSheetError(err instanceof Error ? err.message : "Failed to generate character sheet.");
    } finally {
      setDownloadingSheet(false);
    }
  }

  async function handlePreviewSheet() {
    if (!character || !data || !priorityRules || !qualityRules || !gearRules) return;
    const previewWindow = window.open("", "_blank");
    setPreviewingSheet(true);
    setSheetError(null);
    try {
      const bytes = await generateCharacterSheetPdf({
        characterAlias: character.name,
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
    !character ||
    !data ||
    !priorityRules ||
    !lifepathRules ||
    !qualityRules ||
    !gearRules ||
    !packRules ||
    !spellRules ||
    !adeptPowerRules ||
    !lifestyleRules ||
    !complexFormRules
  ) {
    return (
      <div className="page">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="page builder-page">
      <header className="page-header">
        <h1>{character.name}</h1>
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
        </div>
      </header>

      <div className="builder-layout">
        <div className="builder-main">
          {character.system === "priority" ? (
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
                data,
                onChange: setData,
              })}
              activeId={activeStepId}
              onSelect={setActiveStepId}
            />
          ) : (
            <>
              <LifepathBuilder
                rules={lifepathRules}
                metatypeAttributes={priorityRules.metatypeAttributes}
                metavariants={priorityRules.metavariants}
                skillList={priorityRules.skillList}
                data={data}
                onChange={setData}
              />
              <QualityPicker
                rules={qualityRules}
                metatypeAttributes={priorityRules.metatypeAttributes}
                metavariants={priorityRules.metavariants}
                skillList={priorityRules.skillList}
                data={data}
                onChange={setData}
              />
              <SpellPicker rules={spellRules} priorityRules={priorityRules} data={data} onChange={setData} />
              <AdeptPowerPicker rules={adeptPowerRules} data={data} onChange={setData} />
              <ComplexFormPicker rules={complexFormRules} priorityRules={priorityRules} data={data} onChange={setData} />
              <LivingPersonaPanel data={data} onChange={setData} />
              <LifestylePicker rules={lifestyleRules} data={data} onChange={setData} />
              <PackPicker
                packRules={packRules}
                gearRules={gearRules}
                lifestyleRules={lifestyleRules}
                data={data}
                onChange={setData}
                extraNuyenSpent={lifestyleCostTotal(data.lifestyles)}
              />
              <GearPicker
                rules={gearRules}
                data={data}
                onChange={setData}
                extraKarmaSpent={
                  spellKarmaCost(data, priorityRules) +
                  complexFormKarmaCost(data, priorityRules) +
                  metavariantKarmaCost(data, priorityRules.metavariants) +
                  contactsKarmaSpent(data.contacts)
                }
                extraNuyenSpent={lifestyleCostTotal(data.lifestyles)}
              />
              <DeckerPersonaPanel data={data} gearRules={gearRules} onChange={setData} />
            </>
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
