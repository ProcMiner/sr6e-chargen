// A decker's Matrix persona configuration - the non-technomancer mirror of
// LivingPersonaPanel.tsx. Shown once the character owns a cyberdeck,
// commlink, or cyberjack with printed Matrix attributes (core rulebook
// p.174, 178) - self-gates like LivingPersonaPanel does for Resonance.
import type { CharacterData, DeckerPersonaAllocation } from "../../../character";
import type { GearRulesResponse } from "../../../rules";
import { effectiveAttributes } from "../../../derive";
import { modifierBonuses } from "../../../deriveModifiers";
import {
  MATRIX_ATTRIBUTE_KEYS,
  MATRIX_ATTRIBUTE_LABELS,
  availableMatrixValues,
  deckerAllocation,
  deckerAttackRating,
  deckerDefenseRating,
  deckerMatrixInitiativeAR,
  deckerMatrixInitiativeVRCold,
  deckerMatrixInitiativeVRHot,
  lockedAttackSleaze,
  matrixConditionMonitor,
  matrixDevices,
  remainingMatrixValues,
  resolveDeckerAllocation,
} from "../../../deriveDeckerPersona";

interface Props {
  data: CharacterData;
  gearRules: GearRulesResponse;
  onChange: (data: CharacterData) => void;
}

export function DeckerPersonaPanel({ data, gearRules, onChange }: Props) {
  const devices = matrixDevices(data, gearRules);
  if (devices.length === 0) return null;

  const available = availableMatrixValues(devices);
  const allocation = resolveDeckerAllocation(devices, deckerAllocation(data));
  const locked = lockedAttackSleaze(devices);
  const effectiveAttrs = effectiveAttributes(data.attributes, modifierBonuses(data.gear, data.adeptPowers));

  function setSlot(key: keyof DeckerPersonaAllocation, value: string) {
    const next = value === "" ? undefined : Number(value);
    onChange({ ...data, deckerPersonaAllocation: { ...allocation, [key]: next } });
  }

  return (
    <div className="decker-persona-panel">
      <h2>Decker Persona</h2>
      <p className="hint">
        Assign each device's printed Attack/Sleaze or Data Processing/Firewall numbers to whichever named
        Matrix attribute you want - the book confirms these can be freely recombined across devices (core
        rulebook p.174, 178). Unassigned slots are 0.
        {locked && (
          <>
            {" "}
            A custom cyberdeck's Attack/Sleaze are locked to that device and can't join this pool (Hack &amp;
            Slash p.34, "you may not rotate out your Attack and Sleaze attributes") - only Data
            Processing/Firewall stay freely assignable below.
          </>
        )}
      </p>
      <ul className="module-slots">
        {devices.map((d) => (
          <li key={d.name}>
            <div className="module-instance">
              <strong>{d.name}</strong>
              <span className="hint">
                {" "}
                Device Rating {d.deviceRating}, values {d.values.join("/")}, Matrix Condition Monitor{" "}
                {matrixConditionMonitor(d.deviceRating)}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <dl className="attribute-grid">
        {MATRIX_ATTRIBUTE_KEYS.map((key) => {
          const isLockedSlot = !!locked && (key === "attack" || key === "sleaze");
          if (isLockedSlot) {
            return (
              <div key={key}>
                <dt>{MATRIX_ATTRIBUTE_LABELS[key]}</dt>
                <dd>
                  {allocation[key]} <span className="hint">(locked to custom cyberdeck)</span>
                </dd>
              </div>
            );
          }
          const options = remainingMatrixValues(available, allocation, key);
          const current = allocation[key];
          return (
            <div key={key}>
              <dt>{MATRIX_ATTRIBUTE_LABELS[key]}</dt>
              <dd>
                <select value={current ?? ""} onChange={(e) => setSlot(key, e.target.value)}>
                  <option value="">0</option>
                  {options.map((v, i) => (
                    <option key={i} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </dd>
            </div>
          );
        })}
      </dl>

      <p className="hint">
        Attack Rating {deckerAttackRating(allocation)} | Defense Rating {deckerDefenseRating(allocation)}
      </p>
      <p className="hint">
        Matrix Initiative - AR: {deckerMatrixInitiativeAR(effectiveAttrs)} + 1D6 | VR (cold-sim):{" "}
        {deckerMatrixInitiativeVRCold(effectiveAttrs, allocation)} + 1D6 | VR (hot-sim):{" "}
        {deckerMatrixInitiativeVRHot(effectiveAttrs, allocation)} + 2D6
      </p>
    </div>
  );
}
