// Plain <input type="number"> has two problems on iOS Safari: it never
// renders the native up/down spinner, and tapping into a field that already
// shows a digit (e.g. an attribute starting at 1) positions the cursor
// without selecting the existing text, so typing a new digit gets appended
// instead of replacing it ("1" + "3" -> "13", which then clamps down to
// max). Selecting the field's contents on focus fixes typed entry on every
// platform; the +/- buttons give touch users a way to change the value
// without typing at all, mirroring what desktop's spinner arrows already do.
interface Props {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label?: string;
  /** Amount the +/- buttons and the native step add/subtract - defaults to 1. Only needed for fractional fields like gear Essence cost. */
  step?: number;
}

export function NumberStepper({ value, min, max, onChange, label, step = 1 }: Props) {
  function clamp(n: number) {
    return Math.min(max, Math.max(min, n));
  }

  return (
    <span className="number-stepper">
      <button
        type="button"
        className="number-stepper-button"
        onClick={() => onChange(clamp(value - step))}
        disabled={value <= min}
        aria-label={label ? `Decrease ${label}` : "Decrease"}
      >
        −
      </button>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => {
          const next = Number(e.target.value);
          if (Number.isNaN(next)) return;
          onChange(clamp(next));
        }}
      />
      <button
        type="button"
        className="number-stepper-button"
        onClick={() => onChange(clamp(value + step))}
        disabled={value >= max}
        aria-label={label ? `Increase ${label}` : "Increase"}
      >
        +
      </button>
    </span>
  );
}
