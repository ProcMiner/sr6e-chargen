import type { CharacterData, LifepathSystemState } from "../../../../character";
import type { LifepathRulesResponse, MetatypeAttributes, MetavariantCatalogEntry } from "../../../../rules";
import { effectiveMetatypeInfo } from "../../../../deriveMetavariant";
import { BASE_ATTR_KEYS, deriveLifepathState, recomputeLifepathData } from "../../../../deriveLifepath";

interface Props {
  rules: LifepathRulesResponse;
  metatypeAttributes: MetatypeAttributes[];
  metavariants: MetavariantCatalogEntry[];
  skillList: string[];
  data: CharacterData;
  onChange: (data: CharacterData) => void;
}

export function ComingOfAgeStep({ rules, metatypeAttributes, metavariants, skillList, data, onChange }: Props) {
  const state = deriveLifepathState(data);
  const metatypeInfo = effectiveMetatypeInfo(data, metatypeAttributes, metavariants);

  function recompute(nextState: LifepathSystemState) {
    onChange(recomputeLifepathData(data, rules, metatypeAttributes, metavariants, skillList, nextState));
  }

  function applyComingOfAgeSkill(skill: string) {
    recompute({ ...state, comingOfAgeSkill: skill });
  }

  function applyComingOfAgeBestAttribute(attribute: string) {
    recompute({ ...state, comingOfAgeBestAttribute: attribute || undefined, comingOfAgeRedirectAttribute: undefined });
  }

  function applyComingOfAgeRedirectAttribute(attribute: string) {
    recompute({ ...state, comingOfAgeRedirectAttribute: attribute || undefined });
  }

  return (
    <div className="lifepath-builder">
      <h2>Coming of Age</h2>
      <p className="hint">Choose your strongest skill - rank 4 (rank 6 if it's also a Growing Up pick).</p>
      <select value={state.comingOfAgeSkill ?? ""} onChange={(e) => applyComingOfAgeSkill(e.target.value)}>
        <option value="">-</option>
        {skillList.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <p className="hint">Choose your best attribute (not Edge, Magic, or Resonance) - it gains +5.</p>
      <select
        value={state.comingOfAgeBestAttribute ?? ""}
        onChange={(e) => applyComingOfAgeBestAttribute(e.target.value)}
      >
        <option value="">-</option>
        {BASE_ATTR_KEYS.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
      {state.comingOfAgeBestAttribute &&
        metatypeInfo &&
        metatypeInfo[state.comingOfAgeBestAttribute as (typeof BASE_ATTR_KEYS)[number]].max === 5 && (
          <>
            <p className="hint">
              Your metatype caps {state.comingOfAgeBestAttribute} at 5, so it's set to 5 instead of +5 -
              redirect the leftover +1 to another attribute.
            </p>
            <select
              value={state.comingOfAgeRedirectAttribute ?? ""}
              onChange={(e) => applyComingOfAgeRedirectAttribute(e.target.value)}
            >
              <option value="">-</option>
              {BASE_ATTR_KEYS.filter((a) => a !== state.comingOfAgeBestAttribute).map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </>
        )}
      <p className="hint">
        Also grants 1-2 qualities (pick them in the Qualities section below), +25,000 nuyen (added once
        you pick a skill above), and 4 contact points toward a contact of any type - spend them in
        Finishing Steps.
      </p>
    </div>
  );
}
