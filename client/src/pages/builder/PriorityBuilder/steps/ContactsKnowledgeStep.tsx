import { useState } from "react";
import type { CharacterData, Contact, KnowledgeSkillLine, LanguageLevel } from "../../../../character";
import { LANGUAGE_LEVEL_NAMES } from "../../../../character";
import type { PriorityRulesResponse } from "../../../../rules";
import { NumberStepper } from "../../../../components/NumberStepper";
import { contactsCostTotal, priorityContactPointPool, withRating } from "../../../../deriveContacts";
import { MAX_PURCHASABLE_LANGUAGE_LEVEL, knowledgeSlotsSpent, priorityKnowledgeSlotPool } from "../../../../deriveKnowledge";
import { generateId } from "../../../../id";

const PURCHASABLE_LANGUAGE_LEVELS: LanguageLevel[] = Array.from(
  { length: MAX_PURCHASABLE_LANGUAGE_LEVEL },
  (_, i) => (i + 1) as LanguageLevel
);

interface Props {
  rules: PriorityRulesResponse;
  data: CharacterData;
  onChange: (data: CharacterData) => void;
}

export function ContactsKnowledgeStep({ data, onChange }: Props) {
  const [newContactName, setNewContactName] = useState("");
  const [newKnowledgeName, setNewKnowledgeName] = useState("");
  const [newKnowledgeType, setNewKnowledgeType] = useState<"knowledge" | "language">("knowledge");

  // Contacts (core rulebook p.66-67): Charisma x 6 points shared across
  // every contact's Connection + Loyalty, no individual rating above
  // Charisma. See deriveContacts.ts for why there's no separate "number of
  // contacts" cap - it's just a consequence of the pool size.
  const contacts = data.contacts;
  const charisma = data.attributes.charisma;
  const contactPool = priorityContactPointPool(charisma);
  const contactPointsSpent = contactsCostTotal(contacts);
  const contactPointsRemaining = contactPool - contactPointsSpent;

  function updateContact(id: string, next: Contact) {
    onChange({ ...data, contacts: contacts.map((c) => (c.id === id ? next : c)) });
  }

  function removeContact(id: string) {
    onChange({ ...data, contacts: contacts.filter((c) => c.id !== id) });
  }

  function addContact() {
    const name = newContactName.trim();
    if (!name || contactPointsRemaining < 2) return;
    const contact: Contact = { id: generateId(), name, connection: 1, loyalty: 1 };
    onChange({ ...data, contacts: [...contacts, contact] });
    setNewContactName("");
  }

  // Knowledge & Language skills (core rulebook p.67, p.97-99): a free pool
  // of Logic slots, plus one free Native language granted outside that pool
  // (see deriveKnowledge.ts). Life Path doesn't get this pool at all - its
  // knowledge/language skills come entirely from life module choices.
  const knowledgeSkills = data.knowledgeSkills;
  const knowledgePool = priorityKnowledgeSlotPool(data.attributes.logic);
  const knowledgeSlotsUsed = knowledgeSlotsSpent(knowledgeSkills);
  const knowledgeSlotsRemaining = knowledgePool - knowledgeSlotsUsed;

  function updateKnowledgeLine(id: string, next: KnowledgeSkillLine) {
    onChange({ ...data, knowledgeSkills: knowledgeSkills.map((k) => (k.id === id ? next : k)) });
  }

  function removeKnowledgeLine(id: string) {
    onChange({ ...data, knowledgeSkills: knowledgeSkills.filter((k) => k.id !== id) });
  }

  function addKnowledgeLine() {
    const name = newKnowledgeName.trim();
    if (!name || knowledgeSlotsRemaining < 1) return;
    const line: KnowledgeSkillLine =
      newKnowledgeType === "language"
        ? { id: generateId(), name, type: "language", level: 1 }
        : { id: generateId(), name, type: "knowledge" };
    onChange({ ...data, knowledgeSkills: [...knowledgeSkills, line] });
    setNewKnowledgeName("");
  }

  function setLanguageLevel(id: string, level: LanguageLevel) {
    const line = knowledgeSkills.find((k) => k.id === id);
    if (!line) return;
    const delta = level - (line.level ?? 1);
    if (delta > 0 && delta > knowledgeSlotsRemaining) return;
    updateKnowledgeLine(id, { ...line, level });
  }

  return (
    <div className="priority-builder">
      <section>
        <h3>
          Contacts ({contactPointsSpent} / {contactPool} points spent)
        </h3>
        <p className="hint">
          Charisma x 6 points to spend on Connection + Loyalty across all your contacts (core rulebook
          p.66-67). No single rating may exceed your Charisma ({charisma}).
        </p>
        {contacts.length > 0 && (
          <ul className="module-slots">
            {contacts.map((c) => (
              <li key={c.id}>
                <div className="module-instance">
                  <div className="module-instance-header">
                    <strong>{c.name}</strong>
                    <button className="danger" onClick={() => removeContact(c.id)}>
                      Remove
                    </button>
                  </div>
                  <div className="attribute-editor">
                    <label>
                      Connection
                      <NumberStepper
                        label={`${c.name} Connection`}
                        min={1}
                        max={Math.min(charisma, c.connection + contactPointsRemaining)}
                        value={c.connection}
                        onChange={(next) => updateContact(c.id, withRating(c, "connection", next))}
                      />
                    </label>
                    <label>
                      Loyalty
                      <NumberStepper
                        label={`${c.name} Loyalty`}
                        min={1}
                        max={Math.min(charisma, c.loyalty + contactPointsRemaining)}
                        value={c.loyalty}
                        onChange={(next) => updateContact(c.id, withRating(c, "loyalty", next))}
                      />
                    </label>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="inline-field">
          <input
            type="text"
            placeholder="Contact name (e.g. Johnny Two-Fingers, Fixer)"
            value={newContactName}
            onChange={(e) => setNewContactName(e.target.value)}
          />
          <button onClick={addContact} disabled={!newContactName.trim() || contactPointsRemaining < 2}>
            Add (2 points)
          </button>
        </div>
      </section>

      <section>
        <h3>Knowledge &amp; Language Skills</h3>
        <p className="hint">
          Every character starts with one free Native language, entered below - it doesn't cost any
          points.
        </p>
        <input
          type="text"
          placeholder="Native language (e.g. English, Sperethiel, Cityspeak)"
          value={data.nativeLanguage ?? ""}
          onChange={(e) => onChange({ ...data, nativeLanguage: e.target.value })}
        />
        <p className="hint">
          {knowledgeSlotsUsed} / {knowledgePool} points spent (equal to Logic, core rulebook p.67). A
          knowledge topic or a language's first (Basic) level costs 1 point; each further language level
          costs 1 more, up to Expert (3 total) - Native is only ever the free one above.
        </p>
        {knowledgeSkills.length > 0 && (
          <ul className="module-slots">
            {knowledgeSkills.map((k) => (
              <li key={k.id}>
                <div className="module-instance">
                  <div className="module-instance-header">
                    <strong>
                      {k.name}
                      {k.type === "language" ? ` (${LANGUAGE_LEVEL_NAMES[k.level ?? 1]})` : ""}
                    </strong>
                    <button className="danger" onClick={() => removeKnowledgeLine(k.id)}>
                      Remove
                    </button>
                  </div>
                  {k.type === "language" && (
                    <div className="chip-row">
                      {PURCHASABLE_LANGUAGE_LEVELS.map((level) => (
                        <button
                          key={level}
                          className={k.level === level ? "chip selected" : "chip"}
                          disabled={level > (k.level ?? 1) && level - (k.level ?? 1) > knowledgeSlotsRemaining}
                          onClick={() => setLanguageLevel(k.id, level)}
                        >
                          {LANGUAGE_LEVEL_NAMES[level]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="inline-field">
          <input
            type="text"
            placeholder="Knowledge topic or language name"
            value={newKnowledgeName}
            onChange={(e) => setNewKnowledgeName(e.target.value)}
          />
          <select value={newKnowledgeType} onChange={(e) => setNewKnowledgeType(e.target.value as "knowledge" | "language")}>
            <option value="knowledge">Knowledge topic</option>
            <option value="language">Language</option>
          </select>
          <button onClick={addKnowledgeLine} disabled={!newKnowledgeName.trim() || knowledgeSlotsRemaining < 1}>
            Add (1 point)
          </button>
        </div>
      </section>
    </div>
  );
}
