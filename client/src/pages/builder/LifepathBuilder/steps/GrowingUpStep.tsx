import type { CharacterData } from "../../../../character";
import type { LifepathRulesResponse, MetatypeAttributes, MetavariantCatalogEntry } from "../../../../rules";
import { deriveLifepathState, recomputeLifepathData } from "../../../../deriveLifepath";

interface Props {
  rules: LifepathRulesResponse;
  metatypeAttributes: MetatypeAttributes[];
  metavariants: MetavariantCatalogEntry[];
  skillList: string[];
  data: CharacterData;
  onChange: (data: CharacterData) => void;
}

export function GrowingUpStep({ rules, metatypeAttributes, metavariants, skillList, data, onChange }: Props) {
  const state = deriveLifepathState(data);
  const growingUpModule = rules.startingModules.find((m) => m.id === "growing-up")!;
  const growingUpOptions = growingUpModule.boosts?.[0]?.from ?? [];
  const growingUpSkills = state.growingUpSkills ?? [];

  function toggleGrowingUpSkill(skill: string) {
    const has = growingUpSkills.includes(skill);
    let next: string[];
    if (has) next = growingUpSkills.filter((s) => s !== skill);
    else if (growingUpSkills.length < 4) next = [...growingUpSkills, skill];
    else return;

    onChange(
      recomputeLifepathData(data, rules, metatypeAttributes, metavariants, skillList, { ...state, growingUpSkills: next })
    );
  }

  return (
    <div className="lifepath-builder">
      <h2>Growing Up: Early Childhood and Adolescence</h2>
      <p className="hint">Choose 4 skills - each is gained at rank 2.</p>
      <div className="chip-row">
        {growingUpOptions.map((skill) => (
          <button
            key={skill}
            className={growingUpSkills.includes(skill) ? "chip selected" : "chip"}
            onClick={() => toggleGrowingUpSkill(skill)}
          >
            {skill}
          </button>
        ))}
      </div>
    </div>
  );
}
