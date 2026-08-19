// The Astral Plane (core rulebook p.159-163): Assensing, Astral Projection,
// Astral Combat, Astral Tracking, Mana Barriers. Same "no dice-rolling
// engine" treatment as Spirits.tsx (Conjuring) - only what's directly
// computable from the character's own attributes (Astral Combat's Attack/
// Defense Rating, Astral Projection's time limit) is a real number; every
// opposed/extended test stays a reference formula for the player to
// resolve at the table. Astral Initiative itself lives in derive.ts
// (shared with Living Persona), not duplicated here.
import type { CharacterData } from "../../character";
import { astralInitiative, effectiveAttributes } from "../../derive";
import { isAdept, isMysticAdept } from "../../deriveAdeptPowers";
import { modifierBonuses } from "../../deriveModifiers";
import {
  ASSENSING_TABLE,
  ASTRAL_TRACKING_MODIFIERS,
  MANA_BARRIERS_TABLE,
  adeptDrainResistancePool,
  astralAttackRating,
  astralDefenseRating,
  astralProjectionMaxHours,
  astralUnarmedDamage,
  centeringDrainBonus,
  traditionDrainResistancePool,
} from "../../deriveAstral";

interface Props {
  data: CharacterData;
}

export function Astral({ data }: Props) {
  const magic = data.attributes.magic;
  if (magic === undefined) return null;
  const traditionAttribute = data.traditionAttribute;
  const pureAdept = isAdept(data);
  const mysticAdept = isMysticAdept(data);
  const effectiveAttrs = effectiveAttributes(data.attributes, modifierBonuses(data.gear, data.adeptPowers));
  const centeringBonus = centeringDrainBonus(data);

  return (
    <div className="astral-panel">
      <h2>The Astral Plane</h2>

      <details className="quality-section">
        <summary>Drain Resistance</summary>
        <p className="hint">
          Reduces drain damage by 1 per hit rolled, to a minimum of 0. Drain is Stun damage by default,
          unless the specific power/spell/effect that caused it says otherwise. Can't be healed by rest,
          medkits, or magic - only time or Edge.
        </p>
        {pureAdept ? (
          <p className="hint">
            Adept Power Drain: Body + Willpower ={" "}
            <strong>{adeptDrainResistancePool(effectiveAttrs)}</strong>
          </p>
        ) : traditionAttribute ? (
          <>
            <p className="hint">
              Spellcasting/Conjuring/Enchanting Drain: Willpower + Tradition Attribute{centeringBonus > 0 && " + Centering"} ={" "}
              <strong>{traditionDrainResistancePool(effectiveAttrs, traditionAttribute) + centeringBonus}</strong>
            </p>
            {mysticAdept && (
              <p className="hint">
                Adept Power Drain: Body + Willpower ={" "}
                <strong>{adeptDrainResistancePool(effectiveAttrs)}</strong>
              </p>
            )}
          </>
        ) : (
          <p className="hint">
            Choose a Tradition Attribute (in the builder's Magic or Resonance section) to compute this.
          </p>
        )}
      </details>

      <details className="quality-section">
        <summary>Assensing</summary>
        <p className="hint">
          Astral + Intuition (untrained is fine if you can astrally perceive but lack ranks) - net hits
          reveal more per the table below. Requires astral perception (magician, aspected magician, or an
          adept/mystic adept with the Astral Perception power); using it makes you dual-natured with a -2
          dice pool penalty to non-Magic actions.
        </p>
        <table className="rules-table">
          <thead>
            <tr>
              <th># Hits</th>
              <th>Information learned</th>
            </tr>
          </thead>
          <tbody>
            {ASSENSING_TABLE.map(({ hits, info }) => (
              <tr key={hits}>
                <td>{hits}</td>
                <td>
                  <ul>
                    {info.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <details className="quality-section">
        <summary>Astral Projection</summary>
        <p className="hint">
          Astral running: 5 km/Combat Round (too fast to take anything in). Astral walk: 100 m/Combat
          Round (lets you observe surroundings). Manifesting (becoming faintly visible/audible on the
          physical plane, no physical presence or spellcasting there) is a Major Action, same to end it.
        </p>
        <p className="hint">
          Time limit before Essence loss begins: <strong>{astralProjectionMaxHours(magic)} hours</strong> (Magic{" "}
          {magic} x 2). Past that, Essence drops 1 per hour away (recovers 1/hour after you return) -
          hitting 0 kills the physical body. Finding a body that's been moved: Astral + Intuition test, GM
          sets the threshold from how far/well-hidden it is; each net hit beyond the first success halves
          the time to find it. Mystic Adepts can never astrally project, even with Astral Perception.
        </p>
      </details>

      <details className="quality-section">
        <summary>Astral Combat</summary>
        {traditionAttribute ? (
          <p className="hint">
            Attack Rating <strong>{astralAttackRating(effectiveAttrs, traditionAttribute)}</strong> |
            Defense Rating <strong>{astralDefenseRating(effectiveAttrs)}</strong> | Initiative{" "}
            <strong>{astralInitiative(effectiveAttrs)} + 2D6</strong> | Unarmed Damage Value{" "}
            <strong>{astralUnarmedDamage(effectiveAttrs, traditionAttribute)}</strong>P/S (+1 per net hit)
          </p>
        ) : (
          <p className="hint">
            Choose a Tradition Attribute (in the builder's Magic or Resonance section) to compute these.
          </p>
        )}
        <p className="hint">
          Dice pools - Unarmed: Astral + Willpower vs. Intuition + Logic. Weapon foci: Close Combat +
          Willpower vs. Intuition + Logic (Willpower substitutes for Agility; melee only, no ranged weapon
          attacks in astral combat - use a spell instead). Spellcasting: Sorcery + Magic (Mana spells
          only). Damage Resistance: Willpower - the attacker chooses Physical or Stun damage. Weapon focus
          damage equals the weapon's physical value, +1 per net hit. Mana barriers can only be damaged by
          Physical damage.
        </p>
      </details>

      <details className="quality-section">
        <summary>Astral Tracking</summary>
        <p className="hint">
          Astral + Intuition (5, 1 hour) Extended test, modified by the table below. Nearly all magical
          things (spirits, spells, foci, magical lodges) carry an astral link back to whoever's
          responsible for them - the summoner, the caster, the activating magician.
        </p>
        <table className="rules-table">
          <thead>
            <tr>
              <th>Condition</th>
              <th>Threshold modifier</th>
            </tr>
          </thead>
          <tbody>
            {ASTRAL_TRACKING_MODIFIERS.map(({ condition, modifier }) => (
              <tr key={condition}>
                <td>{condition}</td>
                <td>{modifier}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <details className="quality-section">
        <summary>Mana Barriers</summary>
        <p className="hint">
          Physical-plane barriers are invisible to normal sight but solid to spells, manifesting/dual-
          natured entities, spirits, and active foci - a spell cast through one adds the barrier's rating
          to the defense pool (or, for an otherwise-unopposed spell, turns it into an Opposed test against
          barrier rating x 2). Astral-plane barriers are solid, hazily opaque walls that block astral
          movement and impose a visual penalty equal to their Force. Dual-natured barriers do both at
          once. Adept powers and always-on critter powers ignore barriers; creators pass through their own
          barriers freely, and can let others through too.
        </p>
        <p className="hint">
          Breaking through deliberately: deal with the barrier's Structure rating (it regenerates fully
          each Combat Round), or press through with a Magic + Charisma vs. (Structure x 2) Opposed test -
          net hits let you (and that many companions) cross. Running into one unaware resolves as an
          Opposed test instead: living beings roll Magic + Charisma, foci Force x 2, preparations Potency
          x 2, barriers Structure x 2, spells the caster's Magic x 2 - the loser is disrupted (spells
          dissipate, foci deactivate, spirits go home, living beings take a full Stun Condition Monitor);
          ties disrupt everything.
        </p>
        <table className="rules-table">
          <thead>
            <tr>
              <th>Mana barrier</th>
              <th>Astral or physical</th>
              <th>Reference</th>
            </tr>
          </thead>
          <tbody>
            {MANA_BARRIERS_TABLE.map(({ barrier, astralOrPhysical, reference }) => (
              <tr key={barrier}>
                <td>{barrier}</td>
                <td>{astralOrPhysical}</td>
                <td>{reference}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
