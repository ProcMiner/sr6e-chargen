import { useState } from "react";
import type { CharacterData, Contact } from "../../../../character";
import type { LifepathRulesResponse, MetatypeAttributes, MetavariantCatalogEntry } from "../../../../rules";
import { NumberStepper } from "../../../../components/NumberStepper";
import { karmaRemaining } from "../../../../deriveGear";
import {
  contactsCpSpent,
  contactsKarmaSpent,
  lifepathAvailableContactTypes,
  lifepathContactPointPool,
  withKarmaFundedPoint,
  withRating,
} from "../../../../deriveContacts";
import { deriveLifepathState } from "../../../../deriveLifepath";
import { generateId } from "../../../../id";

interface Props {
  rules: LifepathRulesResponse;
  metatypeAttributes: MetatypeAttributes[];
  metavariants: MetavariantCatalogEntry[];
  skillList: string[];
  data: CharacterData;
  onChange: (data: CharacterData) => void;
}

export function FinishingStepsStep({ rules, data, onChange }: Props) {
  const state = deriveLifepathState(data);
  const [newContactName, setNewContactName] = useState("");
  const [newContactType, setNewContactType] = useState("");

  // Contacts (Sixth World Companion p.31): points come entirely from
  // selected life modules (+ Coming of Age's fixed 4), never from Charisma -
  // see deriveContacts.ts. Customization Karma can optionally push a rating
  // further, 1 Karma per point, but never above Charisma.
  const contacts = data.contacts;
  const charisma = data.attributes.charisma;
  const comingOfAgeDone = !!state.comingOfAgeSkill;
  const allAdult = rules.adultModules;
  const contactTypes = lifepathAvailableContactTypes(state.selectedModuleIds, allAdult, comingOfAgeDone);
  const contactPool = lifepathContactPointPool(state.selectedModuleIds, allAdult, comingOfAgeDone);
  const contactCpSpent = contactsCpSpent(contacts);
  const contactCpRemaining = contactPool - contactCpSpent;
  const contactKarmaBudget = karmaRemaining(data, contactsKarmaSpent(contacts));

  function updateContact(id: string, next: Contact) {
    onChange({ ...data, contacts: contacts.map((c) => (c.id === id ? next : c)) });
  }

  function removeContact(id: string) {
    onChange({ ...data, contacts: contacts.filter((c) => c.id !== id) });
  }

  function addContact() {
    const name = newContactName.trim();
    if (!name || !newContactType || contactCpRemaining < 2) return;
    const contact: Contact = { id: generateId(), name, type: newContactType, connection: 1, loyalty: 1 };
    onChange({ ...data, contacts: [...contacts, contact] });
    setNewContactName("");
  }

  function spendKarmaOnRating(id: string, field: "connection" | "loyalty") {
    const contact = contacts.find((c) => c.id === id);
    if (!contact || contact[field] >= charisma || contactKarmaBudget < 1) return;
    updateContact(id, withKarmaFundedPoint(contact, field));
  }

  return (
    <div className="lifepath-builder">
      <h2>
        Contacts ({contactCpSpent} / {contactPool} contact points spent)
      </h2>
      <p className="hint">
        Contact points come from your life modules and Coming of Age, not from Charisma (Companion
        p.31). A new contact costs 2 points (Connection 1 / Loyalty 1); each additional point of
        Connection or Loyalty costs 1 more, up to a hard cap of 8. You can also spend customization Karma
        (1 per point, "+1 (Karma)" below) to push a rating up to your Charisma ({charisma}). The book
        restricts each module's points to contacts matching that module's own type list - this tool
        doesn't enforce that narrower per-module match, so self-adjudicate against the modules you picked
        in Adult Life Modules.
      </p>
      {contactTypes.length === 0 && (
        <p className="hint">Finish Coming of Age or pick a life module that grants contact points to unlock contact types.</p>
      )}
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
                <label className="inline-field">
                  Type
                  <select value={c.type ?? ""} onChange={(e) => updateContact(c.id, { ...c, type: e.target.value })}>
                    {contactTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="attribute-editor">
                  {(["connection", "loyalty"] as const).map((field) => (
                    <label key={field} className="inline-field">
                      {field === "connection" ? "Connection" : "Loyalty"}
                      <NumberStepper
                        label={`${c.name} ${field}`}
                        min={1}
                        max={Math.min(8, c[field] + contactCpRemaining)}
                        value={c[field]}
                        onChange={(next) => updateContact(c.id, withRating(c, field, next))}
                      />
                      {c[field] < charisma && contactKarmaBudget >= 1 && (
                        <button type="button" className="chip" onClick={() => spendKarmaOnRating(c.id, field)}>
                          +1 (Karma)
                        </button>
                      )}
                      {c.karmaFunded && c.karmaFunded[field] > 0 && (
                        <span className="hint">{c.karmaFunded[field]} Karma-funded</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="inline-field">
        <input
          type="text"
          placeholder="Contact name"
          value={newContactName}
          onChange={(e) => setNewContactName(e.target.value)}
        />
        <select value={newContactType} onChange={(e) => setNewContactType(e.target.value)}>
          <option value="">choose type...</option>
          {contactTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button onClick={addContact} disabled={!newContactName.trim() || !newContactType || contactCpRemaining < 2}>
          Add (2 points)
        </button>
      </div>

      <h2>Native Language</h2>
      <p className="hint">
        Every character starts with one free Native language (Companion p.31) - it isn't drawn from any
        life module's knowledge/language grants above.
      </p>
      <input
        type="text"
        placeholder="Native language (e.g. English, Sperethiel, Cityspeak)"
        value={data.nativeLanguage ?? ""}
        onChange={(e) => onChange({ ...data, nativeLanguage: e.target.value })}
      />
    </div>
  );
}
