import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, type CharacterSummary } from "../api";
import type { PlayState } from "../playState";
import type { Attributes } from "../rules";
import { deriveStats } from "../derive";
import { modifierBonuses } from "../deriveModifiers";
import { ConditionStrip } from "../components/ConditionStrip";
import { EditableName } from "../components/EditableName";

/** Physical Condition Monitor + Edge max, purely from the character's own
 * chargen data (already present on CharacterSummary) - same computation
 * Combat.tsx uses, just without needing the gear rules catalog since gear
 * modifiers are pre-resolved per line. */
const BLANK_ATTRIBUTES: Attributes = {
  body: 0,
  agility: 0,
  reaction: 0,
  strength: 0,
  willpower: 0,
  logic: 0,
  intuition: 0,
  charisma: 0,
  edge: 0,
};

function vitals(c: CharacterSummary) {
  const attributes = c.data.attributes ?? BLANK_ATTRIBUTES;
  const bonuses = modifierBonuses(c.data.gear ?? [], c.data.adeptPowers ?? []);
  const derived = deriveStats(attributes, bonuses);
  const edge = attributes.edge;
  const maxEdge = typeof edge === "number" && Number.isFinite(edge) ? edge : 0;
  return { maxPhysical: derived.physicalMonitor, maxEdge };
}

export function CharacterList() {
  const [characters, setCharacters] = useState<CharacterSummary[] | null>(null);
  const [playStates, setPlayStates] = useState<Record<number, PlayState>>({});
  const [name, setName] = useState("");
  const [system, setSystem] = useState<"priority" | "lifepath">("priority");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  function refresh() {
    api.listCharacters().then((list) => {
      setCharacters(list);
      Promise.all(
        list.map((c) =>
          api
            .getPlayState(c.id)
            .then((ps) => [c.id, ps] as const)
            .catch(() => null)
        )
      ).then((results) => {
        const next: Record<number, PlayState> = {};
        for (const r of results) {
          if (r) next[r[0]] = r[1];
        }
        setPlayStates(next);
      });
    });
  }

  useEffect(refresh, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const character = await api.createCharacter(name.trim(), system, { systemState: {} });
      navigate(`/characters/${character.id}`);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this character? This can't be undone.")) return;
    await api.deleteCharacter(id);
    refresh();
  }

  function handleRename(id: number, nextName: string) {
    setCharacters((prev) => prev && prev.map((c) => (c.id === id ? { ...c, name: nextName } : c)));
    api.updateCharacter(id, { name: nextName });
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Character Vault</h1>
      </header>

      <form onSubmit={handleCreate} className="new-character-form">
        <input
          placeholder="Character name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <select value={system} onChange={(e) => setSystem(e.target.value as "priority" | "lifepath")}>
          <option value="priority">Priority System</option>
          <option value="lifepath">Life Path (Modules)</option>
        </select>
        <button type="submit" disabled={creating}>
          New Character
        </button>
      </form>

      {characters === null && <p className="hint">Loading...</p>}
      {characters?.length === 0 && <p className="hint">No characters yet - build your first one above.</p>}

      {characters && characters.length > 0 && (
        <>
          <div className="vault-header-row">
            <span>Runner</span>
            <span>System</span>
            <span>Condition</span>
            <span>Edge</span>
            <span />
          </div>
          <ul className="character-list">
            {characters.map((c) => {
              const { maxPhysical, maxEdge } = vitals(c);
              const ps = playStates[c.id];
              const metaParts = [c.data.metatype, typeof c.data.karma === "number" ? `${c.data.karma} Karma` : null].filter(
                Boolean
              );
              return (
                <li key={c.id} className="vault-row">
                  <div>
                    <div className="vault-runner-name">
                      <EditableName value={c.name} onSave={(next) => handleRename(c.id, next)} />
                    </div>
                    {metaParts.length > 0 && <div className="vault-runner-meta">{metaParts.join(" · ")}</div>}
                  </div>
                  <div>
                    <span className="system-tag">{c.system === "priority" ? "Priority" : "Life Path"}</span>
                  </div>
                  <div>
                    <ConditionStrip filled={ps?.physicalDamage ?? 0} max={maxPhysical} size="sm" />
                  </div>
                  <div className="vault-edge num">{ps ? `${ps.edgeAvailable} / ${maxEdge}` : "–"}</div>
                  <div className="vault-actions">
                    <Link className="button-link" to={`/characters/${c.id}/live`}>
                      Live Play
                    </Link>
                    <Link className="button-link btn-ghost" to={`/characters/${c.id}`}>
                      Edit
                    </Link>
                    <button className="danger" onClick={() => handleDelete(c.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
