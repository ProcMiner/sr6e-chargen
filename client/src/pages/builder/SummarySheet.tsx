import type { CharacterData, PrioritySystemState } from "../../character";
import { deriveAdjustmentPoints } from "../../deriveAdjustmentPoints";
import { astralInitiative, deriveStats, effectiveAttributes } from "../../derive";
import { astralAttackRating, astralDefenseRating } from "../../deriveAstral";
import { combineQualityCatalog, findQualityEntry, qualityDisplayName, qualityKarmaAmount } from "../../deriveQualities";
import {
  canAttachToWeapon,
  findGearEntry,
  gearBondingKarmaTotal,
  gearCostTotal,
  gearLineKey,
  isWeapon,
  karmaRemaining,
  nuyenFromKarmaConversion,
  nuyenRemaining,
} from "../../deriveGear";
import { contactsKarmaSpent } from "../../deriveContacts";
import { LANGUAGE_LEVEL_NAMES } from "../../character";
import { modifierBonuses } from "../../deriveModifiers";
import { defenseRating, unarmedAttackRating } from "../../deriveCombat";
import { currentEssence, effectiveMagic, effectiveResonance } from "../../deriveEssence";
import type {
  AdeptPowerRulesResponse,
  ComplexFormRulesResponse,
  GearRulesResponse,
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
import { initiationKarmaTotal } from "../../deriveInitiation";
import { customCyberdeckKarmaTotal } from "../../deriveCustomCyberdeck";
import { advancementKarmaTotal } from "../../deriveAdvancement";
import { specializationKarmaTotal } from "../../deriveSpecializations";
import {
  MATRIX_ATTRIBUTE_KEYS,
  MATRIX_ATTRIBUTE_LABELS,
  livingPersonaAttribute,
} from "../../deriveLivingPersona";
import {
  deckerAllocation,
  deckerAttackRating,
  deckerAttribute,
  deckerDefenseRating,
  matrixDevices,
  resolveDeckerAllocation,
} from "../../deriveDeckerPersona";

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
  gearRules: GearRulesResponse;
}

export function SummarySheet({
  data,
  qualityRules,
  metatypeAttributes,
  spellRules,
  priorityRules,
  adeptPowerRules,
  complexFormRules,
  gearRules,
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
  const initiationKarma = initiationKarmaTotal(data.initiations);
  const customCyberdeckKarma = customCyberdeckKarmaTotal(data.gear);
  const skillAdvancementKarma = advancementKarmaTotal(data.advancement);
  const specializationKarma = specializationKarmaTotal(data.specializationLog);
  const matrixDeviceList = matrixDevices(data, gearRules);
  const deckerResolvedAllocation = resolveDeckerAllocation(matrixDeviceList, deckerAllocation(data));
  // Life Path characters have no PrioritySystemState.priorities, so Adjustment
  // Points (a Priority-system-only concept) simply don't apply to them.
  const isPrioritySystem = !!(data.systemState as PrioritySystemState)?.priorities;
  const adjustmentPoints = isPrioritySystem ? deriveAdjustmentPoints(data, priorityRules) : null;
  const bonuses = modifierBonuses(data.gear, data.adeptPowers);
  const derived = deriveStats(data.attributes, bonuses);
  const effectiveAttrs = effectiveAttributes(data.attributes, bonuses);
  const essence = currentEssence(data);
  const magicRaw = data.attributes.magic;
  const resonanceRaw = data.attributes.resonance;
  const magicEffective = effectiveMagic(data);
  const resonanceEffective = effectiveResonance(data);
  const skillEntries = Object.entries(data.skills).filter(([, rank]) => rank > 0);
  const qualityCatalog = combineQualityCatalog(qualityRules);
  const racialQualities = combinedRacialQualities(data, metatypeAttributes, priorityRules.metavariants);
  const accessoriesByTarget = new Map<string, typeof data.gear>();
  for (const line of data.gear) {
    const entry = line.itemId ? findGearEntry(line.itemId, gearRules.gear) : undefined;
    if (!canAttachToWeapon(entry) || !line.attachedTo) continue;
    accessoriesByTarget.set(line.attachedTo, [...(accessoriesByTarget.get(line.attachedTo) ?? []), line]);
  }
  const gearForSummary = data.gear.filter((line) => {
    const entry = line.itemId ? findGearEntry(line.itemId, gearRules.gear) : undefined;
    return !(canAttachToWeapon(entry) && line.attachedTo);
  });

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
            const natural = data.attributes[key];
            if (natural === undefined) return null;
            const effective = effectiveAttrs[key] ?? natural;
            return (
              <div key={key}>
                <dt>{label}</dt>
                <dd>
                  {effective}
                  {effective !== natural && ` (${natural} natural)`}
                </dd>
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
          <div>
            <dt>Attack Rating (unarmed)</dt>
            <dd>{unarmedAttackRating(effectiveAttrs)}</dd>
          </div>
          <div>
            <dt>Defense Rating</dt>
            <dd>{defenseRating(data, gearRules.gear, derived.armor, effectiveAttrs.body)}</dd>
          </div>
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

      {matrixDeviceList.length > 0 && (
        <section>
          <h3>Decker Persona</h3>
          <dl className="attribute-grid">
            {MATRIX_ATTRIBUTE_KEYS.map((key) => (
              <div key={key}>
                <dt>{MATRIX_ATTRIBUTE_LABELS[key]}</dt>
                <dd>{deckerAttribute(deckerResolvedAllocation, key)}</dd>
              </div>
            ))}
            <div>
              <dt>Attack Rating</dt>
              <dd>{deckerAttackRating(deckerResolvedAllocation)}</dd>
            </div>
            <div>
              <dt>Defense Rating</dt>
              <dd>{deckerDefenseRating(deckerResolvedAllocation)}</dd>
            </div>
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
                <dd>{astralAttackRating(effectiveAttrs, data.traditionAttribute)}</dd>
              </div>
              <div>
                <dt>Defense Rating</dt>
                <dd>{astralDefenseRating(effectiveAttrs)}</dd>
              </div>
              <div>
                <dt>Initiative</dt>
                <dd>{astralInitiative(effectiveAttrs)} + 2D6</dd>
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
            {gearForSummary.map((g, i) => {
              const entry = g.itemId ? findGearEntry(g.itemId, gearRules.gear) : undefined;
              const attached = isWeapon(entry) ? accessoriesByTarget.get(gearLineKey(g)) : undefined;
              return (
                <li key={i}>
                  {g.name} x{g.qty}
                  {g.bondingKarma ? ` (${g.bondingKarma * g.qty} Karma bonding)` : ""}
                  {attached && attached.length > 0 && (
                    <ul>
                      {attached.map((acc, j) => (
                        <li key={j}>
                          {acc.name} x{acc.qty}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section>
        <h3>Resources</h3>
        <p>{data.nuyen.toLocaleString()}¥ earned</p>
        {(data.karmaSpentOnNuyen ?? 0) > 0 && (
          <p>{nuyenFromKarmaConversion(data).toLocaleString()}¥ from converting Karma</p>
        )}
        <p>{gearCostTotal(data.gear).toLocaleString()}¥ spent on gear</p>
        {lifestyleSpend > 0 && <p>{lifestyleSpend.toLocaleString()}¥ spent on lifestyle</p>}
        <p>{nuyenRemaining(data, lifestyleSpend).toLocaleString()}¥ remaining</p>
        <p>{data.karma.toLocaleString()} Karma pool</p>
        <p>{gearBondingKarmaTotal(data.gear).toLocaleString()} Karma spent bonding foci</p>
        {(data.karmaSpentOnNuyen ?? 0) > 0 && (
          <p>{(data.karmaSpentOnNuyen ?? 0).toLocaleString()} Karma converted to nuyen</p>
        )}
        <p>{spellKarma.toLocaleString()} Karma spent on spells</p>
        {complexFormKarma > 0 && <p>{complexFormKarma.toLocaleString()} Karma spent on complex forms</p>}
        {metavariantKarma > 0 && <p>{metavariantKarma.toLocaleString()} Karma spent on metavariant</p>}
        {contactsKarma > 0 && <p>{contactsKarma.toLocaleString()} Karma spent on contacts</p>}
        {initiationKarma > 0 && <p>{initiationKarma.toLocaleString()} Karma spent on Initiation/Submersion</p>}
        {customCyberdeckKarma > 0 && (
          <p>{customCyberdeckKarma.toLocaleString()} Karma spent DIY-building a custom cyberdeck</p>
        )}
        {skillAdvancementKarma > 0 && <p>{skillAdvancementKarma.toLocaleString()} Karma spent on skill ranks</p>}
        {specializationKarma > 0 && <p>{specializationKarma.toLocaleString()} Karma spent on specializations</p>}
        <p>
          {karmaRemaining(
            data,
            spellKarma +
              complexFormKarma +
              metavariantKarma +
              contactsKarma +
              initiationKarma +
              customCyberdeckKarma +
              skillAdvancementKarma +
              specializationKarma
          ).toLocaleString()}{" "}
          Karma remaining
        </p>
        {adjustmentPoints && (
          <p>
            {adjustmentPoints.remaining.toLocaleString()} / {adjustmentPoints.total.toLocaleString()} Adjustment
            Points remaining
          </p>
        )}
      </section>
    </div>
  );
}
