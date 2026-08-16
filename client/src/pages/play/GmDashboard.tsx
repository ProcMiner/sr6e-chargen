import { useEffect, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../AuthContext";
import type { PlaySessionSummary, SessionDetail } from "../../playState";
import { heatEffectFor } from "../../deriveReputation";
import { NpcRoster } from "./NpcRoster";

const POLL_INTERVAL_MS = 5000;

export function GmDashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<PlaySessionSummary[] | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [creating, setCreating] = useState(false);

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
          <h2>{detail.name}</h2>
          <p className="hint">
            Join code: <strong>{detail.joinCode}</strong>
          </p>

          {detail.characters.length === 0 && <p className="hint">No characters have joined yet.</p>}

          {detail.characters.length > 0 && (
            <p className="hint">
              Party Heat (highest of the group, per the book's rule): {Math.max(...detail.characters.map((c) => c.heat))} -{" "}
              {heatEffectFor(Math.max(...detail.characters.map((c) => c.heat))).effect}
            </p>
          )}

          <div className="module-picker">
            {detail.characters.map((c) => {
              const physicalPct = Math.min(100, (c.playState.physicalDamage / c.maxPhysical) * 100);
              const stunPct = Math.min(100, (c.playState.stunDamage / c.maxStun) * 100);
              const physicalOverflow = c.playState.physicalDamage - c.maxPhysical;
              const stunOverflow = c.playState.stunDamage - c.maxStun;
              return (
                <div key={c.id} className="module-instance gm-character-card">
                  <div className="module-instance-header">
                    <strong>{c.name}</strong>
                    <span className="hint">{c.owner}</span>
                  </div>
                  <p className="hint">Physical</p>
                  <div className="damage-bar">
                    <div className="damage-bar-fill" style={{ width: `${physicalPct}%` }} />
                  </div>
                  <p>
                    {c.playState.physicalDamage} / {c.maxPhysical}
                    {physicalOverflow > 0 && <span className="danger-text"> (Overflow: {physicalOverflow})</span>}
                  </p>
                  <p className="hint">Stun</p>
                  <div className="damage-bar">
                    <div className="damage-bar-fill" style={{ width: `${stunPct}%` }} />
                  </div>
                  <p>
                    {c.playState.stunDamage} / {c.maxStun}
                    {stunOverflow > 0 && <span className="danger-text"> (Overflow: {stunOverflow})</span>}
                  </p>
                  <p>
                    Edge: {c.playState.edgeAvailable} / {c.maxEdge}
                  </p>
                  <p>
                    Reputation: {c.reputation} | Heat: {c.heat}
                  </p>
                  {c.playState.statusEffects.length > 0 && (
                    <div className="chip-row">
                      {c.playState.statusEffects.map((e) => (
                        <span key={e.id} className="chip">
                          {e.name}
                          {e.roundsRemaining !== undefined ? ` (${e.roundsRemaining})` : ""}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h2>NPCs</h2>
        <NpcRoster />
      </section>
    </div>
  );
}
