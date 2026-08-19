// Custom cyberdeck component-building (Hack & Slash pp.34-39) - see
// deriveCustomCyberdeck.ts for the cost/Core-Slot formulas and what's
// deliberately out of scope (cases, case mods, optional accessories, the
// DIY Karma-build path). Builds one GearLine per click, same "draft state,
// commit on click" pattern as Advancement.tsx's initiate()/submerge() -
// writes straight into data.gear, so nuyenRemaining() and every other
// gear-cost consumer picks it up automatically, no new plumbing needed.
import { useState } from "react";
import type { CharacterData } from "../../../character";
import { nuyenRemaining } from "../../../deriveGear";
import {
  activeProgramSlots,
  availabilityDisplay,
  coreCost,
  coreSlotsUsed,
  defaultCustomCyberdeckStats,
  maxModuleRating,
  moduleCost,
  moduleCoreSlots,
  totalCoreSlotBudget,
  totalCost,
  type CustomCyberdeckStats,
} from "../../../deriveCustomCyberdeck";
import { generateId } from "../../../id";
import { NumberStepper } from "../../../components/NumberStepper";

interface Props {
  data: CharacterData;
  onChange: (data: CharacterData) => void;
  /** Nuyen already committed outside gear (e.g. lifestyle purchases), same convention as GearPicker's own prop - so this builder's afford check reflects the whole shared nuyen pool. */
  extraNuyenSpent?: number;
}

export function CyberdeckBuilder({ data, onChange, extraNuyenSpent = 0 }: Props) {
  const [draft, setDraft] = useState<CustomCyberdeckStats>(defaultCustomCyberdeckStats());

  const owned = data.gear
    .map((line, index) => ({ line, index }))
    .filter((g) => g.line.customCyberdeck);

  const nuyenBudget = nuyenRemaining(data, extraNuyenSpent);

  function updateDraft(patch: Partial<CustomCyberdeckStats>) {
    const next = { ...draft, ...patch };
    // Re-clamp Attack/Sleaze and extra program slots if the Core rating shrank below what they were using.
    const cap = maxModuleRating(next.coreRating);
    next.attackRating = Math.min(next.attackRating, cap);
    next.sleazeRating = Math.min(next.sleazeRating, cap);
    const slotsForModules = moduleCoreSlots(next.attackRating) + moduleCoreSlots(next.sleazeRating);
    const slotBudget = totalCoreSlotBudget(next.coreRating);
    next.extraProgramSlots = Math.max(0, Math.min(next.extraProgramSlots, slotBudget - slotsForModules));
    setDraft(next);
  }

  const draftCap = maxModuleRating(draft.coreRating);
  const draftBudget = totalCoreSlotBudget(draft.coreRating);
  const draftUsed = coreSlotsUsed(draft);
  const draftCost = totalCost(draft);
  const slotsUsedByModules = moduleCoreSlots(draft.attackRating) + moduleCoreSlots(draft.sleazeRating);
  const maxExtraProgramSlots = Math.max(0, draftBudget - slotsUsedByModules);
  const canBuild = draftUsed <= draftBudget && draftCost <= nuyenBudget;

  function build() {
    if (!canBuild) return;
    const stats = { ...draft };
    onChange({
      ...data,
      gear: [
        ...data.gear,
        {
          id: generateId(),
          name: `Custom Cyberdeck (Device Rating ${stats.coreRating})`,
          qty: 1,
          unitCost: totalCost(stats),
          customCyberdeck: stats,
        },
      ],
    });
    setDraft(defaultCustomCyberdeckStats());
  }

  function removeAt(index: number) {
    onChange({ ...data, gear: data.gear.filter((_, i) => i !== index) });
  }

  return (
    <div className="cyberdeck-builder">
      <h2>Custom Cyberdeck</h2>
      <p className="hint">
        Deckmeister-built decks (Hack &amp; Slash pp.34-39): Core sets the Device Rating, Attack/Sleaze Modules
        provide those two attributes (each capped at Core Rating x2), all drawing from a Core Slot budget of
        Device Rating x3. Data Processing/Firewall still come from a separate cyberjack or cyberhack, same as a
        stock deck. Once built, a custom deck's Attack/Sleaze are locked to it and can't be reassigned in the
        Decker Persona section below (the book's own restriction). Cases, case mods, and the DIY build path
        aren't modeled - see the Availability column below for reference only, it isn't enforced anywhere in
        this app.
      </p>

      {owned.length > 0 && (
        <ul className="module-slots">
          {owned.map(({ line, index }) => {
            const stats = line.customCyberdeck!;
            return (
              <li key={line.id ?? index}>
                <div className="module-instance">
                  <div className="module-instance-header">
                    <strong>
                      {line.name} ({line.unitCost.toLocaleString()}¥)
                    </strong>
                    <button className="danger" onClick={() => removeAt(index)}>
                      Remove
                    </button>
                  </div>
                  <p className="hint">
                    Core {stats.coreRating} | Attack {stats.attackRating} | Sleaze {stats.sleazeRating} | Active
                    program slots {activeProgramSlots(stats)} | Availability {availabilityDisplay(stats)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <h3>Build a custom cyberdeck</h3>
      <label className="inline-field">
        Core Rating (Device Rating)
        <NumberStepper
          label="Core Rating"
          min={1}
          max={6}
          value={draft.coreRating}
          onChange={(v) => updateDraft({ coreRating: v })}
        />
      </label>
      <p className="hint">
        Core cost {coreCost(draft.coreRating).toLocaleString()}¥ - Core Slot budget {draftBudget} - Attack/Sleaze
        capped at {draftCap}
      </p>

      <label className="inline-field">
        Attack Module Rating
        <NumberStepper
          label="Attack Module Rating"
          min={1}
          max={draftCap}
          value={draft.attackRating}
          onChange={(v) => updateDraft({ attackRating: v })}
        />
      </label>
      <p className="hint">{moduleCost(draft.attackRating).toLocaleString()}¥</p>

      <label className="inline-field">
        Sleaze Module Rating
        <NumberStepper
          label="Sleaze Module Rating"
          min={1}
          max={draftCap}
          value={draft.sleazeRating}
          onChange={(v) => updateDraft({ sleazeRating: v })}
        />
      </label>
      <p className="hint">{moduleCost(draft.sleazeRating).toLocaleString()}¥</p>

      <label className="inline-field">
        Extra Program Slots (beyond the {draft.coreRating} free)
        <NumberStepper
          label="Extra Program Slots"
          min={0}
          max={maxExtraProgramSlots}
          value={draft.extraProgramSlots}
          onChange={(v) => updateDraft({ extraProgramSlots: v })}
        />
      </label>

      <p className="hint">
        {draftUsed} / {draftBudget} Core Slots used - {activeProgramSlots(draft)} active program slots total -
        Availability {availabilityDisplay(draft)}
      </p>
      <p className="hint">
        {draftCost.toLocaleString()}¥ total - {nuyenBudget.toLocaleString()}¥ available
      </p>
      <button onClick={build} disabled={!canBuild}>
        Build Custom Cyberdeck ({draftCost.toLocaleString()}¥)
      </button>
    </div>
  );
}
