// The Matrix (core rulebook p.174-185): Overwatch Score, Noise, Matrix
// Perception, Cybercombat, Matrix Actions, Programs. Same treatment as
// Astral.tsx - this app has no dice-rolling engine anywhere, so every
// opposed/extended test stays a reference formula; only what's directly
// computable from the character's own attributes (Matrix Initiative) is a
// real number. Shown for both deckers (via their gear-derived persona) and
// technomancers (via their existing Living Persona) - the rules are
// identical either way, only the attribute source differs. Hosts and IC
// are deliberately out of scope, same as the existing Rules Coverage
// boundary: GM-facing content, not character-build data.
import type { CharacterData } from "../../character";
import type { GearRulesResponse } from "../../rules";
import type { PlayState } from "../../playState";
import { ConditionStrip } from "../../components/ConditionStrip";
import { effectiveAttributes } from "../../derive";
import { modifierBonuses } from "../../deriveModifiers";
import {
  MATRIX_ATTRIBUTE_LABELS,
  livingPersonaAttribute,
  livingPersonaInitiative,
} from "../../deriveLivingPersona";
import {
  deckerAllocation,
  deckerAttackRating,
  deckerDefenseRating,
  deckerMatrixInitiativeAR,
  deckerMatrixInitiativeVRCold,
  deckerMatrixInitiativeVRHot,
  matrixConditionMonitor,
  matrixDevices,
  matrixVrInitDice,
  resolveDeckerAllocation,
} from "../../deriveDeckerPersona";
import {
  CONVERGENCE_OS,
  MATRIX_ACTIONS,
  MATRIX_EDGE_ACTIONS,
  MATRIX_PROGRAMS,
  NOISE_TABLE,
  OVERWATCH_SCORE_SOURCES,
  hackingDicePools,
} from "../../deriveMatrix";

interface Props {
  data: CharacterData;
  gearRules: GearRulesResponse;
  playState: PlayState;
  onChange: (next: PlayState) => void;
}

export function Matrix({ data, gearRules, playState, onChange }: Props) {
  const devices = matrixDevices(data, gearRules);
  const isTechnomancer = data.attributes.resonance !== undefined;
  if (devices.length === 0 && !isTechnomancer) return null;

  const allocation = resolveDeckerAllocation(devices, deckerAllocation(data));
  const effectiveAttrs = effectiveAttributes(data.attributes, modifierBonuses(data.gear, data.adeptPowers));
  const cmDevices = devices.filter((d) => d.hasConditionMonitor);

  function adjustMatrixDamage(deviceName: string, delta: number) {
    const current = playState.matrixDamageByDevice[deviceName] ?? 0;
    onChange({
      ...playState,
      matrixDamageByDevice: { ...playState.matrixDamageByDevice, [deviceName]: Math.max(0, current + delta) },
    });
  }

  function resetMatrixDamage(deviceName: string) {
    onChange({ ...playState, matrixDamageByDevice: { ...playState.matrixDamageByDevice, [deviceName]: 0 } });
  }

  return (
    <div className="matrix-panel">
      <h2>The Matrix</h2>

      {cmDevices.length > 0 && (
        <div className="vitals-row vitals-row--matrix">
          {cmDevices.map((d) => {
            const max = matrixConditionMonitor(d.deviceRating);
            const damage = playState.matrixDamageByDevice[d.name] ?? 0;
            const overflow = damage - max;
            return (
              <div className="vitals-card" key={d.name}>
                <div className="vitals-card-header">
                  <span className="vitals-card-label">{d.name} Matrix CM</span>
                  <span className="vitals-card-value num">
                    {damage} / {max}
                    {overflow > 0 && <span className="danger-text"> Overflow {overflow}</span>}
                  </span>
                </div>
                <ConditionStrip filled={damage} max={max} size="lg" />
                <div className="vitals-card-actions">
                  <button onClick={() => adjustMatrixDamage(d.name, -1)}>-1</button>
                  <button onClick={() => adjustMatrixDamage(d.name, 1)}>+1</button>
                  <button className="btn-ghost" onClick={() => resetMatrixDamage(d.name)}>
                    Reset
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <section>
        <h3>Matrix Initiative</h3>
        {isTechnomancer ? (
          <p className="hint">
            Living Persona: {livingPersonaInitiative(data)} + 1D6 (plus Matrix-mode adjustments this app
            doesn't track).
          </p>
        ) : (
          <p className="hint">
            AR: {deckerMatrixInitiativeAR(effectiveAttrs)} + 1D6 | VR (cold-sim):{" "}
            {deckerMatrixInitiativeVRCold(effectiveAttrs, allocation)} + {matrixVrInitDice(1, devices)}D6 | VR
            (hot-sim): {deckerMatrixInitiativeVRHot(effectiveAttrs, allocation)} + {matrixVrInitDice(2, devices)}D6
            (dice on top of the usual 1D6, capped at 5D6 total same as physical Initiative - a cyberjack's own VR
            Matrix Init Dice bonus is folded in above)
          </p>
        )}
        {isTechnomancer ? (
          <p className="hint">
            Attack {livingPersonaAttribute(data, "attack")} | Sleaze {livingPersonaAttribute(data, "sleaze")} |
            Data Processing {livingPersonaAttribute(data, "dataProcessing")} | Firewall{" "}
            {livingPersonaAttribute(data, "firewall")} | Attack Rating{" "}
            {livingPersonaAttribute(data, "attack") + livingPersonaAttribute(data, "sleaze")} | Defense Rating{" "}
            {livingPersonaAttribute(data, "dataProcessing") + livingPersonaAttribute(data, "firewall")}
          </p>
        ) : (
          <p className="hint">
            Attack Rating {deckerAttackRating(allocation)} | Defense Rating {deckerDefenseRating(allocation)} -
            configure the underlying {MATRIX_ATTRIBUTE_LABELS.attack}/{MATRIX_ATTRIBUTE_LABELS.sleaze}/
            {MATRIX_ATTRIBUTE_LABELS.dataProcessing}/{MATRIX_ATTRIBUTE_LABELS.firewall} split in the Decker
            Persona section of the builder.
          </p>
        )}
        {cmDevices.length > 0 && (
          <p className="hint">
            Device Matrix Condition Monitor -{" "}
            {cmDevices.map((d) => `${d.name}: ${matrixConditionMonitor(d.deviceRating)}`).join(", ")}. An implanted
            cyberjack has no Device Rating and isn't itself something a persona runs on - it just feeds Data
            Processing/Firewall into whatever deck it's wired to, so it doesn't get its own Condition Monitor; a
            bricked deck ends the connection regardless. Technomancers have no Matrix Condition Monitor - Matrix
            damage applies to Stun (or as otherwise specified) instead.
          </p>
        )}
      </section>

      <details className="quality-section">
        <summary>Overwatch Score &amp; Convergence</summary>
        <p className="hint">
          Every illegal Matrix action's opposing roll adds hits (not net hits) to your Overwatch Score (OS).
          At {CONVERGENCE_OS} OS, Convergence occurs: the device used for your last illegal test is bricked,
          you're dumped from the Matrix with dumpshock, and your physical location is reported to the
          authorities.
        </p>
        <ul>
          {OVERWATCH_SCORE_SOURCES.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className="hint">
          Distribute Edge: compare Attack Rating (Attack + Sleaze) to Defense Rating (Data Processing +
          Firewall) - 4+ points higher grants a bonus Edge point (max two bonus tokens/round), lost on
          leaving a host, rebooting, jacking out, or Convergence.
        </p>
        <table className="rules-table">
          <thead>
            <tr>
              <th>Matrix Edge Action</th>
              <th>Cost</th>
              <th>Effect</th>
            </tr>
          </thead>
          <tbody>
            {MATRIX_EDGE_ACTIONS.map(({ name, cost, summary }) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{cost}</td>
                <td>{summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="hint">Requires an implanted cyberjack or a Resonance score to use Matrix Edge Actions.</p>
      </details>

      <details className="quality-section">
        <summary>Dumpshock, Link-Locking &amp; Noise</summary>
        <p className="hint">
          Dumpshock: getting disconnected from VR without gracefully switching to AR first - DV 3S (cold-sim)
          or 3P (hot-sim) biofeedback damage, resisted with Willpower. Also disoriented: no Edge gain/use for
          (10 - Willpower) minutes, even if damage is fully soaked.
        </p>
        <p className="hint">
          Link-locking: another persona/device sends keep-alive signals that block Enter/Exit Host, Reboot
          Device, and Switch Interface Mode on your device. Escape with a successful Jack Out (usually still
          costs dumpshock). Falling unconscious in VR normally auto-switches you to AR - link-locked, you stay
          in VR and can't defend against actions.
        </p>
        <p className="hint">Each point of Noise gives a -1 penalty to Matrix tests; Noise greater than a device's rating blocks Matrix access and wireless bonuses entirely.</p>
        <table className="rules-table">
          <thead>
            <tr>
              <th>Condition</th>
              <th>Noise</th>
            </tr>
          </thead>
          <tbody>
            {NOISE_TABLE.map(({ condition, noise }) => (
              <tr key={condition}>
                <td>{condition}</td>
                <td>{noise}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <details className="quality-section">
        <summary>Matrix Perception, Access Levels &amp; Cybercombat</summary>
        <p className="hint">
          Matrix Perception: Electronics + Intuition vs. Willpower + Sleaze (Major) to learn about an icon; a
          public-database search instead is an Electronics + Intuition Extended test (10-minute interval).
          Detecting someone running silent is normally a Major Action, but a Minor Action if you're using a
          cyberdeck, cyberjack, or have a Resonance attribute.
        </p>
        <p className="hint">
          Access levels: Outsider (basic look-around, no privileges), User (read files, basic functions), and
          Admin (change configuration, turn devices on/off). Gaining User/Admin illicitly requires Brute Force
          or Probe - hacked Admin still isn't true ownership.
        </p>
        <p className="hint">
          Cybercombat resolves like hacking against another icon (IC, a security decker's persona). By
          default, Matrix damage is resisted with Firewall; biofeedback damage (noted per action/program) is
          resisted with Willpower instead. Bricked devices are ejected from the Matrix (with dumpshock in VR)
          and unusable until repaired: Engineering + Logic (number of boxes, 1 hour) Extended test, no toolkit
          means no repair, and a critical glitch means the device never works again.
        </p>
      </details>

      <details className="quality-section">
        <summary>Matrix Actions ({MATRIX_ACTIONS.length})</summary>
        <table className="rules-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Legal</th>
              <th>Access</th>
              <th>Type</th>
              <th>Test</th>
              <th>Effect</th>
            </tr>
          </thead>
          <tbody>
            {MATRIX_ACTIONS.map((a) => (
              <tr key={a.name}>
                <td>{a.name}</td>
                <td>{a.legal}</td>
                <td>{a.access}</td>
                <td>{a.actionType}</td>
                <td>{a.test}</td>
                <td>{a.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <details className="quality-section" open>
        <summary>Dice Pools</summary>
        <p className="hint">
          Skill rank + attribute, using your current effective attributes (augmentations included). A
          Specialization/Expertise column bonus only applies when the test actually falls within that narrow
          focus (core rulebook p.92) - it's not added to the base pool shown here.
        </p>
        <table className="rules-table">
          <thead>
            <tr>
              <th>Dice Pool</th>
              <th>Rating</th>
              <th>Specialization / Expertise</th>
              <th>Used For</th>
            </tr>
          </thead>
          <tbody>
            {hackingDicePools(data, effectiveAttrs).map((p) => (
              <tr key={p.label}>
                <td>{p.label}</td>
                <td>
                  {p.pool} ({p.skill} {p.skillRank} + {p.attributeLabel} {p.attributeValue})
                </td>
                <td>
                  {p.focusBonuses.length === 0
                    ? "-"
                    : p.focusBonuses
                        .map((f) => `${f.focus} +${f.bonus}${f.tier === "expertise" ? " (Expertise)" : ""}`)
                        .join(", ")}
                </td>
                <td>{p.usedFor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <details className="quality-section">
        <summary>Programs ({MATRIX_PROGRAMS.length})</summary>
        <p className="hint">
          The gear catalog only sells generic "Cyberprogram, Basic/Hacking" slots (Basic 60¥, Hacking 250¥) -
          note which named program below each one represents. Your device's Data Processing rating limits how
          many can run at once, though more may be stored.
        </p>
        <table className="rules-table">
          <thead>
            <tr>
              <th>Program</th>
              <th>Category</th>
              <th>Effect</th>
            </tr>
          </thead>
          <tbody>
            {MATRIX_PROGRAMS.map((p) => (
              <tr key={p.name}>
                <td>{p.name}</td>
                <td>
                  {p.category}
                  {p.linkedAttribute ? ` (${p.linkedAttribute}-linked)` : ""}
                </td>
                <td>{p.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
