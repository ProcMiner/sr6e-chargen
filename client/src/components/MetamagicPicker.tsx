// Chip-button catalog picker for Metamagics (Initiation) and Echoes
// (Submersion) - see server/src/rules/metamagics.ts. Shared between
// Advancement.tsx (career-mode Initiation/Submersion) and InitiationPicker
// (chargen "experienced character" starting Grade), same "catalog own,
// small controlled component" pattern as NumberStepper. Doesn't own the
// chosen name/id itself - the caller holds that in its own form state and
// passes it back as `selectedId`, since both callers still need a free-text
// override for a homebrew/GM-approved name.
import type { EchoCatalogEntry, MetamagicCatalogEntry } from "../rules";

interface Props {
  catalog: (MetamagicCatalogEntry | EchoCatalogEntry)[];
  /** Only metamagics carry this filter; echoes have no adept-only entries. */
  isAdept: boolean;
  /** Ids already known and not repeatable - greyed out, can't be picked again. */
  knownOnceIds: string[];
  selectedId?: string;
  onSelect: (entry: { id: string; name: string }) => void;
}

function isRepeatable(entry: MetamagicCatalogEntry | EchoCatalogEntry): boolean {
  if ("repeatable" in entry && entry.repeatable) return true;
  if ("maxRepeats" in entry && entry.maxRepeats) return true;
  return false;
}

export function MetamagicPicker({ catalog, isAdept, knownOnceIds, selectedId, onSelect }: Props) {
  const visible = catalog.filter((entry) => isAdept || !("adeptOnly" in entry && entry.adeptOnly));

  const byBook = new Map<string, (MetamagicCatalogEntry | EchoCatalogEntry)[]>();
  for (const entry of visible) {
    if (!byBook.has(entry.book)) byBook.set(entry.book, []);
    byBook.get(entry.book)!.push(entry);
  }

  return (
    <div className="metamagic-picker">
      {[...byBook.entries()].map(([book, entries]) => (
        <div key={book} className="chip-row">
          {entries.map((entry) => {
            const alreadyKnown = !isRepeatable(entry) && knownOnceIds.includes(entry.id);
            return (
              <button
                key={entry.id}
                type="button"
                className={`chip${selectedId === entry.id ? " selected" : ""}`}
                disabled={alreadyKnown}
                title={alreadyKnown ? `${entry.summary} (already known)` : entry.summary}
                onClick={() => onSelect({ id: entry.id, name: entry.name })}
              >
                {entry.name}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
