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
  MetamagicRulesResponse,
  PackRulesResponse,
  PriorityRulesResponse,
  QualityRulesResponse,
  SpellRulesResponse,
} from "../../../rules";
import type { WizardStep } from "../../../components/StepWizard";
import { attributePointsRemaining, skillPointsRemaining } from "../../../deriveAdjustmentPoints";
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
  metamagicRules: MetamagicRulesResponse;
  data: CharacterData;
  onChange: (data: CharacterData) => void;
}

export function getPrioritySteps(props: PriorityStepsProps): WizardStep[] {
  const { priorityRules, qualityRules, data, onChange } = props;
  const attributePoints = attributePointsRemaining(data, priorityRules);
  const skillPoints = skillPointsRemaining(data, priorityRules);

  return [
    {
      id: "power-level",
      label: "Priorities",
      content: <PowerLevelStep rules={priorityRules} qualityRules={qualityRules} data={data} onChange={onChange} />,
    },
    {
      id: "metatype",
      label: "Metatype",
      content: <MetatypeStep rules={priorityRules} data={data} onChange={onChange} />,
    },
    {
      id: "attributes",
      label: "Attributes",
      state: attributePoints.total > 0 ? `${attributePoints.remaining} / ${attributePoints.total}` : undefined,
      content: <AttributesStep rules={priorityRules} data={data} onChange={onChange} />,
    },
    {
      id: "skills",
      label: "Skills",
      state: skillPoints.total > 0 ? `${skillPoints.remaining} / ${skillPoints.total}` : undefined,
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
