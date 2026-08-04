import type { CharacterData, LifepathSystemState } from "../../../character";
import type { Boost, LifeModule, LifepathRulesResponse, MetatypeAttributes } from "../../../rules";

const AWAKENED_TYPES = [
  "Mundane",
  "Full Magician",
  "Aspected Magician",
  "Mystic Adept",
  "Adept",
  "Emerged",
] as const;

const ADULT_SLOTS = 8;

interface Props {
  rules: LifepathRulesResponse;
  metatypeAttributes: MetatypeAttributes[];
  skillList: string[];
  data: CharacterData;
  onChange: (data: CharacterData) => void;
}

function isBlank(state: LifepathSystemState) {
  return !state.selectedModuleIds;
}

export function LifepathBuilder({ rules, metatypeAttributes, skillList, data, onChange }: Props) {
  const raw = data.systemState as LifepathSystemState;
  const state: LifepathSystemState = isBlank(raw)
    ? { selectedModuleIds: [], choices: {} }
    : raw;

  // ---- Born This Way ----
  const metatypeInfo = data.metatype
    ? metatypeAttributes.find((m) => m.metatype === data.metatype)
    : undefined;

  function applyMetatype(metatype: string) {
    const info = metatypeAttributes.find((m) => m.metatype === metatype);
    if (!info) return;
    const attrs = { ...data.attributes };
    for (const key of ["body", "agility", "reaction", "strength", "willpower", "logic", "intuition", "charisma"] as const) {
      attrs[key] = info[key].max > 6 ? 2 : 1;
    }
    attrs.edge = 1;
    onChange({ ...data, metatype: metatype as CharacterData["metatype"], attributes: attrs });
  }

  function applyAwakenedType(type: string) {
    const attrs = { ...data.attributes };
    delete attrs.magic;
    delete attrs.resonance;
    if (type === "Emerged") attrs.resonance = 1;
    else if (type === "Aspected Magician") attrs.magic = 2;
    else if (["Full Magician", "Mystic Adept", "Adept"].includes(type)) attrs.magic = 1;
    else if (type === "Mundane") attrs.edge = (attrs.edge ?? 1) + 1;
    onChange({ ...data, attributes: attrs, systemState: { ...state, awakenedType: type } });
  }

  // ---- Growing Up ----
  const growingUpModule = rules.startingModules.find((m) => m.id === "growing-up")!;
  const growingUpOptions = growingUpModule.boosts?.[0]?.from ?? [];
  const growingUpSkills = state.growingUpSkills ?? [];

  function toggleGrowingUpSkill(skill: string) {
    const has = growingUpSkills.includes(skill);
    let next: string[];
    if (has) next = growingUpSkills.filter((s) => s !== skill);
    else if (growingUpSkills.length < 4) next = [...growingUpSkills, skill];
    else return;

    const skills = { ...data.skills };
    for (const s of growingUpOptions) {
      if (s === state.comingOfAgeSkill) continue;
      if (next.includes(s)) skills[s] = 2;
      else if (skills[s] === 2) delete skills[s];
    }
    onChange({ ...data, skills, systemState: { ...state, growingUpSkills: next } });
  }

  // ---- Coming of Age ----
  function applyComingOfAgeSkill(skill: string) {
    const skills = { ...data.skills };
    skills[skill] = growingUpSkills.includes(skill) ? 6 : 4;
    onChange({ ...data, skills, systemState: { ...state, comingOfAgeSkill: skill } });
  }

  // ---- Adult modules ----
  const selected = state.selectedModuleIds;
  const canAddMore = selected.length < ADULT_SLOTS;

  function moduleUsageCount(id: string) {
    return selected.filter((s) => s === id).length;
  }

  function addModule(id: string) {
    if (!canAddMore) return;
    if (moduleUsageCount(id) >= 2) return; // "one - and only one - module twice"
    recompute({ ...state, selectedModuleIds: [...selected, id] });
  }

  function removeModuleAt(index: number) {
    const next = [...selected];
    next.splice(index, 1);
    recompute({ ...state, selectedModuleIds: next });
  }

  const allAdult = rules.adultModules;

  // Recompute skills/resources/contactPoints from scratch whenever module
  // selections or their choices change, so it's always consistent instead
  // of drifting via incremental patches.
  function instanceKey(moduleId: string, occurrence: number) {
    return `${moduleId}#${occurrence}`;
  }

  function setChoice(key: string, value: string) {
    recompute({ ...state, choices: { ...state.choices, [key]: value } });
  }

  function recompute(nextState: LifepathSystemState) {
    const attrs = { ...data.attributes };
    const skills = { ...data.skills };
    let nuyen = 0;
    const knowledge: string[] = [];

    const occurrences: Record<string, number> = {};
    for (const id of nextState.selectedModuleIds) {
      occurrences[id] = (occurrences[id] ?? 0) + 1;
      const occurrence = occurrences[id];
      const key = instanceKey(id, occurrence);
      const mod = allAdult.find((m) => m.id === id);
      if (!mod) continue;

      nuyen += mod.resources ?? 0;

      mod.boosts?.forEach((boost, bi) => {
        const picks = boost.count ?? 1;
        for (let p = 0; p < picks; p++) {
          const choiceKey = `${key}:boost:${bi}:${p}`;
          const chosen = nextState.choices[choiceKey] ?? (boost.from.length === 1 ? boost.from[0] : undefined);
          if (!chosen) continue;
          applyBoost(attrs, skills, chosen, boost.amount);
        }
      });

      if (mod.knowledgeChoice) {
        for (let k = 0; k < mod.knowledgeChoice.count; k++) {
          const choiceKey = `${key}:knowledge:${k}`;
          const chosen = nextState.choices[choiceKey];
          if (chosen) knowledge.push(chosen);
        }
      }
    }

    onChange({
      ...data,
      attributes: attrs,
      skills,
      nuyen,
      knowledgeSkills: knowledge,
      systemState: { ...nextState },
    });
  }

  function applyBoost(
    attrs: CharacterData["attributes"],
    skills: Record<string, number>,
    key: string,
    amount: number
  ) {
    const attrKeys = ["body", "agility", "reaction", "strength", "willpower", "logic", "intuition", "charisma", "edge", "magic", "resonance"];
    const attrsRecord = attrs as unknown as Record<string, number>;
    if (attrKeys.includes(key)) {
      attrsRecord[key] = (attrsRecord[key] ?? 0) + amount;
    } else if (key === "any" || key === "any-attribute" || key === "any-special-attribute") {
      // left for the player to resolve manually via the sidebar until a
      // concrete target is picked - no-op here.
    } else {
      skills[key] = (skills[key] ?? 0) + amount;
    }
  }

  return (
    <div className="lifepath-builder">
      <h2>Born This Way</h2>
      <div className="chip-row">
        {metatypeAttributes.map((m) => (
          <button
            key={m.metatype}
            className={data.metatype === m.metatype ? "chip selected" : "chip"}
            onClick={() => applyMetatype(m.metatype)}
          >
            {m.metatype}
          </button>
        ))}
      </div>
      {metatypeInfo && (
        <>
          <div className="chip-row">
            {AWAKENED_TYPES.map((t) => (
              <button
                key={t}
                className={state.awakenedType === t ? "chip selected" : "chip"}
                onClick={() => applyAwakenedType(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="hint">
            Attributes with a racial max above 6 start at 2; everything else starts at 1. Choose 1-2
            inborn qualities and a native language on the summary sheet manually for now.
          </p>
        </>
      )}

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

      <h2>
        Adult Life Modules ({selected.length} / {ADULT_SLOTS})
      </h2>
      <ol className="module-slots">
        {selected.map((id, i) => {
          const mod = allAdult.find((m) => m.id === id)!;
          return (
            <li key={i}>
              <ModuleInstance
                module={mod}
                instanceKey={instanceKey(id, selected.slice(0, i + 1).filter((s) => s === id).length)}
                choices={state.choices}
                skillList={skillList}
                onChoice={setChoice}
                onRemove={() => removeModuleAt(i)}
              />
            </li>
          );
        })}
      </ol>

      {canAddMore && (
        <>
          <h3>Add a module</h3>
          <div className="module-picker">
            {allAdult.map((mod) => (
              <button
                key={mod.id}
                className="chip"
                disabled={moduleUsageCount(mod.id) >= 2}
                onClick={() => addModule(mod.id)}
                title={mod.summary}
              >
                {mod.name}
                {mod.restriction ? ` (${mod.restriction})` : ""}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ModuleInstance({
  module,
  instanceKey,
  choices,
  skillList,
  onChoice,
  onRemove,
}: {
  module: LifeModule;
  instanceKey: string;
  choices: Record<string, string>;
  skillList: string[];
  onChoice: (key: string, value: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="module-instance">
      <div className="module-instance-header">
        <strong>{module.name}</strong>
        <button className="danger" onClick={onRemove}>
          Remove
        </button>
      </div>
      <p className="hint">{module.summary}</p>
      {module.boosts?.map((boost, bi) => (
        <BoostPicker
          key={bi}
          boost={boost}
          instanceKey={instanceKey}
          boostIndex={bi}
          choices={choices}
          skillList={skillList}
          onChoice={onChoice}
        />
      ))}
      {module.knowledgeChoice &&
        Array.from({ length: module.knowledgeChoice.count }).map((_, k) => {
          const key = `${instanceKey}:knowledge:${k}`;
          return (
            <label key={key} className="inline-field">
              Knowledge/Language skill
              <input
                list={`${instanceKey}-knowledge-suggestions`}
                value={choices[key] ?? ""}
                onChange={(e) => onChoice(key, e.target.value)}
                placeholder={module.knowledgeChoice!.suggestions[0] ?? "custom"}
              />
              <datalist id={`${instanceKey}-knowledge-suggestions`}>
                {module.knowledgeChoice!.suggestions.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </label>
          );
        })}
      {module.resources ? <p className="hint">+{module.resources.toLocaleString()}¥</p> : null}
      {module.contactPoints ? (
        <p className="hint">
          +{module.contactPoints} contact points ({module.contactTypes?.join(", ")})
        </p>
      ) : null}
      {module.qualitySlots?.map((q, qi) => (
        <p key={qi} className="hint">
          May take {q.count} {q.polarity} quality{q.note ? ` - ${q.note}` : ""} (add it on the summary
          sheet manually).
        </p>
      ))}
      {module.notes?.map((n, ni) => (
        <p key={ni} className="hint">
          {n}
        </p>
      ))}
    </div>
  );
}

function BoostPicker({
  boost,
  instanceKey,
  boostIndex,
  choices,
  skillList,
  onChoice,
}: {
  boost: Boost;
  instanceKey: string;
  boostIndex: number;
  choices: Record<string, string>;
  skillList: string[];
  onChoice: (key: string, value: string) => void;
}) {
  const picks = boost.count ?? 1;
  const options = boost.from[0] === "any" ? skillList : boost.from;

  return (
    <>
      {Array.from({ length: picks }).map((_, p) => {
        const key = `${instanceKey}:boost:${boostIndex}:${p}`;
        if (options.length === 1) {
          return (
            <p key={key} className="hint">
              +{boost.amount} {options[0]}
            </p>
          );
        }
        return (
          <label key={key} className="inline-field">
            +{boost.amount} to
            <select value={choices[key] ?? ""} onChange={(e) => onChoice(key, e.target.value)}>
              <option value="">choose...</option>
              {options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
        );
      })}
    </>
  );
}
