import { useEffect, useState } from "react";
import { api, type NpcSummary } from "../../api";
import { emptyNpcData, type NpcData } from "../../npc";
import type { NpcTemplateEntry } from "../../rules";

/** Local editable copy of the non-live fields, saved via an explicit Save button rather than on every keystroke - mirrors BuilderRoot.tsx's Save convention. */
interface DetailsForm {
  description: string;
  physicalMonitor: string;
  stunMonitor: string;
  armor: string;
  initiative: string;
  combat: string;
  notes: string;
}

function toForm(data: Partial<NpcData>): DetailsForm {
  const full = { ...emptyNpcData(), ...data };
  return {
    description: full.description,
    physicalMonitor: String(full.physicalMonitor),
    stunMonitor: String(full.stunMonitor),
    armor: String(full.armor),
    initiative: full.initiative,
    combat: full.combat,
    notes: full.notes,
  };
}

export function NpcRoster() {
  const [npcs, setNpcs] = useState<NpcSummary[] | null>(null);
  const [templates, setTemplates] = useState<NpcTemplateEntry[] | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [form, setForm] = useState<DetailsForm | null>(null);
  const [saving, setSaving] = useState(false);

  function refresh() {
    api.listNpcs().then(setNpcs);
  }

  useEffect(refresh, []);
  useEffect(() => {
    api.npcTemplates().then((res) => setTemplates(res.npcTemplates));
  }, []);

  const templatesByRating = new Map<number, NpcTemplateEntry[]>();
  for (const template of templates ?? []) {
    if (!templatesByRating.has(template.professionalRating)) {
      templatesByRating.set(template.professionalRating, []);
    }
    templatesByRating.get(template.professionalRating)!.push(template);
  }
  const ratings = [...templatesByRating.keys()].sort((a, b) => a - b);

  async function handleImport(template: NpcTemplateEntry) {
    setImportingId(template.id);
    try {
      const npc = await api.createNpc(template.name, template.data);
      refresh();
      setSelectedId(npc.id);
      setForm(toForm(npc.data));
    } finally {
      setImportingId(null);
    }
  }

  const selected = npcs?.find((n) => n.id === selectedId) ?? null;

  function select(npc: NpcSummary) {
    if (selectedId === npc.id) {
      setSelectedId(null);
      setForm(null);
    } else {
      setSelectedId(npc.id);
      setForm(toForm(npc.data));
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const npc = await api.createNpc(newName.trim(), emptyNpcData());
      setNewName("");
      refresh();
      setSelectedId(npc.id);
      setForm(toForm(npc.data));
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this NPC? This can't be undone.")) return;
    await api.deleteNpc(id);
    if (selectedId === id) {
      setSelectedId(null);
      setForm(null);
    }
    refresh();
  }

  async function adjustDamage(field: "physicalDamage" | "stunDamage", delta: number) {
    if (!selected) return;
    const current = { ...emptyNpcData(), ...selected.data };
    const next = { ...current, [field]: Math.max(0, current[field] + delta) };
    const npc = await api.updateNpc(selected.id, { data: next });
    setNpcs((prev) => prev?.map((n) => (n.id === npc.id ? npc : n)) ?? prev);
  }

  async function handleSaveDetails() {
    if (!selected || !form) return;
    setSaving(true);
    try {
      const current = { ...emptyNpcData(), ...selected.data };
      const next: NpcData = {
        ...current,
        description: form.description,
        physicalMonitor: Math.max(1, Number(form.physicalMonitor) || 1),
        stunMonitor: Math.max(1, Number(form.stunMonitor) || 1),
        armor: Math.max(0, Number(form.armor) || 0),
        initiative: form.initiative,
        combat: form.combat,
        notes: form.notes,
      };
      const npc = await api.updateNpc(selected.id, { data: next });
      setNpcs((prev) => prev?.map((n) => (n.id === npc.id ? npc : n)) ?? prev);
      setForm(toForm(npc.data));
    } finally {
      setSaving(false);
    }
  }

  const data = selected ? { ...emptyNpcData(), ...selected.data } : null;
  const physicalOverflow = data ? data.physicalDamage - data.physicalMonitor : 0;
  const stunOverflow = data ? data.stunDamage - data.stunMonitor : 0;

  return (
    <div>
      <p className="hint">A GM-only roster, separate from Character Vault - reusable across every game you run.</p>

      <form onSubmit={handleAdd} className="new-character-form">
        <input
          placeholder="NPC name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
        <button type="submit" disabled={creating}>
          Add NPC
        </button>
      </form>

      <details className="quality-section">
        <summary>Import from book ({templates?.length ?? 0})</summary>
        <p className="hint">
          Core Rulebook Grunts (Professional Rating 0-10) and Prime Runners, p. 203-211. Adding one creates a new
          NPC pre-filled from the printed stat block, ready to tweak.
        </p>
        {ratings.map((rating) => (
          <div key={rating}>
            <h4>
              Professional Rating {rating} - {templatesByRating.get(rating)![0].category}
            </h4>
            <ul className="module-slots">
              {templatesByRating.get(rating)!.map((template) => (
                <li key={template.id}>
                  <div className="module-instance">
                    <div className="module-instance-header">
                      <strong>{template.name}</strong>
                      <button onClick={() => handleImport(template)} disabled={importingId === template.id}>
                        {importingId === template.id ? "Adding..." : "Add"}
                      </button>
                    </div>
                    <p className="hint">{template.summary}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </details>

      {npcs === null && <p>Loading...</p>}
      {npcs?.length === 0 && <p>No NPCs yet - add one above.</p>}

      {npcs && npcs.length > 0 && (
        <ul className="module-slots">
          {npcs.map((npc) => (
            <li key={npc.id}>
              <div className="module-instance">
                <div className="module-instance-header">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      select(npc);
                    }}
                  >
                    <strong>
                      {npc.name}
                      {npc.data.description ? ` - ${npc.data.description}` : ""}
                    </strong>
                  </a>
                  <button className="danger" onClick={() => handleDelete(npc.id)}>
                    Delete
                  </button>
                </div>

                {selectedId === npc.id && data && form && (
                  <div>
                    <section>
                      <h3>Physical</h3>
                      <div className="damage-bar">
                        <div
                          className="damage-bar-fill"
                          style={{ width: `${Math.min(100, (data.physicalDamage / data.physicalMonitor) * 100)}%` }}
                        />
                      </div>
                      <p>
                        {data.physicalDamage} / {data.physicalMonitor}
                        {physicalOverflow > 0 && <span className="danger-text"> (Overflow: {physicalOverflow})</span>}
                      </p>
                      <div className="chip-row">
                        <button onClick={() => adjustDamage("physicalDamage", -1)}>-1</button>
                        <button onClick={() => adjustDamage("physicalDamage", 1)}>+1</button>
                      </div>
                    </section>

                    <section>
                      <h3>Stun</h3>
                      <div className="damage-bar">
                        <div
                          className="damage-bar-fill"
                          style={{ width: `${Math.min(100, (data.stunDamage / data.stunMonitor) * 100)}%` }}
                        />
                      </div>
                      <p>
                        {data.stunDamage} / {data.stunMonitor}
                        {stunOverflow > 0 && <span className="danger-text"> (Overflow: {stunOverflow})</span>}
                      </p>
                      <div className="chip-row">
                        <button onClick={() => adjustDamage("stunDamage", -1)}>-1</button>
                        <button onClick={() => adjustDamage("stunDamage", 1)}>+1</button>
                      </div>
                    </section>

                    <section>
                      <h3>Details</h3>
                      <label className="inline-field">
                        Description
                        <input
                          value={form.description}
                          onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                      </label>
                      <label className="inline-field">
                        Physical Monitor (max)
                        <input
                          type="number"
                          min={1}
                          value={form.physicalMonitor}
                          onChange={(e) => setForm({ ...form, physicalMonitor: e.target.value })}
                        />
                      </label>
                      <label className="inline-field">
                        Stun Monitor (max)
                        <input
                          type="number"
                          min={1}
                          value={form.stunMonitor}
                          onChange={(e) => setForm({ ...form, stunMonitor: e.target.value })}
                        />
                      </label>
                      <label className="inline-field">
                        Armor
                        <input
                          type="number"
                          min={0}
                          value={form.armor}
                          onChange={(e) => setForm({ ...form, armor: e.target.value })}
                        />
                      </label>
                      <label className="inline-field">
                        Initiative
                        <input
                          placeholder="e.g. 8 + 1d6"
                          value={form.initiative}
                          onChange={(e) => setForm({ ...form, initiative: e.target.value })}
                        />
                      </label>
                      <label className="inline-field">
                        Combat
                        <textarea
                          rows={4}
                          placeholder="e.g. Firearms 10, Ares Predator VI (3P, AR 9)"
                          value={form.combat}
                          onChange={(e) => setForm({ ...form, combat: e.target.value })}
                        />
                      </label>
                      <label className="inline-field">
                        Notes
                        <textarea
                          rows={3}
                          placeholder="Tactics, loot, anything else"
                          value={form.notes}
                          onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        />
                      </label>
                      <div className="chip-row">
                        <button onClick={handleSaveDetails} disabled={saving}>
                          {saving ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </section>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
