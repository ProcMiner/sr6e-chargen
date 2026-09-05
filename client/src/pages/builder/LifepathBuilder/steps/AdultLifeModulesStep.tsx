import { useState } from "react";
import type { CharacterData, KnowledgeSkillLine, LifepathSystemState } from "../../../../character";
import type { Boost, LifeModule, LifepathRulesResponse, MetatypeAttributes, MetavariantCatalogEntry } from "../../../../rules";
import { MAX_PURCHASABLE_LANGUAGE_LEVEL } from "../../../../deriveKnowledge";
import { effectiveMetatypeInfo } from "../../../../deriveMetavariant";
import {
  adultSlots,
  computeBoostOverflow,
  deriveLifepathState,
  eligibleRedirectAttributes,
  instanceKey,
  magicResonancePresence,
  recomputeLifepathData,
  resolveBoostOptions,
} from "../../../../deriveLifepath";

interface Props {
  rules: LifepathRulesResponse;
  metatypeAttributes: MetatypeAttributes[];
  metavariants: MetavariantCatalogEntry[];
  skillList: string[];
  data: CharacterData;
  onChange: (data: CharacterData) => void;
}

export function AdultLifeModulesStep({ rules, metatypeAttributes, metavariants, skillList, data, onChange }: Props) {
  const state = deriveLifepathState(data);
  const { hasMagic, hasResonance } = magicResonancePresence(state.awakenedType);
  const [moduleSearch, setModuleSearch] = useState("");
  const metatypeInfo = effectiveMetatypeInfo(data, metatypeAttributes, metavariants);
  // Which boost choices got clamped at their metatype/Edge cap this render,
  // keyed the same as state.choices - drives the "redirect leftover to..."
  // picker in BoostPicker below (this app's house rule for the Life Path
  // system's uncovered "every option is already maxed" case).
  const boostOverflow = computeBoostOverflow(data, rules, metatypeAttributes, metavariants, skillList, state);

  function recompute(nextState: LifepathSystemState) {
    onChange(recomputeLifepathData(data, rules, metatypeAttributes, metavariants, skillList, nextState));
  }

  const selected = state.selectedModuleIds;
  const slots = adultSlots(state);
  const canAddMore = selected.length < slots;

  function setPowerLevel(next: LifepathSystemState["powerLevel"]) {
    recompute({ ...state, powerLevel: next });
  }

  const moduleSearchTerm = moduleSearch.trim().toLowerCase();
  function matchesModuleSearch(mod: LifeModule) {
    if (!moduleSearchTerm) return true;
    return mod.name.toLowerCase().includes(moduleSearchTerm) || mod.summary.toLowerCase().includes(moduleSearchTerm);
  }

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
  const choiceModules = allAdult.filter((m) => m.category === "choice").filter(matchesModuleSearch);
  const eventModules = allAdult.filter((m) => m.category === "event").filter(matchesModuleSearch);

  function setChoice(key: string, value: string) {
    recompute({ ...state, choices: { ...state.choices, [key]: value } });
  }

  function setKnowledgeChoice(key: string, type: "knowledge" | "language", name: string) {
    recompute({ ...state, knowledgeChoices: { ...state.knowledgeChoices, [key]: { type, name } } });
  }

  // Every language already picked in an earlier knowledgeChoice slot,
  // offered as suggestions so choosing the same name again reads as "level
  // this up" rather than the player having to remember it by heart.
  const existingLanguages = data.knowledgeSkills.filter((k) => k.type === "language");

  return (
    <div className="lifepath-builder">
      <h2>
        Adult Life Modules ({selected.length} / {slots})
      </h2>
      <p className="hint">
        Optional power level (Sixth World Companion p.16, "Elite"): choose ten adult life modules instead of
        eight, representing high-level corporate operatives, celebrities, and executives. The book also lifts
        gear Availability restrictions for elite characters, but this app has never enforced Availability as a
        chargen restriction for anyone (it only governs finding a seller via Contacts once play has started,
        which this app doesn't simulate) - so there's nothing further to unlock there.
      </p>
      <div className="chip-row">
        <button className={!state.powerLevel ? "chip selected" : "chip"} onClick={() => setPowerLevel(undefined)}>
          Standard (8 modules)
        </button>
        <button className={state.powerLevel === "elite" ? "chip selected" : "chip"} onClick={() => setPowerLevel("elite")}>
          Elite (10 modules)
        </button>
      </div>
      <ol className="module-slots">
        {selected.map((id, i) => {
          const mod = allAdult.find((m) => m.id === id)!;
          return (
            <li key={i}>
              <ModuleInstance
                module={mod}
                instanceKey={instanceKey(id, selected.slice(0, i + 1).filter((s) => s === id).length)}
                choices={state.choices}
                knowledgeChoices={state.knowledgeChoices ?? {}}
                existingLanguages={existingLanguages}
                skillList={skillList}
                hasMagic={hasMagic}
                hasResonance={hasResonance}
                attrs={data.attributes as unknown as Record<string, number>}
                metatypeInfo={metatypeInfo}
                boostOverflow={boostOverflow}
                onChoice={setChoice}
                onKnowledgeChoice={setKnowledgeChoice}
                onRemove={() => removeModuleAt(i)}
              />
            </li>
          );
        })}
      </ol>

      {canAddMore && (
        <>
          <h3>Add a module</h3>
          <input
            type="text"
            className="picker-search"
            value={moduleSearch}
            onChange={(e) => setModuleSearch(e.target.value)}
            placeholder="Search modules by name or description..."
            aria-label="Search modules"
          />

          <details className="quality-section" open>
            <summary>Choices</summary>
            <div className="module-picker">
              {choiceModules.map((mod) => (
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
              {moduleSearchTerm && choiceModules.length === 0 && (
                <p className="hint">No Choices modules match "{moduleSearch}".</p>
              )}
            </div>
          </details>

          <details className="quality-section" open>
            <summary>Events</summary>
            <div className="module-picker">
              {eventModules.map((mod) => (
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
              {moduleSearchTerm && eventModules.length === 0 && (
                <p className="hint">No Event modules match "{moduleSearch}".</p>
              )}
            </div>
          </details>
        </>
      )}
    </div>
  );
}

function ModuleInstance({
  module,
  instanceKey,
  choices,
  knowledgeChoices,
  existingLanguages,
  skillList,
  hasMagic,
  hasResonance,
  attrs,
  metatypeInfo,
  boostOverflow,
  onChoice,
  onKnowledgeChoice,
  onRemove,
}: {
  module: LifeModule;
  instanceKey: string;
  choices: Record<string, string>;
  knowledgeChoices: Record<string, { type: "knowledge" | "language"; name: string }>;
  existingLanguages: KnowledgeSkillLine[];
  skillList: string[];
  hasMagic: boolean;
  hasResonance: boolean;
  attrs: Record<string, number>;
  metatypeInfo: MetatypeAttributes | undefined;
  boostOverflow: Record<string, number>;
  onChoice: (key: string, value: string) => void;
  onKnowledgeChoice: (key: string, type: "knowledge" | "language", name: string) => void;
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
          hasMagic={hasMagic}
          hasResonance={hasResonance}
          attrs={attrs}
          metatypeInfo={metatypeInfo}
          boostOverflow={boostOverflow}
          onChoice={onChoice}
        />
      ))}
      {module.knowledgeChoice &&
        Array.from({ length: module.knowledgeChoice.count }).map((_, k) => {
          const key = `${instanceKey}:knowledge:${k}`;
          // Legacy fallback mirrors recomputeLifepathData()'s
          // resolveKnowledgeChoice - an older save's plain-string pick
          // still shows up here as a knowledge topic instead of appearing
          // blank.
          const chosen = knowledgeChoices[key] ?? (choices[key] ? { type: "knowledge" as const, name: choices[key] } : undefined);
          const type = chosen?.type ?? "knowledge";
          const name = chosen?.name ?? "";
          const allowsLanguage = module.knowledgeChoice!.allowsLanguage;
          const matchedLanguage =
            type === "language" ? existingLanguages.find((l) => l.name.toLowerCase() === name.toLowerCase()) : undefined;
          // Suggestions render as clickable chips rather than a native
          // <input list>/<datalist> - that combination was reported as
          // unresponsive to typing on at least two testers' real browsers
          // (unreproducible in-house, but the datalist wiring was the one
          // thing this field had that a plain contact-name input doesn't),
          // so it's replaced outright rather than chased further.
          const suggestions = type === "language" ? existingLanguages.map((l) => l.name) : module.knowledgeChoice!.suggestions;
          return (
            <div key={key}>
              <div className="inline-field">
                {allowsLanguage && (
                  <select value={type} onChange={(e) => onKnowledgeChoice(key, e.target.value as "knowledge" | "language", name)}>
                    <option value="knowledge">Knowledge</option>
                    <option value="language">Language</option>
                  </select>
                )}
                <input
                  value={name}
                  onChange={(e) => onKnowledgeChoice(key, type, e.target.value)}
                  placeholder={type === "language" ? "Language name" : "custom"}
                />
                {matchedLanguage && (
                  <span className="hint">
                    levels up an existing language (currently {matchedLanguage.level ?? 1}/{MAX_PURCHASABLE_LANGUAGE_LEVEL})
                  </span>
                )}
              </div>
              {suggestions.length > 0 && (
                <div className="chip-row">
                  {suggestions.map((s) => (
                    <button key={s} type="button" className="chip" onClick={() => onKnowledgeChoice(key, type, s)}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
          May take {q.count} {q.polarity} quality{q.note ? ` - ${q.note}` : ""} (pick it in the
          Qualities section below).
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
  hasMagic,
  hasResonance,
  attrs,
  metatypeInfo,
  boostOverflow,
  onChoice,
}: {
  boost: Boost;
  instanceKey: string;
  boostIndex: number;
  choices: Record<string, string>;
  skillList: string[];
  hasMagic: boolean;
  hasResonance: boolean;
  attrs: Record<string, number>;
  metatypeInfo: MetatypeAttributes | undefined;
  boostOverflow: Record<string, number>;
  onChoice: (key: string, value: string) => void;
}) {
  const picks = boost.count ?? 1;
  const options = resolveBoostOptions(boost.from, skillList, hasMagic, hasResonance);

  return (
    <>
      {Array.from({ length: picks }).map((_, p) => {
        const key = `${instanceKey}:boost:${boostIndex}:${p}`;
        const leftover = boostOverflow[key] ?? 0;
        const redirectPicker = leftover > 0 && (
          <RedirectPicker key={`${key}:redirect`} choiceKey={key} leftover={leftover} attrs={attrs} metatypeInfo={metatypeInfo} choices={choices} onChoice={onChoice} />
        );
        if (options.length === 1) {
          return (
            <div key={key}>
              <p className="hint">
                +{boost.amount} {options[0]}
              </p>
              {redirectPicker}
            </div>
          );
        }
        return (
          <div key={key}>
            <label className="inline-field">
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
            {redirectPicker}
          </div>
        );
      })}
    </>
  );
}

/**
 * Shown when a boost choice is already at its metatype/Edge cap and some of
 * its points couldn't apply - lets the player send the leftover to another
 * eligible attribute instead of it silently vanishing over the cap (house
 * rule; see eligibleRedirectAttributes' comment in deriveLifepath.ts).
 */
function RedirectPicker({
  choiceKey,
  leftover,
  attrs,
  metatypeInfo,
  choices,
  onChoice,
}: {
  choiceKey: string;
  leftover: number;
  attrs: Record<string, number>;
  metatypeInfo: MetatypeAttributes | undefined;
  choices: Record<string, string>;
  onChoice: (key: string, value: string) => void;
}) {
  const redirectKey = `${choiceKey}:redirect`;
  const options = eligibleRedirectAttributes(attrs, metatypeInfo, leftover);
  return (
    <label className="inline-field">
      <span className="hint">
        {leftover} point{leftover === 1 ? "" : "s"} already at cap - redirect to
      </span>
      <select value={choices[redirectKey] ?? ""} onChange={(e) => onChoice(redirectKey, e.target.value)}>
        <option value="">choose...</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
