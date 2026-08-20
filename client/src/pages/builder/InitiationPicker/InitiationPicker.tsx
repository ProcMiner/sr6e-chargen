// Starting Initiate/Submersion Grade at chargen ("experienced character
// creation" - core p.63's Prime Runner sidebar doubles customization Karma
// but the book gives no separate optional rule for buying a Grade before
// play starts). This reuses the exact same Karma formula and Grade-cap gate
// as career-mode Initiation (deriveInitiation.ts, Advancement.tsx) rather
// than inventing a new mechanic - spending here just comes out of the
// shared customization Karma pool instead of Karma earned in play. Same
// "self-contained picker, minor optimistic self-accounting" convention as
// SpellPicker/ComplexFormPicker (see those files) - karmaBudget here
// doesn't know about spell/complex-form/contact spend in the same step,
// only its own cost + metavariant, same as those two pickers don't know
// about each other or this one. GearPicker's extraKarmaSpent is still the
// one true final gate.
import { useState } from "react";
import type { CharacterData } from "../../../character";
import type { MetamagicRulesResponse, PriorityRulesResponse } from "../../../rules";
import { karmaRemaining } from "../../../deriveGear";
import { metavariantKarmaCost } from "../../../deriveMetavariant";
import { canInitiate, canSubmerge, initiationCost, initiationKarmaTotal } from "../../../deriveInitiation";
import { isAdept, isMysticAdept } from "../../../deriveAdeptPowers";
import { generateId } from "../../../id";
import { MetamagicPicker } from "../../../components/MetamagicPicker";

interface Props {
  rules: MetamagicRulesResponse;
  priorityRules: PriorityRulesResponse;
  data: CharacterData;
  onChange: (data: CharacterData) => void;
}

export function InitiationPicker({ rules, priorityRules, data, onChange }: Props) {
  const [metamagicName, setMetamagicName] = useState("");
  const [metamagicId, setMetamagicId] = useState<string | undefined>(undefined);
  const [echoName, setEchoName] = useState("");
  const [echoId, setEchoId] = useState<string | undefined>(undefined);

  const isAwakened = data.attributes.magic !== undefined;
  const isTechnomancer = data.attributes.resonance !== undefined;
  if (!isAwakened && !isTechnomancer) return null;

  const currentInitiationKarma = initiationKarmaTotal(data.initiations);
  const karmaBudget = karmaRemaining(
    data,
    currentInitiationKarma + metavariantKarmaCost(data, priorityRules.metavariants)
  );

  const nextInitiateGrade = (data.initiateGrade ?? 0) + 1;
  const nextSubmersionGrade = (data.submersionGrade ?? 0) + 1;
  const initiateCost = initiationCost(nextInitiateGrade);
  const submergeCost = initiationCost(nextSubmersionGrade);

  const log = [...(data.initiations ?? [])].reverse();
  const knownMetamagicIds = (data.initiations ?? [])
    .filter((e) => e.type === "initiation" && e.metamagicId)
    .map((e) => e.metamagicId!);
  const knownEchoIds = (data.initiations ?? [])
    .filter((e) => e.type === "submersion" && e.metamagicId)
    .map((e) => e.metamagicId!);

  function initiate() {
    const name = metamagicName.trim();
    if (!name || !canInitiate(data)) return;
    const grade = (data.initiateGrade ?? 0) + 1;
    const cost = initiationCost(grade);
    if (cost > karmaBudget) return;
    onChange({
      ...data,
      initiateGrade: grade,
      initiations: [
        ...(data.initiations ?? []),
        { id: generateId(), type: "initiation", grade, metamagicName: name, metamagicId, karmaCost: cost, date: new Date().toISOString() },
      ],
    });
    setMetamagicName("");
    setMetamagicId(undefined);
  }

  function submerge() {
    const name = echoName.trim();
    if (!name || !canSubmerge(data)) return;
    const grade = (data.submersionGrade ?? 0) + 1;
    const cost = initiationCost(grade);
    if (cost > karmaBudget) return;
    onChange({
      ...data,
      submersionGrade: grade,
      initiations: [
        ...(data.initiations ?? []),
        { id: generateId(), type: "submersion", grade, metamagicName: name, metamagicId: echoId, karmaCost: cost, date: new Date().toISOString() },
      ],
    });
    setEchoName("");
    setEchoId(undefined);
  }

  function canUndo(entry: (typeof log)[number]): boolean {
    const currentGrade = entry.type === "initiation" ? data.initiateGrade ?? 0 : data.submersionGrade ?? 0;
    return currentGrade === entry.grade;
  }

  function undo(entry: (typeof log)[number]) {
    if (!canUndo(entry)) return;
    const nextData: CharacterData = {
      ...data,
      initiations: (data.initiations ?? []).filter((e) => e.id !== entry.id),
    };
    if (entry.type === "initiation") nextData.initiateGrade = entry.grade - 1;
    else nextData.submersionGrade = entry.grade - 1;
    onChange(nextData);
  }

  return (
    <details className="top-level-section" open>
      <summary>
        <h2>Initiation / Submersion</h2>
      </summary>
      <div className="initiation-picker">
      <p className="hint">
        Optional "experienced character" starting Grade, not a printed core-rulebook chargen rule - it reuses the
        same in-play Initiation/Submersion formula (10 + desired Grade Karma, Grade can never exceed
        Magic/Resonance), spending from this same customization Karma pool instead of Karma earned in play.
      </p>

      {isAwakened && (
        <>
          <h3>Initiation</h3>
          <p className="hint">Initiate Grade {data.initiateGrade ?? 0}.</p>
          <MetamagicPicker
            catalog={rules.metamagics}
            isAdept={isAdept(data) || isMysticAdept(data)}
            knownOnceIds={knownMetamagicIds}
            selectedId={metamagicId}
            onSelect={({ id, name }) => {
              setMetamagicId(id);
              setMetamagicName(name);
            }}
          />
          <form
            className="inline-field"
            onSubmit={(e) => {
              e.preventDefault();
              initiate();
            }}
          >
            <input
              type="text"
              placeholder="Metamagic learned (or type a custom/homebrew name)"
              value={metamagicName}
              onChange={(e) => {
                setMetamagicName(e.target.value);
                setMetamagicId(undefined);
              }}
            />
            <button
              type="submit"
              disabled={!metamagicName.trim() || !canInitiate(data) || initiateCost > karmaBudget}
              title={
                !canInitiate(data)
                  ? `Magic must be at least ${nextInitiateGrade} to reach Grade ${nextInitiateGrade}`
                  : `${initiateCost} Karma`
              }
            >
              Initiate to Grade {nextInitiateGrade} ({initiateCost} Karma)
            </button>
          </form>
        </>
      )}

      {isTechnomancer && (
        <>
          <h3>Submersion</h3>
          <p className="hint">Submersion Grade {data.submersionGrade ?? 0}.</p>
          <MetamagicPicker
            catalog={rules.echoes}
            isAdept={false}
            knownOnceIds={knownEchoIds}
            selectedId={echoId}
            onSelect={({ id, name }) => {
              setEchoId(id);
              setEchoName(name);
            }}
          />
          <form
            className="inline-field"
            onSubmit={(e) => {
              e.preventDefault();
              submerge();
            }}
          >
            <input
              type="text"
              placeholder="Echo learned (or type a custom/homebrew name)"
              value={echoName}
              onChange={(e) => {
                setEchoName(e.target.value);
                setEchoId(undefined);
              }}
            />
            <button
              type="submit"
              disabled={!echoName.trim() || !canSubmerge(data) || submergeCost > karmaBudget}
              title={
                !canSubmerge(data)
                  ? `Resonance must be at least ${nextSubmersionGrade} to reach Grade ${nextSubmersionGrade}`
                  : `${submergeCost} Karma`
              }
            >
              Submerge to Grade {nextSubmersionGrade} ({submergeCost} Karma)
            </button>
          </form>
        </>
      )}

      <p className="hint">
        {karmaBudget.toLocaleString()} Karma available - {currentInitiationKarma.toLocaleString()} spent on
        Initiation/Submersion so far.
      </p>

      {log.length > 0 && (
        <ul className="module-slots">
          {log.map((entry) => (
            <li key={entry.id}>
              <div className="module-instance">
                <div className="module-instance-header">
                  <strong>
                    {entry.type === "initiation" ? "Initiation" : "Submersion"} Grade {entry.grade} -{" "}
                    {entry.metamagicName} ({entry.karmaCost} Karma)
                  </strong>
                  <button className="danger" disabled={!canUndo(entry)} onClick={() => undo(entry)}>
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      </div>
    </details>
  );
}
