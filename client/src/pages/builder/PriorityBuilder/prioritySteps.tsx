// Assembles the Priority Builder's step-wizard, in the order the core
// rulebook actually walks a player through chargen (p.63-67): priorities
// through Resources, then the shared tail (Qualities, Customization Karma,
// Buy Gear, Finishing Steps, Final Calculations) from sharedSteps/tailSteps.tsx
// - see that file's header for why the tail is shared with Life Path.
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
import { getSharedTailSteps } from "../sharedSteps/tailSteps";
import { PowerLevelStep } from "./steps/PowerLevelStep";
import { MetatypeStep } from "./steps/MetatypeStep";
import { AttributesStep } from "./steps/AttributesStep";
import { SkillsStep } from "./steps/SkillsStep";
import { MagicResonanceStep } from "./steps/MagicResonanceStep";
import { ResourcesStep } from "./steps/ResourcesStep";
import { ContactsKnowledgeStep } from "./steps/ContactsKnowledgeStep";

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

export function getPrioritySteps(props: PriorityStepsProps): WizardStep[] {
  const { priorityRules, data, onChange } = props;

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
    ...getSharedTailSteps({
      ...props,
      finishingStepsLabel: "Finishing Steps",
      finishingStepsContent: <ContactsKnowledgeStep rules={priorityRules} data={data} onChange={onChange} />,
    }),
  ];
}
