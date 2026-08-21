// Steps 5 (well, 7 for Priority) through the end are identical in shape
// between Priority and Life Path: both the Companion (p.30) and the Core
// Rulebook fold into the same Select Qualities -> Customization Karma ->
// Buy Gear -> Finishing Steps -> Final Calculations sequence once their own
// front-end steps are done. Only "Finishing Steps" differs (Priority uses
// Charisma/Logic point pools, Life Path uses module-granted pools) - the
// caller supplies that step's label/content, everything else is shared.
import type { ReactNode } from "react";
import type { CharacterData } from "../../../character";
import type {
  AdeptPowerRulesResponse,
  ComplexFormRulesResponse,
  GearRulesResponse,
  LifestyleRulesResponse,
  MetamagicRulesResponse,
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
import { initiationKarmaTotal } from "../../../deriveInitiation";
import { customCyberdeckKarmaTotal } from "../../../deriveCustomCyberdeck";
import { advancementKarmaTotal } from "../../../deriveAdvancement";
import { specializationKarmaTotal } from "../../../deriveSpecializations";
import { nuyenRemaining } from "../../../deriveGear";
import { QualityPicker, MAX_QUALITIES } from "../QualityPicker/QualityPicker";
import { SpellPicker } from "../SpellPicker/SpellPicker";
import { AdeptPowerPicker } from "../AdeptPowerPicker/AdeptPowerPicker";
import { ComplexFormPicker } from "../ComplexFormPicker/ComplexFormPicker";
import { InitiationPicker } from "../InitiationPicker/InitiationPicker";
import { SkillAdvancementPicker } from "../SkillAdvancementPicker/SkillAdvancementPicker";
import { LifestylePicker } from "../LifestylePicker/LifestylePicker";
import { PackPicker } from "../PackPicker/PackPicker";
import { GearPicker } from "../GearPicker/GearPicker";
import { CyberdeckBuilder } from "../CyberdeckBuilder/CyberdeckBuilder";
import { DeckerPersonaPanel } from "../DeckerPersonaPanel/DeckerPersonaPanel";
import { SummarySheet } from "../SummarySheet";

interface SharedTailStepsProps {
  priorityRules: PriorityRulesResponse;
  qualityRules: QualityRulesResponse;
  gearRules: GearRulesResponse;
  packRules: PackRulesResponse;
  spellRules: SpellRulesResponse;
  adeptPowerRules: AdeptPowerRulesResponse;
  lifestyleRules: LifestyleRulesResponse;
  complexFormRules: ComplexFormRulesResponse;
  metamagicRules: MetamagicRulesResponse;
  data: CharacterData;
  onChange: (data: CharacterData) => void;
  finishingStepsLabel: string;
  finishingStepsContent: ReactNode;
}

export function getSharedTailSteps({
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
  onChange,
  finishingStepsLabel,
  finishingStepsContent,
}: SharedTailStepsProps): WizardStep[] {
  const extraKarmaSpent =
    spellKarmaCost(data, priorityRules) +
    complexFormKarmaCost(data, priorityRules) +
    metavariantKarmaCost(data, priorityRules.metavariants) +
    contactsKarmaSpent(data.contacts) +
    initiationKarmaTotal(data.initiations) +
    customCyberdeckKarmaTotal(data.gear) +
    advancementKarmaTotal(data.advancement) +
    specializationKarmaTotal(data.specializationLog);
  const extraNuyenSpent = lifestyleCostTotal(data.lifestyles);

  return [
    {
      id: "qualities",
      label: "Select Qualities",
      state: `${data.qualities.length} / ${MAX_QUALITIES}`,
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
          <InitiationPicker rules={metamagicRules} priorityRules={priorityRules} data={data} onChange={onChange} />
          <SkillAdvancementPicker
            priorityRules={priorityRules}
            data={data}
            onChange={onChange}
            extraKarmaSpent={extraKarmaSpent}
          />
        </>
      ),
    },
    {
      id: "gear",
      label: "Buy Gear",
      state: `${nuyenRemaining(data, extraNuyenSpent).toLocaleString()}¥`,
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
          <CyberdeckBuilder
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
      label: finishingStepsLabel,
      content: finishingStepsContent,
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
