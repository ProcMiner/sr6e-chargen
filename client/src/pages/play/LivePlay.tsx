import { useEffect, useRef, useState, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { api, ApiError, type CharacterSummary } from "../../api";
import { emptyAttributes, emptyCharacterData, type CharacterData } from "../../character";
import type {
  GearRulesResponse,
  MetamagicRulesResponse,
  PriorityRulesResponse,
  QualityRulesResponse,
  SpiritRulesResponse,
  SpriteRulesResponse,
} from "../../rules";
import { deriveStats } from "../../derive";
import { modifierBonuses } from "../../deriveModifiers";
import { lifestyleCostTotal } from "../../deriveLifestyle";
import { spellKarmaCost } from "../../deriveSpells";
import { complexFormKarmaCost } from "../../deriveComplexForms";
import { metavariantKarmaCost } from "../../deriveMetavariant";
import { advancementKarmaTotal } from "../../deriveAdvancement";
import { initiationKarmaTotal } from "../../deriveInitiation";
import { specializationKarmaTotal } from "../../deriveSpecializations";
import { normalizeKnowledgeSkills } from "../../deriveKnowledge";
import { matrixConditionMonitor, matrixDevices } from "../../deriveDeckerPersona";
import { GearPicker } from "../builder/GearPicker/GearPicker";
import { Advancement } from "./Advancement";
import { Combat } from "./Combat";
import { Contacts } from "./Contacts";
import { GearLifestyle } from "./GearLifestyle";
import { ReputationHeat } from "./ReputationHeat";
import { Spirits } from "./Spirits";
import { Sprites } from "./Sprites";
import { Astral } from "./Astral";
import { Matrix } from "./Matrix";
import type { PlaySessionSummary, PlayState, StatusEffect } from "../../playState";
import { generateId } from "../../id";
import { PersonalDataCard } from "../../components/PersonalDataCard";
import { ConditionMonitorBand } from "../../components/ConditionMonitorBand";
import { AttributesDerivedCard } from "../../components/AttributesDerivedCard";
import { SkillsCard } from "../../components/SkillsCard";
import { EditableName } from "../../components/EditableName";

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
  const [qualityRules, setQualityRules] = useState<QualityRulesResponse | null>(null);
  const [spiritRules, setSpiritRules] = useState<SpiritRulesResponse | null>(null);
  const [spriteRules, setSpriteRules] = useState<SpriteRulesResponse | null>(null);
  const [metamagicRules, setMetamagicRules] = useState<MetamagicRulesResponse | null>(null);
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
  const [showCustomEffect, setShowCustomEffect] = useState(false);
  const [activeTab, setActiveTab] = useState("combat");

  function refreshSessions() {
    if (!id) return;
    api.getCharacterSessions(Number(id)).then(setSessions);
  }

  useEffect(() => {
    if (!id) return;
    api.getCharacter(Number(id)).then((c) => {
      setCharacter(c);
      const raw = c.data as Partial<CharacterData>;
      setCharacterData({ ...emptyCharacterData(), ...raw, knowledgeSkills: normalizeKnowledgeSkills(raw.knowledgeSkills) });
    });
    api.getPlayState(Number(id)).then(setPlayState);
    api.gear().then(setGearRules);
    api.priorityTables().then(setPriorityRules);
    api.qualities().then(setQualityRules);
    api.spirits().then(setSpiritRules);
    api.sprites().then(setSpriteRules);
    api.metamagics().then(setMetamagicRules);
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

  function adjustMatrixDamage(delta: number) {
    scheduleSave({ ...playState!, matrixDamage: Math.max(0, playState!.matrixDamage + delta) });
  }

  function resetMatrixDamage() {
    scheduleSave({ ...playState!, matrixDamage: 0 });
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
      statusEffects: [...playState!.statusEffects, { id: generateId(), ...effect }],
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

  function handleRename(name: string) {
    if (!character) return;
    setCharacter({ ...character, name });
    api.updateCharacter(character.id, { name });
  }

  function toggleCommonEffect(name: string) {
    const existing = playState!.statusEffects.find((e) => e.name === name);
    if (existing) {
      removeStatusEffect(existing.id);
    } else {
      addStatusEffect({ name });
    }
  }

  const isTechnomancer = attributes.resonance !== undefined;
  const hasMagic = attributes.magic !== undefined;
  const devices = gearRules ? matrixDevices(characterData, gearRules) : [];
  const spiritsRelevant = !!spiritRules && (attributes.magic ?? 0) > 0;
  const spritesRelevant = !!spriteRules && isTechnomancer;
  const matrixRelevant = !!gearRules && (isTechnomancer || devices.length > 0);
  const advancementRelevant = !!(priorityRules && qualityRules && metamagicRules);
  // A decker's device Matrix Condition Monitor (core rulebook p.174/178) -
  // only the first/primary owned device is tracked (see PlayState.matrixDamage).
  // Technomancers have none: Matrix damage applies to Stun instead (Matrix.tsx).
  const primaryMatrixDevice = !isTechnomancer && devices.length > 0 ? devices[0] : undefined;
  const activeEffectNames = new Set(playState.statusEffects.map((e) => e.name));

  const tabs: { id: string; label: string; content: ReactNode }[] = [
    {
      id: "games",
      label: "Games",
      content: (
        <>
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
        </>
      ),
    },
    ...(gearRules
      ? [{ id: "combat", label: "Combat", content: <Combat data={characterData} gearRules={gearRules} /> }]
      : []),
    ...(matrixRelevant
      ? [{ id: "matrix", label: "Matrix", content: <Matrix data={characterData} gearRules={gearRules!} /> }]
      : []),
    ...(hasMagic ? [{ id: "astral", label: "Astral", content: <Astral data={characterData} /> }] : []),
    ...(spiritsRelevant
      ? [
          {
            id: "spirits",
            label: "Spirits",
            content: (
              <Spirits
                data={characterData}
                onDataChange={scheduleDataSave}
                playState={playState}
                onChange={scheduleSave}
                spiritRules={spiritRules!}
              />
            ),
          },
        ]
      : []),
    ...(spritesRelevant
      ? [
          {
            id: "sprites",
            label: "Sprites",
            content: (
              <Sprites data={characterData} playState={playState} onChange={scheduleSave} spriteRules={spriteRules!} />
            ),
          },
        ]
      : []),
    ...(gearRules
      ? [
          {
            id: "gear",
            label: "Gear & Lifestyle",
            content: (
              <>
                <GearLifestyle
                  data={characterData}
                  gearRules={gearRules}
                  extraKarmaSpent={extraKarmaSpent}
                  extraNuyenSpent={extraNuyenSpent}
                />
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
              </>
            ),
          },
        ]
      : []),
    { id: "contacts", label: "Contacts", content: <Contacts data={characterData} /> },
    ...(advancementRelevant
      ? [
          {
            id: "advancement",
            label: "Advancement",
            content: (
              <Advancement
                data={characterData}
                onChange={scheduleDataSave}
                priorityRules={priorityRules!}
                qualityRules={qualityRules!}
                metamagicRules={metamagicRules!}
              />
            ),
          },
        ]
      : []),
    {
      id: "reputation",
      label: "Reputation & Heat",
      content: <ReputationHeat data={characterData} onChange={scheduleDataSave} />,
    },
  ];

  const currentTab = tabs.some((t) => t.id === activeTab) ? activeTab : tabs[0]?.id;

  return (
    <div className="page live-play-page">
      <header className="page-header">
        <h1>
          <EditableName value={character.name} onSave={handleRename} /> - Live Play
        </h1>
        <div className="header-actions">
          {(saving || dataSaving) && <span className="saved-at">Saving...</span>}
        </div>
      </header>

      {priorityRules && (
        <>
          <PersonalDataCard data={characterData} priorityRules={priorityRules} onChange={scheduleDataSave} />

          <ConditionMonitorBand
            physicalDamage={playState.physicalDamage}
            physicalMax={derived.physicalMonitor}
            onAdjustPhysical={(d) => adjustDamage("physicalDamage", d)}
            onResetPhysical={() => resetDamage("physicalDamage")}
            stunDamage={playState.stunDamage}
            stunMax={derived.stunMonitor}
            onAdjustStun={(d) => adjustDamage("stunDamage", d)}
            onResetStun={() => resetDamage("stunDamage")}
            edgeAvailable={playState.edgeAvailable}
            edgeMax={attributes.edge}
            onAdjustEdge={adjustEdge}
            onResetEdge={resetEdge}
            matrix={
              primaryMatrixDevice
                ? {
                    damage: playState.matrixDamage,
                    max: matrixConditionMonitor(primaryMatrixDevice.deviceRating),
                    onAdjust: adjustMatrixDamage,
                    onReset: resetMatrixDamage,
                  }
                : undefined
            }
          />
          {(physicalOverflow > 0 || stunOverflow > 0) && (
            <p className="hint danger-text">
              {physicalOverflow > 0 && `Physical overflow ${physicalOverflow}. `}
              {stunOverflow > 0 && `Stun overflow ${stunOverflow}.`}
            </p>
          )}

          <AttributesDerivedCard data={characterData} gearRules={gearRules} />

          <SkillsCard data={characterData} priorityRules={priorityRules} />
        </>
      )}

      <section>
        <h2 className="rules-kicker">Status</h2>
        <div className="chip-row">
          {playState.statusEffects.map((effect) => (
            <button key={effect.id} className="chip selected" onClick={() => removeStatusEffect(effect.id)}>
              {effect.name}
              {effect.roundsRemaining !== undefined ? ` · ${effect.roundsRemaining}` : ""}
            </button>
          ))}
          {COMMON_STATUS_EFFECTS.filter((name) => !activeEffectNames.has(name)).map((name) => (
            <button key={name} className="chip" onClick={() => toggleCommonEffect(name)}>
              {name}
            </button>
          ))}
          <button className="chip" onClick={() => setShowCustomEffect((v) => !v)}>
            + custom
          </button>
        </div>

        {showCustomEffect && (
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
                onFocus={(e) => e.currentTarget.select()}
                onChange={(e) => setEffectRounds(e.target.value)}
              />
            </label>
            <input
              type="text"
              placeholder="Notes (optional)"
              value={effectNotes}
              onChange={(e) => setEffectNotes(e.target.value)}
            />
            <button
              onClick={() => {
                addFreeformEffect();
                setShowCustomEffect(false);
              }}
              disabled={!effectName.trim()}
            >
              Add
            </button>
          </div>
        )}
      </section>

      <div className="tab-bar">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={t.id === currentTab ? "tab-bar-item active" : "tab-bar-item"}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <section>{tabs.find((t) => t.id === currentTab)?.content}</section>
    </div>
  );
}
