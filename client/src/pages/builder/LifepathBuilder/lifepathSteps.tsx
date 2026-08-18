// Assembles the Life Path Builder's step-wizard: Born This Way, Growing Up,
// Coming of Age, and Adult Life Modules, then the shared tail (Qualities,
// Customization Karma, Buy Gear, Finishing Steps, Final Calculations) from
// sharedSteps/tailSteps.tsx - the Sixth World Companion (p.30) explicitly
// funnels Life Path into those same Core Rulebook steps once life modules
// are done, so that tail is identical in shape to Priority's, just fed
// Life-Path-specific Finishing Steps content (Contacts + Native Language
// instead of Priority's Charisma/Logic point pools).
import type { CharacterData } from "../../../character";
import type {
  AdeptPowerRulesResponse,
  ComplexFormRulesResponse,
  GearRulesResponse,
  LifepathRulesResponse,
  LifestyleRulesResponse,
  PackRulesResponse,
  PriorityRulesResponse,
  QualityRulesResponse,
  SpellRulesResponse,
} from "../../../rules";
import type { WizardStep } from "../../../components/StepWizard";
import { getSharedTailSteps } from "../sharedSteps/tailSteps";
import { BornThisWayStep } from "./steps/BornThisWayStep";
import { GrowingUpStep } from "./steps/GrowingUpStep";
import { ComingOfAgeStep } from "./steps/ComingOfAgeStep";
import { AdultLifeModulesStep } from "./steps/AdultLifeModulesStep";
import { FinishingStepsStep } from "./steps/FinishingStepsStep";

interface LifepathStepsProps {
  lifepathRules: LifepathRulesResponse;
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

export function getLifepathSteps(props: LifepathStepsProps): WizardStep[] {
  const { lifepathRules, priorityRules, data, onChange } = props;
  const stepProps = {
    rules: lifepathRules,
    metatypeAttributes: priorityRules.metatypeAttributes,
    metavariants: priorityRules.metavariants,
    skillList: priorityRules.skillList,
    data,
    onChange,
  };

  return [
    {
      id: "born-this-way",
      label: "Born This Way",
      content: <BornThisWayStep {...stepProps} />,
    },
    {
      id: "growing-up",
      label: "Growing Up",
      content: <GrowingUpStep {...stepProps} />,
    },
    {
      id: "coming-of-age",
      label: "Coming of Age",
      content: <ComingOfAgeStep {...stepProps} />,
    },
    {
      id: "adult-life-modules",
      label: "Adult Life Modules",
      content: <AdultLifeModulesStep {...stepProps} />,
    },
    ...getSharedTailSteps({
      ...props,
      finishingStepsLabel: "Finishing Steps",
      finishingStepsContent: <FinishingStepsStep {...stepProps} />,
    }),
  ];
}
