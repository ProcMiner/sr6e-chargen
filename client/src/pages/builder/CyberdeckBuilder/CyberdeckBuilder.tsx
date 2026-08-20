// Custom cyberdeck component-building (Hack & Slash pp.34-39) - see
// deriveCustomCyberdeck.ts for the cost/Core-Slot formulas, the DIY
// Karma-for-nuyen build path, and what's deliberately still out of scope
// (cases, case mods, optional accessories). Builds one GearLine per click,
// same "draft state, commit on click" pattern as Advancement.tsx's
// initiate()/submerge() - writes straight into data.gear, so
// nuyenRemaining() and every other gear-cost consumer picks it up
// automatically, no new plumbing needed.
import { useState } from "react";
import type { CharacterData } from "../../../character";
import { karmaRemaining, nuyenRemaining } from "../../../deriveGear";
import {
  activeProgramSlots,
  availabilityDisplay,
  coreCost,
  coreSlotsUsed,
  defaultCustomCyberdeckStats,
  DIY_NUYEN_PER_KARMA,
  karmaFundedNuyenCost,
  maxModuleRating,
  maxUsefulKarma,
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
  /** Karma already committed outside gear (e.g. spells beyond the free allotment), same convention as GearPicker's own prop - so this builder's DIY-Karma afford check reflects the whole shared Karma pool. */
  extraKarmaSpent?: number;
  /** Nuyen already committed outside gear (e.g. lifestyle purchases), same convention as GearPicker's own prop - so this builder's afford check reflects the whole shared nuyen pool. */
  extraNuyenSpent?: number;
}

export function CyberdeckBuilder({ data, onChange, extraKarmaSpent = 0, extraNuyenSpent = 0 }: Props) {
  const [draft, setDraft] = useState<CustomCyberdeckStats>(defaultCustomCyberdeckStats());
  const [karmaSpent, setKarmaSpent] = useState(0);

  const owned = data.gear
    .map((line, index) => ({ line, index }))
    .filter((g) => g.line.customCyberdeck);

  const nuyenBudget = nuyenRemaining(data, extraNuyenSpent);
  const karmaBudget = karmaRemaining(data, extraKarmaSpent);

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
    // A shrinking cost can make the stored Karma spend more than the build could ever use.
    setKarmaSpent((prev) => Math.min(prev, maxUsefulKarma(totalCost(next))));
  }

  const draftCap = maxModuleRating(draft.coreRating);
  const draftBudget = totalCoreSlotBudget(draft.coreRating);
  const draftUsed = coreSlotsUsed(draft);
  const draftCost = totalCost(draft);
  const slotsUsedByModules = moduleCoreSlots(draft.attackRating) + moduleCoreSlots(draft.sleazeRating);
  const maxExtraProgramSlots = Math.max(0, draftBudget - slotsUsedByModules);
  const maxKarmaSpend = Math.min(maxUsefulKarma(draftCost), karmaBudget);
  const draftNuyenCost = karmaFundedNuyenCost(draftCost, karmaSpent);
  const canBuild = draftUsed <= draftBudget && karmaSpent <= karmaBudget && draftNuyenCost <= nuyenBudget;

  function build() {
    if (!canBuild) return;
    const stats = { ...draft, karmaSpent };
    onChange({
      ...data,
      gear: [
        ...data.gear,
        {
          id: generateId(),
          name: `Custom Cyberdeck (Device Rating ${stats.coreRating})`,
          qty: 1,
          unitCost: draftNuyenCost,
          customCyberdeck: stats,
        },
      ],
    });
    setDraft(defaultCustomCyberdeckStats());
    setKarmaSpent(0);
  }

  function removeAt(index: number) {
    onChange({ ...data, gear: data.gear.filter((_, i) => i !== index) });
  }

  return (
    <details className="top-level-section" open>
      <summary>
        <h2>Custom Cyberdeck</h2>
      </summary>
      <div className="cyberdeck-builder">
      <p className="hint">
        Deckmeister-built decks (Hack &amp; Slash pp.34-39): Core sets the Device Rating, Attack/Sleaze Modules
        provide those two attributes (each capped at Core Rating x2), all drawing from a Core Slot budget of
        Device Rating x3. Data Processing/Firewall still come from a separate cyberjack or cyberhack, same as a
        stock deck. Once built, a custom deck's Attack/Sleaze are locked to it and can't be reassigned in the
        Decker Persona section below (the book's own restriction). You can pay part or all of the cost in Karma
        instead of nuyen (the DIY "Building Your Own" path, p.35) at 4,000¥ per Karma - the book's own extended
        Matrix Search and Electronics tests that gate this in play aren't modeled, since at chargen the build
        happens before play starts and how long it took doesn't matter. Cases and case mods aren't modeled - see
        the Availability column below for reference only, it isn't enforced anywhere in this app.
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
                  {stats.karmaSpent > 0 && (
                    <p className="hint">
                      {stats.karmaSpent.toLocaleString()} Karma DIY-covered{" "}
                      {(stats.karmaSpent * DIY_NUYEN_PER_KARMA).toLocaleString()}¥ of the{" "}
                      {totalCost(stats).toLocaleString()}¥ total, {line.unitCost.toLocaleString()}¥ paid in nuyen
                    </p>
                  )}
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

      <label className="inline-field">
        Karma spent DIY-building it ({DIY_NUYEN_PER_KARMA.toLocaleString()}¥ each)
        <NumberStepper
          label="Karma spent DIY-building it"
          min={0}
          max={maxKarmaSpend}
          value={karmaSpent}
          onChange={setKarmaSpent}
        />
      </label>

      <p className="hint">
        {draftCost.toLocaleString()}¥ total
        {karmaSpent > 0 && (
          <>
            {" "}
            - {karmaSpent.toLocaleString()} Karma covers {(karmaSpent * DIY_NUYEN_PER_KARMA).toLocaleString()}¥
          </>
        )}{" "}
        - {draftNuyenCost.toLocaleString()}¥ owed in nuyen ({nuyenBudget.toLocaleString()}¥ available, {karmaBudget.toLocaleString()}{" "}
        Karma available)
      </p>
      <button onClick={build} disabled={!canBuild}>
        Build Custom Cyberdeck ({draftNuyenCost.toLocaleString()}¥{karmaSpent > 0 && ` + ${karmaSpent} Karma`})
      </button>
      </div>
    </details>
  );
}
