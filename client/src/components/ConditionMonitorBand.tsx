// Condition Monitors band (SR6 Character Sheet Design handoff) - Physical/
// Stun/Edge/Matrix CM as small grouped boxes (core rulebook p.38: "Condition
// Monitors are a series of boxes set in rows of three"), plus a live Damage
// Modifiers readout. Physical/Stun box fill = damage taken; Edge box fill =
// Edge currently available (matches this app's existing vitals-row
// semantics, just re-skinned from bars to boxes - see LivePlay.tsx).
import { woundModifier } from "../derive";

type BoxState = "" | "box-filled" | "box-overflow";

function boxRow(current: number, max: number): BoxState[] {
  const boxes: BoxState[] = [];
  for (let i = 0; i < max; i++) boxes.push(i < current ? "box-filled" : "");
  for (let i = max; i < current; i++) boxes.push("box-overflow");
  return boxes;
}

function boxGroups(current: number, max: number, size = 3): BoxState[][] {
  const flat = boxRow(current, max);
  const groups: BoxState[][] = [];
  for (let i = 0; i < flat.length; i += size) groups.push(flat.slice(i, i + size));
  return groups;
}

function Boxes({ current, max, grouped }: { current: number; max: number; grouped?: boolean }) {
  if (!grouped) {
    return (
      <div className="box-group">
        {boxRow(current, max).map((cls, i) => (
          <div key={i} className={`box ${cls}`} />
        ))}
      </div>
    );
  }
  return (
    <div className="box-row">
      {boxGroups(current, max).map((group, i) => (
        <div key={i} className="box-group">
          {group.map((cls, j) => (
            <div key={j} className={`box ${cls}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

interface TrackProps {
  label: string;
  current: number;
  max: number;
  grouped?: boolean;
  onAdjust: (delta: number) => void;
  onReset: () => void;
  resetLabel?: string;
}

function ConditionTrack({ label, current, max, grouped, onAdjust, onReset, resetLabel = "Reset" }: TrackProps) {
  return (
    <div className="sheet-card">
      <div className="rules-kicker">{label}</div>
      <Boxes current={current} max={max} grouped={grouped} />
      <div className="vitals-card-actions">
        <button onClick={() => onAdjust(-1)}>-1</button>
        <button onClick={() => onAdjust(1)}>+1</button>
        <button className="btn-ghost" onClick={onReset}>
          {resetLabel}
        </button>
      </div>
    </div>
  );
}

interface Props {
  physicalDamage: number;
  physicalMax: number;
  onAdjustPhysical: (delta: number) => void;
  onResetPhysical: () => void;
  stunDamage: number;
  stunMax: number;
  onAdjustStun: (delta: number) => void;
  onResetStun: () => void;
  edgeAvailable: number;
  edgeMax: number;
  onAdjustEdge: (delta: number) => void;
  onResetEdge: () => void;
  matrix?: {
    damage: number;
    max: number;
    onAdjust: (delta: number) => void;
    onReset: () => void;
  };
}

export function ConditionMonitorBand({
  physicalDamage,
  physicalMax,
  onAdjustPhysical,
  onResetPhysical,
  stunDamage,
  stunMax,
  onAdjustStun,
  onResetStun,
  edgeAvailable,
  edgeMax,
  onAdjustEdge,
  onResetEdge,
  matrix,
}: Props) {
  const mod = woundModifier(physicalDamage, stunDamage);
  const physicalRows = Math.floor(physicalDamage / 3);
  const stunRows = Math.floor(stunDamage / 3);

  return (
    <div className="condition-band">
      <ConditionTrack
        label="Physical"
        current={physicalDamage}
        max={physicalMax}
        grouped
        onAdjust={onAdjustPhysical}
        onReset={onResetPhysical}
      />
      <ConditionTrack label="Stun" current={stunDamage} max={stunMax} grouped onAdjust={onAdjustStun} onReset={onResetStun} />
      <ConditionTrack
        label="Edge"
        current={edgeAvailable}
        max={edgeMax}
        onAdjust={onAdjustEdge}
        onReset={onResetEdge}
        resetLabel="Max"
      />
      {matrix && (
        <ConditionTrack
          label="Matrix CM"
          current={matrix.damage}
          max={matrix.max}
          onAdjust={matrix.onAdjust}
          onReset={matrix.onReset}
        />
      )}
      <div className="sheet-card">
        <div className="rules-kicker">Damage Modifiers</div>
        <div className="kv-row">
          <span className="kv-label">Physical ({physicalRows} row{physicalRows === 1 ? "" : "s"})</span>
          <span className="kv-value">{physicalRows ? `-${physicalRows}` : "0"}</span>
        </div>
        <div className="kv-row">
          <span className="kv-label">Stun ({stunRows} row{stunRows === 1 ? "" : "s"})</span>
          <span className="kv-value">{stunRows ? `-${stunRows}` : "0"}</span>
        </div>
        <div className="kv-row">
          <span className="kv-label">Total (all tests but Damage Resistance)</span>
          <span className="kv-value cell-accent">{mod || "0"}</span>
        </div>
      </div>
    </div>
  );
}
