import { useState } from "react";
import { emptyAttributes } from "../../../character";
import type { CharacterData, Contact, LifepathSystemState } from "../../../character";
import type { Boost, LifeModule, LifepathRulesResponse, MetatypeAttributes, MetavariantCatalogEntry } from "../../../rules";
import { effectiveMetatypeInfo, findMetavariant } from "../../../deriveMetavariant";
import { NumberStepper } from "../../../components/NumberStepper";
import { karmaRemaining } from "../../../deriveGear";
import {
  contactsCpSpent,
  contactsKarmaSpent,
  lifepathAvailableContactTypes,
  lifepathContactPointPool,
  withKarmaFundedPoint,
  withRating,
} from "../../../deriveContacts";

const BASE_ATTR_KEYS = [
  "body",
  "agility",
  "reaction",
  "strength",
  "willpower",
  "logic",
  "intuition",
  "charisma",
] as const;

const MENTAL_ATTR_KEYS = ["willpower", "logic", "intuition", "charisma"] as const;
const PHYSICAL_ATTR_KEYS = ["body", "agility", "reaction", "strength"] as const;

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
  metavariants: MetavariantCatalogEntry[];
  skillList: string[];
  data: CharacterData;
  onChange: (data: CharacterData) => void;
}

function isBlank(state: LifepathSystemState) {
  return !state.selectedModuleIds;
}

export function LifepathBuilder({ rules, metatypeAttributes, metavariants, skillList, data, onChange }: Props) {
  const raw = data.systemState as LifepathSystemState;
  const state: LifepathSystemState = isBlank(raw)
    ? { selectedModuleIds: [], choices: {} }
    : raw;
  const { hasMagic, hasResonance } = magicResonancePresence(state.awakenedType);

  // ---- Born This Way ----
  const metatypeInfo = effectiveMetatypeInfo(data, metatypeAttributes, metavariants);
  const selectedMetavariant = findMetavariant(data, metavariants);
  const availableMetavariants = metavariants.filter((m) => m.parentMetatype === data.metatype);

  function applyMetatype(metatype: string) {
    const info = metatypeAttributes.find((m) => m.metatype === metatype);
    if (!info) return;
    recompute(state, metatype, undefined);
  }

  function applyMetavariant(metavariantId: string | undefined) {
    recompute(state, data.metatype, metavariantId);
  }

  function applyAwakenedType(type: string) {
    recompute({ ...state, awakenedType: type });
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

    recompute({ ...state, growingUpSkills: next });
  }

  // ---- Coming of Age ----
  function applyComingOfAgeSkill(skill: string) {
    recompute({ ...state, comingOfAgeSkill: skill });
  }

  function applyComingOfAgeBestAttribute(attribute: string) {
    recompute({ ...state, comingOfAgeBestAttribute: attribute || undefined, comingOfAgeRedirectAttribute: undefined });
  }

  function applyComingOfAgeRedirectAttribute(attribute: string) {
    recompute({ ...state, comingOfAgeRedirectAttribute: attribute || undefined });
  }

  // ---- Adult modules ----
  const selected = state.selectedModuleIds;
  const canAddMore = selected.length < ADULT_SLOTS;

  const [newContactName, setNewContactName] = useState("");
  const [newContactType, setNewContactType] = useState("");

  const [moduleSearch, setModuleSearch] = useState("");
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

  // Contacts (Sixth World Companion p.31): points come entirely from
  // selected life modules (+ Coming of Age's fixed 4), never from Charisma -
  // see deriveContacts.ts. Customization Karma can optionally push a rating
  // further, 1 Karma per point, but never above Charisma.
  const contacts = data.contacts;
  const charisma = data.attributes.charisma;
  const comingOfAgeDone = !!state.comingOfAgeSkill;
  const contactTypes = lifepathAvailableContactTypes(selected, allAdult, comingOfAgeDone);
  const contactPool = lifepathContactPointPool(selected, allAdult, comingOfAgeDone);
  const contactCpSpent = contactsCpSpent(contacts);
  const contactCpRemaining = contactPool - contactCpSpent;
  const contactKarmaBudget = karmaRemaining(data, contactsKarmaSpent(contacts));

  function updateContact(id: string, next: Contact) {
    onChange({ ...data, contacts: contacts.map((c) => (c.id === id ? next : c)) });
  }

  function removeContact(id: string) {
    onChange({ ...data, contacts: contacts.filter((c) => c.id !== id) });
  }

  function addContact() {
    const name = newContactName.trim();
    if (!name || !newContactType || contactCpRemaining < 2) return;
    const contact: Contact = { id: crypto.randomUUID(), name, type: newContactType, connection: 1, loyalty: 1 };
    onChange({ ...data, contacts: [...contacts, contact] });
    setNewContactName("");
  }

  function spendKarmaOnRating(id: string, field: "connection" | "loyalty") {
    const contact = contacts.find((c) => c.id === id);
    if (!contact || contact[field] >= charisma || contactKarmaBudget < 1) return;
    updateContact(id, withKarmaFundedPoint(contact, field));
  }

  // Recompute skills/resources/contactPoints from scratch whenever module
  // selections or their choices change, so it's always consistent instead
  // of drifting via incremental patches.
  function instanceKey(moduleId: string, occurrence: number) {
    return `${moduleId}#${occurrence}`;
  }

  function setChoice(key: string, value: string) {
    recompute({ ...state, choices: { ...state.choices, [key]: value } });
  }

  // Derives the pre-adult-module baseline (metatype attributes, awakened
  // type's magic/resonance/edge, Growing Up skills, Coming of Age skill)
  // from scratch every time, so recompute() never has to treat already-
  // boosted data as its starting point.
  function computeBaseAttributesAndSkills(
    nextState: LifepathSystemState,
    metatype: string | undefined,
    metavariantId: string | undefined
  ) {
    const info = effectiveMetatypeInfo(
      { ...data, metatype: metatype as CharacterData["metatype"], metavariant: metavariantId },
      metatypeAttributes,
      metavariants
    );
    const attrs: CharacterData["attributes"] = { ...emptyAttributes };
    for (const key of BASE_ATTR_KEYS) {
      attrs[key] = info && info[key].max > 6 ? 2 : 1;
    }
    attrs.edge = 1;

    const type = nextState.awakenedType;
    if (type === "Emerged") attrs.resonance = 1;
    else if (type === "Aspected Magician") attrs.magic = 2;
    else if (type && ["Full Magician", "Mystic Adept", "Adept"].includes(type)) attrs.magic = 1;
    else if (type === "Mundane") attrs.edge += 1;

    const skills: Record<string, number> = {};
    const growingUp = nextState.growingUpSkills ?? [];
    for (const s of growingUp) skills[s] = 2;
    if (nextState.comingOfAgeSkill) {
      skills[nextState.comingOfAgeSkill] = growingUp.includes(nextState.comingOfAgeSkill) ? 6 : 4;
    }

    // Coming of Age: "best attribute" gains +5, except metatypes that cap
    // it at 5 - there it's set to 5 instead, and the leftover +1 (which
    // couldn't apply without exceeding that cap) goes to another
    // attribute of the player's choice.
    const best = nextState.comingOfAgeBestAttribute as (typeof BASE_ATTR_KEYS)[number] | undefined;
    if (best && info) {
      if (info[best].max === 5) {
        attrs[best] = 5;
        const redirect = nextState.comingOfAgeRedirectAttribute as (typeof BASE_ATTR_KEYS)[number] | undefined;
        if (redirect && redirect !== best) attrs[redirect] += 1;
      } else {
        attrs[best] += 5;
      }
    }

    return { attrs, skills };
  }

  function recompute(
    nextState: LifepathSystemState,
    metatype: string | undefined = data.metatype,
    metavariantId: string | undefined = data.metavariant
  ) {
    const { attrs, skills } = computeBaseAttributesAndSkills(nextState, metatype, metavariantId);
    const { hasMagic, hasResonance } = magicResonancePresence(nextState.awakenedType);
    // Coming of Age grants +25,000 nuyen; gated on the skill pick since
    // that's this module's primary "have I done this yet" signal.
    let nuyen = nextState.comingOfAgeSkill ? 25_000 : 0;
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
        const options = resolveBoostOptions(boost.from, skillList, hasMagic, hasResonance);
        for (let p = 0; p < picks; p++) {
          const choiceKey = `${key}:boost:${bi}:${p}`;
          const chosen = nextState.choices[choiceKey] ?? (options.length === 1 ? options[0] : undefined);
          if (!chosen) continue;
          // A handful of modules offer a flat +25,000 nuyen as an
          // alternative to one of their attribute/skill choices.
          if (chosen === "nuyen") {
            nuyen += 25_000;
          } else {
            applyBoost(attrs, skills, chosen, boost.amount);
          }
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
      metatype: metatype as CharacterData["metatype"],
      metavariant: metavariantId,
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
    // `key` is always a concrete attribute/skill name by this point -
    // resolveBoostOptions() (see BoostPicker/recompute above) expands every
    // "any-X" placeholder token into real options before a choice is ever
    // stored, so there's nothing left to resolve here.
    const attrKeys = ["body", "agility", "reaction", "strength", "willpower", "logic", "intuition", "charisma", "edge", "magic", "resonance"];
    const attrsRecord = attrs as unknown as Record<string, number>;
    if (attrKeys.includes(key)) {
      attrsRecord[key] = (attrsRecord[key] ?? 0) + amount;
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
      {availableMetavariants.length > 0 && (
        <>
          <h3>Metavariant (optional)</h3>
          <p className="hint">
            Overrides attribute ranges; its Karma cost is deducted from your customization Karma pool
            (see Resources/Karma on the summary sheet).
          </p>
          <div className="chip-row">
            <button
              className={!data.metavariant ? "chip selected" : "chip"}
              onClick={() => applyMetavariant(undefined)}
            >
              Base {data.metatype}
            </button>
            {availableMetavariants.map((m) => (
              <button
                key={m.id}
                className={data.metavariant === m.id ? "chip selected" : "chip"}
                onClick={() => applyMetavariant(m.id)}
                title={m.racialTraits.join(", ")}
              >
                {m.name} ({m.karma} Karma)
              </button>
            ))}
          </div>
          {selectedMetavariant?.karmaNote && <p className="hint">{selectedMetavariant.karmaNote}</p>}
        </>
      )}
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
            inborn qualities in the Qualities section below, and a native language on the summary
            sheet manually for now.
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
      {state.comingOfAgeBestAttribute && metatypeInfo && metatypeInfo[state.comingOfAgeBestAttribute as (typeof BASE_ATTR_KEYS)[number]].max === 5 && (
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
        you pick a skill above), and 4 contact points toward a contact of any type - spend them in the
        Contacts section below.
      </p>

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
                hasMagic={hasMagic}
                hasResonance={hasResonance}
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

      <h2>
        Contacts ({contactCpSpent} / {contactPool} contact points spent)
      </h2>
      <p className="hint">
        Contact points come from your life modules above and Coming of Age, not from Charisma (Companion
        p.31). A new contact costs 2 points (Connection 1 / Loyalty 1); each additional point of
        Connection or Loyalty costs 1 more, up to a hard cap of 8. You can also spend customization Karma
        (1 per point, "+1 (Karma)" below) to push a rating up to your Charisma ({charisma}). The book
        restricts each module's points to contacts matching that module's own type list - this tool
        doesn't enforce that narrower per-module match, so self-adjudicate against the modules you picked
        above.
      </p>
      {contactTypes.length === 0 && (
        <p className="hint">Finish Coming of Age or pick a life module that grants contact points to unlock contact types.</p>
      )}
      {contacts.length > 0 && (
        <ul className="module-slots">
          {contacts.map((c) => (
            <li key={c.id}>
              <div className="module-instance">
                <div className="module-instance-header">
                  <strong>{c.name}</strong>
                  <button className="danger" onClick={() => removeContact(c.id)}>
                    Remove
                  </button>
                </div>
                <label className="inline-field">
                  Type
                  <select value={c.type ?? ""} onChange={(e) => updateContact(c.id, { ...c, type: e.target.value })}>
                    {contactTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="attribute-editor">
                  {(["connection", "loyalty"] as const).map((field) => (
                    <label key={field} className="inline-field">
                      {field === "connection" ? "Connection" : "Loyalty"}
                      <NumberStepper
                        label={`${c.name} ${field}`}
                        min={1}
                        max={Math.min(8, c[field] + contactCpRemaining)}
                        value={c[field]}
                        onChange={(next) => updateContact(c.id, withRating(c, field, next))}
                      />
                      {c[field] < charisma && contactKarmaBudget >= 1 && (
                        <button type="button" className="chip" onClick={() => spendKarmaOnRating(c.id, field)}>
                          +1 (Karma)
                        </button>
                      )}
                      {c.karmaFunded && c.karmaFunded[field] > 0 && (
                        <span className="hint">{c.karmaFunded[field]} Karma-funded</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="inline-field">
        <input
          type="text"
          placeholder="Contact name"
          value={newContactName}
          onChange={(e) => setNewContactName(e.target.value)}
        />
        <select value={newContactType} onChange={(e) => setNewContactType(e.target.value)}>
          <option value="">choose type...</option>
          {contactTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button onClick={addContact} disabled={!newContactName.trim() || !newContactType || contactCpRemaining < 2}>
          Add (2 points)
        </button>
      </div>
    </div>
  );
}

function ModuleInstance({
  module,
  instanceKey,
  choices,
  skillList,
  hasMagic,
  hasResonance,
  onChoice,
  onRemove,
}: {
  module: LifeModule;
  instanceKey: string;
  choices: Record<string, string>;
  skillList: string[];
  hasMagic: boolean;
  hasResonance: boolean;
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
          hasMagic={hasMagic}
          hasResonance={hasResonance}
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

/** Whether the Born This Way awakened type grants a Magic or Resonance attribute - mirrors computeBaseAttributesAndSkills's own magic/resonance assignment above. */
function magicResonancePresence(awakenedType: string | undefined): { hasMagic: boolean; hasResonance: boolean } {
  if (awakenedType === "Emerged") return { hasMagic: false, hasResonance: true };
  if (awakenedType && ["Full Magician", "Mystic Adept", "Adept", "Aspected Magician"].includes(awakenedType)) {
    return { hasMagic: true, hasResonance: false };
  }
  return { hasMagic: false, hasResonance: false };
}

/**
 * Expands a single Boost.from entry into real, pickable attribute/skill
 * names. Most tokens are already concrete (e.g. "edge", "Firearms") and
 * pass through unchanged; a handful of placeholder tokens (see
 * lifepath-modules.ts's header comment) stand in for "any X" and need
 * expanding into the actual list the player can choose from.
 */
function expandBoostToken(token: string, skillList: string[], hasMagic: boolean, hasResonance: boolean): string[] {
  switch (token) {
    case "any":
      return skillList;
    case "any-attribute":
      return [...BASE_ATTR_KEYS];
    case "any-special-attribute": {
      const specials: string[] = ["edge"];
      if (hasMagic) specials.push("magic");
      if (hasResonance) specials.push("resonance");
      return specials;
    }
    case "any-mental-attribute":
      return [...MENTAL_ATTR_KEYS];
    case "any-physical-attribute":
      return [...PHYSICAL_ATTR_KEYS];
    case "any-skill-or-attribute":
      return [...skillList, ...BASE_ATTR_KEYS];
    default:
      return [token];
  }
}

/** Expands every token in a Boost.from array and dedupes the result - a module can mix concrete names and placeholder tokens in one choice (e.g. "any-attribute" alongside "any-special-attribute"). */
function resolveBoostOptions(from: string[], skillList: string[], hasMagic: boolean, hasResonance: boolean): string[] {
  const seen = new Set<string>();
  const options: string[] = [];
  for (const token of from) {
    for (const option of expandBoostToken(token, skillList, hasMagic, hasResonance)) {
      if (!seen.has(option)) {
        seen.add(option);
        options.push(option);
      }
    }
  }
  return options;
}

function BoostPicker({
  boost,
  instanceKey,
  boostIndex,
  choices,
  skillList,
  hasMagic,
  hasResonance,
  onChoice,
}: {
  boost: Boost;
  instanceKey: string;
  boostIndex: number;
  choices: Record<string, string>;
  skillList: string[];
  hasMagic: boolean;
  hasResonance: boolean;
  onChoice: (key: string, value: string) => void;
}) {
  const picks = boost.count ?? 1;
  const options = resolveBoostOptions(boost.from, skillList, hasMagic, hasResonance);

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
