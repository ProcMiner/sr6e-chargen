// Reputation & Heat (core rulebook "Running the Game," pp. 235-237) plus a
// short Run Compensation reference blurb (p. 243) - see deriveReputation.ts
// for the rationale. Reputation/Heat are plain GM-adjusted running scores,
// not formulas, so this is a +/- adjuster next to reference text, same
// treatment as Physical/Stun/Edge above in LivePlay.tsx.
import type { CharacterData } from "../../character";
import {
  HEAT_EFFECTS,
  HEAT_REDUCTION_METHODS,
  HEAT_ROLL_MODIFIERS,
  REPUTATION_CHANGES,
  REPUTATION_HIGH_THRESHOLD,
  REPUTATION_LOW_THRESHOLD,
  currentHeat,
  currentReputation,
  heatEffectFor,
} from "../../deriveReputation";

interface Props {
  data: CharacterData;
  onChange: (data: CharacterData) => void;
}

export function ReputationHeat({ data, onChange }: Props) {
  const reputation = currentReputation(data);
  const heat = currentHeat(data);
  const heatTier = heatEffectFor(heat);

  function adjustReputation(delta: number) {
    onChange({ ...data, reputation: reputation + delta });
  }

  function adjustHeat(delta: number) {
    onChange({ ...data, heat: Math.max(0, heat + delta) });
  }

  return (
    <div className="reputation-heat-panel">
      <h2>Reputation &amp; Heat</h2>

      <section>
        <h3>Reputation</h3>
        <p>{reputation}</p>
        <div className="chip-row">
          <button onClick={() => adjustReputation(-1)}>-1</button>
          <button onClick={() => adjustReputation(1)}>+1</button>
        </div>
        {reputation >= REPUTATION_HIGH_THRESHOLD && (
          <p className="hint">
            {REPUTATION_HIGH_THRESHOLD}+: gain Edge at the start of social interactions with law enforcement,
            community residents, and other runners - but hardened criminals gain Edge against you instead.
          </p>
        )}
        {reputation <= REPUTATION_LOW_THRESHOLD && (
          <p className="hint">
            {REPUTATION_LOW_THRESHOLD} or lower: law enforcement, community residents, and other runners gain Edge
            against you - but you gain Edge at the start of social interactions with hardened criminals instead.
          </p>
        )}
        <details className="quality-section">
          <summary>Reputation Changes (GM guideline, not a definitive list)</summary>
          <table className="rules-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              {REPUTATION_CHANGES.map(({ action, change }) => (
                <tr key={action}>
                  <td>{action}</td>
                  <td>{change}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </section>

      <section>
        <h3>Heat</h3>
        <p>{heat}</p>
        <div className="chip-row">
          <button onClick={() => adjustHeat(-1)} disabled={heat <= 0}>
            -1
          </button>
          <button onClick={() => adjustHeat(1)}>+1</button>
        </div>
        <p className="hint">{heatTier.effect}</p>
        <p className="hint">
          At the end of every session the GM rolls 2D6 (adjusted by the Heat Roll Modifiers below): 9+ raises
          everyone's Heat by 1, 15+ raises it by 2. If the overall modifier is -4 or lower, the check auto-fails and
          the GM awards +1 Reputation to each runner instead.
        </p>
        <details className="quality-section">
          <summary>Heat Effects</summary>
          <table className="rules-table">
            <thead>
              <tr>
                <th>Heat</th>
                <th>Effect</th>
              </tr>
            </thead>
            <tbody>
              {HEAT_EFFECTS.map((t) => (
                <tr key={t.min} className={heat >= t.min && heat <= t.max ? "current-row" : undefined}>
                  <td>{t.max === Infinity ? `${t.min}+` : t.min === t.max ? `${t.min}` : `${t.min}-${t.max}`}</td>
                  <td>{t.effect}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
        <details className="quality-section">
          <summary>Heat Roll Modifiers</summary>
          <table className="rules-table">
            <thead>
              <tr>
                <th>Circumstance</th>
                <th>Modifier</th>
              </tr>
            </thead>
            <tbody>
              {HEAT_ROLL_MODIFIERS.map(({ circumstance, modifier }) => (
                <tr key={circumstance}>
                  <td>{circumstance}</td>
                  <td>{modifier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
        <details className="quality-section">
          <summary>Lowering Heat</summary>
          <table className="rules-table">
            <thead>
              <tr>
                <th>Method</th>
                <th>Effect</th>
              </tr>
            </thead>
            <tbody>
              {HEAT_REDUCTION_METHODS.map(({ name, effect }) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>{effect}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </section>

      <section>
        <h3>Run Compensation</h3>
        <p className="hint">
          GM guidance, not tracked here - award Karma/Nuyen above in Karma &amp; Advancement. Karma: 5 is the base
          unit (the same multiplier as attribute/skill/specialization costs) - 1-2 for a session that struggled, 3-4
          for solid progress, 5-6 for an excellent or run-completing session. Cash: 5,000¥ (one month of a Middle
          lifestyle) is the base unit per runner - scale up for longer or more dangerous jobs.
        </p>
      </section>
    </div>
  );
}
