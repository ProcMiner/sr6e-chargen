import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, type CharacterSummary } from "../api";
import { useAuth } from "../AuthContext";

export function CharacterList() {
  const [characters, setCharacters] = useState<CharacterSummary[] | null>(null);
  const [name, setName] = useState("");
  const [system, setSystem] = useState<"priority" | "lifepath">("priority");
  const [creating, setCreating] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function refresh() {
    api.listCharacters().then(setCharacters);
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

  return (
    <div className="page">
      <header className="page-header">
        <h1>Your Characters</h1>
        <div className="header-actions">
          <span>{user?.username}</span>
          <button onClick={() => logout()}>Log out</button>
        </div>
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

      {characters === null && <p>Loading...</p>}
      {characters?.length === 0 && <p>No characters yet - build your first one above.</p>}

      <ul className="character-list">
        {characters?.map((c) => (
          <li key={c.id}>
            <Link to={`/characters/${c.id}`}>
              <strong>{c.name}</strong>
              <span className="system-tag">{c.system === "priority" ? "Priority" : "Life Path"}</span>
            </Link>
            <button className="danger" onClick={() => handleDelete(c.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
