interface Props {
  filled: number;
  max: number;
  size?: "sm" | "lg";
  /** "circle" is used for Edge, which shares the exact same fill/empty/
   * overflow logic as a Condition Monitor but reads as pips, not boxes. */
  shape?: "box" | "circle";
}

/** One box per Condition Monitor point - the paper-sheet-shaped alternative
 * to a single filled progress bar. Reused by the Character Vault (`sm`) and
 * Live Play's vitals cards (`lg`, and `circle` for Edge). Overflow (filled >
 * max) fills every box in the overflow tone rather than clamping, so it
 * stays visible at a glance instead of just looking "full". */
export function ConditionStrip({ filled, max, size = "sm", shape = "box" }: Props) {
  const boxCount = Math.max(max, 0);
  const overflow = filled > max;

  return (
    <div className={`condition-strip condition-strip--${size}${shape === "circle" ? " condition-strip--circle" : ""}`}>
      {Array.from({ length: boxCount }, (_, i) => {
        const isFilled = overflow || i < filled;
        const className = overflow
          ? "condition-box condition-box--overflow"
          : isFilled
            ? "condition-box condition-box--filled"
            : "condition-box";
        return <span key={i} className={className} />;
      })}
    </div>
  );
}
