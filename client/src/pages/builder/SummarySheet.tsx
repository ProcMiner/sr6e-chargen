import type { CharacterData } from "../../character";
import { deriveStats } from "../../derive";
import { combineQualityCatalog, findQualityEntry, qualityDisplayName, qualityKarmaAmount } from "../../deriveQualities";
import { gearBondingKarmaTotal, gearCostTotal, karmaRemaining, nuyenRemaining } from "../../deriveGear";
import { currentEssence, effectiveMagic, effectiveResonance } from "../../deriveEssence";
import type { MetatypeAttributes, QualityRulesResponse } from "../../rules";

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
}

export function SummarySheet({ data, qualityRules, metatypeAttributes }: Props) {
  const derived = deriveStats(data.attributes);
  const essence = currentEssence(data);
  const magicRaw = data.attributes.magic;
  const resonanceRaw = data.attributes.resonance;
  const magicEffective = effectiveMagic(data);
  const resonanceEffective = effectiveResonance(data);
  const skillEntries = Object.entries(data.skills).filter(([, rank]) => rank > 0);
  const qualityCatalog = combineQualityCatalog(qualityRules);
  const racialQualities = data.metatype
    ? metatypeAttributes.find((m) => m.metatype === data.metatype)?.racialQualities ?? []
    : [];

  return (
    <div className="summary-sheet">
      <h2>Summary</h2>
      {data.metatype && <p className="metatype">{data.metatype}</p>}

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
            {data.contacts.map((c, i) => (
              <li key={i}>
                {c.name} (Connection {c.connection} / Loyalty {c.loyalty})
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
        <p>{nuyenRemaining(data).toLocaleString()}¥ remaining</p>
        <p>{data.karma.toLocaleString()} Karma pool</p>
        <p>{gearBondingKarmaTotal(data.gear).toLocaleString()} Karma spent bonding foci</p>
        <p>{karmaRemaining(data).toLocaleString()} Karma remaining</p>
      </section>
    </div>
  );
}
