// Attributes + Derived Stats two-column card (SR6 Character Sheet Design
// handoff) - the Derived Stats list matches the official Genesis sheet's
// right-hand Attributes-page column (Minor Actions/Initiative/Initiative
// (Matrix VR)/Initiative (Astral)/Defense/Composure/Judge Intentions/
// Memory/Lift-Carry), not the design mockup's invented list (that mockup
// included a non-SR6 "Movement" stat and a combined-total wound table -
// dropped/replaced here in favor of the real rulebook formulas, all already
// implemented in derive.ts).
import type { CharacterData } from "../character";
import {
  astralInitiative,
  composure,
  defenseTestPool,
  deriveStats,
  effectiveAttributes,
  judgeIntentions,
  liftCarry,
  memory,
  minorActions,
} from "../derive";
import { unarmedAttackRating } from "../deriveCombat";
import { matrixDevices, matrixVrInitDice, deckerMatrixInitiativeVRCold, deckerAllocation, resolveDeckerAllocation } from "../deriveDeckerPersona";
import { currentEssence, effectiveMagic, effectiveResonance, formatEssence } from "../deriveEssence";
import { livingPersonaInitiative } from "../deriveLivingPersona";
import { modifierBonuses } from "../deriveModifiers";
import type { GearRulesResponse } from "../rules";

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

interface Props {
  data: CharacterData;
  gearRules: GearRulesResponse | null;
}

export function AttributesDerivedCard({ data, gearRules }: Props) {
  const bonuses = modifierBonuses(data.gear, data.adeptPowers);
  const derived = deriveStats(data.attributes, bonuses);
  const effectiveAttrs = effectiveAttributes(data.attributes, bonuses);
  const essence = currentEssence(data);
  const magicEffective = effectiveMagic(data);
  const resonanceEffective = effectiveResonance(data);
  const isTechnomancer = data.attributes.resonance !== undefined;
  const devices = gearRules ? matrixDevices(data, gearRules) : [];
  const isMatrixEquipped = isTechnomancer || devices.length > 0;

  let matrixInitLine: string | null = null;
  if (isTechnomancer) {
    matrixInitLine = `${livingPersonaInitiative(data)} + 1d6`;
  } else if (devices.length > 0) {
    const allocation = resolveDeckerAllocation(devices, deckerAllocation(data));
    matrixInitLine = `${deckerMatrixInitiativeVRCold(effectiveAttrs, allocation)} + ${matrixVrInitDice(1, devices)}d6`;
  }

  return (
    <div className="rules-two-col">
      <div className="sheet-card">
        <div className="rules-kicker">Attributes</div>
        {ATTRIBUTE_LABELS.map(([key, label]) => {
          const natural = data.attributes[key];
          if (natural === undefined) return null;
          const effective = effectiveAttrs[key] ?? natural;
          const diff = effective - natural;
          return (
            <div key={key} className="kv-row">
              <span className="kv-label">{label}</span>
              <span className="kv-value num">
                {natural}
                {diff !== 0 && <span className="kv-mod">{diff > 0 ? ` (+${diff})` : ` (${diff})`}</span>}
              </span>
            </div>
          );
        })}
        {data.attributes.magic !== undefined && (
          <div className="kv-row">
            <span className="kv-label">Magic</span>
            <span className="kv-value num">
              {data.attributes.magic}
              {magicEffective !== data.attributes.magic && (
                <span className="kv-mod">
                  {magicEffective > data.attributes.magic ? ` (+${magicEffective - data.attributes.magic})` : ` (${magicEffective - data.attributes.magic})`}
                </span>
              )}
            </span>
          </div>
        )}
        {data.attributes.resonance !== undefined && (
          <div className="kv-row">
            <span className="kv-label">Resonance</span>
            <span className="kv-value num">
              {data.attributes.resonance}
              {resonanceEffective !== data.attributes.resonance && (
                <span className="kv-mod">
                  {resonanceEffective > data.attributes.resonance
                    ? ` (+${resonanceEffective - data.attributes.resonance})`
                    : ` (${resonanceEffective - data.attributes.resonance})`}
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      <div className="sheet-card">
        <div className="rules-kicker">Derived Stats</div>
        <div className="kv-row">
          <span className="kv-label">Minor Actions</span>
          <span className="kv-value num">{minorActions(derived)}</span>
        </div>
        <div className="kv-row">
          <span className="kv-label">Initiative</span>
          <span className="kv-value num">
            {derived.initiative} + {derived.initiativeDice}d6
          </span>
        </div>
        {isMatrixEquipped && matrixInitLine && (
          <div className="kv-row">
            <span className="kv-label">Initiative (Matrix VR)</span>
            <span className="kv-value num">{matrixInitLine}</span>
          </div>
        )}
        {data.attributes.magic !== undefined && (
          <div className="kv-row">
            <span className="kv-label">Initiative (Astral)</span>
            <span className="kv-value num">{astralInitiative(effectiveAttrs)} + 2d6</span>
          </div>
        )}
        <div className="kv-row">
          <span className="kv-label">Defense (Pool)</span>
          <span className="kv-value num">{defenseTestPool(data.attributes)}</span>
        </div>
        <div className="kv-row">
          <span className="kv-label">Composure</span>
          <span className="kv-value num">{composure(data.attributes)}</span>
        </div>
        <div className="kv-row">
          <span className="kv-label">Judge Intentions</span>
          <span className="kv-value num">{judgeIntentions(data.attributes)}</span>
        </div>
        <div className="kv-row">
          <span className="kv-label">Memory</span>
          <span className="kv-value num">{memory(data.attributes)}</span>
        </div>
        <div className="kv-row">
          <span className="kv-label">Lift / Carry</span>
          <span className="kv-value num">{liftCarry(data.attributes)}</span>
        </div>
        <div className="kv-row">
          <span className="kv-label">Essence</span>
          <span className="kv-value num">{formatEssence(essence)}</span>
        </div>
        <div className="kv-row">
          <span className="kv-label">Unarmed Attack Rating</span>
          <span className="kv-value num">{unarmedAttackRating(effectiveAttrs)}</span>
        </div>
      </div>
    </div>
  );
}
