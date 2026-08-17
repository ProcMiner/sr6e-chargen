// Conjuring: summoning and tracking bound spirits during play. Core
// rulebook "Conjuring," p. 146-149 - see server/src/rules/spirits.ts for
// the catalog and playState.ts's BoundSpirit for why this lives in
// PlayState rather than CharacterData. This app has no dice-rolling engine
// anywhere (damage/Edge/Karma are always player-reported, not rolled), so
// the actual Conjuring/Banishing tests stay a reference formula here, same
// as every other "test" in this app - only Force is entered, and the
// player reports back the net hits/drain they rolled at the table.
import { useState } from "react";
import type { CharacterData } from "../../character";
import type { BoundSpirit, PlayState } from "../../playState";
import type { SpiritRulesResponse } from "../../rules";
import { NumberStepper } from "../../components/NumberStepper";
import { generateId } from "../../id";
import {
  ASTRAL_REPUTATION_ADJUSTMENTS,
  astralReputationEffect,
  maxBoundForce,
  optionalPowerCount,
  resolveForceTemplate,
  spiritAttributes,
  spiritConditionMonitor,
  spiritDefenseRating,
} from "../../deriveSpirits";

interface Props {
  data: CharacterData;
  onDataChange: (next: CharacterData) => void;
  playState: PlayState;
  onChange: (next: PlayState) => void;
  spiritRules: SpiritRulesResponse;
}

const ATTRIBUTE_LABELS: [key: "body" | "agility" | "reaction" | "strength" | "willpower" | "logic" | "intuition" | "charisma", label: string][] = [
  ["body", "B"],
  ["agility", "A"],
  ["reaction", "R"],
  ["strength", "S"],
  ["willpower", "W"],
  ["logic", "L"],
  ["intuition", "I"],
  ["charisma", "C"],
];

export function Spirits({ data, onDataChange, playState, onChange, spiritRules }: Props) {
  const [spiritTypeId, setSpiritTypeId] = useState(spiritRules.spirits[0]?.id ?? "");
  const [forceInput, setForceInput] = useState("3");
  const [nameInput, setNameInput] = useState("");
  const [servicesInput, setServicesInput] = useState("1");
  const [chosenOptional, setChosenOptional] = useState<string[]>([]);

  const magic = data.attributes.magic ?? 0;
  const boundSpirits = playState.boundSpirits ?? [];
  const activeForce = boundSpirits.reduce((sum, s) => sum + s.force, 0);
  const forceCap = maxBoundForce(magic);
  const astralReputation = data.astralReputation ?? 0;
  const asRepEffect = astralReputationEffect(astralReputation);

  const selectedType = spiritRules.spirits.find((s) => s.id === spiritTypeId);
  const force = Math.max(1, Number(forceInput) || 1);
  const availableOptionalSlots = selectedType ? optionalPowerCount(force) : 0;

  function findPower(powerId: string) {
    return spiritRules.spiritPowers.find((p) => p.id === powerId);
  }

  function toggleOptional(powerId: string) {
    setChosenOptional((prev) => {
      if (prev.includes(powerId)) return prev.filter((id) => id !== powerId);
      if (prev.length >= availableOptionalSlots) return prev;
      return [...prev, powerId];
    });
  }

  function summon() {
    if (!selectedType) return;
    const name = nameInput.trim() || selectedType.name;
    const services = Math.max(0, Number(servicesInput) || 0);
    const entry: BoundSpirit = {
      id: generateId(),
      spiritTypeId: selectedType.id,
      name,
      force,
      servicesRemaining: services,
      conditionDamage: 0,
      optionalPowersChosen: chosenOptional,
      summonedAt: new Date().toISOString(),
    };
    onChange({ ...playState, boundSpirits: [...boundSpirits, entry] });
    setNameInput("");
    setServicesInput("1");
    setChosenOptional([]);
  }

  function updateSpirit(id: string, patch: Partial<BoundSpirit>) {
    onChange({
      ...playState,
      boundSpirits: boundSpirits.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  }

  function dismiss(id: string) {
    onChange({ ...playState, boundSpirits: boundSpirits.filter((s) => s.id !== id) });
  }

  if (magic <= 0) return null;

  return (
    <div className="spirits-panel">
      <h2>Conjuring</h2>
      <p className="hint">
        Summon: Conjuring + Magic vs. (Force x 2) - net hits = services, at least 1 net hit needed. Resist Drain
        equal to the hits (not net hits) the spirit rolled, as Charisma + Willpower vs. that as a spell's Drain
        Value (Stun, or Physical if it exceeds your Magic). Spirits have a built-in time limit of one sunrise and
        one sunset after summoning. Banishing: Conjuring + Magic vs. (spirit's Force x 2), net hits remove that many
        services; Drain is twice the hits the spirit rolled resisting.
      </p>
      <p className={activeForce > forceCap ? "danger-text" : "hint"}>
        Active Force: {activeForce} / {forceCap} (Magic {magic} x 3) max
      </p>

      <label className="inline-field">
        Astral Reputation
        <NumberStepper
          label="Astral Reputation"
          min={-10}
          max={10}
          value={astralReputation}
          onChange={(next) => onDataChange({ ...data, astralReputation: next })}
        />
      </label>
      <p className="hint">
        How spirits as a community regard you (Street Wyrd p.64-65), -10 to 10 - tracked by roleplay, not rolled.
        {asRepEffect ? ` Current effect: ${asRepEffect}` : " -5 to 5 is narrative flavor only, no mechanical effect."}
      </p>
      <details className="quality-section">
        <summary>Astral Reputation adjustments (reference)</summary>
        <ul className="skill-list">
          {ASTRAL_REPUTATION_ADJUSTMENTS.map(({ event, delta }) => (
            <li key={event}>
              <span>{event}</span>
              <span>{delta}</span>
            </li>
          ))}
        </ul>
      </details>

      <details className="quality-section">
        <summary>Summon a spirit</summary>
        <div className="inline-field">
          <label className="inline-field">
            Type
            <select value={spiritTypeId} onChange={(e) => setSpiritTypeId(e.target.value)}>
              {spiritRules.spirits.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="inline-field">
            Force
            <input
              type="text"
              inputMode="numeric"
              value={forceInput}
              onChange={(e) => {
                setForceInput(e.target.value.replace(/[^0-9]/g, ""));
                setChosenOptional([]);
              }}
            />
          </label>
          <input
            type="text"
            placeholder="Name (optional)"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          <label className="inline-field">
            Services (net hits rolled)
            <input
              type="text"
              inputMode="numeric"
              value={servicesInput}
              onChange={(e) => setServicesInput(e.target.value.replace(/[^0-9]/g, ""))}
            />
          </label>
        </div>

        {selectedType && (
          <>
            <p className="hint">{selectedType.summary}</p>
            {availableOptionalSlots > 0 && (
              <>
                <p className="hint">
                  Optional powers ({chosenOptional.length}/{availableOptionalSlots}) - fixed once summoned:
                </p>
                <div className="chip-row">
                  {selectedType.optionalPowers.map((ref) => {
                    const power = findPower(ref.powerId);
                    const chosen = chosenOptional.includes(ref.powerId);
                    return (
                      <button
                        key={ref.powerId}
                        type="button"
                        className={chosen ? "chip selected" : "chip"}
                        disabled={!chosen && chosenOptional.length >= availableOptionalSlots}
                        onClick={() => toggleOptional(ref.powerId)}
                        title={power?.summary}
                      >
                        {power?.name ?? ref.powerId}
                        {ref.note ? ` (${ref.note})` : ""}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            <button type="button" onClick={summon} disabled={servicesInput === "" || Number(servicesInput) < 1}>
              Summon
            </button>
          </>
        )}
      </details>

      {boundSpirits.length > 0 && (
        <ul className="module-slots">
          {boundSpirits.map((spirit) => {
            const type = spiritRules.spirits.find((s) => s.id === spirit.spiritTypeId);
            if (!type) return null;
            const attrs = spiritAttributes(type, spirit.force);
            const cm = spiritConditionMonitor(type, spirit.force);
            const defense = spiritDefenseRating(type, spirit.force);
            return (
              <li key={spirit.id}>
                <div className="module-instance">
                  <div className="module-instance-header">
                    <strong>
                      {spirit.name} ({type.name}, Force {spirit.force})
                    </strong>
                    <button className="danger" onClick={() => dismiss(spirit.id)}>
                      Dismiss
                    </button>
                  </div>

                  <p className="hint">
                    {ATTRIBUTE_LABELS.map(([key, label]) => `${label} ${attrs[key]}`).join(" ")} | Defense Rating{" "}
                    {defense} | Actions {type.actionsNote} | Move {type.movement}
                  </p>
                  <p className="hint">
                    Initiative {resolveForceTemplate(type.initiative, spirit.force)} | Astral Initiative{" "}
                    {resolveForceTemplate(type.astralInitiative, spirit.force)}
                  </p>
                  <p className="hint">Skills: {type.skills.map((sk) => `${sk} ${spirit.force}`).join(", ")}</p>
                  <p className="hint">
                    Powers:{" "}
                    {type.fixedPowers
                      .map((ref) => {
                        const p = findPower(ref.powerId);
                        return `${p?.name ?? ref.powerId}${ref.note ? ` (${ref.note})` : ""}`;
                      })
                      .join(", ")}
                    {spirit.optionalPowersChosen.length > 0 && (
                      <>
                        {" + "}
                        {spirit.optionalPowersChosen
                          .map((id) => {
                            const ref = type.optionalPowers.find((o) => o.powerId === id);
                            const p = findPower(id);
                            return `${p?.name ?? id}${ref?.note ? ` (${ref.note})` : ""}`;
                          })
                          .join(", ")}
                      </>
                    )}
                  </p>
                  {type.weaknesses.length > 0 && <p className="hint">Weaknesses: {type.weaknesses.join(", ")}</p>}
                  <p className="hint">
                    Attacks: {type.attacks.map((a) => resolveForceTemplate(a, spirit.force)).join("; ")}
                  </p>

                  <label className="inline-field">
                    Services remaining
                    <input
                      type="number"
                      min={0}
                      value={spirit.servicesRemaining}
                      onChange={(e) => updateSpirit(spirit.id, { servicesRemaining: Math.max(0, Number(e.target.value)) })}
                    />
                  </label>
                  <label className="inline-field">
                    Condition damage
                    <input
                      type="number"
                      min={0}
                      value={spirit.conditionDamage}
                      onChange={(e) => updateSpirit(spirit.id, { conditionDamage: Math.max(0, Number(e.target.value)) })}
                    />
                    / {cm}
                    {spirit.conditionDamage >= cm && <span className="danger-text"> (disrupted - sent home)</span>}
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
