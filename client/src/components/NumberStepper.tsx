// Plain <input type="number"> has real problems here. On iOS Safari it
// never renders the native up/down spinner, and - the one that actually
// matters - selectionStart/selectionEnd/select()/setSelectionRange() are
// all defined by the HTML spec to apply ONLY to text/search/url/tel/
// password inputs, never to type="number". Confirmed directly (not just
// from docs): even in a plain Chromium tab, calling .select() on a
// type="number" input leaves selectionStart/selectionEnd both null - it's
// a silent no-op everywhere, not just a Safari quirk. A prior pass here
// tried to fix "tapping a field that already shows a digit appends instead
// of replacing" by calling .select() onFocus, but that call never actually
// selected anything on any browser, so the underlying bug was never fixed -
// it just happened not to throw. Real fix: use type="text" with
// inputMode="numeric" (or "decimal" for fractional-step fields like gear
// Essence cost) so the field gets a numeric keyboard on mobile while still
// being a type that genuinely supports selection, then sanitize/parse the
// typed string by hand instead of relying on the browser's number parsing.
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
  const allowsDecimal = step < 1;

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
        type="text"
        inputMode={allowsDecimal ? "decimal" : "numeric"}
        value={value}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => {
          const raw = e.target.value;
          // Reject anything that isn't (part of) a plain non-negative number
          // while the user is mid-typing, rather than forcing the field back
          // to its old value - lets "1" become "12" one keystroke at a time,
          // and lets a decimal field pass through a bare "0." while the
          // fractional digits are still being typed.
          const pattern = allowsDecimal ? /^\d*\.?\d*$/ : /^\d*$/;
          if (!pattern.test(raw)) return;
          if (raw === "" || raw === ".") return;
          const next = Number(raw);
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
