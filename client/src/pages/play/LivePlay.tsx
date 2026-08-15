import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { api, ApiError, type CharacterSummary } from "../../api";
import { emptyAttributes, emptyCharacterData, type CharacterData } from "../../character";
import type { GearRulesResponse, PriorityRulesResponse, SpiritRulesResponse } from "../../rules";
import { deriveStats } from "../../derive";
import { modifierBonuses } from "../../deriveModifiers";
import { lifestyleCostTotal } from "../../deriveLifestyle";
import { spellKarmaCost } from "../../deriveSpells";
import { complexFormKarmaCost } from "../../deriveComplexForms";
import { metavariantKarmaCost } from "../../deriveMetavariant";
import { advancementKarmaTotal } from "../../deriveAdvancement";
import { initiationKarmaTotal } from "../../deriveInitiation";
import { specializationKarmaTotal } from "../../deriveSpecializations";
import { GearPicker } from "../builder/GearPicker/GearPicker";
import { Advancement } from "./Advancement";
import { Spirits } from "./Spirits";
import type { PlaySessionSummary, PlayState, StatusEffect } from "../../playState";

const COMMON_STATUS_EFFECTS = [
  "Prone",
  "Blinded I",
  "Blinded II",
  "Blinded III",
  "Dazed",
  "Zapped",
  "Poisoned",
  "Sustained Spell",
];

const SAVE_DEBOUNCE_MS = 500;

export function LivePlay() {
  const { id } = useParams();
  const [character, setCharacter] = useState<CharacterSummary | null>(null);
  const [characterData, setCharacterData] = useState<CharacterData | null>(null);
  const [gearRules, setGearRules] = useState<GearRulesResponse | null>(null);
  const [priorityRules, setPriorityRules] = useState<PriorityRulesResponse | null>(null);
  const [spiritRules, setSpiritRules] = useState<SpiritRulesResponse | null>(null);
  const [playState, setPlayState] = useState<PlayState | null>(null);
  const [sessions, setSessions] = useState<PlaySessionSummary[] | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimeout = useRef<number | null>(null);
  const pendingSave = useRef<PlayState | null>(null);

  const [dataSaving, setDataSaving] = useState(false);
  const dataSaveTimeout = useRef<number | null>(null);
  const pendingDataSave = useRef<CharacterData | null>(null);
  const [nuyenAward, setNuyenAward] = useState("");

  const [effectName, setEffectName] = useState("");
  const [effectRounds, setEffectRounds] = useState("");
  const [effectNotes, setEffectNotes] = useState("");

  function refreshSessions() {
    if (!id) return;
    api.getCharacterSessions(Number(id)).then(setSessions);
  }

  useEffect(() => {
    if (!id) return;
    api.getCharacter(Number(id)).then((c) => {
      setCharacter(c);
      setCharacterData({ ...emptyCharacterData(), ...(c.data as Partial<CharacterData>) });
    });
    api.getPlayState(Number(id)).then(setPlayState);
    api.gear().then(setGearRules);
    api.priorityTables().then(setPriorityRules);
    api.spirits().then(setSpiritRules);
    refreshSessions();
  }, [id]);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !joinCode.trim()) return;
    setJoining(true);
    setJoinError(null);
    try {
      await api.joinSession(joinCode.trim(), Number(id));
      setJoinCode("");
      refreshSessions();
    } catch (err) {
      setJoinError(err instanceof ApiError ? err.message : "Failed to join - check the code and try again.");
    } finally {
      setJoining(false);
    }
  }

  async function handleLeave(sessionId: number) {
    if (!id) return;
    await api.leaveSession(sessionId, Number(id));
    refreshSessions();
  }

  useEffect(() => {
    return () => {
      // Flush rather than drop: a pending debounced save must still reach
      // the server even if the player navigates away before it fires,
      // otherwise their last change silently reverts for everyone watching
      // (including the GM dashboard).
      if (saveTimeout.current === null || pendingSave.current === null || !id) return;
      window.clearTimeout(saveTimeout.current);
      api.updatePlayState(Number(id), pendingSave.current);
      saveTimeout.current = null;
      pendingSave.current = null;
    };
  }, [id]);

  useEffect(() => {
    return () => {
      if (dataSaveTimeout.current === null || pendingDataSave.current === null || !id) return;
      window.clearTimeout(dataSaveTimeout.current);
      api.updateCharacter(Number(id), { data: pendingDataSave.current });
      dataSaveTimeout.current = null;
      pendingDataSave.current = null;
    };
  }, [id]);

  function scheduleDataSave(next: CharacterData) {
    setCharacterData(next);
    pendingDataSave.current = next;
    if (dataSaveTimeout.current) window.clearTimeout(dataSaveTimeout.current);
    dataSaveTimeout.current = window.setTimeout(() => {
      if (!id) return;
      setDataSaving(true);
      api
        .updateCharacter(Number(id), { data: next })
        .finally(() => setDataSaving(false));
      dataSaveTimeout.current = null;
      pendingDataSave.current = null;
    }, SAVE_DEBOUNCE_MS);
  }

  function awardNuyen() {
    if (!characterData) return;
    const amount = Number(nuyenAward);
    if (!Number.isFinite(amount) || amount <= 0) return;
    scheduleDataSave({ ...characterData, nuyen: characterData.nuyen + amount });
    setNuyenAward("");
  }

  function scheduleSave(next: PlayState) {
    setPlayState(next);
    pendingSave.current = next;
    if (saveTimeout.current) window.clearTimeout(saveTimeout.current);
    saveTimeout.current = window.setTimeout(() => {
      if (!id) return;
      setSaving(true);
      api
        .updatePlayState(Number(id), next)
        .finally(() => setSaving(false));
      saveTimeout.current = null;
      pendingSave.current = null;
    }, SAVE_DEBOUNCE_MS);
  }

  if (!character || !playState || !characterData) {
    return (
      <div className="page">
        <p>Loading...</p>
      </div>
    );
  }

  const attributes = { ...emptyAttributes, ...(characterData.attributes ?? {}) };
  const derived = deriveStats(attributes, modifierBonuses(characterData.gear ?? [], characterData.adeptPowers ?? []));
  const physicalOverflow = playState.physicalDamage - derived.physicalMonitor;
  const stunOverflow = playState.stunDamage - derived.stunMonitor;

  const extraKarmaSpent =
    spellKarmaCost(characterData, priorityRules ?? undefined) +
    complexFormKarmaCost(characterData, priorityRules ?? undefined) +
    metavariantKarmaCost(characterData, priorityRules?.metavariants ?? []) +
    advancementKarmaTotal(characterData.advancement) +
    initiationKarmaTotal(characterData.initiations) +
    specializationKarmaTotal(characterData.specializationLog);
  const extraNuyenSpent = lifestyleCostTotal(characterData.lifestyles);

  function adjustDamage(field: "physicalDamage" | "stunDamage", delta: number) {
    scheduleSave({ ...playState!, [field]: Math.max(0, playState![field] + delta) });
  }

  function resetDamage(field: "physicalDamage" | "stunDamage") {
    scheduleSave({ ...playState!, [field]: 0 });
  }

  function adjustEdge(delta: number) {
    const next = Math.max(0, Math.min(attributes.edge, playState!.edgeAvailable + delta));
    scheduleSave({ ...playState!, edgeAvailable: next });
  }

  function resetEdge() {
    scheduleSave({ ...playState!, edgeAvailable: attributes.edge });
  }

  function addStatusEffect(effect: Omit<StatusEffect, "id">) {
    scheduleSave({
      ...playState!,
      statusEffects: [...playState!.statusEffects, { id: crypto.randomUUID(), ...effect }],
    });
  }

  function addFreeformEffect() {
    const name = effectName.trim();
    if (!name) return;
    const rounds = effectRounds.trim() ? Number(effectRounds) : undefined;
    addStatusEffect({ name, roundsRemaining: rounds, notes: effectNotes.trim() || undefined });
    setEffectName("");
    setEffectRounds("");
    setEffectNotes("");
  }

  function removeStatusEffect(effectId: string) {
    scheduleSave({ ...playState!, statusEffects: playState!.statusEffects.filter((e) => e.id !== effectId) });
  }

  return (
    <div className="page live-play-page">
      <header className="page-header">
        <h1>{character.name} - Live Play</h1>
        <div className="header-actions">
          {(saving || dataSaving) && <span className="saved-at">Saving...</span>}
        </div>
      </header>

      <section>
        <h2>Games</h2>
        {sessions && sessions.length > 0 && (
          <ul className="module-slots">
            {sessions.map((s) => (
              <li key={s.id}>
                <div className="module-instance">
                  <div className="module-instance-header">
                    <strong>{s.name}</strong>
                    <button className="danger" onClick={() => handleLeave(s.id)}>
                      Leave
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={handleJoin} className="inline-field">
          <input
            type="text"
            placeholder="Join code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />
          <button type="submit" disabled={joining || !joinCode.trim()}>
            Join a game
          </button>
          {joinError && <span className="save-error">{joinError}</span>}
        </form>
      </section>

      <section>
        <h2>Physical</h2>
        <div className="damage-bar">
          <div
            className="damage-bar-fill"
            style={{ width: `${Math.min(100, (playState.physicalDamage / derived.physicalMonitor) * 100)}%` }}
          />
        </div>
        <p>
          {playState.physicalDamage} / {derived.physicalMonitor}
          {physicalOverflow > 0 && <span className="danger-text"> (Overflow: {physicalOverflow})</span>}
        </p>
        <div className="chip-row">
          <button onClick={() => adjustDamage("physicalDamage", -1)}>-1</button>
          <button onClick={() => adjustDamage("physicalDamage", 1)}>+1</button>
          <button onClick={() => resetDamage("physicalDamage")}>Reset</button>
        </div>
      </section>

      <section>
        <h2>Stun</h2>
        <div className="damage-bar">
          <div
            className="damage-bar-fill"
            style={{ width: `${Math.min(100, (playState.stunDamage / derived.stunMonitor) * 100)}%` }}
          />
        </div>
        <p>
          {playState.stunDamage} / {derived.stunMonitor}
          {stunOverflow > 0 && <span className="danger-text"> (Overflow: {stunOverflow})</span>}
        </p>
        <div className="chip-row">
          <button onClick={() => adjustDamage("stunDamage", -1)}>-1</button>
          <button onClick={() => adjustDamage("stunDamage", 1)}>+1</button>
          <button onClick={() => resetDamage("stunDamage")}>Reset</button>
        </div>
      </section>

      <section>
        <h2>Edge</h2>
        <p>
          {playState.edgeAvailable} / {attributes.edge}
        </p>
        <div className="chip-row">
          <button onClick={() => adjustEdge(-1)} disabled={playState.edgeAvailable <= 0}>
            Spend 1
          </button>
          <button onClick={() => adjustEdge(1)} disabled={playState.edgeAvailable >= attributes.edge}>
            Regain 1
          </button>
          <button onClick={resetEdge}>Reset to Max</button>
        </div>
      </section>

      <section>
        <h2>Status Effects</h2>
        {playState.statusEffects.length > 0 && (
          <ul className="module-slots">
            {playState.statusEffects.map((effect) => (
              <li key={effect.id}>
                <div className="module-instance">
                  <div className="module-instance-header">
                    <strong>
                      {effect.name}
                      {effect.roundsRemaining !== undefined ? ` (${effect.roundsRemaining} rounds)` : ""}
                    </strong>
                    <button className="danger" onClick={() => removeStatusEffect(effect.id)}>
                      Remove
                    </button>
                  </div>
                  {effect.notes && <p className="hint">{effect.notes}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="chip-row">
          {COMMON_STATUS_EFFECTS.map((name) => (
            <button key={name} className="chip" onClick={() => addStatusEffect({ name })}>
              {name}
            </button>
          ))}
        </div>

        <div className="inline-field">
          <input
            type="text"
            placeholder="Status name"
            value={effectName}
            onChange={(e) => setEffectName(e.target.value)}
          />
          <label className="inline-field">
            Rounds
            <input
              type="number"
              min={0}
              placeholder="optional"
              value={effectRounds}
              onChange={(e) => setEffectRounds(e.target.value)}
            />
          </label>
          <input
            type="text"
            placeholder="Notes (optional)"
            value={effectNotes}
            onChange={(e) => setEffectNotes(e.target.value)}
          />
          <button onClick={addFreeformEffect} disabled={!effectName.trim()}>
            Add
          </button>
        </div>
      </section>

      {priorityRules && (
        <section>
          <Advancement data={characterData} onChange={scheduleDataSave} priorityRules={priorityRules} />
        </section>
      )}

      {spiritRules && (
        <section>
          <Spirits data={characterData} playState={playState} onChange={scheduleSave} spiritRules={spiritRules} />
        </section>
      )}

      {gearRules && (
        <section>
          <h2>Equipment</h2>
          <form
            className="inline-field"
            onSubmit={(e) => {
              e.preventDefault();
              awardNuyen();
            }}
          >
            <input
              type="text"
              inputMode="numeric"
              placeholder="Nuyen earned from a run"
              value={nuyenAward}
              onChange={(e) => setNuyenAward(e.target.value.replace(/[^0-9]/g, ""))}
            />
            <button type="submit" disabled={!nuyenAward}>
              Award Nuyen
            </button>
          </form>
          <GearPicker
            rules={gearRules}
            data={characterData}
            onChange={scheduleDataSave}
            extraKarmaSpent={extraKarmaSpent}
            extraNuyenSpent={extraNuyenSpent}
            allowFree
          />
        </section>
      )}
    </div>
  );
}
