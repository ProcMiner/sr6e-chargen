import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type CharacterSummary } from "../api";
import type { PlayState } from "../playState";
import type { Attributes } from "../rules";
import { deriveStats } from "../derive";
import { modifierBonuses } from "../deriveModifiers";
import { ConditionStrip } from "../components/ConditionStrip";

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

export function InPlay() {
  const [characters, setCharacters] = useState<CharacterSummary[] | null>(null);
  const [playStates, setPlayStates] = useState<Record<number, PlayState>>({});

  useEffect(() => {
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
  }, []);

  return (
    <div className="page">
      <header className="page-header">
        <h1>In Play</h1>
      </header>

      {characters === null && <p className="hint">Loading...</p>}
      {characters?.length === 0 && <p className="hint">No characters yet - create one in Character Vault first.</p>}

      {characters && characters.length > 0 && (
        <>
          <div className="vault-header-row vault-header-row--inplay">
            <span>Runner</span>
            <span>System</span>
            <span>Condition</span>
            <span>Edge</span>
          </div>
          <ul className="character-list">
            {characters.map((c) => {
              const { maxPhysical, maxEdge } = vitals(c);
              const ps = playStates[c.id];
              return (
                <li key={c.id} className="vault-row vault-row--inplay">
                  <Link className="vault-runner-link" to={`/characters/${c.id}/live`}>
                    <span className="vault-runner-name">{c.name}</span>
                  </Link>
                  <div>
                    <span className="system-tag">{c.system === "priority" ? "Priority" : "Life Path"}</span>
                  </div>
                  <div>
                    <ConditionStrip filled={ps?.physicalDamage ?? 0} max={maxPhysical} size="sm" />
                  </div>
                  <div className="vault-edge num">{ps ? `${ps.edgeAvailable} / ${maxEdge}` : "–"}</div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
