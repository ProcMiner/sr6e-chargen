import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type CharacterSummary } from "../api";

export function InPlay() {
  const [characters, setCharacters] = useState<CharacterSummary[] | null>(null);

  useEffect(() => {
    api.listCharacters().then(setCharacters);
  }, []);

  return (
    <div className="page">
      <header className="page-header">
        <h1>In Play</h1>
      </header>

      {characters === null && <p>Loading...</p>}
      {characters?.length === 0 && <p>No characters yet - create one in Character Vault first.</p>}

      <ul className="character-list">
        {characters?.map((c) => (
          <li key={c.id}>
            <Link to={`/characters/${c.id}/live`}>
              <strong>{c.name}</strong>
              <span className="system-tag">{c.system === "priority" ? "Priority" : "Life Path"}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
