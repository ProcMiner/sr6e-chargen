// Lifestyle catalog - Core Rulebook's basic lifestyle rules, book pp. 56-57.
// Six flat monthly tiers; no per-category customization (that's the Sixth
// World Companion's separate Lifestyle Points system, deliberately deferred
// as a bigger follow-on chunk - see client/src/deriveLifestyle.ts's header).

export interface LifestyleCatalogEntry {
  id: string;
  name: string;
  /** Nuyen per month; flat, no rating/levels for the basic tiers. */
  costPerMonth: number;
  summary: string;
  book: string;
}

export const lifestyles: LifestyleCatalogEntry[] = [
  {
    id: "lifestyle-street",
    name: "Street",
    costPerMonth: 0,
    summary:
      "No fixed place to live - a couch, a doorway, or wherever's dry tonight. No storage; anything not carried is likely to get stolen. Default if a lifestyle isn't paid for in the current month.",
    book: "Core p. 56",
  },
  {
    id: "lifestyle-squatter",
    name: "Squatter",
    costPerMonth: 500,
    summary:
      "An abandoned or condemned building claimed rather than rented. Minimal security, no reliable plumbing or heat, soy-packet food - but a roof and somewhere to stash gear.",
    book: "Core p. 57",
  },
  {
    id: "lifestyle-low",
    name: "Low",
    costPerMonth: 2000,
    summary:
      "An actual residence (even if it started life as a shipping container): electricity, running water, a locking door, and an official address. Basic food delivery is available.",
    book: "Core p. 57",
  },
  {
    id: "lifestyle-middle",
    name: "Middle",
    costPerMonth: 5000,
    summary:
      "Round-the-clock utilities, responsive police, low odds of being mugged near home, and decent food. Safe and unremarkable - the baseline for most working people.",
    book: "Core p. 57",
  },
  {
    id: "lifestyle-high",
    name: "High",
    costPerMonth: 10000,
    summary:
      "Comfortable and well-appointed, with real security and neighbors who notice (and report) outsiders. A visible sign of having made it.",
    book: "Core p. 57",
  },
  {
    id: "lifestyle-luxury",
    name: "Luxury",
    costPerMonth: 100000,
    summary:
      "The top tier - real meat, staffed hotels, and every want met. Spends more per month than a Street or Squatter lifestyle costs in years.",
    book: "Core p. 57",
  },
];
