// A decker's Matrix persona configuration - the non-technomancer mirror of
// LivingPersonaPanel.tsx. Shown once the character owns a cyberdeck,
// commlink, or cyberjack with printed Matrix attributes (core rulebook
// p.174, 178) - self-gates like LivingPersonaPanel does for Resonance.
import type { CharacterData, DeckerPersonaAllocation } from "../../../character";
import type { GearRulesResponse } from "../../../rules";
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
  matrixConditionMonitor,
  matrixDevices,
  remainingMatrixValues,
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
  const allocation = deckerAllocation(data);

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
        Matrix Initiative - AR: {deckerMatrixInitiativeAR(data.attributes)} + 1D6 | VR (cold-sim):{" "}
        {deckerMatrixInitiativeVRCold(data.attributes, allocation)} + 1D6 | VR (hot-sim):{" "}
        {deckerMatrixInitiativeVRHot(data.attributes, allocation)} + 2D6
      </p>
    </div>
  );
}
