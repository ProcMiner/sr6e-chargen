import { useEffect, useRef, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../AuthContext";
import type { PlaySessionSummary, PlayState, SessionCharacterCard, SessionDetail } from "../../playState";
import { heatEffectFor } from "../../deriveReputation";
import { NpcRoster } from "./NpcRoster";
import { generateId } from "../../id";

const POLL_INTERVAL_MS = 5000;
const SAVE_DEBOUNCE_MS = 500;

type NumericField = "physicalDamage" | "stunDamage" | "edgeAvailable";

export function GmDashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<PlaySessionSummary[] | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [creating, setCreating] = useState(false);

  // The GM's own live-entry edits, layered on top of each poll response so
  // an in-flight debounced save (or a save that landed between polls) never
  // visibly reverts. Cleared per-field once that field's save resolves.
  const [overrides, setOverrides] = useState<Record<number, Partial<PlayState>>>({});
  const [undoable, setUndoable] = useState<Record<number, boolean>>({});
  const timers = useRef<Record<string, number>>({});

  function refreshSessions() {
    api.listSessions().then(setSessions);
  }

  useEffect(refreshSessions, []);

  useEffect(() => {
    if (selectedId === null) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    function poll() {
      api.getSession(selectedId!).then((d) => {
        if (!cancelled) setDetail(d);
      });
    }
    poll();
    const interval = window.setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [selectedId]);

  async function handleCreate() {
    if (!user) return;
    setCreating(true);
    try {
      const session = await api.createSession(`${user.username}'s Game`);
      refreshSessions();
      setSelectedId(session.id);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this game? This can't be undone.")) return;
    await api.deleteSession(id);
    if (selectedId === id) setSelectedId(null);
    refreshSessions();
  }

  function displayState(c: SessionCharacterCard): PlayState {
    return { ...c.playState, ...overrides[c.id] };
  }

  function clearOverrideField(characterId: number, field: keyof PlayState) {
    setOverrides((prev) => {
      const forChar = prev[characterId];
      if (!forChar) return prev;
      const { [field]: _dropped, ...rest } = forChar;
      const next = { ...prev };
      if (Object.keys(rest).length === 0) delete next[characterId];
      else next[characterId] = rest;
      return next;
    });
  }

  function scheduleFieldSave(c: SessionCharacterCard, field: NumericField, value: number) {
    setOverrides((prev) => ({ ...prev, [c.id]: { ...prev[c.id], [field]: value } }));
    setUndoable((prev) => ({ ...prev, [c.id]: true }));
    const key = `${c.id}:${field}`;
    if (timers.current[key]) window.clearTimeout(timers.current[key]);
    timers.current[key] = window.setTimeout(() => {
      api.updatePlayState(c.id, { [field]: value }).then(() => clearOverrideField(c.id, field));
      delete timers.current[key];
    }, SAVE_DEBOUNCE_MS);
  }

  function adjustDamage(c: SessionCharacterCard, field: "physicalDamage" | "stunDamage", delta: number) {
    const next = Math.max(0, displayState(c)[field] + delta);
    scheduleFieldSave(c, field, next);
  }

  function adjustEdge(c: SessionCharacterCard, delta: number) {
    const next = Math.max(0, Math.min(c.maxEdge, displayState(c).edgeAvailable + delta));
    scheduleFieldSave(c, "edgeAvailable", next);
  }

  function addStatusEffect(c: SessionCharacterCard) {
    const name = window.prompt("Status effect name")?.trim();
    if (!name) return;
    const next = [...displayState(c).statusEffects, { id: generateId(), name }];
    setOverrides((prev) => ({ ...prev, [c.id]: { ...prev[c.id], statusEffects: next } }));
    api.updatePlayState(c.id, { statusEffects: next }).then(() => clearOverrideField(c.id, "statusEffects"));
  }

  function removeStatusEffect(c: SessionCharacterCard, effectId: string) {
    const next = displayState(c).statusEffects.filter((e) => e.id !== effectId);
    setOverrides((prev) => ({ ...prev, [c.id]: { ...prev[c.id], statusEffects: next } }));
    api.updatePlayState(c.id, { statusEffects: next }).then(() => clearOverrideField(c.id, "statusEffects"));
  }

  async function undoLastChange(c: SessionCharacterCard) {
    const reverted = await api.undoPlayState(c.id);
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[c.id];
      return next;
    });
    setUndoable((prev) => ({ ...prev, [c.id]: false }));
    setDetail((prevDetail) =>
      prevDetail
        ? { ...prevDetail, characters: prevDetail.characters.map((ch) => (ch.id === c.id ? { ...ch, playState: reverted } : ch)) }
        : prevDetail
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>GM's Bar</h1>
      </header>

      {sessions !== null && sessions.length === 0 && (
        <div className="new-character-form">
          <button onClick={handleCreate} disabled={creating}>
            Create {user?.username}'s Game
          </button>
        </div>
      )}

      {sessions === null && <p>Loading...</p>}

      <ul className="character-list">
        {sessions?.map((s) => (
          <li key={s.id}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setSelectedId(s.id);
              }}
            >
              <strong>{s.name}</strong>
              <span className="system-tag">Code: {s.joinCode}</span>
            </a>
            <button className="danger" onClick={() => handleDelete(s.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {detail && (
        <section>
          <p className="rules-kicker">
            GM's Bar · {detail.name} · {detail.joinCode}
          </p>
          {detail.characters.length > 0 && (
            <>
              <h2>
                Party Heat <span className="num">{Math.max(...detail.characters.map((c) => c.heat))}</span>
              </h2>
              <p className="hint">{heatEffectFor(Math.max(...detail.characters.map((c) => c.heat))).effect}</p>
            </>
          )}

          {detail.characters.length === 0 && <p className="hint">No characters have joined yet.</p>}

          {detail.characters.length > 0 && (
            <>
              <div className="gm-header-row">
                <span>Runner</span>
                <span>Physical</span>
                <span>Stun</span>
                <span>Edge</span>
                <span>Status</span>
              </div>
              {detail.characters.map((c) => {
                const ps = displayState(c);
                const physicalOverflow = ps.physicalDamage > c.maxPhysical;
                const stunOverflow = ps.stunDamage > c.maxStun;
                return (
                  <div key={c.id} className="gm-row">
                    <div>
                      <div className="vault-runner-name">{c.name}</div>
                      <div className="vault-runner-meta">
                        {c.owner} · Heat {c.heat}
                      </div>
                      {undoable[c.id] && (
                        <button className="link-button gm-undo" onClick={() => undoLastChange(c)}>
                          Undo last change
                        </button>
                      )}
                    </div>

                    <div className="gm-stat">
                      <span className={physicalOverflow ? "num gm-stat-value gm-stat-value--overflow" : "num gm-stat-value"}>
                        {ps.physicalDamage} / {c.maxPhysical}
                      </span>
                      <div className="gm-stat-actions">
                        <button onClick={() => adjustDamage(c, "physicalDamage", -1)}>-1</button>
                        <button onClick={() => adjustDamage(c, "physicalDamage", 1)}>+1</button>
                        <button className="btn-primary" onClick={() => adjustDamage(c, "physicalDamage", 3)}>
                          +3
                        </button>
                      </div>
                    </div>

                    <div className="gm-stat">
                      <span className={stunOverflow ? "num gm-stat-value gm-stat-value--overflow" : "num gm-stat-value"}>
                        {ps.stunDamage} / {c.maxStun}
                      </span>
                      <div className="gm-stat-actions">
                        <button onClick={() => adjustDamage(c, "stunDamage", -1)}>-1</button>
                        <button onClick={() => adjustDamage(c, "stunDamage", 1)}>+1</button>
                        <button className="btn-primary" onClick={() => adjustDamage(c, "stunDamage", 3)}>
                          +3
                        </button>
                      </div>
                    </div>

                    <div className="gm-stat">
                      <span className="num gm-stat-value">
                        {ps.edgeAvailable} / {c.maxEdge}
                      </span>
                      <div className="gm-stat-actions">
                        <button onClick={() => adjustEdge(c, -1)} disabled={ps.edgeAvailable <= 0}>
                          -1
                        </button>
                        <button onClick={() => adjustEdge(c, 1)} disabled={ps.edgeAvailable >= c.maxEdge}>
                          +1
                        </button>
                      </div>
                    </div>

                    <div className="chip-row gm-status">
                      {ps.statusEffects.map((e) => (
                        <button key={e.id} className="chip selected" onClick={() => removeStatusEffect(c, e.id)}>
                          {e.name}
                          {e.roundsRemaining !== undefined ? ` (${e.roundsRemaining})` : ""}
                        </button>
                      ))}
                      <button className="chip gm-status-add" onClick={() => addStatusEffect(c)}>
                        + add
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </section>
      )}

      <section>
        <h2>NPCs</h2>
        <NpcRoster />
      </section>
    </div>
  );
}
