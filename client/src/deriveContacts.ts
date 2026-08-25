// Contacts (core rulebook p.66-67; Sixth World Companion "Life Path" p.31).
// The two build systems fund contacts very differently:
// - Priority/Point Buy: a flat pool of Charisma x 6 points, spent on
//   Connection + Loyalty across every contact, with each individual rating
//   capped at Charisma. No hard cap on the number of contacts - it falls out
//   of the pool size (a new contact costs 2 points minimum).
// - Life Path: contact points come entirely from selected life modules
//   (LifeModule.contactPoints) plus Coming of Age's fixed 4 points: "your
//   Charisma does not provide you with contact points, and your contacts'
//   ratings are not limited by your Charisma attribute" (Companion p.31).
//   Each rating caps at 8 instead. Customization Karma can optionally push a
//   rating further, 1 Karma per point, but never above Charisma.
// House rule (not RAW, see contactRatingCap below): an Elite (Life Path) or
// Prime Runner (Priority) character isn't held to that starter-character
// Charisma cap on individual ratings - they can push all the way to the
// in-play cap (CONTACT_RATING_MAX) instead.
import type { Contact, ContactAdvancementEntry } from "./character";
import type { LifeModule } from "./rules";

// Post-chargen ("career mode") Contact improvement: 1 Karma per point of
// Connection or Loyalty, reusing the same rate this app's Life Path build
// already charges for Karma-funded contact points at chargen
// (withKarmaFundedPoint below, Companion p.31) - the core rulebook's own
// Improvement Cost table (p.68-69) doesn't tabulate Contacts at all, so this
// is the only concrete Karma-per-point rate on record for this app rather
// than a fresh guess. Both ratings cap at 12 in play (core p.51, "Both
// ratings range from 1 to 12"), not at Charisma - that narrower cap is
// chargen-only ("at this point [creation], neither rating can be higher
// than the character's Charisma").
export const CONTACT_ADVANCEMENT_KARMA_PER_POINT = 1;
export const CONTACT_RATING_MAX = 12;

export function contactAdvancementKarmaTotal(entries: ContactAdvancementEntry[] | undefined): number {
  return (entries ?? []).reduce((sum, e) => sum + e.karmaCost, 0);
}

/** Every concrete contact type in the book's fixed list (Companion p.31/33-46) - a module's `contactTypes: ["Any"]` grant expands to all of these. */
export const ALL_CONTACT_TYPES = [
  "Academic",
  "Corporate",
  "Criminal",
  "Engineering",
  "Government",
  "Magic",
  "Matrix",
  "Media",
  "Medical",
  "Street",
] as const;

/** Combined Connection + Loyalty cost of one contact - the same "points" currency in both build systems: a brand new contact costs 2 (Connection 1 + Loyalty 1), and every point above that costs 1 more. */
export function contactCost(contact: Contact): number {
  return contact.connection + contact.loyalty;
}

export function contactsCostTotal(contacts: Contact[]): number {
  return contacts.reduce((sum, c) => sum + contactCost(c), 0);
}

/** Portion of a contact's cost paid for with a life module's contact points rather than customization Karma - the only thing that draws down the Life Path contact point pool. */
export function contactsCpSpent(contacts: Contact[]): number {
  return contacts.reduce((sum, c) => sum + contactCost(c) - karmaFundedTotal(c), 0);
}

/** Karma spent upgrading contacts beyond their module-funded points (Life Path only) - feeds into the shared customization Karma pool the same way spell/complex form/metavariant Karma costs do (see SummarySheet.tsx / deriveGear.ts's karmaRemaining). */
export function contactsKarmaSpent(contacts: Contact[]): number {
  return contacts.reduce((sum, c) => sum + karmaFundedTotal(c), 0);
}

function karmaFundedTotal(c: Contact): number {
  return c.karmaFunded ? c.karmaFunded.connection + c.karmaFunded.loyalty : 0;
}

/** Priority/Point Buy contact point pool (core rulebook p.66-67). */
export function priorityContactPointPool(charisma: number): number {
  return charisma * 6;
}

/**
 * Highest a single Connection/Loyalty rating may reach at chargen. Standard
 * play caps every rating at Charisma - Priority directly (core p.66-67),
 * Life Path indirectly via its Karma-funded push (Companion p.31, "never
 * above Charisma"). House rule: an Elite/Prime Runner character (see
 * PrioritySystemState.powerLevel/LifepathSystemState.powerLevel) isn't held
 * to that starter-character limitation and can push a rating all the way to
 * the in-play cap instead.
 */
export function contactRatingCap(charisma: number, elevated: boolean): number {
  return elevated ? CONTACT_RATING_MAX : charisma;
}

/**
 * Life Path contact point pool: the sum of every selected life module's
 * `contactPoints`, plus Coming of Age's fixed 4 (Companion p.31: "Assign
 * four total points... minimum 1 each" - not itemized as a `contactPoints`
 * field since Coming of Age is a starting module handled by its own code
 * path in LifepathBuilder.tsx, not the data-driven adult-module list).
 *
 * This sums the total available points across every module regardless of
 * that module's `contactTypes` list. The book restricts each module's
 * points to contacts matching that module's own type list; this app doesn't
 * enforce that narrower per-module restriction (would require tracking
 * which specific module funded which point on which contact) - players
 * should self-adjudicate type matches against the modules they picked.
 */
export function lifepathContactPointPool(
  selectedModuleIds: string[],
  allModules: LifeModule[],
  comingOfAgeSkillChosen: boolean
): number {
  let total = comingOfAgeSkillChosen ? 4 : 0;
  for (const id of selectedModuleIds) {
    const mod = allModules.find((m) => m.id === id);
    if (mod?.contactPoints) total += mod.contactPoints;
  }
  return total;
}

/** Every concrete contact type reachable from the selected life modules (plus Coming of Age, which lets you pick any of the 10) - populates the type dropdown in LifepathBuilder.tsx so players can only pick a type they actually have access to. */
export function lifepathAvailableContactTypes(
  selectedModuleIds: string[],
  allModules: LifeModule[],
  comingOfAgeSkillChosen: boolean
): string[] {
  const types = new Set<string>();
  if (comingOfAgeSkillChosen) ALL_CONTACT_TYPES.forEach((t) => types.add(t));
  for (const id of selectedModuleIds) {
    const mod = allModules.find((m) => m.id === id);
    for (const t of mod?.contactTypes ?? []) {
      if (t === "Any") ALL_CONTACT_TYPES.forEach((all) => types.add(all));
      else types.add(t);
    }
  }
  return Array.from(types).sort();
}

/** Sets a contact's rating, shrinking its Karma-funded count if the new value drops below it (refunding the Karma-funded portion last, since a CP-funded point is refunded first by construction - see contactsCpSpent). */
export function withRating(contact: Contact, field: "connection" | "loyalty", value: number): Contact {
  const karmaFunded = contact.karmaFunded;
  if (!karmaFunded || karmaFunded[field] <= value) return { ...contact, [field]: value };
  return { ...contact, [field]: value, karmaFunded: { ...karmaFunded, [field]: value } };
}

/** Adds 1 Karma-funded point to a contact's rating - caller is responsible for checking the rating is below Charisma and the Karma budget allows it (Companion p.31). */
export function withKarmaFundedPoint(contact: Contact, field: "connection" | "loyalty"): Contact {
  const karmaFunded = contact.karmaFunded ?? { connection: 0, loyalty: 0 };
  return {
    ...contact,
    [field]: contact[field] + 1,
    karmaFunded: { ...karmaFunded, [field]: karmaFunded[field] + 1 },
  };
}
