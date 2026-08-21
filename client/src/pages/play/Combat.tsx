// Mundane Combat (core rulebook pp. 67, 104-111) - Attack/Defense Rating,
// the Combat Process, and reference tables for everything else. Same "no
// dice-rolling engine" treatment as Astral.tsx/Matrix.tsx: only Attack
// Rating and Defense Rating are directly computable from the character's
// own attributes/gear; the rest (Edge distribution, Combat Options,
// Barriers) is reference text the table resolves by hand. Deliberately
// excludes the full generic Edge Actions catalog (p. 47 - spans every
// discipline, not just combat) and the Barrier-breaking-through math (deep
// GM-facing minutiae) - same scope boundary as Matrix's Hosts/IC exclusion.
import { useState } from "react";
import type { CharacterData } from "../../character";
import type { GearRulesResponse } from "../../rules";
import { deriveStats, effectiveAttributes } from "../../derive";
import { modifierBonuses } from "../../deriveModifiers";
import {
  COMBAT_OPTIONS,
  COMBAT_PROCESS_STEPS,
  DAMAGE_TYPES,
  EDGE_IN_COMBAT,
  FIRING_MODES,
  RANGE_CATEGORIES,
  defenseRating,
  unarmedAttackRating,
  weaponAttackRatings,
  wornArmorTotal,
} from "../../deriveCombat";

type ReferenceSection = "process" | "edge" | "ranges" | "damage" | "options";

const REFERENCE_SECTIONS: { id: ReferenceSection; label: string }[] = [
  { id: "process", label: "Combat process" },
  { id: "edge", label: "Edge in combat" },
  { id: "ranges", label: "Ranges & firing modes" },
  { id: "damage", label: "Damage types" },
  { id: "options", label: "Combat options" },
];

interface Props {
  data: CharacterData;
  gearRules: GearRulesResponse;
}

export function Combat({ data, gearRules }: Props) {
  const [section, setSection] = useState<ReferenceSection>("process");
  const bonuses = modifierBonuses(data.gear ?? [], data.adeptPowers ?? []);
  const derived = deriveStats(data.attributes, bonuses);
  const effectiveAttrs = effectiveAttributes(data.attributes, bonuses);
  const armor = wornArmorTotal(data, gearRules.gear);
  const dr = defenseRating(data, gearRules.gear, derived.armor, effectiveAttrs.body);
  const weaponRatings = weaponAttackRatings(data, gearRules.gear, effectiveAttrs);

  return (
    <div className="combat-panel">
      <h2>Combat</h2>

      <section>
        <h3>Attack Rating &amp; Defense Rating</h3>
        <p className="hint">
          Unarmed Attack Rating <strong>{unarmedAttackRating(effectiveAttrs)}</strong> (Strength + Reaction). A melee
          weapon instead adds your Strength directly to its own printed Attack Rating; both are shown per owned
          weapon below, including any bonus from an attached Weapon Accessory (see Gear's "Mounted on" picker).
        </p>
        <p className="hint">
          Defense Rating <strong>{dr}</strong> (Body {effectiveAttrs.body ?? 0} + worn armor {armor} + augmentation
          armor {derived.armor}). Worn armor is your single best owned Clothes/Armor item (base suits aren't
          cumulative with each other) plus every Helmet/Shield you own (those do stack).
        </p>
        {weaponRatings.length > 0 && (
          <table className="rules-table">
            <thead>
              <tr>
                <th>Weapon</th>
                <th>Attack Ratings (Close/Near/Medium/Far/Extreme)</th>
                <th>Bonus</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {weaponRatings.map((w, i) => (
                <tr key={i}>
                  <td>{w.line.name}</td>
                  <td>
                    {w.effectiveAttackRatings}
                    {w.bonus !== 0 && ` (base ${w.baseAttackRatings})`}
                  </td>
                  <td>{w.bonusSources.length > 0 ? w.bonusSources.join(", ") : "-"}</td>
                  <td>{w.modeNotes.length > 0 ? w.modeNotes.join(" ") : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h3>Combat reference</h3>
        <p className="rules-kicker">Core rulebook pp. 67, 104-111</p>
        <div className="rules-nav">
          {REFERENCE_SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={s.id === section ? "chip selected" : "chip"}
              onClick={() => setSection(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>

        {section === "process" && (
          <>
            <table className="rules-table">
              <thead>
                <tr>
                  <th>Step</th>
                  <th>Summary</th>
                </tr>
              </thead>
              <tbody>
                {COMBAT_PROCESS_STEPS.map(({ step, summary }) => (
                  <tr key={step}>
                    <td>{step}</td>
                    <td>{summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="hint">
              Edge tie-break for Initiative ties: compare Edge, then Reaction, then Intuition (ERIC) - whoever's
              higher first goes first; a coin flip breaks any remaining tie.
            </p>
          </>
        )}

        {section === "edge" && (
          <table className="rules-table">
            <thead>
              <tr>
                <th>Cost</th>
                <th>Uses</th>
              </tr>
            </thead>
            <tbody>
              {EDGE_IN_COMBAT.map(({ cost, uses }) => (
                <tr key={cost}>
                  <td>{cost}</td>
                  <td>
                    <ul>
                      {uses.map((u) => (
                        <li key={u}>{u}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {section === "ranges" && (
          <div className="rules-two-col">
            <table className="rules-table">
              <thead>
                <tr>
                  <th>Range</th>
                  <th>Distance</th>
                </tr>
              </thead>
              <tbody>
                {RANGE_CATEGORIES.map(({ name, distance }) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{distance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <table className="rules-table">
              <thead>
                <tr>
                  <th>Firing Mode</th>
                  <th>Effect</th>
                </tr>
              </thead>
              <tbody>
                {FIRING_MODES.map(({ mode, effect }) => (
                  <tr key={mode}>
                    <td>{mode}</td>
                    <td>{effect}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {section === "damage" && (
          <table className="rules-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Secondary effect</th>
              </tr>
            </thead>
            <tbody>
              {DAMAGE_TYPES.map(({ type, effect }) => (
                <tr key={type}>
                  <td>{type}</td>
                  <td>{effect}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {section === "options" && (
          <table className="rules-table">
            <thead>
              <tr>
                <th>Option</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {COMBAT_OPTIONS.map(({ name, summary }) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>{summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
