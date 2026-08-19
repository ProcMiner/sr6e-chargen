// Post-chargen ("career mode") Karma spending: raising attributes/skills one
// rating at a time while a character is in play, plus Initiation/Submersion
// (Magic/Resonance Grade) and the Karma-award input a GM/player uses to log
// Karma earned from a run. See deriveAdvancement.ts and deriveInitiation.ts
// for the cost formulas and the itemized-log rationale.
import { useState } from "react";
import type {
  AdvancementEntry,
  CharacterData,
  Contact,
  ContactAdvancementEntry,
  InitiationEntry,
  KnowledgePurchaseEntry,
  KnowledgeSkillLine,
  LanguageLevel,
  QualityPurchaseEntry,
  SelectedQuality,
  SpecializationEntry,
} from "../../character";
import type { MetamagicRulesResponse, PriorityRulesResponse, QualityCatalogEntry, QualityRulesResponse } from "../../rules";
import { karmaRemaining } from "../../deriveGear";
import { effectiveAttributes } from "../../derive";
import { modifierBonuses } from "../../deriveModifiers";
import { spellKarmaCost } from "../../deriveSpells";
import { complexFormKarmaCost } from "../../deriveComplexForms";
import { metavariantKarmaCost } from "../../deriveMetavariant";
import { magicMax, resonanceMax } from "../../deriveEssence";
import {
  CORE_ATTRIBUTE_KEYS,
  advancementKarmaTotal,
  attributeAdvanceCost,
  attributeMax,
  skillAdvanceCost,
  skillMax,
  type CoreAttributeKey,
} from "../../deriveAdvancement";
import { canInitiate, canSubmerge, initiationCost, initiationKarmaTotal } from "../../deriveInitiation";
import { isAdept, isMysticAdept } from "../../deriveAdeptPowers";
import { generateId } from "../../id";
import { MetamagicPicker } from "../../components/MetamagicPicker";
import {
  EXOTIC_WEAPONS_SKILL,
  EXPERTISE_KARMA_COST,
  SKILL_SPECIALIZATION_SUGGESTIONS,
  SPECIALIZATION_KARMA_COST,
  canAddSecondSpecialization,
  canAddSpecialization,
  canUpgradeToExpertise,
  exoticWeaponsNeedsSpecialization,
  specializationKarmaTotal,
} from "../../deriveSpecializations";
import { KNOWLEDGE_PURCHASE_KARMA_COST, knowledgePurchaseKarmaTotal } from "../../deriveKnowledge";
import {
  combineQualityCatalog,
  findQualityEntry,
  qualityDisplayName,
  qualityKarmaAmount,
  qualityPurchaseCost,
  qualityPurchaseKarmaTotal,
} from "../../deriveQualities";
import {
  CONTACT_ADVANCEMENT_KARMA_PER_POINT,
  CONTACT_RATING_MAX,
  contactAdvancementKarmaTotal,
  withRating,
} from "../../deriveContacts";
import { ATTRIBUTE_NAMES } from "../builder/QualityPicker/QualityPicker";

interface Props {
  data: CharacterData;
  onChange: (next: CharacterData) => void;
  priorityRules: PriorityRulesResponse;
  qualityRules: QualityRulesResponse;
  metamagicRules: MetamagicRulesResponse;
}

export function Advancement({ data, onChange, priorityRules, qualityRules, metamagicRules }: Props) {
  const [karmaAward, setKarmaAward] = useState("");
  const [metamagicName, setMetamagicName] = useState("");
  const [metamagicId, setMetamagicId] = useState<string | undefined>(undefined);
  const [echoName, setEchoName] = useState("");
  const [echoId, setEchoId] = useState<string | undefined>(undefined);
  const [specSkill, setSpecSkill] = useState(priorityRules.skillList[0] ?? "");
  const [specFocus, setSpecFocus] = useState("");
  const [knowledgeName, setKnowledgeName] = useState("");
  const [knowledgeType, setKnowledgeType] = useState<"knowledge" | "language">("knowledge");
  const [qualitySearch, setQualitySearch] = useState("");
  const [qualityChoices, setQualityChoices] = useState<Record<string, { rating?: number; param?: string }>>({});

  const spellKarma = spellKarmaCost(data, priorityRules);
  const complexFormKarma = complexFormKarmaCost(data, priorityRules);
  const metavariantKarma = metavariantKarmaCost(data, priorityRules.metavariants);
  const advancementKarma = advancementKarmaTotal(data.advancement);
  const effectiveAttrs = effectiveAttributes(data.attributes, modifierBonuses(data.gear, data.adeptPowers));
  const initiationKarma = initiationKarmaTotal(data.initiations);
  const specializationKarma = specializationKarmaTotal(data.specializationLog);
  const knowledgeKarma = knowledgePurchaseKarmaTotal(data.knowledgePurchases);
  const qualityKarma = qualityPurchaseKarmaTotal(data.qualityPurchases);
  const contactKarma = contactAdvancementKarmaTotal(data.contactAdvancement);
  const available = karmaRemaining(
    data,
    spellKarma +
      complexFormKarma +
      metavariantKarma +
      advancementKarma +
      initiationKarma +
      specializationKarma +
      knowledgeKarma +
      qualityKarma +
      contactKarma
  );

  const log = [...(data.advancement ?? [])].reverse();
  const initiationLog = [...(data.initiations ?? [])].reverse();
  const knownMetamagicIds = (data.initiations ?? [])
    .filter((e) => e.type === "initiation" && e.metamagicId)
    .map((e) => e.metamagicId!);
  const knownEchoIds = (data.initiations ?? [])
    .filter((e) => e.type === "submersion" && e.metamagicId)
    .map((e) => e.metamagicId!);
  const specializations = data.specializations ?? [];
  const specializationLog = [...(data.specializationLog ?? [])].reverse();
  const knowledgeLog = [...(data.knowledgePurchases ?? [])].reverse();
  const qualityLog = [...(data.qualityPurchases ?? [])].reverse();
  const contactLog = [...(data.contactAdvancement ?? [])].reverse();
  const qualityCatalog = combineQualityCatalog(qualityRules);

  const isAwakened = data.attributes.magic !== undefined;
  const isTechnomancer = data.attributes.resonance !== undefined;

  function awardKarma() {
    const amount = Number(karmaAward);
    if (!Number.isFinite(amount) || amount <= 0) return;
    onChange({ ...data, karma: data.karma + amount });
    setKarmaAward("");
  }

  function increaseAttribute(key: string, max: number) {
    const current = data.attributes[key as CoreAttributeKey] ?? (key === "magic" || key === "resonance" ? 0 : 1);
    const next = current + 1;
    if (next > max) return;
    const cost = attributeAdvanceCost(next);
    if (cost > available) return;
    onChange({
      ...data,
      attributes: { ...data.attributes, [key]: next },
      advancement: [
        ...(data.advancement ?? []),
        { id: generateId(), type: "attribute", key, fromRating: current, toRating: next, karmaCost: cost, date: new Date().toISOString() },
      ],
    });
  }

  function increaseSkill(name: string) {
    const current = data.skills[name] ?? 0;
    const max = skillMax(data, name);
    const next = current + 1;
    if (next > max) return;
    const cost = skillAdvanceCost(next);
    if (cost > available) return;
    onChange({
      ...data,
      skills: { ...data.skills, [name]: next },
      advancement: [
        ...(data.advancement ?? []),
        { id: generateId(), type: "skill", key: name, fromRating: current, toRating: next, karmaCost: cost, date: new Date().toISOString() },
      ],
    });
  }

  /** Only the most recent purchase for a given key can be undone, so undoing never strands a later purchase built on top of it. */
  function canUndo(entry: AdvancementEntry): boolean {
    const currentRating =
      entry.type === "attribute" ? data.attributes[entry.key as CoreAttributeKey] : data.skills[entry.key];
    return (currentRating ?? 0) === entry.toRating;
  }

  function undoEntry(entry: AdvancementEntry) {
    if (!canUndo(entry)) return;
    const nextData: CharacterData = {
      ...data,
      advancement: (data.advancement ?? []).filter((e) => e.id !== entry.id),
    };
    if (entry.type === "attribute") {
      nextData.attributes = { ...data.attributes, [entry.key]: entry.fromRating };
    } else {
      nextData.skills = { ...data.skills, [entry.key]: entry.fromRating };
    }
    onChange(nextData);
  }

  function initiate() {
    const name = metamagicName.trim();
    if (!name || !canInitiate(data)) return;
    const grade = (data.initiateGrade ?? 0) + 1;
    const cost = initiationCost(grade);
    if (cost > available) return;
    onChange({
      ...data,
      initiateGrade: grade,
      initiations: [
        ...(data.initiations ?? []),
        {
          id: generateId(),
          type: "initiation",
          grade,
          metamagicName: name,
          metamagicId,
          karmaCost: cost,
          date: new Date().toISOString(),
        },
      ],
    });
    setMetamagicName("");
    setMetamagicId(undefined);
  }

  function submerge() {
    const name = echoName.trim();
    if (!name || !canSubmerge(data)) return;
    const grade = (data.submersionGrade ?? 0) + 1;
    const cost = initiationCost(grade);
    if (cost > available) return;
    onChange({
      ...data,
      submersionGrade: grade,
      initiations: [
        ...(data.initiations ?? []),
        {
          id: generateId(),
          type: "submersion",
          grade,
          metamagicName: name,
          metamagicId: echoId,
          karmaCost: cost,
          date: new Date().toISOString(),
        },
      ],
    });
    setEchoName("");
    setEchoId(undefined);
  }

  function canUndoInitiation(entry: InitiationEntry): boolean {
    const currentGrade = entry.type === "initiation" ? data.initiateGrade ?? 0 : data.submersionGrade ?? 0;
    return currentGrade === entry.grade;
  }

  function undoInitiation(entry: InitiationEntry) {
    if (!canUndoInitiation(entry)) return;
    const nextData: CharacterData = {
      ...data,
      initiations: (data.initiations ?? []).filter((e) => e.id !== entry.id),
    };
    if (entry.type === "initiation") {
      nextData.initiateGrade = entry.grade - 1;
    } else {
      nextData.submersionGrade = entry.grade - 1;
    }
    onChange(nextData);
  }

  function buySpecialization(skill: string, focus: string) {
    if (!focus.trim() || !canAddSpecialization(data, skill) || SPECIALIZATION_KARMA_COST > available) return;
    const specEntry = { id: generateId(), skill, focus: focus.trim(), tier: "specialization" as const };
    const logEntry: SpecializationEntry = {
      id: generateId(),
      skill,
      focus: focus.trim(),
      action: "new",
      karmaCost: SPECIALIZATION_KARMA_COST,
      date: new Date().toISOString(),
    };
    onChange({
      ...data,
      specializations: [...specializations, specEntry],
      specializationLog: [...(data.specializationLog ?? []), logEntry],
    });
  }

  function upgradeToExpertise(skill: string) {
    if (!canUpgradeToExpertise(data, skill) || EXPERTISE_KARMA_COST > available) return;
    const existing = specializations.find((s) => s.skill === skill && s.tier === "specialization");
    if (!existing) return;
    const logEntry: SpecializationEntry = {
      id: generateId(),
      skill,
      focus: existing.focus,
      action: "expertise",
      karmaCost: EXPERTISE_KARMA_COST,
      date: new Date().toISOString(),
    };
    onChange({
      ...data,
      specializations: specializations.map((s) => (s.id === existing.id ? { ...s, tier: "expertise" } : s)),
      specializationLog: [...(data.specializationLog ?? []), logEntry],
    });
  }

  function buySecondSpecialization(skill: string, focus: string) {
    if (!focus.trim() || !canAddSecondSpecialization(data, skill) || SPECIALIZATION_KARMA_COST > available) return;
    const specEntry = { id: generateId(), skill, focus: focus.trim(), tier: "specialization" as const };
    const logEntry: SpecializationEntry = {
      id: generateId(),
      skill,
      focus: focus.trim(),
      action: "second",
      karmaCost: SPECIALIZATION_KARMA_COST,
      date: new Date().toISOString(),
    };
    onChange({
      ...data,
      specializations: [...specializations, specEntry],
      specializationLog: [...(data.specializationLog ?? []), logEntry],
    });
  }

  /** Only the most recent specialization action can be undone. */
  function canUndoSpecialization(entry: SpecializationEntry): boolean {
    const entries = specializationLog;
    return entries[0]?.id === entry.id;
  }

  function undoSpecialization(entry: SpecializationEntry) {
    if (!canUndoSpecialization(entry)) return;
    const nextLog = (data.specializationLog ?? []).filter((e) => e.id !== entry.id);
    let nextSpecs = specializations;
    if (entry.action === "new" || entry.action === "second") {
      nextSpecs = specializations.filter((s) => !(s.skill === entry.skill && s.focus === entry.focus));
    } else if (entry.action === "expertise") {
      nextSpecs = specializations.map((s) =>
        s.skill === entry.skill && s.focus === entry.focus ? { ...s, tier: "specialization" } : s
      );
    }
    onChange({ ...data, specializations: nextSpecs, specializationLog: nextLog });
  }

  function buyKnowledge() {
    const name = knowledgeName.trim();
    if (!name || KNOWLEDGE_PURCHASE_KARMA_COST > available) return;
    const line: KnowledgeSkillLine =
      knowledgeType === "language"
        ? { id: generateId(), name, type: "language", level: 1 as LanguageLevel }
        : { id: generateId(), name, type: "knowledge" };
    const entry: KnowledgePurchaseEntry = {
      id: generateId(),
      knowledgeLineId: line.id,
      name,
      type: knowledgeType,
      karmaCost: KNOWLEDGE_PURCHASE_KARMA_COST,
      date: new Date().toISOString(),
    };
    onChange({
      ...data,
      knowledgeSkills: [...data.knowledgeSkills, line],
      knowledgePurchases: [...(data.knowledgePurchases ?? []), entry],
    });
    setKnowledgeName("");
  }

  function canUndoKnowledge(entry: KnowledgePurchaseEntry): boolean {
    return knowledgeLog[0]?.id === entry.id;
  }

  function undoKnowledge(entry: KnowledgePurchaseEntry) {
    if (!canUndoKnowledge(entry)) return;
    onChange({
      ...data,
      knowledgeSkills: data.knowledgeSkills.filter((k) => k.id !== entry.knowledgeLineId),
      knowledgePurchases: (data.knowledgePurchases ?? []).filter((e) => e.id !== entry.id),
    });
  }

  function qualityChoiceFor(id: string) {
    return qualityChoices[id] ?? {};
  }

  function setQualityChoice(id: string, patch: { rating?: number; param?: string }) {
    setQualityChoices((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  function buyQuality(entry: QualityCatalogEntry) {
    const choice = qualityChoiceFor(entry.id);
    const sel: SelectedQuality = {
      id: entry.id,
      rating: entry.levels ? choice.rating ?? entry.levels.min : undefined,
      param: entry.requiresParam ? choice.param : undefined,
      instanceId: generateId(),
    };
    if (entry.requiresParam && !sel.param?.trim()) return;
    const cost = qualityPurchaseCost(sel, entry);
    if (cost > available) return;
    const logEntry: QualityPurchaseEntry = {
      id: generateId(),
      action: "purchased",
      quality: sel,
      name: qualityDisplayName(sel, qualityCatalog),
      karmaCost: cost,
      date: new Date().toISOString(),
    };
    onChange({
      ...data,
      qualities: [...data.qualities, sel],
      qualityPurchases: [...(data.qualityPurchases ?? []), logEntry],
    });
  }

  function eliminateQuality(sel: SelectedQuality, entry: QualityCatalogEntry) {
    const cost = qualityKarmaAmount(sel, entry) * 2;
    if (cost > available) return;
    const logEntry: QualityPurchaseEntry = {
      id: generateId(),
      action: "eliminated",
      quality: sel,
      name: qualityDisplayName(sel, qualityCatalog),
      karmaCost: cost,
      date: new Date().toISOString(),
    };
    onChange({
      ...data,
      qualities: data.qualities.filter((q) => q !== sel),
      qualityPurchases: [...(data.qualityPurchases ?? []), logEntry],
    });
  }

  function canUndoQuality(entry: QualityPurchaseEntry): boolean {
    return qualityLog[0]?.id === entry.id;
  }

  function undoQuality(entry: QualityPurchaseEntry) {
    if (!canUndoQuality(entry)) return;
    const nextPurchases = (data.qualityPurchases ?? []).filter((e) => e.id !== entry.id);
    if (entry.action === "purchased") {
      onChange({
        ...data,
        qualities: data.qualities.filter((q) => q.instanceId !== entry.quality.instanceId),
        qualityPurchases: nextPurchases,
      });
    } else {
      onChange({
        ...data,
        qualities: [...data.qualities, entry.quality],
        qualityPurchases: nextPurchases,
      });
    }
  }

  function raiseContact(contact: Contact, field: "connection" | "loyalty") {
    const current = contact[field];
    if (current >= CONTACT_RATING_MAX || CONTACT_ADVANCEMENT_KARMA_PER_POINT > available) return;
    const next = current + 1;
    const entry: ContactAdvancementEntry = {
      id: generateId(),
      contactId: contact.id,
      field,
      fromRating: current,
      toRating: next,
      karmaCost: CONTACT_ADVANCEMENT_KARMA_PER_POINT,
      date: new Date().toISOString(),
    };
    onChange({
      ...data,
      contacts: data.contacts.map((c) => (c.id === contact.id ? withRating(c, field, next) : c)),
      contactAdvancement: [...(data.contactAdvancement ?? []), entry],
    });
  }

  function canUndoContact(entry: ContactAdvancementEntry): boolean {
    const contact = data.contacts.find((c) => c.id === entry.contactId);
    return !!contact && contact[entry.field] === entry.toRating;
  }

  function undoContact(entry: ContactAdvancementEntry) {
    if (!canUndoContact(entry)) return;
    onChange({
      ...data,
      contacts: data.contacts.map((c) =>
        c.id === entry.contactId ? withRating(c, entry.field, entry.fromRating) : c
      ),
      contactAdvancement: (data.contactAdvancement ?? []).filter((e) => e.id !== entry.id),
    });
  }

  const magicCeiling = magicMax(data);
  const resonanceCeiling = resonanceMax(data);
  const nextInitiateGrade = (data.initiateGrade ?? 0) + 1;
  const nextSubmersionGrade = (data.submersionGrade ?? 0) + 1;
  const initiateCost = initiationCost(nextInitiateGrade);
  const submergeCost = initiationCost(nextSubmersionGrade);

  return (
    <div className="advancement-panel">
      <h2>Karma &amp; Advancement</h2>
      <p className="hint">
        {data.karma.toLocaleString()} Karma earned - {(data.karma - available).toLocaleString()} committed ={" "}
        {available.toLocaleString()} available to spend
      </p>

      <form
        className="inline-field"
        onSubmit={(e) => {
          e.preventDefault();
          awardKarma();
        }}
      >
        <input
          type="text"
          inputMode="numeric"
          placeholder="Karma earned from a run"
          value={karmaAward}
          onChange={(e) => setKarmaAward(e.target.value.replace(/[^0-9]/g, ""))}
        />
        <button type="submit" disabled={!karmaAward}>
          Award Karma
        </button>
      </form>

      <h3>Attributes</h3>
      <div className="attribute-editor">
        {CORE_ATTRIBUTE_KEYS.map((key) => {
          const current = data.attributes[key] ?? 1;
          const effective = effectiveAttrs[key] ?? current;
          const max = attributeMax(data, key, priorityRules.metatypeAttributes, priorityRules.metavariants);
          const atMax = current >= max;
          const cost = attributeAdvanceCost(current + 1);
          const afford = cost <= available;
          return (
            <label key={key}>
              {key} ({current}/{max}{effective !== current ? `, ${effective} w/ augments` : ""})
              <button
                type="button"
                className="chip"
                disabled={atMax || !afford}
                onClick={() => increaseAttribute(key, max)}
                title={atMax ? `At natural maximum (${max})` : `Raise to ${current + 1} for ${cost} Karma`}
              >
                {atMax ? "Max" : `+1 (${cost})`}
              </button>
            </label>
          );
        })}
        {isAwakened && (
          <label key="magic">
            magic ({data.attributes.magic}/{magicCeiling})
            <button
              type="button"
              className="chip"
              disabled={
                (data.attributes.magic ?? 0) >= magicCeiling ||
                attributeAdvanceCost((data.attributes.magic ?? 0) + 1) > available
              }
              onClick={() => increaseAttribute("magic", magicCeiling)}
              title={
                (data.attributes.magic ?? 0) >= magicCeiling
                  ? `At natural maximum (${magicCeiling}) - Initiate to raise it further`
                  : `Raise to ${(data.attributes.magic ?? 0) + 1} for ${attributeAdvanceCost((data.attributes.magic ?? 0) + 1)} Karma`
              }
            >
              {(data.attributes.magic ?? 0) >= magicCeiling
                ? "Max"
                : `+1 (${attributeAdvanceCost((data.attributes.magic ?? 0) + 1)})`}
            </button>
          </label>
        )}
        {isTechnomancer && (
          <label key="resonance">
            resonance ({data.attributes.resonance}/{resonanceCeiling})
            <button
              type="button"
              className="chip"
              disabled={
                (data.attributes.resonance ?? 0) >= resonanceCeiling ||
                attributeAdvanceCost((data.attributes.resonance ?? 0) + 1) > available
              }
              onClick={() => increaseAttribute("resonance", resonanceCeiling)}
              title={
                (data.attributes.resonance ?? 0) >= resonanceCeiling
                  ? `At natural maximum (${resonanceCeiling}) - Submerge to raise it further`
                  : `Raise to ${(data.attributes.resonance ?? 0) + 1} for ${attributeAdvanceCost((data.attributes.resonance ?? 0) + 1)} Karma`
              }
            >
              {(data.attributes.resonance ?? 0) >= resonanceCeiling
                ? "Max"
                : `+1 (${attributeAdvanceCost((data.attributes.resonance ?? 0) + 1)})`}
            </button>
          </label>
        )}
      </div>

      <h3>Skills</h3>
      <div className="skill-editor">
        {priorityRules.skillList.map((skill) => {
          const current = data.skills[skill] ?? 0;
          const max = skillMax(data, skill);
          const atMax = current >= max;
          const cost = skillAdvanceCost(current + 1);
          const afford = cost <= available;
          return (
            <label key={skill}>
              {skill} ({current})
              <button
                type="button"
                className="chip"
                disabled={atMax || !afford}
                onClick={() => increaseSkill(skill)}
                title={atMax ? `At natural maximum (${max})` : `Raise to ${current + 1} for ${cost} Karma`}
              >
                {atMax ? "Max" : `+1 (${cost})`}
              </button>
              {skill === EXOTIC_WEAPONS_SKILL && exoticWeaponsNeedsSpecialization(data) && (
                <span className="hint danger-text">
                  Needs a specialization below to be usable (p. 95) - ranks alone can't be rolled with any weapon.
                </span>
              )}
            </label>
          );
        })}
      </div>

      <h3>Specializations &amp; Expertise</h3>
      <p className="hint">
        A specialization is +2 dice on tests in that narrow area; an expertise upgrades it to +3, but needs the
        skill already specialized and at rank 5+. Once a skill has an expertise, it can take one more
        specialization (which can never itself become an expertise). {SPECIALIZATION_KARMA_COST} Karma each.
      </p>
      {specializations.length > 0 && (
        <ul className="module-slots">
          {specializations.map((s) => (
            <li key={s.id}>
              <div className="module-instance">
                <div className="module-instance-header">
                  <strong>
                    {s.skill}: {s.focus} ({s.tier})
                  </strong>
                  {s.tier === "specialization" && canUpgradeToExpertise(data, s.skill) && (
                    <button
                      className="chip"
                      disabled={EXPERTISE_KARMA_COST > available}
                      onClick={() => upgradeToExpertise(s.skill)}
                    >
                      Upgrade to Expertise ({EXPERTISE_KARMA_COST})
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="inline-field">
        <select value={specSkill} onChange={(e) => setSpecSkill(e.target.value)}>
          {priorityRules.skillList.map((skill) => (
            <option key={skill} value={skill}>
              {skill}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Focus (e.g. Light Pistols)"
          value={specFocus}
          onChange={(e) => setSpecFocus(e.target.value)}
        />
        {canAddSecondSpecialization(data, specSkill) ? (
          <button
            onClick={() => {
              buySecondSpecialization(specSkill, specFocus);
              setSpecFocus("");
            }}
            disabled={!specFocus.trim() || SPECIALIZATION_KARMA_COST > available}
          >
            Add second specialization ({SPECIALIZATION_KARMA_COST})
          </button>
        ) : (
          <button
            onClick={() => {
              buySpecialization(specSkill, specFocus);
              setSpecFocus("");
            }}
            disabled={!canAddSpecialization(data, specSkill) || !specFocus.trim() || SPECIALIZATION_KARMA_COST > available}
            title={!canAddSpecialization(data, specSkill) ? "This skill already has a specialization" : undefined}
          >
            Add specialization ({SPECIALIZATION_KARMA_COST})
          </button>
        )}
      </div>
      {(SKILL_SPECIALIZATION_SUGGESTIONS[specSkill] ?? []).length > 0 && (
        <div className="chip-row">
          {SKILL_SPECIALIZATION_SUGGESTIONS[specSkill]!.map((s) => (
            <button key={s} type="button" className="chip" onClick={() => setSpecFocus(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      {isAwakened && (
        <>
          <h3>Initiation</h3>
          <p className="hint">
            Initiate Grade {data.initiateGrade ?? 0}. Raises Magic's natural maximum to {magicCeiling}. Requires
            Magic {nextInitiateGrade}+ to reach Grade {nextInitiateGrade} ("Initiate Grade can never exceed Magic
            rating").
          </p>
          <MetamagicPicker
            catalog={metamagicRules.metamagics}
            isAdept={isAdept(data) || isMysticAdept(data)}
            knownOnceIds={knownMetamagicIds}
            selectedId={metamagicId}
            onSelect={({ id, name }) => {
              setMetamagicId(id);
              setMetamagicName(name);
            }}
          />
          <form
            className="inline-field"
            onSubmit={(e) => {
              e.preventDefault();
              initiate();
            }}
          >
            <input
              type="text"
              placeholder="Metamagic learned (or type a custom/homebrew name)"
              value={metamagicName}
              onChange={(e) => {
                setMetamagicName(e.target.value);
                setMetamagicId(undefined);
              }}
            />
            <button
              type="submit"
              disabled={!metamagicName.trim() || !canInitiate(data) || initiateCost > available}
              title={
                !canInitiate(data)
                  ? `Magic must be at least ${nextInitiateGrade} to reach Grade ${nextInitiateGrade}`
                  : `${initiateCost} Karma`
              }
            >
              Initiate to Grade {nextInitiateGrade} ({initiateCost} Karma)
            </button>
          </form>
        </>
      )}

      {isTechnomancer && (
        <>
          <h3>Submersion</h3>
          <p className="hint">
            Submersion Grade {data.submersionGrade ?? 0}. Raises Resonance's natural maximum to {resonanceCeiling}.
            Requires Resonance {nextSubmersionGrade}+ to reach Grade {nextSubmersionGrade}.
          </p>
          <MetamagicPicker
            catalog={metamagicRules.echoes}
            isAdept={false}
            knownOnceIds={knownEchoIds}
            selectedId={echoId}
            onSelect={({ id, name }) => {
              setEchoId(id);
              setEchoName(name);
            }}
          />
          <form
            className="inline-field"
            onSubmit={(e) => {
              e.preventDefault();
              submerge();
            }}
          >
            <input
              type="text"
              placeholder="Echo learned (or type a custom/homebrew name)"
              value={echoName}
              onChange={(e) => {
                setEchoName(e.target.value);
                setEchoId(undefined);
              }}
            />
            <button
              type="submit"
              disabled={!echoName.trim() || !canSubmerge(data) || submergeCost > available}
              title={
                !canSubmerge(data)
                  ? `Resonance must be at least ${nextSubmersionGrade} to reach Grade ${nextSubmersionGrade}`
                  : `${submergeCost} Karma`
              }
            >
              Submerge to Grade {nextSubmersionGrade} ({submergeCost} Karma)
            </button>
          </form>
        </>
      )}

      <h3>Knowledge &amp; Language Skills</h3>
      <p className="hint">
        A brand-new Knowledge topic or Language (at Basic level) costs {KNOWLEDGE_PURCHASE_KARMA_COST} Karma
        (core rulebook p. 71).
      </p>
      <form
        className="inline-field"
        onSubmit={(e) => {
          e.preventDefault();
          buyKnowledge();
        }}
      >
        <input
          type="text"
          placeholder="Knowledge topic or language name"
          value={knowledgeName}
          onChange={(e) => setKnowledgeName(e.target.value)}
        />
        <select value={knowledgeType} onChange={(e) => setKnowledgeType(e.target.value as "knowledge" | "language")}>
          <option value="knowledge">Knowledge topic</option>
          <option value="language">Language</option>
        </select>
        <button type="submit" disabled={!knowledgeName.trim() || KNOWLEDGE_PURCHASE_KARMA_COST > available}>
          Learn ({KNOWLEDGE_PURCHASE_KARMA_COST} Karma)
        </button>
      </form>

      <h3>Qualities</h3>
      <p className="hint">
        Purchasing a new positive quality costs 2x its normal Karma cost; eliminating an existing negative
        quality costs 2x its base Karma bonus. New negative qualities can't be purchased after creation
        (core rulebook p. 71).
      </p>
      {data.qualities.some((sel) => findQualityEntry(sel.id, qualityCatalog)?.category === "negative") && (
        <ul className="module-slots">
          {data.qualities.map((sel, i) => {
            const entry = findQualityEntry(sel.id, qualityCatalog);
            if (!entry || entry.category !== "negative") return null;
            const eliminateCost = qualityKarmaAmount(sel, entry) * 2;
            return (
              <li key={sel.instanceId ?? i}>
                <div className="module-instance">
                  <div className="module-instance-header">
                    <strong>{qualityDisplayName(sel, qualityCatalog)}</strong>
                    <button className="chip" disabled={eliminateCost > available} onClick={() => eliminateQuality(sel, entry)}>
                      Eliminate ({eliminateCost} Karma)
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <details className="quality-section">
        <summary>Purchase a new positive quality</summary>
        <input
          type="text"
          className="picker-search"
          value={qualitySearch}
          onChange={(e) => setQualitySearch(e.target.value)}
          placeholder="Search positive qualities..."
          aria-label="Search qualities"
        />
        <ul className="module-slots">
          {qualityRules.positiveQualities
            .filter((entry) => entry.name.toLowerCase().includes(qualitySearch.trim().toLowerCase()))
            .map((entry) => {
              const choice = qualityChoiceFor(entry.id);
              const rating = entry.levels ? choice.rating ?? entry.levels.min : undefined;
              const previewSel: SelectedQuality = { id: entry.id, rating, param: choice.param };
              const cost = qualityPurchaseCost(previewSel, entry);
              const missingParam = !!entry.requiresParam && !choice.param?.trim();
              return (
                <li key={entry.id}>
                  <div className="module-instance">
                    <div className="module-instance-header">
                      <strong>
                        {entry.name} ({cost} Karma)
                      </strong>
                      <button
                        className="chip"
                        disabled={cost > available || missingParam}
                        onClick={() => buyQuality(entry)}
                        title={entry.summary}
                      >
                        Purchase
                      </button>
                    </div>
                    <p className="hint">{entry.summary}</p>
                    {entry.levels && (
                      <label className="inline-field">
                        Rating
                        <select
                          value={rating}
                          onChange={(e) => setQualityChoice(entry.id, { rating: Number(e.target.value) })}
                        >
                          {Array.from(
                            { length: entry.levels.max - entry.levels.min + 1 },
                            (_, n) => entry.levels!.min + n
                          ).map((level) => (
                            <option key={level} value={level}>
                              {level}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                    {entry.requiresParam && (
                      <label className="inline-field">
                        {entry.requiresParam === "skill" ? "Skill" : entry.requiresParam === "attribute" ? "Attribute" : "Specify"}
                        {entry.requiresParam === "custom" ? (
                          <input
                            value={choice.param ?? ""}
                            onChange={(e) => setQualityChoice(entry.id, { param: e.target.value })}
                          />
                        ) : (
                          <select
                            value={choice.param ?? ""}
                            onChange={(e) => setQualityChoice(entry.id, { param: e.target.value })}
                          >
                            <option value="">choose...</option>
                            {(entry.requiresParam === "skill" ? priorityRules.skillList : ATTRIBUTE_NAMES).map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        )}
                      </label>
                    )}
                  </div>
                </li>
              );
            })}
        </ul>
      </details>

      <h3>Contacts</h3>
      <p className="hint">
        Raising a contact's Connection or Loyalty during play costs {CONTACT_ADVANCEMENT_KARMA_PER_POINT} Karma
        per point, up to {CONTACT_RATING_MAX} (core rulebook p. 51) - no longer capped at Charisma once play
        has started.
      </p>
      {data.contacts.length > 0 ? (
        <ul className="module-slots">
          {data.contacts.map((c) => (
            <li key={c.id}>
              <div className="module-instance">
                <div className="module-instance-header">
                  <strong>{c.name}</strong>
                </div>
                <div className="contact-rating-editor">
                  <label>
                    Connection ({c.connection})
                    <button
                      type="button"
                      className="chip"
                      disabled={c.connection >= CONTACT_RATING_MAX || CONTACT_ADVANCEMENT_KARMA_PER_POINT > available}
                      onClick={() => raiseContact(c, "connection")}
                    >
                      +1 ({CONTACT_ADVANCEMENT_KARMA_PER_POINT})
                    </button>
                  </label>
                  <label>
                    Loyalty ({c.loyalty})
                    <button
                      type="button"
                      className="chip"
                      disabled={c.loyalty >= CONTACT_RATING_MAX || CONTACT_ADVANCEMENT_KARMA_PER_POINT > available}
                      onClick={() => raiseContact(c, "loyalty")}
                    >
                      +1 ({CONTACT_ADVANCEMENT_KARMA_PER_POINT})
                    </button>
                  </label>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="hint">No contacts yet.</p>
      )}

      {(log.length > 0 ||
        initiationLog.length > 0 ||
        specializationLog.length > 0 ||
        knowledgeLog.length > 0 ||
        qualityLog.length > 0 ||
        contactLog.length > 0) && (
        <>
          <h3>Advancement Log</h3>
          <ul className="module-slots">
            {specializationLog.map((entry) => (
              <li key={entry.id}>
                <div className="module-instance">
                  <div className="module-instance-header">
                    <strong>
                      {entry.skill}: {entry.focus} (
                      {entry.action === "expertise" ? "upgraded to Expertise" : "Specialization"}, {entry.karmaCost}{" "}
                      Karma)
                    </strong>
                    <button
                      className="danger"
                      disabled={!canUndoSpecialization(entry)}
                      onClick={() => undoSpecialization(entry)}
                    >
                      Undo
                    </button>
                  </div>
                  <p className="hint">{new Date(entry.date).toLocaleString()}</p>
                </div>
              </li>
            ))}
            {log.map((entry) => (
              <li key={entry.id}>
                <div className="module-instance">
                  <div className="module-instance-header">
                    <strong>
                      {entry.key} {entry.fromRating} &rarr; {entry.toRating} ({entry.karmaCost} Karma)
                    </strong>
                    <button className="danger" disabled={!canUndo(entry)} onClick={() => undoEntry(entry)}>
                      Undo
                    </button>
                  </div>
                  <p className="hint">{new Date(entry.date).toLocaleString()}</p>
                </div>
              </li>
            ))}
            {initiationLog.map((entry) => (
              <li key={entry.id}>
                <div className="module-instance">
                  <div className="module-instance-header">
                    <strong>
                      {entry.type === "initiation" ? "Initiation" : "Submersion"} Grade {entry.grade} -{" "}
                      {entry.metamagicName} ({entry.karmaCost} Karma)
                    </strong>
                    <button className="danger" disabled={!canUndoInitiation(entry)} onClick={() => undoInitiation(entry)}>
                      Undo
                    </button>
                  </div>
                  <p className="hint">{new Date(entry.date).toLocaleString()}</p>
                </div>
              </li>
            ))}
            {knowledgeLog.map((entry) => (
              <li key={entry.id}>
                <div className="module-instance">
                  <div className="module-instance-header">
                    <strong>
                      {entry.name} ({entry.type === "language" ? "Language" : "Knowledge"}, {entry.karmaCost} Karma)
                    </strong>
                    <button className="danger" disabled={!canUndoKnowledge(entry)} onClick={() => undoKnowledge(entry)}>
                      Undo
                    </button>
                  </div>
                  <p className="hint">{new Date(entry.date).toLocaleString()}</p>
                </div>
              </li>
            ))}
            {qualityLog.map((entry) => (
              <li key={entry.id}>
                <div className="module-instance">
                  <div className="module-instance-header">
                    <strong>
                      {entry.name} ({entry.action === "eliminated" ? "eliminated" : "purchased"}, {entry.karmaCost}{" "}
                      Karma)
                    </strong>
                    <button className="danger" disabled={!canUndoQuality(entry)} onClick={() => undoQuality(entry)}>
                      Undo
                    </button>
                  </div>
                  <p className="hint">{new Date(entry.date).toLocaleString()}</p>
                </div>
              </li>
            ))}
            {contactLog.map((entry) => {
              const contact = data.contacts.find((c) => c.id === entry.contactId);
              return (
                <li key={entry.id}>
                  <div className="module-instance">
                    <div className="module-instance-header">
                      <strong>
                        {contact?.name ?? "Contact"} {entry.field} {entry.fromRating} &rarr; {entry.toRating} (
                        {entry.karmaCost} Karma)
                      </strong>
                      <button className="danger" disabled={!canUndoContact(entry)} onClick={() => undoContact(entry)}>
                        Undo
                      </button>
                    </div>
                    <p className="hint">{new Date(entry.date).toLocaleString()}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
