import { useState } from "react";
import type { CharacterData, Contact, KnowledgeSkillLine, LanguageLevel, PrioritySystemState, SkillSpecialization } from "../../../character";
import { LANGUAGE_LEVEL_NAMES } from "../../../character";
import type { PriorityLetter, PriorityRulesResponse } from "../../../rules";
import { NumberStepper } from "../../../components/NumberStepper";
import { effectiveMetatypeInfo, findMetavariant } from "../../../deriveMetavariant";
import { SKILL_SPECIALIZATION_SUGGESTIONS } from "../../../deriveSpecializations";
import { contactsCostTotal, priorityContactPointPool, withRating } from "../../../deriveContacts";
import { MAX_PURCHASABLE_LANGUAGE_LEVEL, knowledgeSlotsSpent, priorityKnowledgeSlotPool } from "../../../deriveKnowledge";

const PURCHASABLE_LANGUAGE_LEVELS: LanguageLevel[] = Array.from(
  { length: MAX_PURCHASABLE_LANGUAGE_LEVEL },
  (_, i) => (i + 1) as LanguageLevel
);

const LETTERS: PriorityLetter[] = ["A", "B", "C", "D", "E"];
const CATEGORIES = [
  ["metatype", "Metatype"],
  ["attributes", "Attributes"],
  ["skills", "Skills"],
  ["magic", "Magic or Resonance"],
  ["resources", "Resources"],
] as const;

// Edge is deliberately excluded here: per the core rulebook (p. 63), Edge
// is funded entirely by Metatype Adjustment Points, not the Attributes
// priority's point pool.
const CORE_ATTRIBUTE_KEYS = [
  "body",
  "agility",
  "reaction",
  "strength",
  "willpower",
  "logic",
  "intuition",
  "charisma",
] as const;

interface Props {
  rules: PriorityRulesResponse;
  data: CharacterData;
  onChange: (data: CharacterData) => void;
}

export function PriorityBuilder({ rules, data, onChange }: Props) {
  const [specSkill, setSpecSkill] = useState(rules.skillList[0] ?? "");
  const [specFocus, setSpecFocus] = useState("");
  const [newContactName, setNewContactName] = useState("");
  const [newKnowledgeName, setNewKnowledgeName] = useState("");
  const [newKnowledgeType, setNewKnowledgeType] = useState<"knowledge" | "language">("knowledge");

  const state = (data.systemState as PrioritySystemState)?.priorities
    ? (data.systemState as PrioritySystemState)
    : { priorities: {} };

  function setPriorities(next: PrioritySystemState["priorities"]) {
    onChange({ ...data, systemState: { ...state, priorities: next } });
  }

  function usedLetters(exceptCategory?: string) {
    return new Set(
      Object.entries(state.priorities)
        .filter(([cat]) => cat !== exceptCategory)
        .map(([, letter]) => letter)
        .filter(Boolean)
    );
  }

  const metatypeRow = rules.priorityTable.find((r) => r.priority === state.priorities.metatype);
  const attributeRow = rules.priorityTable.find((r) => r.priority === state.priorities.attributes);
  const skillRow = rules.priorityTable.find((r) => r.priority === state.priorities.skills);
  const magicRow = rules.priorityTable.find((r) => r.priority === state.priorities.magic);
  const resourcesRow = rules.priorityTable.find((r) => r.priority === state.priorities.resources);

  const metatypeInfo = effectiveMetatypeInfo(data, rules.metatypeAttributes, rules.metavariants);
  const selectedMetavariant = findMetavariant(data, rules.metavariants);
  const metatypePriorityLetter = state.priorities.metatype;
  const availableMetavariants = rules.metavariants.filter(
    (m) =>
      m.parentMetatype === data.metatype &&
      (!metatypePriorityLetter || m.adjustmentPoints[metatypePriorityLetter] !== undefined)
  );

  // Normal attribute points can only raise a core attribute up to 6, even
  // if the metatype's max is higher - anything above 6 ("special racial
  // attributes" per p. 63) draws from Adjustment Points instead.
  function normalCap(key: (typeof CORE_ATTRIBUTE_KEYS)[number]) {
    return metatypeInfo ? Math.min(6, metatypeInfo[key].max) : 6;
  }

  function isSpecialAttribute(key: (typeof CORE_ATTRIBUTE_KEYS)[number]) {
    return !!metatypeInfo && metatypeInfo[key].max > 6;
  }

  // House rule (not RAW - see PrioritySystemState.adjustmentFundedAttributes):
  // a special racial attribute can optionally be funded entirely from
  // Adjustment Points instead of splitting 1-6 across Attribute Points and
  // the excess across Adjustment Points, freeing Attribute Points for other
  // attributes. RAW's Adjustment Points pool otherwise has no other sink
  // once Edge/Magic/Resonance are covered, so high-Adjustment-Point
  // metatypes (Troll, Ork, Dwarf) can end up with unspendable leftovers.
  const adjustmentFundedAttributes = state.adjustmentFundedAttributes ?? [];
  function isAdjustmentFunded(key: (typeof CORE_ATTRIBUTE_KEYS)[number]) {
    return adjustmentFundedAttributes.includes(key);
  }
  function toggleAdjustmentFunding(key: (typeof CORE_ATTRIBUTE_KEYS)[number]) {
    const next = isAdjustmentFunded(key)
      ? adjustmentFundedAttributes.filter((k) => k !== key)
      : [...adjustmentFundedAttributes, key];
    onChange({ ...data, systemState: { ...state, adjustmentFundedAttributes: next } });
  }

  const attributePointsSpent = CORE_ATTRIBUTE_KEYS.reduce((sum, key) => {
    if (isSpecialAttribute(key) && isAdjustmentFunded(key)) return sum;
    return sum + (Math.min(data.attributes[key], normalCap(key)) - 1);
  }, 0);
  const attributePointsTotal = attributeRow?.attributePoints ?? 0;
  const attributePointsRemaining = attributePointsTotal - attributePointsSpent;

  // A specialization costs the same as one rank of a skill (p. 65-66), so
  // it draws from the same skill-point budget as raising a skill's rank.
  const specializations = data.specializations ?? [];
  const skillPointsSpent =
    Object.values(data.skills).reduce((sum, v) => sum + v, 0) + specializations.length;
  const skillPointsRemaining = (skillRow?.skillPoints ?? 0) - skillPointsSpent;

  // Priority chargen allows one specialization per skill (core p. 65-66:
  // "You cannot acquire more than one specialization in a skill at
  // character creation") - no expertise, ever, at chargen in either build
  // system.
  function canAddSpecializationAtChargen(skill: string): boolean {
    return (data.skills[skill] ?? 0) >= 1 && !specializations.some((s) => s.skill === skill);
  }

  function addSpecialization() {
    const focus = specFocus.trim();
    if (!focus || !canAddSpecializationAtChargen(specSkill) || skillPointsRemaining < 1) return;
    const entry: SkillSpecialization = { id: crypto.randomUUID(), skill: specSkill, focus, tier: "specialization" };
    onChange({ ...data, specializations: [...specializations, entry] });
    setSpecFocus("");
  }

  function removeSpecialization(id: string) {
    onChange({ ...data, specializations: specializations.filter((s) => s.id !== id) });
  }

  // Adjustment Points (from the Metatype priority) fund three things:
  // Edge, pushing a "special racial attribute" above 6, and boosting
  // Magic/Resonance above its base rating - up to a hard cap of 6 (p. 65).
  // (Plus, under the house rule above, the full cost of any special
  // attribute toggled to Adjustment-funding.)
  const adjustmentPointsTotal = selectedMetavariant
    ? (metatypePriorityLetter && selectedMetavariant.adjustmentPoints[metatypePriorityLetter]) || 0
    : (metatypeRow?.metatype.find((m) => m.metatype === data.metatype)?.adjustmentPoints ?? 0);

  const edgeSpent = (data.attributes.edge ?? 1) - 1;

  const racialAdjustmentSpent = metatypeInfo
    ? CORE_ATTRIBUTE_KEYS.reduce((sum, key) => {
        if (!isSpecialAttribute(key)) return sum;
        if (isAdjustmentFunded(key)) return sum + (data.attributes[key] - 1);
        return sum + Math.max(0, data.attributes[key] - 6);
      }, 0)
    : 0;

  const selectedMagicOption = state.magicOption
    ? magicRow?.magic.find((m) => m.option === state.magicOption)
    : undefined;
  const magicBaseRating = selectedMagicOption?.rating ?? 0;
  const magicIsResonance = selectedMagicOption?.option === "Technomancer";
  const currentMagicOrResonance = magicIsResonance
    ? (data.attributes.resonance ?? 0)
    : (data.attributes.magic ?? 0);
  const magicBoostSpent =
    selectedMagicOption && selectedMagicOption.option !== "Mundane"
      ? Math.max(0, currentMagicOrResonance - magicBaseRating)
      : 0;

  const adjustmentPointsSpent = edgeSpent + racialAdjustmentSpent + magicBoostSpent;
  const adjustmentPointsRemaining = adjustmentPointsTotal - adjustmentPointsSpent;

  // Contacts (core rulebook p.66-67): Charisma x 6 points shared across
  // every contact's Connection + Loyalty, no individual rating above
  // Charisma. See deriveContacts.ts for why there's no separate "number of
  // contacts" cap - it's just a consequence of the pool size.
  const contacts = data.contacts;
  const charisma = data.attributes.charisma;
  const contactPool = priorityContactPointPool(charisma);
  const contactPointsSpent = contactsCostTotal(contacts);
  const contactPointsRemaining = contactPool - contactPointsSpent;

  function updateContact(id: string, next: Contact) {
    onChange({ ...data, contacts: contacts.map((c) => (c.id === id ? next : c)) });
  }

  function removeContact(id: string) {
    onChange({ ...data, contacts: contacts.filter((c) => c.id !== id) });
  }

  function addContact() {
    const name = newContactName.trim();
    if (!name || contactPointsRemaining < 2) return;
    const contact: Contact = { id: crypto.randomUUID(), name, connection: 1, loyalty: 1 };
    onChange({ ...data, contacts: [...contacts, contact] });
    setNewContactName("");
  }

  // Knowledge & Language skills (core rulebook p.67, p.97-99): a free pool
  // of Logic slots, plus one free Native language granted outside that pool
  // (see deriveKnowledge.ts). Life Path doesn't get this pool at all - its
  // knowledge/language skills come entirely from life module choices.
  const knowledgeSkills = data.knowledgeSkills;
  const knowledgePool = priorityKnowledgeSlotPool(data.attributes.logic);
  const knowledgeSlotsUsed = knowledgeSlotsSpent(knowledgeSkills);
  const knowledgeSlotsRemaining = knowledgePool - knowledgeSlotsUsed;

  function updateKnowledgeLine(id: string, next: KnowledgeSkillLine) {
    onChange({ ...data, knowledgeSkills: knowledgeSkills.map((k) => (k.id === id ? next : k)) });
  }

  function removeKnowledgeLine(id: string) {
    onChange({ ...data, knowledgeSkills: knowledgeSkills.filter((k) => k.id !== id) });
  }

  function addKnowledgeLine() {
    const name = newKnowledgeName.trim();
    if (!name || knowledgeSlotsRemaining < 1) return;
    const line: KnowledgeSkillLine =
      newKnowledgeType === "language"
        ? { id: crypto.randomUUID(), name, type: "language", level: 1 }
        : { id: crypto.randomUUID(), name, type: "knowledge" };
    onChange({ ...data, knowledgeSkills: [...knowledgeSkills, line] });
    setNewKnowledgeName("");
  }

  function setLanguageLevel(id: string, level: LanguageLevel) {
    const line = knowledgeSkills.find((k) => k.id === id);
    if (!line) return;
    const delta = level - (line.level ?? 1);
    if (delta > 0 && delta > knowledgeSlotsRemaining) return;
    updateKnowledgeLine(id, { ...line, level });
  }

  return (
    <div className="priority-builder">
      <h2>Priority Assignment</h2>
      <table className="priority-assign-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          {CATEGORIES.map(([key, label]) => {
            const used = usedLetters(key);
            const current = state.priorities[key];
            return (
              <tr key={key}>
                <td>{label}</td>
                <td>
                  <select
                    value={current ?? ""}
                    onChange={(e) =>
                      setPriorities({ ...state.priorities, [key]: e.target.value || undefined })
                    }
                  >
                    <option value="">-</option>
                    {LETTERS.map((letter) => (
                      <option key={letter} value={letter} disabled={used.has(letter) && letter !== current}>
                        {letter}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {metatypeRow && (
        <section>
          <h3>Metatype</h3>
          <div className="chip-row">
            {metatypeRow.metatype.map((m) => (
              <button
                key={m.metatype}
                className={data.metatype === m.metatype ? "chip selected" : "chip"}
                onClick={() => onChange({ ...data, metatype: m.metatype, metavariant: undefined })}
              >
                {m.metatype} ({m.adjustmentPoints} adj. pts)
              </button>
            ))}
          </div>
          {availableMetavariants.length > 0 && (
            <>
              <h4>Metavariant (optional)</h4>
              <p className="hint">
                Overrides attribute ranges and Adjustment Points; its Karma cost is deducted from your
                customization Karma pool (see Resources/Karma below).
              </p>
              <div className="chip-row">
                <button
                  className={!data.metavariant ? "chip selected" : "chip"}
                  onClick={() => onChange({ ...data, metavariant: undefined })}
                >
                  Base {data.metatype}
                </button>
                {availableMetavariants.map((m) => (
                  <button
                    key={m.id}
                    className={data.metavariant === m.id ? "chip selected" : "chip"}
                    onClick={() => onChange({ ...data, metavariant: m.id })}
                    title={m.racialTraits.join(", ")}
                  >
                    {m.name} ({m.karma} Karma
                    {metatypePriorityLetter ? `, ${m.adjustmentPoints[metatypePriorityLetter]} adj. pts` : ""})
                  </button>
                ))}
              </div>
              {selectedMetavariant?.karmaNote && <p className="hint">{selectedMetavariant.karmaNote}</p>}
            </>
          )}
        </section>
      )}

      {attributeRow && metatypeInfo && (
        <section>
          <h3>
            Attributes ({attributePointsRemaining} / {attributePointsTotal} points remaining)
          </h3>
          <p className="hint">
            Values above 6 are "special racial attributes" and are normally paid for from Adjustment
            Points (below) past 6 only. House rule: check "fund from Adjustment Points" on a special
            attribute to pay for its full value from Adjustment Points instead, freeing these points
            for other attributes.
          </p>
          <div className="attribute-editor">
            {CORE_ATTRIBUTE_KEYS.map((key) => {
              const range = metatypeInfo[key];
              const value = data.attributes[key];
              return (
                <div key={key} className="attribute-editor-row">
                  <label>
                    {key}
                    <NumberStepper
                      label={key}
                      min={range.min}
                      max={range.max}
                      value={value}
                      onChange={(next) =>
                        onChange({
                          ...data,
                          attributes: { ...data.attributes, [key]: next },
                        })
                      }
                    />
                    <span className="range-hint">
                      {range.min}-{range.max}
                    </span>
                  </label>
                  {isSpecialAttribute(key) && (
                    <label className="inline-field">
                      <input
                        type="checkbox"
                        checked={isAdjustmentFunded(key)}
                        onChange={() => toggleAdjustmentFunding(key)}
                      />
                      fund from Adjustment Points
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {skillRow && (
        <section>
          <h3>
            Skills ({skillPointsRemaining} / {skillRow.skillPoints} points remaining)
          </h3>
          <div className="skill-editor">
            {rules.skillList.map((skill) => (
              <label key={skill}>
                {skill}
                <NumberStepper
                  label={skill}
                  min={0}
                  max={6}
                  value={data.skills[skill] ?? 0}
                  onChange={(next) => onChange({ ...data, skills: { ...data.skills, [skill]: next } })}
                />
              </label>
            ))}
          </div>

          <h4>Specializations</h4>
          <p className="hint">
            One skill point each, one per skill at character creation ("+2 dice on tests in that area" - core p.
            92). Expertise (upgrading to +3) can only be bought after creation, during play.
          </p>
          {specializations.length > 0 && (
            <ul className="module-slots">
              {specializations.map((s) => (
                <li key={s.id}>
                  <div className="module-instance">
                    <div className="module-instance-header">
                      <strong>
                        {s.skill}: {s.focus}
                      </strong>
                      <button className="danger" onClick={() => removeSpecialization(s.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="inline-field">
            <select value={specSkill} onChange={(e) => setSpecSkill(e.target.value)}>
              {rules.skillList.map((skill) => (
                <option key={skill} value={skill} disabled={!canAddSpecializationAtChargen(skill)}>
                  {skill}
                </option>
              ))}
            </select>
            <input
              type="text"
              list="priority-specialization-suggestions"
              placeholder="Focus (e.g. Light Pistols)"
              value={specFocus}
              onChange={(e) => setSpecFocus(e.target.value)}
            />
            <datalist id="priority-specialization-suggestions">
              {(SKILL_SPECIALIZATION_SUGGESTIONS[specSkill] ?? []).map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            <button
              onClick={addSpecialization}
              disabled={!specFocus.trim() || !canAddSpecializationAtChargen(specSkill) || skillPointsRemaining < 1}
            >
              Add
            </button>
          </div>
        </section>
      )}

      {magicRow && (
        <section>
          <h3>Magic or Resonance</h3>
          <div className="chip-row">
            {magicRow.magic.map((m) => (
              <button
                key={m.option}
                className={state.magicOption === m.option ? "chip selected" : "chip"}
                onClick={() => {
                  const attrs = { ...data.attributes };
                  delete attrs.magic;
                  delete attrs.resonance;
                  if (m.option === "Technomancer") attrs.resonance = m.rating;
                  else if (m.option !== "Mundane") attrs.magic = m.rating;
                  onChange({
                    ...data,
                    attributes: attrs,
                    systemState: { ...state, magicOption: m.option },
                  });
                }}
              >
                {m.option}
                {m.rating ? ` (${m.rating})` : ""}
              </button>
            ))}
          </div>
        </section>
      )}

      {metatypeRow && metatypeInfo && (
        <section>
          <h3>
            Adjustment Points ({adjustmentPointsRemaining} / {adjustmentPointsTotal} points remaining)
          </h3>
          <p className="hint">
            Spent on Edge, on pushing a special racial attribute (above) past 6 - or its full value if
            "fund from Adjustment Points" is checked - and on boosting Magic/Resonance above its base
            rating (up to 6).
          </p>
          <div className="attribute-editor">
            <label>
              edge
              <NumberStepper
                label="edge"
                min={metatypeInfo.edge.min}
                max={metatypeInfo.edge.max}
                value={data.attributes.edge}
                onChange={(next) => onChange({ ...data, attributes: { ...data.attributes, edge: next } })}
              />
              <span className="range-hint">
                {metatypeInfo.edge.min}-{metatypeInfo.edge.max}
              </span>
            </label>
            {selectedMagicOption && selectedMagicOption.option !== "Mundane" && (
              <label>
                {magicIsResonance ? "resonance" : "magic"}
                <NumberStepper
                  label={magicIsResonance ? "resonance" : "magic"}
                  min={magicBaseRating}
                  max={6}
                  value={currentMagicOrResonance}
                  onChange={(next) =>
                    onChange({
                      ...data,
                      attributes: {
                        ...data.attributes,
                        [magicIsResonance ? "resonance" : "magic"]: next,
                      },
                    })
                  }
                />
                <span className="range-hint">{magicBaseRating}-6</span>
              </label>
            )}
          </div>
        </section>
      )}

      {resourcesRow && (
        <section>
          <h3>Resources</h3>
          <p>{resourcesRow.resources.toLocaleString()}¥ starting nuyen.</p>
          {data.nuyen !== resourcesRow.resources && (
            <button onClick={() => onChange({ ...data, nuyen: resourcesRow.resources })}>
              Apply {resourcesRow.resources.toLocaleString()}¥
            </button>
          )}
        </section>
      )}

      <section>
        <h3>
          Contacts ({contactPointsSpent} / {contactPool} points spent)
        </h3>
        <p className="hint">
          Charisma x 6 points to spend on Connection + Loyalty across all your contacts (core rulebook
          p.66-67). No single rating may exceed your Charisma ({charisma}).
        </p>
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
                  <div className="attribute-editor">
                    <label>
                      Connection
                      <NumberStepper
                        label={`${c.name} Connection`}
                        min={1}
                        max={Math.min(charisma, c.connection + contactPointsRemaining)}
                        value={c.connection}
                        onChange={(next) => updateContact(c.id, withRating(c, "connection", next))}
                      />
                    </label>
                    <label>
                      Loyalty
                      <NumberStepper
                        label={`${c.name} Loyalty`}
                        min={1}
                        max={Math.min(charisma, c.loyalty + contactPointsRemaining)}
                        value={c.loyalty}
                        onChange={(next) => updateContact(c.id, withRating(c, "loyalty", next))}
                      />
                    </label>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="inline-field">
          <input
            type="text"
            placeholder="Contact name (e.g. Johnny Two-Fingers, Fixer)"
            value={newContactName}
            onChange={(e) => setNewContactName(e.target.value)}
          />
          <button onClick={addContact} disabled={!newContactName.trim() || contactPointsRemaining < 2}>
            Add (2 points)
          </button>
        </div>
      </section>

      <section>
        <h3>Knowledge &amp; Language Skills</h3>
        <p className="hint">
          Every character starts with one free Native language, entered below - it doesn't cost any
          points.
        </p>
        <input
          type="text"
          placeholder="Native language (e.g. English, Sperethiel, Cityspeak)"
          value={data.nativeLanguage ?? ""}
          onChange={(e) => onChange({ ...data, nativeLanguage: e.target.value })}
        />
        <p className="hint">
          {knowledgeSlotsUsed} / {knowledgePool} points spent (equal to Logic, core rulebook p.67). A
          knowledge topic or a language's first (Basic) level costs 1 point; each further language level
          costs 1 more, up to Expert (3 total) - Native is only ever the free one above.
        </p>
        {knowledgeSkills.length > 0 && (
          <ul className="module-slots">
            {knowledgeSkills.map((k) => (
              <li key={k.id}>
                <div className="module-instance">
                  <div className="module-instance-header">
                    <strong>
                      {k.name}
                      {k.type === "language" ? ` (${LANGUAGE_LEVEL_NAMES[k.level ?? 1]})` : ""}
                    </strong>
                    <button className="danger" onClick={() => removeKnowledgeLine(k.id)}>
                      Remove
                    </button>
                  </div>
                  {k.type === "language" && (
                    <div className="chip-row">
                      {PURCHASABLE_LANGUAGE_LEVELS.map((level) => (
                        <button
                          key={level}
                          className={k.level === level ? "chip selected" : "chip"}
                          disabled={level > (k.level ?? 1) && level - (k.level ?? 1) > knowledgeSlotsRemaining}
                          onClick={() => setLanguageLevel(k.id, level)}
                        >
                          {LANGUAGE_LEVEL_NAMES[level]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="inline-field">
          <input
            type="text"
            placeholder="Knowledge topic or language name"
            value={newKnowledgeName}
            onChange={(e) => setNewKnowledgeName(e.target.value)}
          />
          <select value={newKnowledgeType} onChange={(e) => setNewKnowledgeType(e.target.value as "knowledge" | "language")}>
            <option value="knowledge">Knowledge topic</option>
            <option value="language">Language</option>
          </select>
          <button onClick={addKnowledgeLine} disabled={!newKnowledgeName.trim() || knowledgeSlotsRemaining < 1}>
            Add (1 point)
          </button>
        </div>
      </section>
    </div>
  );
}
