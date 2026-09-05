// The Matrix (core rulebook p.174-185): a sub-tabbed Matrix Companion for
// live play - Persona/Programs/Actions/Reference/Skills/Workshop - built to
// be the one thing a decker or technomancer's player actually opens during
// a hacking scene, instead of flipping between the character sheet and the
// rulebook. Same "no dice-rolling engine" boundary as every other Live Play
// tab: every opposed/extended test stays a reference formula; only what's
// directly computable from the character's own data (ratings, Initiative,
// dice pools, the two real program-driven bonuses) is a live number.
// Session-transient trackers (Overwatch Score + a reasoned log, loaded
// programs, Reconfigure, Edge spent/link-lock/an active backdoor this
// scene) live in PlayState alongside matrixDamageByDevice, same tier as
// everything else on this tab. The Programs/Reconfigure/Workshop tabs are
// decker-only - technomancers use Complex Forms (built elsewhere) instead
// of gear-based programs, and Reconfigure's Data Processing/Firewall swap
// has no Living Persona equivalent.
import { useState } from "react";
import type { CharacterData, DeckerPersonaAllocation } from "../../character";
import type { Attributes, GearRulesResponse } from "../../rules";
import type { PlayState } from "../../playState";
import { ConditionStrip } from "../../components/ConditionStrip";
import { effectiveAttributes } from "../../derive";
import { modifierBonuses } from "../../deriveModifiers";
import { generateId } from "../../id";
import { livingPersonaAttribute, livingPersonaInitiative } from "../../deriveLivingPersona";
import {
  deckerAllocation,
  deckerAttribute,
  deckerMatrixInitiativeAR,
  deckerMatrixInitiativeVRCold,
  deckerMatrixInitiativeVRHot,
  matrixConditionMonitor,
  matrixDevices,
  matrixVrInitDice,
  resolveDeckerAllocation,
  type MatrixDevice,
} from "../../deriveDeckerPersona";
import {
  CONVERGENCE_OS,
  MATRIX_ACTIONS,
  MATRIX_EDGE_ACTIONS,
  MATRIX_PROGRAMS,
  NOISE_TABLE,
  OVERWATCH_SCORE_SOURCES,
  hackingDicePools,
  runningProgramBonuses,
  runningProgramCount,
} from "../../deriveMatrix";
import { coreSlotsUsed, totalCoreSlotBudget } from "../../deriveCustomCyberdeck";
import { karmaRemaining, nuyenRemaining } from "../../deriveGear";

interface Props {
  data: CharacterData;
  gearRules: GearRulesResponse;
  playState: PlayState;
  onChange: (next: PlayState) => void;
}

type Tab = "persona" | "programs" | "actions" | "reference" | "skills" | "workshop";

export function Matrix({ data, gearRules, playState, onChange }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("persona");
  const [actionsQuery, setActionsQuery] = useState("");
  const [actionsLegalFilter, setActionsLegalFilter] = useState<"all" | "Legal" | "Illegal">("all");
  const [actionsAccessFilter, setActionsAccessFilter] = useState<"all" | "Outsider" | "User" | "Admin">("all");

  const devices = matrixDevices(data, gearRules);
  const isTechnomancer = data.attributes.resonance !== undefined;
  if (devices.length === 0 && !isTechnomancer) return null;

  const allocation = resolveDeckerAllocation(devices, deckerAllocation(data));
  const effectiveAttrs = effectiveAttributes(data.attributes, modifierBonuses(data.gear, data.adeptPowers));
  const cmDevices = devices.filter((d) => d.hasConditionMonitor);
  const running = playState.matrixProgramsRunning;
  const bonuses = runningProgramBonuses(running);

  let attack: number;
  let sleaze: number;
  let dataProcessing: number;
  let firewall: number;
  let activeBonusLabels: string[] = [];
  if (isTechnomancer) {
    attack = livingPersonaAttribute(data, "attack");
    sleaze = livingPersonaAttribute(data, "sleaze");
    dataProcessing = livingPersonaAttribute(data, "dataProcessing");
    firewall = livingPersonaAttribute(data, "firewall");
  } else {
    const rawDp = deckerAttribute(allocation, "dataProcessing");
    const rawFirewall = deckerAttribute(allocation, "firewall");
    attack = deckerAttribute(allocation, "attack");
    sleaze = deckerAttribute(allocation, "sleaze");
    dataProcessing = (playState.matrixReconfigured ? rawFirewall : rawDp) + bonuses.dataProcessingBonus;
    firewall = playState.matrixReconfigured ? rawDp : rawFirewall;
    activeBonusLabels = bonuses.activeLabels;
  }
  const attackRating = attack + sleaze;
  const defenseRating = dataProcessing + firewall + (isTechnomancer ? 0 : bonuses.defenseRatingBonus);
  const runningCount = runningProgramCount(running);
  const programCap = Math.max(0, dataProcessing);

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
  function adjustOverwatch(delta: number, reason?: string) {
    const next = Math.max(0, Math.min(CONVERGENCE_OS, playState.overwatchScore + delta));
    const log =
      reason && delta > 0
        ? [{ id: generateId(), reason, delta }, ...playState.overwatchLog].slice(0, 4)
        : playState.overwatchLog;
    onChange({ ...playState, overwatchScore: next, overwatchLog: log });
  }
  function resetOverwatch() {
    onChange({ ...playState, overwatchScore: 0, overwatchLog: [] });
  }
  function toggleProgram(name: string) {
    onChange({
      ...playState,
      matrixProgramsRunning: { ...playState.matrixProgramsRunning, [name]: !running[name] },
    });
  }
  function toggleReconfigure() {
    onChange({ ...playState, matrixReconfigured: !playState.matrixReconfigured });
  }
  function adjustEdgeScene(delta: number) {
    onChange({ ...playState, matrixEdgeSpentScene: Math.max(0, playState.matrixEdgeSpentScene + delta) });
  }
  function toggleLinkLock() {
    onChange({ ...playState, matrixLinkLocked: !playState.matrixLinkLocked });
  }
  function toggleBackdoor() {
    onChange({ ...playState, matrixBackdoorActive: !playState.matrixBackdoorActive });
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "persona", label: "Persona" },
    ...(isTechnomancer ? [] : [{ id: "programs" as Tab, label: "Programs" }]),
    { id: "actions", label: "Actions" },
    { id: "reference", label: "Reference" },
    { id: "skills", label: "Skills" },
    { id: "workshop", label: "Workshop" },
  ];
  const currentTab = tabs.some((t) => t.id === activeTab) ? activeTab : tabs[0].id;

  return (
    <div className="matrix-panel">
      <h2>The Matrix</h2>

      <div className="tab-bar">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={t.id === currentTab ? "tab-bar-item active" : "tab-bar-item"}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {currentTab === "persona" && (
        <PersonaTab
          isTechnomancer={isTechnomancer}
          data={data}
          effectiveAttrs={effectiveAttrs}
          devices={devices}
          cmDevices={cmDevices}
          allocation={allocation}
          playState={playState}
          attack={attack}
          sleaze={sleaze}
          dataProcessing={dataProcessing}
          firewall={firewall}
          attackRating={attackRating}
          defenseRating={defenseRating}
          activeBonusLabels={activeBonusLabels}
          onAdjustMatrixDamage={adjustMatrixDamage}
          onResetMatrixDamage={resetMatrixDamage}
          onToggleReconfigure={toggleReconfigure}
          onAdjustOverwatch={adjustOverwatch}
          onResetOverwatch={resetOverwatch}
          onAdjustEdgeScene={adjustEdgeScene}
          onToggleLinkLock={toggleLinkLock}
          onToggleBackdoor={toggleBackdoor}
        />
      )}

      {currentTab === "programs" && !isTechnomancer && (
        <ProgramsTab running={running} runningCount={runningCount} programCap={programCap} onToggleProgram={toggleProgram} />
      )}

      {currentTab === "actions" && (
        <ActionsTab
          query={actionsQuery}
          onQueryChange={setActionsQuery}
          legalFilter={actionsLegalFilter}
          onLegalFilterChange={setActionsLegalFilter}
          accessFilter={actionsAccessFilter}
          onAccessFilterChange={setActionsAccessFilter}
          onUseEdgeAction={adjustEdgeScene}
        />
      )}

      {currentTab === "reference" && <ReferenceTab onUseEdgeAction={adjustEdgeScene} />}

      {currentTab === "skills" && <SkillsTab data={data} effectiveAttrs={effectiveAttrs} />}

      {currentTab === "workshop" && <WorkshopTab data={data} />}
    </div>
  );
}

function PersonaTab({
  isTechnomancer,
  data,
  effectiveAttrs,
  devices,
  cmDevices,
  allocation,
  playState,
  attack,
  sleaze,
  dataProcessing,
  firewall,
  attackRating,
  defenseRating,
  activeBonusLabels,
  onAdjustMatrixDamage,
  onResetMatrixDamage,
  onToggleReconfigure,
  onAdjustOverwatch,
  onResetOverwatch,
  onAdjustEdgeScene,
  onToggleLinkLock,
  onToggleBackdoor,
}: {
  isTechnomancer: boolean;
  data: CharacterData;
  effectiveAttrs: Attributes;
  devices: MatrixDevice[];
  cmDevices: MatrixDevice[];
  allocation: DeckerPersonaAllocation;
  playState: PlayState;
  attack: number;
  sleaze: number;
  dataProcessing: number;
  firewall: number;
  attackRating: number;
  defenseRating: number;
  activeBonusLabels: string[];
  onAdjustMatrixDamage: (deviceName: string, delta: number) => void;
  onResetMatrixDamage: (deviceName: string) => void;
  onToggleReconfigure: () => void;
  onAdjustOverwatch: (delta: number, reason?: string) => void;
  onResetOverwatch: () => void;
  onAdjustEdgeScene: (delta: number) => void;
  onToggleLinkLock: () => void;
  onToggleBackdoor: () => void;
}) {
  const osPct = (playState.overwatchScore / CONVERGENCE_OS) * 100;

  return (
    <div>
      <div className="sheet-card">
        <div className="rules-kicker">Matrix Attributes</div>
        <div className="kv-row">
          <span className="kv-label">Attack</span>
          <span className="kv-value">{attack}</span>
        </div>
        <div className="kv-row">
          <span className="kv-label">Sleaze</span>
          <span className="kv-value">{sleaze}</span>
        </div>
        <div className="kv-row">
          <span className="kv-label">Data Processing{!isTechnomancer && playState.matrixReconfigured ? " (swapped)" : ""}</span>
          <span className="kv-value">{dataProcessing}</span>
        </div>
        <div className="kv-row">
          <span className="kv-label">Firewall{!isTechnomancer && playState.matrixReconfigured ? " (swapped)" : ""}</span>
          <span className="kv-value">{firewall}</span>
        </div>
        {!isTechnomancer && (
          <button className="btn-ghost" onClick={onToggleReconfigure}>
            Reconfigure (swap Data Processing / Firewall)
          </button>
        )}
        {activeBonusLabels.length > 0 && (
          <p className="hint">Active: {activeBonusLabels.join(", ")}</p>
        )}
      </div>

      <div className="sheet-card">
        <div className="rules-kicker">Combat Ratings</div>
        <div className="kv-row">
          <span className="kv-label">Attack Rating</span>
          <span className="kv-value">{attackRating}</span>
        </div>
        <div className="kv-row">
          <span className="kv-label">Defense Rating</span>
          <span className="kv-value">{defenseRating}</span>
        </div>
      </div>

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
                  <button onClick={() => onAdjustMatrixDamage(d.name, -1)}>-1</button>
                  <button onClick={() => onAdjustMatrixDamage(d.name, 1)}>+1</button>
                  <button className="btn-ghost" onClick={() => onResetMatrixDamage(d.name)}>
                    Reset
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="sheet-card">
        <div className="rules-kicker">Overwatch Score</div>
        <div className="kv-row">
          <span className="kv-label">Current</span>
          <span className="kv-value">
            {playState.overwatchScore} / {CONVERGENCE_OS}
          </span>
        </div>
        <div className="meter">
          <div
            className={"meter-fill" + (playState.overwatchScore >= 32 ? " meter-fill--danger" : "")}
            style={{ width: `${Math.min(100, osPct)}%` }}
          />
        </div>
        <div className="vitals-card-actions">
          <button onClick={() => onAdjustOverwatch(-1)}>-1</button>
          <button onClick={() => onAdjustOverwatch(1)}>+1</button>
          <button className="btn-ghost" onClick={onResetOverwatch}>
            Reset
          </button>
        </div>
        <div className="chip-row">
          <button className="chip" onClick={() => onAdjustOverwatch(1, "Running a hacking program")}>
            +1 Running program
          </button>
          <button className="chip" onClick={() => onAdjustOverwatch(1, "Holding illegal access")}>
            +1 Illegal access
          </button>
          <button className="chip" onClick={() => onAdjustOverwatch(2, "Opposed test hits")}>
            +2 Opposed hits
          </button>
        </div>
        {playState.overwatchLog.map((e) => (
          <p className="hint" key={e.id}>
            +{e.delta} — {e.reason}
          </p>
        ))}
        <p className="hint">Convergence at {CONVERGENCE_OS} - see the Reference tab for what fills this meter.</p>
      </div>

      <div className="sheet-card">
        <div className="rules-kicker">Matrix Initiative</div>
        {isTechnomancer ? (
          <p className="hint">
            Living Persona: {livingPersonaInitiative(data)} + 1D6 (plus Matrix-mode adjustments this app doesn't
            track).
          </p>
        ) : (
          <>
            <div className="kv-row">
              <span className="kv-label">AR</span>
              <span className="kv-value">{deckerMatrixInitiativeAR(effectiveAttrs)} + 1D6</span>
            </div>
            <div className="kv-row">
              <span className="kv-label">VR — cold-sim</span>
              <span className="kv-value">
                {deckerMatrixInitiativeVRCold(effectiveAttrs, allocation)} + {matrixVrInitDice(1, devices)}D6
              </span>
            </div>
            <div className="kv-row">
              <span className="kv-label">VR — hot-sim</span>
              <span className="kv-value">
                {deckerMatrixInitiativeVRHot(effectiveAttrs, allocation)} + {matrixVrInitDice(2, devices)}D6
              </span>
            </div>
            <p className="hint">
              Dice on top of the usual 1D6, capped at 5D6 total same as physical Initiative - a cyberjack's own VR
              Matrix Init Dice bonus is folded in above.
            </p>
          </>
        )}
      </div>

      <div className="sheet-card">
        <div className="rules-kicker">This Scene</div>
        <div className="kv-row">
          <span className="kv-label">Edge spent</span>
          <span className="stepper">
            <button onClick={() => onAdjustEdgeScene(-1)}>-1</button>
            <span className="kv-value">{playState.matrixEdgeSpentScene}</span>
            <button onClick={() => onAdjustEdgeScene(1)}>+1</button>
          </span>
        </div>
        <div className="kv-row">
          <span className="kv-label">Link-locked</span>
          <button className={playState.matrixLinkLocked ? "chip selected" : "chip"} onClick={onToggleLinkLock}>
            {playState.matrixLinkLocked ? "Locked" : "Clear"}
          </button>
        </div>
        <div className="kv-row">
          <span className="kv-label">Backdoor active</span>
          <button className={playState.matrixBackdoorActive ? "chip selected" : "chip"} onClick={onToggleBackdoor}>
            {playState.matrixBackdoorActive ? "Active" : "None"}
          </button>
        </div>
        <p className="hint">Manually reset between scenes - this app has no automatic scene/combat-round boundary.</p>
      </div>
    </div>
  );
}

function ProgramsTab({
  running,
  runningCount,
  programCap,
  onToggleProgram,
}: {
  running: Record<string, boolean>;
  runningCount: number;
  programCap: number;
  onToggleProgram: (name: string) => void;
}) {
  const basic = MATRIX_PROGRAMS.filter((p) => p.category === "Basic");
  const hacking = MATRIX_PROGRAMS.filter((p) => p.category === "Hacking");
  const atCap = runningCount >= programCap;

  function ProgramRow({ name, summary }: { name: string; summary: string }) {
    const on = !!running[name];
    return (
      <div className="toggle-row">
        <div className="toggle-row-label">
          <div className="toggle-row-name">{name}</div>
          <div className="toggle-row-effect">{summary}</div>
        </div>
        <button
          className={on ? "chip selected" : "chip"}
          disabled={!on && atCap}
          onClick={() => onToggleProgram(name)}
        >
          {on ? "Running" : "Off"}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="sheet-card">
        <div className="rules-kicker">Active Program Slots</div>
        <div className="kv-row">
          <span className="kv-label">Running</span>
          <span className="kv-value">
            {runningCount} / {programCap}
          </span>
        </div>
        <div className="meter">
          <div
            className="meter-fill"
            style={{ width: `${programCap > 0 ? Math.min(100, (runningCount / programCap) * 100) : 0}%` }}
          />
        </div>
        <p className="hint">
          Capped by Data Processing - more programs may be owned/stored than can run at once. Loading a program
          doesn't cost Overwatch Score; only actually using its effect does.
        </p>
      </div>

      <div className="sheet-card">
        <div className="rules-kicker">Agent</div>
        <ProgramRow name="Agent" summary="Semi-autonomous program - can take its own Matrix actions independently of you." />
      </div>

      <div className="sheet-card">
        <div className="rules-kicker">Basic Programs</div>
        {basic.map((p) => (
          <ProgramRow key={p.name} name={p.name} summary={p.summary} />
        ))}
      </div>

      <div className="sheet-card">
        <div className="rules-kicker">Hacking Programs</div>
        {hacking.map((p) => (
          <ProgramRow key={p.name} name={p.name} summary={p.linkedAttribute ? `${p.summary} (${p.linkedAttribute}-linked)` : p.summary} />
        ))}
      </div>
    </div>
  );
}

function EdgeActionsCard({ onUse }: { onUse: (delta: number) => void }) {
  return (
    <div className="sheet-card">
      <div className="rules-kicker">Matrix Edge Actions</div>
      {MATRIX_EDGE_ACTIONS.map((e) => (
        <div className="toggle-row" key={e.name}>
          <div className="toggle-row-label">
            <div className="toggle-row-name">
              {e.name} <span className="hint">{e.cost}</span>
            </div>
            <div className="toggle-row-effect">{e.summary}</div>
          </div>
          <button className="chip" onClick={() => onUse(parseInt(e.cost, 10) || 0)}>
            Use
          </button>
        </div>
      ))}
      <p className="hint">Requires an implanted cyberjack or a Resonance score to use Matrix Edge Actions.</p>
    </div>
  );
}

function ActionsTab({
  query,
  onQueryChange,
  legalFilter,
  onLegalFilterChange,
  accessFilter,
  onAccessFilterChange,
  onUseEdgeAction,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  legalFilter: "all" | "Legal" | "Illegal";
  onLegalFilterChange: (v: "all" | "Legal" | "Illegal") => void;
  accessFilter: "all" | "Outsider" | "User" | "Admin";
  onAccessFilterChange: (v: "all" | "Outsider" | "User" | "Admin") => void;
  onUseEdgeAction: (delta: number) => void;
}) {
  const q = query.trim().toLowerCase();
  const filtered = MATRIX_ACTIONS.filter((a) => {
    if (legalFilter !== "all" && a.legal !== legalFilter) return false;
    if (accessFilter !== "all" && !a.access.includes(accessFilter)) return false;
    if (q && !a.name.toLowerCase().includes(q)) return false;
    return true;
  });
  const legalOptions: ("all" | "Legal" | "Illegal")[] = ["all", "Legal", "Illegal"];
  const accessOptions: ("all" | "Outsider" | "User" | "Admin")[] = ["all", "Outsider", "User", "Admin"];

  return (
    <div>
      <input
        type="search"
        className="full-width"
        placeholder="Search actions…"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />
      <div className="chip-row">
        {legalOptions.map((v) => (
          <button
            key={v}
            className={legalFilter === v ? "chip selected" : "chip"}
            onClick={() => onLegalFilterChange(v)}
          >
            {v === "all" ? "All" : v}
          </button>
        ))}
      </div>
      <div className="chip-row">
        {accessOptions.map((v) => (
          <button
            key={v}
            className={accessFilter === v ? "chip selected" : "chip"}
            onClick={() => onAccessFilterChange(v)}
          >
            {v === "all" ? "Any access" : v}
          </button>
        ))}
      </div>
      <p className="hint">
        {filtered.length} of {MATRIX_ACTIONS.length} actions
      </p>
      {filtered.map((a) => (
        <div className="sheet-card" key={a.name}>
          <div className="kv-row">
            <span className="kv-value">{a.name}</span>
            <span className="hint">
              {a.legal} · {a.access}
            </span>
          </div>
          <p className="hint">
            {a.actionType} · {a.test}
          </p>
          <p className="hint">{a.summary}</p>
        </div>
      ))}
      <EdgeActionsCard onUse={onUseEdgeAction} />
    </div>
  );
}

function ReferenceTab({ onUseEdgeAction }: { onUseEdgeAction: (delta: number) => void }) {
  return (
    <div>
      <div className="sheet-card">
        <div className="rules-kicker">Matrix Perception, Access Levels &amp; Cybercombat</div>
        <p className="hint">
          Matrix Perception: Electronics + Intuition vs. Willpower + Sleaze (Major) to learn about an icon; a
          public-database search instead is an Electronics + Intuition Extended test (10-minute interval).
          Detecting someone running silent is normally a Major Action, but a Minor Action if you're using a
          cyberdeck, cyberjack, or have a Resonance attribute.
        </p>
        <p className="hint">
          Access levels: Outsider (basic look-around, no privileges), User (read files, basic functions), and
          Admin (change configuration, turn devices on/off). Gaining User/Admin illicitly requires Brute Force or
          Probe - hacked Admin still isn't true ownership.
        </p>
        <p className="hint">
          Cybercombat resolves like hacking against another icon (IC, a security decker's persona). By default,
          Matrix damage is resisted with Firewall; biofeedback damage (noted per action/program) is resisted with
          Willpower instead. Bricked devices are ejected from the Matrix (with dumpshock in VR) and unusable until
          repaired: Engineering + Logic (number of boxes, 1 hour) Extended test, no toolkit means no repair, and a
          critical glitch means the device never works again.
        </p>
      </div>

      <details className="quality-section">
        <summary>Dumpshock, Link-Locking &amp; Noise</summary>
        <p className="hint">
          Dumpshock: getting disconnected from VR without gracefully switching to AR first - DV 3S (cold-sim) or
          3P (hot-sim) biofeedback damage, resisted with Willpower. Also disoriented: no Edge gain/use for (10 -
          Willpower) minutes, even if damage is fully soaked.
        </p>
        <p className="hint">
          Link-locking: another persona/device sends keep-alive signals that block Enter/Exit Host, Reboot Device,
          and Switch Interface Mode on your device. Escape with a successful Jack Out (usually still costs
          dumpshock). Falling unconscious in VR normally auto-switches you to AR - link-locked, you stay in VR and
          can't defend against actions.
        </p>
        <p className="hint">
          Each point of Noise gives a -1 penalty to Matrix tests; Noise greater than a device's rating blocks
          Matrix access and wireless bonuses entirely.
        </p>
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
        <summary>Overwatch Score &amp; Convergence</summary>
        <p className="hint">
          Every illegal Matrix action's opposing roll adds hits (not net hits) to your Overwatch Score (OS). At{" "}
          {CONVERGENCE_OS} OS, Convergence occurs: the device used for your last illegal test is bricked, you're
          dumped from the Matrix with dumpshock, and your physical location is reported to the authorities.
        </p>
        <ul>
          {OVERWATCH_SCORE_SOURCES.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className="hint">
          Distribute Edge: compare Attack Rating (Attack + Sleaze) to Defense Rating (Data Processing + Firewall)
          - 4+ points higher grants a bonus Edge point (max two bonus tokens/round), lost on leaving a host,
          rebooting, jacking out, or Convergence.
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

      <details className="quality-section">
        <summary>Programs ({MATRIX_PROGRAMS.length})</summary>
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

      <details className="quality-section" open>
        <summary>Matrix Edge Actions</summary>
        <EdgeActionsCard onUse={onUseEdgeAction} />
      </details>
    </div>
  );
}

function SkillsTab({ data, effectiveAttrs }: { data: CharacterData; effectiveAttrs: Attributes }) {
  const pools = hackingDicePools(data, effectiveAttrs);
  const engineeringRank = data.skills["Engineering"] ?? 0;
  const engineeringPool = engineeringRank + effectiveAttrs.logic;
  const hidePool = pools.find((p) => p.label === "Cracking + Intuition");
  const jackOutPool = pools.find((p) => p.label === "Electronics + Willpower");

  return (
    <div>
      <div className="sheet-card">
        <div className="rules-kicker">Linked Attributes</div>
        <div className="kv-row">
          <span className="kv-label">Logic</span>
          <span className="kv-value">{effectiveAttrs.logic}</span>
        </div>
        <div className="kv-row">
          <span className="kv-label">Intuition</span>
          <span className="kv-value">{effectiveAttrs.intuition}</span>
        </div>
        <div className="kv-row">
          <span className="kv-label">Willpower</span>
          <span className="kv-value">{effectiveAttrs.willpower}</span>
        </div>
      </div>

      {pools.map((p) => (
        <div className="sheet-card" key={p.label}>
          <div className="kv-row">
            <span className="kv-label">{p.label}</span>
            <span className="kv-value">{p.pool}</span>
          </div>
          <p className="hint">
            {p.skill} {p.skillRank} + {p.attributeLabel} {p.attributeValue}
          </p>
          <p className="hint">
            Specialization/Expertise:{" "}
            {p.focusBonuses.length === 0
              ? "none"
              : p.focusBonuses
                  .map((f) => `${f.focus} +${f.bonus}${f.tier === "expertise" ? " (Expertise)" : ""}`)
                  .join(", ")}
          </p>
          <p className="hint">{p.usedFor}</p>
        </div>
      ))}

      <div className="sheet-card">
        <div className="rules-kicker">Other Skills &amp; Pools for Hacking</div>
        {hidePool && (
          <div className="toggle-row">
            <div className="toggle-row-label">
              <div className="toggle-row-name">Hide</div>
              <div className="toggle-row-effect">
                Cracking + Intuition - duck out of Matrix Perception or Trace Icon attempts against you.
              </div>
            </div>
            <span className="kv-value">{hidePool.pool}</span>
          </div>
        )}
        {jackOutPool && (
          <div className="toggle-row">
            <div className="toggle-row-label">
              <div className="toggle-row-name">Jack Out</div>
              <div className="toggle-row-effect">Electronics + Willpower - break a link-lock and disconnect.</div>
            </div>
            <span className="kv-value">{jackOutPool.pool}</span>
          </div>
        )}
        <div className="toggle-row">
          <div className="toggle-row-label">
            <div className="toggle-row-name">Engineering</div>
            <div className="toggle-row-effect">Logic + Engineering - repair or jury-rig Matrix hardware in the field.</div>
          </div>
          <span className="kv-value">{engineeringPool}</span>
        </div>
      </div>
    </div>
  );
}

function WorkshopTab({ data }: { data: CharacterData }) {
  const deckLine = data.gear.find((g) => g.customCyberdeck !== undefined);
  const karma = karmaRemaining(data);
  const nuyen = nuyenRemaining(data);

  return (
    <div>
      <div className="sheet-card">
        <div className="rules-kicker">Karma &amp; Nuyen</div>
        <div className="kv-row">
          <span className="kv-label">Karma remaining</span>
          <span className="kv-value">{karma}</span>
        </div>
        <div className="kv-row">
          <span className="kv-label">Nuyen remaining</span>
          <span className="kv-value">{nuyen.toLocaleString()}¥</span>
        </div>
        <p className="hint">
          Base figures - doesn't include lifestyle upkeep or other in-play spends already tracked on the Gear &amp;
          Lifestyle/Advancement tabs. Read-only here; make changes there.
        </p>
      </div>

      <div className="sheet-card">
        <div className="rules-kicker">Custom Cyberdeck</div>
        {deckLine && deckLine.customCyberdeck ? (
          <>
            <p className="hint">{deckLine.name}</p>
            <div className="kv-row">
              <span className="kv-label">Core Rating</span>
              <span className="kv-value">{deckLine.customCyberdeck.coreRating}</span>
            </div>
            <div className="kv-row">
              <span className="kv-label">Attack Module</span>
              <span className="kv-value">{deckLine.customCyberdeck.attackRating}</span>
            </div>
            <div className="kv-row">
              <span className="kv-label">Sleaze Module</span>
              <span className="kv-value">{deckLine.customCyberdeck.sleazeRating}</span>
            </div>
            <div className="kv-row">
              <span className="kv-label">Extra Program Slots</span>
              <span className="kv-value">{deckLine.customCyberdeck.extraProgramSlots}</span>
            </div>
            <div className="kv-row">
              <span className="kv-label">Core Slots used</span>
              <span className="kv-value">
                {coreSlotsUsed(deckLine.customCyberdeck)} / {totalCoreSlotBudget(deckLine.customCyberdeck.coreRating)}
              </span>
            </div>
            <p className="hint">
              Active Program Slots (the Programs tab's cap) come from Data Processing, not this build spec - see
              the Programs tab. Read-only here - edit the build on the character's Gear &amp; Lifestyle tab.
            </p>
          </>
        ) : (
          <p className="hint">No custom cyberdeck owned.</p>
        )}
      </div>
    </div>
  );
}
