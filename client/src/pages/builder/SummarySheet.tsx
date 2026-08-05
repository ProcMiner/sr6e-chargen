import type { CharacterData } from "../../character";
import { deriveStats } from "../../derive";
import { combineQualityCatalog, findQualityEntry, qualityDisplayName, qualityKarmaAmount } from "../../deriveQualities";
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
  ["magic", "Magic"],
  ["resonance", "Resonance"],
];

interface Props {
  data: CharacterData;
  qualityRules: QualityRulesResponse;
  metatypeAttributes: MetatypeAttributes[];
}

export function SummarySheet({ data, qualityRules, metatypeAttributes }: Props) {
  const derived = deriveStats(data.attributes);
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

      <section>
        <h3>Resources</h3>
        <p>{data.nuyen.toLocaleString()}¥</p>
        <p>{data.karma} Karma</p>
      </section>
    </div>
  );
}
