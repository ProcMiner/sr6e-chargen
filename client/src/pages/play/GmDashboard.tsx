import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../AuthContext";
import type { PlaySessionSummary, SessionDetail } from "../../playState";

const POLL_INTERVAL_MS = 5000;

export function GmDashboard() {
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState<PlaySessionSummary[] | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [newName, setNewName] = useState("");
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

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const session = await api.createSession(newName.trim());
      setNewName("");
      refreshSessions();
      setSelectedId(session.id);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this session? This can't be undone.")) return;
    await api.deleteSession(id);
    if (selectedId === id) setSelectedId(null);
    refreshSessions();
  }

  return (
    <div className="page">
      <header className="page-header">
        <Link to="/characters">&larr; Characters</Link>
        <h1>GM Dashboard</h1>
        <div className="header-actions">
          <span>{user?.username}</span>
          <button onClick={() => logout()}>Log out</button>
        </div>
      </header>

      <form onSubmit={handleCreate} className="new-character-form">
        <input
          placeholder="Session name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
        <button type="submit" disabled={creating}>
          New Session
        </button>
      </form>

      {sessions === null && <p>Loading...</p>}
      {sessions?.length === 0 && <p>No sessions yet - create one above.</p>}

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
    </div>
  );
}
