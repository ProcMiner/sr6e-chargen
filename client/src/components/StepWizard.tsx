// Generic step-by-step shell. Per core rulebook p.63 ("Selections don't need
// to be made in order... adjustments may need to be made as you progress"),
// there's no validation/locking here - every step is freely clickable at any
// time, same as the book explicitly allows.
import type { ReactNode } from "react";

export interface WizardStep {
  id: string;
  label: string;
  content: ReactNode;
}

interface Props {
  steps: WizardStep[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function StepWizard({ steps, activeId, onSelect }: Props) {
  const activeIndex = Math.max(
    0,
    steps.findIndex((s) => s.id === activeId)
  );
  const active = steps[activeIndex] ?? steps[0];

  return (
    <div className="step-wizard">
      <ol className="step-rail">
        {steps.map((step, index) => (
          <li key={step.id}>
            <button
              type="button"
              className={step.id === active.id ? "step-rail-item active" : "step-rail-item"}
              onClick={() => onSelect(step.id)}
            >
              <span className="step-rail-index">{index + 1}</span>
              {step.label}
            </button>
          </li>
        ))}
      </ol>

      <div className="step-wizard-content">{active.content}</div>

      <div className="step-wizard-nav">
        <button
          type="button"
          onClick={() => onSelect(steps[activeIndex - 1].id)}
          disabled={activeIndex === 0}
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => onSelect(steps[activeIndex + 1].id)}
          disabled={activeIndex === steps.length - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}
