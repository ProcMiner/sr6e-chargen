// Skills card (SR6 Character Sheet Design handoff) - Active Skills (Skill/
// Linked/Rank/Pool/Specialization) and Knowledge/Language Skills (Skill/
// Type/Level). Pool = rank + linked attribute only, same convention as
// pdfSheet.ts and Matrix.tsx's hackingDicePools - a Specialization/Expertise
// bonus only applies when a test actually falls within that narrow focus
// (core rulebook p.92), so it's shown as its own column, never added in.
import type { CharacterData } from "../character";
import { LANGUAGE_LEVEL_NAMES } from "../character";
import { effectiveAttributes } from "../derive";
import { modifierBonuses } from "../deriveModifiers";
import type { PriorityRulesResponse } from "../rules";

interface Props {
  data: CharacterData;
  priorityRules: PriorityRulesResponse;
}

export function SkillsCard({ data, priorityRules }: Props) {
  const effectiveAttrs = effectiveAttributes(data.attributes, modifierBonuses(data.gear, data.adeptPowers));
  const skillEntries = Object.entries(data.skills).filter(([, rank]) => rank > 0);
  const knowledgeLines = data.nativeLanguage
    ? [{ id: "native", name: data.nativeLanguage, type: "language" as const, level: 4 as const }, ...data.knowledgeSkills]
    : data.knowledgeSkills;

  function specializationsFor(skill: string): string {
    const matches = (data.specializations ?? []).filter((s) => s.skill === skill);
    if (matches.length === 0) return "—";
    return matches.map((s) => (s.tier === "expertise" ? `${s.focus} (Expertise)` : s.focus)).join(", ");
  }

  if (skillEntries.length === 0 && knowledgeLines.length === 0) return null;

  return (
    <div className="sheet-card">
      {skillEntries.length > 0 && (
        <>
          <div className="rules-kicker">Skills — Active</div>
          <table className="rules-table">
            <thead>
              <tr>
                <th>Skill</th>
                <th>Linked</th>
                <th>Rank</th>
                <th>Pool</th>
                <th>Specialization</th>
              </tr>
            </thead>
            <tbody>
              {skillEntries.map(([skill, rank]) => {
                const attrKey = priorityRules.skillLinkedAttribute[skill];
                const attrValue = attrKey ? (effectiveAttrs as unknown as Record<string, number | undefined>)[attrKey] : undefined;
                return (
                  <tr key={skill}>
                    <td>{skill}</td>
                    <td className="cell-dim">{attrKey ?? "—"}</td>
                    <td>{rank}</td>
                    <td className="cell-accent">{attrValue !== undefined ? rank + attrValue : rank}</td>
                    <td className="cell-dim">{specializationsFor(skill)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      {knowledgeLines.length > 0 && (
        <>
          <div className="hr" />
          <div className="rules-kicker">Knowledge &amp; Language Skills</div>
          <table className="rules-table">
            <thead>
              <tr>
                <th>Skill</th>
                <th>Type</th>
                <th>Level</th>
              </tr>
            </thead>
            <tbody>
              {knowledgeLines.map((k) => (
                <tr key={k.id}>
                  <td>{k.name}</td>
                  <td className="cell-dim">{k.type === "language" ? "Language" : "Knowledge"}</td>
                  <td>{k.type === "language" ? LANGUAGE_LEVEL_NAMES[k.level ?? 1] : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
