// Contacts tab (SR6 Character Sheet Design handoff) - a plain read-only
// roster (Alias/Type/Connection/Loyalty). Buying Connection/Loyalty
// increases in play still lives in the Advancement panel; this is just the
// at-a-glance table the design calls for.
import type { CharacterData } from "../../character";

interface Props {
  data: CharacterData;
}

export function Contacts({ data }: Props) {
  return (
    <div className="sheet-card">
      <div className="rules-kicker">Contacts</div>
      {data.contacts.length > 0 ? (
        <table className="rules-table">
          <thead>
            <tr>
              <th>Alias</th>
              <th>Type</th>
              <th>Connection</th>
              <th>Loyalty</th>
            </tr>
          </thead>
          <tbody>
            {data.contacts.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td className="cell-dim">{c.type ?? "—"}</td>
                <td>{c.connection}</td>
                <td>{c.loyalty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="hint">No contacts yet.</p>
      )}
    </div>
  );
}
