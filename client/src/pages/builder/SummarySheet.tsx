import type { CharacterData } from "../../character";
import { astralInitiative, deriveStats } from "../../derive";
import { astralAttackRating, astralDefenseRating } from "../../deriveAstral";
import { combineQualityCatalog, findQualityEntry, qualityDisplayName, qualityKarmaAmount } from "../../deriveQualities";
import { gearBondingKarmaTotal, gearCostTotal, karmaRemaining, nuyenRemaining } from "../../deriveGear";
import { contactsKarmaSpent } from "../../deriveContacts";
import { LANGUAGE_LEVEL_NAMES } from "../../character";
import { modifierBonuses } from "../../deriveModifiers";
import { currentEssence, effectiveMagic, effectiveResonance } from "../../deriveEssence";
import type {
  AdeptPowerRulesResponse,
  ComplexFormRulesResponse,
  MetatypeAttributes,
  PriorityRulesResponse,
  QualityRulesResponse,
  SpellRulesResponse,
} from "../../rules";
import { freeSpellAllotment, spellKarmaCost } from "../../deriveSpells";
import { adeptPowerPointPool, adeptPowerPointsSpent, findAdeptPowerEntry } from "../../deriveAdeptPowers";
import { combinedRacialQualities, findMetavariant, metavariantKarmaCost } from "../../deriveMetavariant";
import { lifestyleCostTotal } from "../../deriveLifestyle";
import { complexFormKarmaCost, freeComplexFormAllotment } from "../../deriveComplexForms";
import {
  MATRIX_ATTRIBUTE_KEYS,
  MATRIX_ATTRIBUTE_LABELS,
  livingPersonaAttribute,
} from "../../deriveLivingPersona";

const ATTRIBUTE_LABELS: [keyof CharacterData["attributes"], string][] = [
  ["body", "Body"],
  ["agility", "Agility"],
  ["reaction", "Reaction"],
  ["strength", "Strength"],
  ["willpower", "Willpower"],
  ["logic", "Logic"],
  ["intuition", "Intuition"],
  ["charisma", "Charisma"],
  ["edge", "Edge"],
];

/** Strips trailing zeros, e.g. 6 -> "6", 5.8 -> "5.8", 4.25 -> "4.25". */
function formatEssence(n: number): string {
  return n.toFixed(2).replace(/\.?0+$/, "");
}

interface Props {
  data: CharacterData;
  qualityRules: QualityRulesResponse;
  metatypeAttributes: MetatypeAttributes[];
  spellRules: SpellRulesResponse;
  priorityRules: PriorityRulesResponse;
  adeptPowerRules: AdeptPowerRulesResponse;
  complexFormRules: ComplexFormRulesResponse;
}

export function SummarySheet({
  data,
  qualityRules,
  metatypeAttributes,
  spellRules,
  priorityRules,
  adeptPowerRules,
  complexFormRules,
}: Props) {
  const spellKarma = spellKarmaCost(data, priorityRules);
  const spellsFree = freeSpellAllotment(data, priorityRules);
  const selectedMetavariant = findMetavariant(data, priorityRules.metavariants);
  const metavariantKarma = metavariantKarmaCost(data, priorityRules.metavariants);
  const powerPointPool = adeptPowerPointPool(data);
  const powerPointsSpent = adeptPowerPointsSpent(data.adeptPowers, adeptPowerRules.adeptPowers);
  const lifestyleSpend = lifestyleCostTotal(data.lifestyles);
  const complexFormKarma = complexFormKarmaCost(data, priorityRules);
  const complexFormsFree = freeComplexFormAllotment(data, priorityRules);
  const contactsKarma = contactsKarmaSpent(data.contacts);
  const derived = deriveStats(data.attributes, modifierBonuses(data.gear, data.adeptPowers));
  const essence = currentEssence(data);
  const magicRaw = data.attributes.magic;
  const resonanceRaw = data.attributes.resonance;
  const magicEffective = effectiveMagic(data);
  const resonanceEffective = effectiveResonance(data);
  const skillEntries = Object.entries(data.skills).filter(([, rank]) => rank > 0);
  const qualityCatalog = combineQualityCatalog(qualityRules);
  const racialQualities = combinedRacialQualities(data, metatypeAttributes, priorityRules.metavariants);

  return (
    <div className="summary-sheet">
      <h2>Summary</h2>
      {data.metatype && (
        <p className="metatype">
          {data.metatype}
          {selectedMetavariant ? ` (${selectedMetavariant.name})` : ""}
        </p>
      )}

      <section>
        <h3>Attributes</h3>
        <dl className="attribute-grid">
          {ATTRIBUTE_LABELS.map(([key, label]) => {
            const value = data.attributes[key];
            if (value === undefined) return null;
            return (
              <div key={key}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            );
          })}
          <div>
            <dt>Essence</dt>
            <dd>{formatEssence(essence)}</dd>
          </div>
          {magicRaw !== undefined && (
            <div>
              <dt>Magic</dt>
              <dd>
                {magicEffective}
                {magicEffective !== magicRaw && ` (${magicRaw} base, capped by Essence loss)`}
              </dd>
            </div>
          )}
          {resonanceRaw !== undefined && (
            <div>
              <dt>Resonance</dt>
              <dd>
                {resonanceEffective}
                {resonanceEffective !== resonanceRaw && ` (${resonanceRaw} base, capped by Essence loss)`}
              </dd>
            </div>
          )}
        </dl>
      </section>

      <section>
        <h3>Derived</h3>
        <dl className="attribute-grid">
          <div>
            <dt>Physical Monitor</dt>
            <dd>{derived.physicalMonitor}</dd>
          </div>
          <div>
            <dt>Stun Monitor</dt>
            <dd>{derived.stunMonitor}</dd>
          </div>
          <div>
            <dt>Initiative</dt>
            <dd>
              {derived.initiative} + {derived.initiativeDice}d6
            </dd>
          </div>
          {derived.armor > 0 && (
            <div>
              <dt>Armor (bioware/adept)</dt>
              <dd>+{derived.armor}</dd>
            </div>
          )}
        </dl>
      </section>

      {skillEntries.length > 0 && (
        <section>
          <h3>Skills</h3>
          <ul className="skill-list">
            {skillEntries.map(([skill, rank]) => (
              <li key={skill}>
                <span>{skill}</span>
                <span>{rank}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(data.nativeLanguage || data.knowledgeSkills.length > 0) && (
        <section>
          <h3>Knowledge &amp; Language Skills</h3>
          <ul>
            {data.nativeLanguage && <li>{data.nativeLanguage} (Native)</li>}
            {data.knowledgeSkills.map((k) => (
              <li key={k.id}>
                {k.name}
                {k.type === "language" ? ` (${LANGUAGE_LEVEL_NAMES[k.level ?? 1]})` : ""}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(data.qualities.length > 0 || racialQualities.length > 0) && (
        <section>
          <h3>Qualities</h3>
          <ul>
            {racialQualities.map((q) => (
              <li key={q}>{q} (racial)</li>
            ))}
            {data.qualities.map((sel, i) => {
              const entry = findQualityEntry(sel.id, qualityCatalog);
              if (!entry) return null;
              const amount = qualityKarmaAmount(sel, entry);
              return (
                <li key={i}>
                  {qualityDisplayName(sel, qualityCatalog)} ({entry.category === "positive" ? "-" : "+"}
                  {amount} Karma)
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {data.contacts.length > 0 && (
        <section>
          <h3>Contacts</h3>
          <ul>
            {data.contacts.map((c) => (
              <li key={c.id}>
                {c.name}
                {c.type ? ` (${c.type})` : ""} - Connection {c.connection} / Loyalty {c.loyalty}
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.spells.length > 0 && (
        <section>
          <h3>Spells</h3>
          <p className="hint">
            {Math.min(data.spells.length, spellsFree)} / {spellsFree} free
            {data.spells.length > spellsFree ? `, ${data.spells.length - spellsFree} at 5 Karma each` : ""}
          </p>
          <ul>
            {data.spells.map((id, i) => {
              const entry = spellRules.spells.find((s) => s.id === id);
              return <li key={i}>{entry?.name ?? id}</li>;
            })}
          </ul>
        </section>
      )}

      {data.adeptPowers.length > 0 && (
        <section>
          <h3>Adept Powers</h3>
          <p className="hint">
            {powerPointsSpent.toLocaleString()} / {powerPointPool.toLocaleString()} Power Points spent
          </p>
          <ul>
            {data.adeptPowers.map((line, i) => {
              const entry = findAdeptPowerEntry(line.powerId, adeptPowerRules.adeptPowers);
              return (
                <li key={i}>
                  {entry?.name ?? line.powerId}
                  {line.level ? ` (level ${line.level})` : ""}
                  {line.notes ? ` - ${line.notes}` : ""}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {data.complexForms.length > 0 && (
        <section>
          <h3>Complex Forms</h3>
          <p className="hint">
            {Math.min(data.complexForms.length, complexFormsFree)} / {complexFormsFree} free
            {data.complexForms.length > complexFormsFree
              ? `, ${data.complexForms.length - complexFormsFree} at 5 Karma each`
              : ""}
          </p>
          <ul>
            {data.complexForms.map((line, i) => {
              const entry = complexFormRules.complexForms.find((f) => f.id === line.formId);
              return (
                <li key={i}>
                  {entry?.name ?? line.formId}
                  {line.notes ? ` - ${line.notes}` : ""}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {data.attributes.resonance !== undefined && (
        <section>
          <h3>Living Persona</h3>
          <dl className="attribute-grid">
            {MATRIX_ATTRIBUTE_KEYS.map((key) => (
              <div key={key}>
                <dt>{MATRIX_ATTRIBUTE_LABELS[key]}</dt>
                <dd>{livingPersonaAttribute(data, key)}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {data.attributes.magic !== undefined && (
        <section>
          <h3>Astral Combat</h3>
          {data.traditionAttribute ? (
            <dl className="attribute-grid">
              <div>
                <dt>Attack Rating</dt>
                <dd>{astralAttackRating(data.attributes, data.traditionAttribute)}</dd>
              </div>
              <div>
                <dt>Defense Rating</dt>
                <dd>{astralDefenseRating(data.attributes)}</dd>
              </div>
              <div>
                <dt>Initiative</dt>
                <dd>{astralInitiative(data.attributes)} + 2D6</dd>
              </div>
            </dl>
          ) : (
            <p className="hint">Choose a Tradition Attribute (Magic or Resonance section) to see this.</p>
          )}
        </section>
      )}

      {data.lifestyles.length > 0 && (
        <section>
          <h3>Lifestyle</h3>
          <ul>
            {data.lifestyles.map((line, i) => (
              <li key={i}>
                {line.name} - {line.monthsPrepaid} month{line.monthsPrepaid === 1 ? "" : "s"} (
                {(line.monthsPrepaid * line.costPerMonth).toLocaleString()}¥)
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.gear.length > 0 && (
        <section>
          <h3>Gear</h3>
          <ul>
            {data.gear.map((g, i) => (
              <li key={i}>
                {g.name} x{g.qty}
                {g.bondingKarma ? ` (${g.bondingKarma * g.qty} Karma bonding)` : ""}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3>Resources</h3>
        <p>{data.nuyen.toLocaleString()}¥ earned</p>
        <p>{gearCostTotal(data.gear).toLocaleString()}¥ spent on gear</p>
        {lifestyleSpend > 0 && <p>{lifestyleSpend.toLocaleString()}¥ spent on lifestyle</p>}
        <p>{nuyenRemaining(data, lifestyleSpend).toLocaleString()}¥ remaining</p>
        <p>{data.karma.toLocaleString()} Karma pool</p>
        <p>{gearBondingKarmaTotal(data.gear).toLocaleString()} Karma spent bonding foci</p>
        <p>{spellKarma.toLocaleString()} Karma spent on spells</p>
        {complexFormKarma > 0 && <p>{complexFormKarma.toLocaleString()} Karma spent on complex forms</p>}
        {metavariantKarma > 0 && <p>{metavariantKarma.toLocaleString()} Karma spent on metavariant</p>}
        {contactsKarma > 0 && <p>{contactsKarma.toLocaleString()} Karma spent on contacts</p>}
        <p>
          {karmaRemaining(
            data,
            spellKarma + complexFormKarma + metavariantKarma + contactsKarma
          ).toLocaleString()}{" "}
          Karma remaining
        </p>
      </section>
    </div>
  );
}
