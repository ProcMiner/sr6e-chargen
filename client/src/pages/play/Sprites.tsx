// Sprites: compiling, registering, and decompiling during play. Core
// rulebook "Technomancers," p. 191-195 - see server/src/rules/sprites.ts for
// the catalog and playState.ts's CompiledSprite for why this lives in
// PlayState rather than CharacterData. Same "no dice-rolling engine" stance
// as Spirits.tsx: Compiling/Registering/Decompiling tests stay reference
// formulas here - only Level is entered, and the player reports back
// whatever they rolled at the table into the tasks/OS/damage fields below.
import { useState } from "react";
import type { CharacterData } from "../../character";
import type { CompiledSprite, PlayState } from "../../playState";
import type { SpriteRulesResponse } from "../../rules";
import { NumberStepper } from "../../components/NumberStepper";
import { generateId } from "../../id";
import { maxRegisteredSprites, resolveLevelTemplate, spriteConditionMonitor, spriteMatrixAttributes } from "../../deriveSprites";

interface Props {
  data: CharacterData;
  playState: PlayState;
  onChange: (next: PlayState) => void;
  spriteRules: SpriteRulesResponse;
}

export function Sprites({ data, playState, onChange, spriteRules }: Props) {
  const [spriteTypeId, setSpriteTypeId] = useState(spriteRules.sprites[0]?.id ?? "");
  const [level, setLevel] = useState(3);
  const [nameInput, setNameInput] = useState("");
  const [tasks, setTasks] = useState(1);

  const resonance = data.attributes.resonance ?? 0;
  const isTechnomancer = data.attributes.resonance !== undefined;
  const compiledSprites = playState.compiledSprites ?? [];
  const unregisteredCount = compiledSprites.filter((s) => !s.registered).length;
  const registeredCount = compiledSprites.filter((s) => s.registered).length;
  const registeredCap = maxRegisteredSprites(resonance);

  const selectedType = spriteRules.sprites.find((s) => s.id === spriteTypeId);

  function findPower(powerId: string) {
    return spriteRules.spritePowers.find((p) => p.id === powerId);
  }

  function compile() {
    if (!selectedType) return;
    const name = nameInput.trim() || selectedType.name;
    const entry: CompiledSprite = {
      id: generateId(),
      spriteTypeId: selectedType.id,
      name,
      level,
      tasksRemaining: tasks,
      registered: false,
      overwatchScore: 0,
      matrixDamage: 0,
      compiledAt: new Date().toISOString(),
    };
    onChange({ ...playState, compiledSprites: [...compiledSprites, entry] });
    setNameInput("");
    setTasks(1);
  }

  function updateSprite(id: string, patch: Partial<CompiledSprite>) {
    onChange({
      ...playState,
      compiledSprites: compiledSprites.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  }

  function decompile(id: string) {
    onChange({ ...playState, compiledSprites: compiledSprites.filter((s) => s.id !== id) });
  }

  if (!isTechnomancer) return null;

  return (
    <div className="sprites-panel">
      <h2>Sprites</h2>
      <p className="hint">
        Compile: Tasking + Resonance vs. (Level x 2) - net hits become the sprite's tasks, at least 1 net hit is
        typical but not required to get something. Resist Fading equal to the hits (not net hits) the sprite rolled,
        as Willpower + Charisma (Physical if it exceeds your Resonance). Only one unregistered sprite at a time; it
        exists for (Level x 2) hours unless registered.
      </p>
      <p className="hint">
        Register (an already-compiled, unregistered sprite): costs Level hours, during which neither of you can act.
        Then Tasking + Resonance vs. (Level x 2) - Fading is 2 DV per hit (not net hit) the sprite gets, minimum 2.
        At least 1 net hit registers it (OS resets to 0, net hits add to its tasks, no more time limit).
      </p>
      <p className="hint">
        Decompile (yours or another technomancer's sprite): Tasking + Resonance vs. sprite's Level (+ the Resonance
        of whoever compiled it, if registered) - each net hit removes a task. A sprite reduced to 0 or fewer tasks
        is gone.
      </p>
      <p className={registeredCount > registeredCap || unregisteredCount > 1 ? "danger-text" : "hint"}>
        Registered: {registeredCount} / {registeredCap} (Resonance) &nbsp; Unregistered: {unregisteredCount} / 1
      </p>

      <details className="quality-section">
        <summary>Registered Sprite Tasks (reference)</summary>
        <p className="hint">
          Only a registered sprite can do these, each spending one of its tasks unless noted: Compiled Sprite Tasks
          (anything an unregistered sprite can do); Loaned Task (follow another persona's orders for however many
          tasks you assign); Remote Task (a task sent to another host returns to you, not the Resonance, when done);
          Re-register Sprite (another Tasking + Resonance vs. Level x 2 test - success adds net hits to its tasks,
          minus the one spent here; failure loses 1 task instead); Standby (return to the Resonance until called
          back, resetting OS); Sustain Complex Form (the sprite sustains one for you, for a number of combat rounds
          equal to its Level per task spent).
        </p>
      </details>

      <details className="quality-section">
        <summary>Compile a sprite</summary>
        <div className="inline-field">
          <label className="inline-field">
            Type
            <select value={spriteTypeId} onChange={(e) => setSpriteTypeId(e.target.value)}>
              {spriteRules.sprites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="inline-field">
            Level
            <NumberStepper label="Sprite level" min={1} max={20} value={level} onChange={setLevel} />
          </label>
          <input
            type="text"
            placeholder="Name (optional)"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          <label className="inline-field">
            Tasks (net hits rolled)
            <NumberStepper label="Sprite tasks" min={0} max={99} value={tasks} onChange={setTasks} />
          </label>
        </div>

        {selectedType && (
          <>
            <p className="hint">{selectedType.summary}</p>
            <button type="button" onClick={compile}>
              Compile
            </button>
          </>
        )}
      </details>

      {compiledSprites.length > 0 && (
        <ul className="module-slots">
          {compiledSprites.map((sprite) => {
            const type = spriteRules.sprites.find((s) => s.id === sprite.spriteTypeId);
            if (!type) return null;
            const attrs = spriteMatrixAttributes(type, sprite.level);
            const cm = spriteConditionMonitor(sprite.level);
            return (
              <li key={sprite.id}>
                <div className="module-instance">
                  <div className="module-instance-header">
                    <strong>
                      {sprite.name} ({type.name}, Level {sprite.level}){sprite.registered ? " - Registered" : ""}
                    </strong>
                    <button className="danger" onClick={() => decompile(sprite.id)}>
                      Decompile
                    </button>
                  </div>

                  <p className="hint">
                    Attack {attrs.attack} | Sleaze {attrs.sleaze} | Data Processing {attrs.dataProcessing} | Firewall{" "}
                    {attrs.firewall} | Device Rating &amp; Resonance {sprite.level}
                  </p>
                  <p className="hint">Initiative {resolveLevelTemplate(type.initiative, sprite.level)}</p>
                  <p className="hint">Skills: {type.skills.map((sk) => `${sk} ${sprite.level}`).join(", ")}</p>
                  <p className="hint">
                    Powers:{" "}
                    {type.powers.map((id) => findPower(id)?.name ?? id).join(", ")}
                  </p>

                  {!sprite.registered && (
                    <button type="button" onClick={() => updateSprite(sprite.id, { registered: true, overwatchScore: 0 })}>
                      Register
                    </button>
                  )}

                  <label className="inline-field">
                    Tasks remaining
                    <NumberStepper
                      label={`${sprite.name} tasks remaining`}
                      min={-20}
                      max={99}
                      value={sprite.tasksRemaining}
                      onChange={(next) => updateSprite(sprite.id, { tasksRemaining: next })}
                    />
                    {sprite.tasksRemaining <= 0 && <span className="danger-text"> (out of tasks - decompiled)</span>}
                  </label>
                  <label className="inline-field">
                    Overwatch Score
                    <NumberStepper
                      label={`${sprite.name} Overwatch Score`}
                      min={0}
                      max={99}
                      value={sprite.overwatchScore}
                      onChange={(next) => updateSprite(sprite.id, { overwatchScore: next })}
                    />
                  </label>
                  <label className="inline-field">
                    Matrix damage
                    <NumberStepper
                      label={`${sprite.name} Matrix damage`}
                      min={0}
                      max={cm}
                      value={sprite.matrixDamage}
                      onChange={(next) => updateSprite(sprite.id, { matrixDamage: next })}
                    />
                    / {cm}
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
