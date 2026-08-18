// Assembles the Priority Builder's step-wizard, in the order the core
// rulebook actually walks a player through chargen (p.63-67): priorities
// through Resources, then Qualities, Customization Karma, Buy Gear, and
// finally Finishing Steps + Final Calculations. This is the one place that
// encodes what the steps are and what order they're in.
import type { CharacterData } from "../../../character";
import type {
  AdeptPowerRulesResponse,
  ComplexFormRulesResponse,
  GearRulesResponse,
  LifestyleRulesResponse,
  PackRulesResponse,
  PriorityRulesResponse,
  QualityRulesResponse,
  SpellRulesResponse,
} from "../../../rules";
import type { WizardStep } from "../../../components/StepWizard";
import { spellKarmaCost } from "../../../deriveSpells";
import { metavariantKarmaCost } from "../../../deriveMetavariant";
import { contactsKarmaSpent } from "../../../deriveContacts";
import { lifestyleCostTotal } from "../../../deriveLifestyle";
import { complexFormKarmaCost } from "../../../deriveComplexForms";
import { PowerLevelStep } from "./steps/PowerLevelStep";
import { MetatypeStep } from "./steps/MetatypeStep";
import { AttributesStep } from "./steps/AttributesStep";
import { SkillsStep } from "./steps/SkillsStep";
import { MagicResonanceStep } from "./steps/MagicResonanceStep";
import { ResourcesStep } from "./steps/ResourcesStep";
import { ContactsKnowledgeStep } from "./steps/ContactsKnowledgeStep";
import { QualityPicker } from "../QualityPicker/QualityPicker";
import { SpellPicker } from "../SpellPicker/SpellPicker";
import { AdeptPowerPicker } from "../AdeptPowerPicker/AdeptPowerPicker";
import { ComplexFormPicker } from "../ComplexFormPicker/ComplexFormPicker";
import { LifestylePicker } from "../LifestylePicker/LifestylePicker";
import { PackPicker } from "../PackPicker/PackPicker";
import { GearPicker } from "../GearPicker/GearPicker";
import { DeckerPersonaPanel } from "../DeckerPersonaPanel/DeckerPersonaPanel";
import { SummarySheet } from "../SummarySheet";

interface PriorityStepsProps {
  priorityRules: PriorityRulesResponse;
  qualityRules: QualityRulesResponse;
  gearRules: GearRulesResponse;
  packRules: PackRulesResponse;
  spellRules: SpellRulesResponse;
  adeptPowerRules: AdeptPowerRulesResponse;
  lifestyleRules: LifestyleRulesResponse;
  complexFormRules: ComplexFormRulesResponse;
  data: CharacterData;
  onChange: (data: CharacterData) => void;
}

export function getPrioritySteps({
  priorityRules,
  qualityRules,
  gearRules,
  packRules,
  spellRules,
  adeptPowerRules,
  lifestyleRules,
  complexFormRules,
  data,
  onChange,
}: PriorityStepsProps): WizardStep[] {
  const extraKarmaSpent =
    spellKarmaCost(data, priorityRules) +
    complexFormKarmaCost(data, priorityRules) +
    metavariantKarmaCost(data, priorityRules.metavariants) +
    contactsKarmaSpent(data.contacts);
  const extraNuyenSpent = lifestyleCostTotal(data.lifestyles);

  return [
    {
      id: "power-level",
      label: "Priorities",
      content: <PowerLevelStep rules={priorityRules} data={data} onChange={onChange} />,
    },
    {
      id: "metatype",
      label: "Metatype",
      content: <MetatypeStep rules={priorityRules} data={data} onChange={onChange} />,
    },
    {
      id: "attributes",
      label: "Attributes",
      content: <AttributesStep rules={priorityRules} data={data} onChange={onChange} />,
    },
    {
      id: "skills",
      label: "Skills",
      content: <SkillsStep rules={priorityRules} data={data} onChange={onChange} />,
    },
    {
      id: "magic",
      label: "Magic/Resonance",
      content: <MagicResonanceStep rules={priorityRules} data={data} onChange={onChange} />,
    },
    {
      id: "resources",
      label: "Resources",
      content: <ResourcesStep rules={priorityRules} data={data} onChange={onChange} />,
    },
    {
      id: "qualities",
      label: "Select Qualities",
      content: (
        <QualityPicker
          rules={qualityRules}
          metatypeAttributes={priorityRules.metatypeAttributes}
          metavariants={priorityRules.metavariants}
          skillList={priorityRules.skillList}
          data={data}
          onChange={onChange}
        />
      ),
    },
    {
      id: "customization-karma",
      label: "Customization Karma",
      content: (
        <>
          <SpellPicker rules={spellRules} priorityRules={priorityRules} data={data} onChange={onChange} />
          <AdeptPowerPicker rules={adeptPowerRules} data={data} onChange={onChange} />
          <ComplexFormPicker rules={complexFormRules} priorityRules={priorityRules} data={data} onChange={onChange} />
        </>
      ),
    },
    {
      id: "gear",
      label: "Buy Gear",
      content: (
        <>
          <LifestylePicker rules={lifestyleRules} data={data} onChange={onChange} />
          <PackPicker
            packRules={packRules}
            gearRules={gearRules}
            lifestyleRules={lifestyleRules}
            data={data}
            onChange={onChange}
            extraNuyenSpent={extraNuyenSpent}
          />
          <GearPicker
            rules={gearRules}
            data={data}
            onChange={onChange}
            extraKarmaSpent={extraKarmaSpent}
            extraNuyenSpent={extraNuyenSpent}
          />
          <DeckerPersonaPanel data={data} gearRules={gearRules} onChange={onChange} />
        </>
      ),
    },
    {
      id: "finishing",
      label: "Finishing Steps",
      content: <ContactsKnowledgeStep rules={priorityRules} data={data} onChange={onChange} />,
    },
    {
      id: "final",
      label: "Final Calculations",
      content: (
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
      ),
    },
  ];
}
