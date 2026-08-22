import { useState } from "react";

interface Props {
  value: string;
  onSave: (name: string) => void;
  className?: string;
}

/** Click-to-edit inline text - used everywhere a character's name is shown
 * (Character Vault row, Builder header, Live Play header) so renaming works
 * from wherever the user happens to be looking at it, not just one page.
 * Enter/blur commits, Escape cancels. Saving is the caller's job (usually a
 * single api.updateCharacter(id, { name }) call) - this component only
 * owns the editing UI and local draft text. */
export function EditableName({ value, onSave, className }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function commit() {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    else setDraft(value);
  }

  if (editing) {
    return (
      <input
        className={`editable-name-input ${className ?? ""}`}
        value={draft}
        autoFocus
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
      />
    );
  }

  return (
    <span
      className={`editable-name ${className ?? ""}`}
      role="button"
      tabIndex={0}
      title="Click to rename"
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          setDraft(value);
          setEditing(true);
        }
      }}
    >
      {value}
    </span>
  );
}
