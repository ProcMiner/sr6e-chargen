// Gear catalog, Vehicle upgrades chunk - ninth in the Companion
// PACKs-aligned sequence (see gear.ts's header for the full rationale and
// chunk ordering). Done out of order relative to chunk 8 (Drones) at the
// user's request, to close out vehicle-adjacent content together.
//
// Transcribed from SR6_Core_RuleBook_noimg.pdf, book p. 295: the "Vehicle
// Modifications" table that opens the "Vehicles and Drones" section, right
// before the Bikes/Cars/etc. stat tables in vehicles.ts. Deliberately held
// back from that chunk's header note for exactly this chunk.
//
// This is a genuinely small table - only four entries - which is everything
// the core rulebook itself prints under "Vehicle Modifications." The
// roadmap's chunk description cites "Companion's Vehicle Upgrade PACKs,"
// but the Sixth World Companion's fuller vehicle-modification catalog (if
// any beyond what it reuses from the core book) hasn't been checked - same
// class of gap as qualities.ts's sourcebook-by-sourcebook expansion, not
// attempted here since this app's gear catalogs are core-rulebook-first.
//
// Stat-block numbers are transcribed as printed; flavor text is paraphrased
// in our own words, same convention as every prior chunk.
//
// Known gaps in this pass, flagged rather than guessed at:
// - Manual Operation is printed as a "+1 Avail / +500¥" modifier on an
//   already-purchased weapon mount, not a standalone item - catalogued here
//   as its own flat purchase (500¥, Avail 1) since the app has no mechanism
//   for one GearLine modifying another's price/availability. The summary
//   notes what it actually does; enforcing "must already own a weapon
//   mount" is left to the player/GM, same as how gear.ts's ammo-type
//   multipliers were left informational-only.
// - Weapon mount capacity (Body / 3 mounts per vehicle, Heavy mounts
//   counting as two) isn't validated anywhere - this app doesn't model
//   per-vehicle gear attachment, only a flat purchased-items list.

import type { GearCatalogEntry } from "./gear.js";

export const vehicleUpgradesGear: GearCatalogEntry[] = [
  {
    id: "vehicle-upgrade-rigger-interface",
    name: "Rigger Interface",
    category: "vehicle",
    subcategory: "Vehicle Modifications",
    cost: 1000,
    availability: "2",
    summary:
      "Lets a rigger jump into the vehicle and feel it as their own body (hands/feet as wheels or rotors, sight/hearing as sensors) instead of just remote-driving from the captain's chair. Vehicles need this installed unless noted; all drones come with one standard.",
  },
  {
    id: "vehicle-upgrade-standard-weapon-mount",
    name: "Standard Weapon Mount",
    category: "vehicle",
    subcategory: "Vehicle Modifications",
    cost: 2500,
    availability: "4I",
    summary:
      "Holds any Assault Rifle or smaller weapon plus 250 rounds of ammo. Operated remotely with a 90-degree arc of fire (horizontal and vertical). A vehicle may carry mounts up to its unaugmented Body / 3.",
  },
  {
    id: "vehicle-upgrade-heavy-weapon-mount",
    name: "Heavy Weapon Mount",
    category: "vehicle",
    subcategory: "Vehicle Modifications",
    cost: 5000,
    availability: "5I",
    summary:
      "Holds any weapon plus 500 rounds of belted ammo or up to (Body) rockets/missiles. Counts as two weapon mounts against the vehicle's Body / 3 capacity. Operated remotely with a 90-degree arc of fire.",
  },
  {
    id: "vehicle-upgrade-manual-operation",
    name: "Manual Operation",
    category: "vehicle",
    subcategory: "Vehicle Modifications",
    cost: 500,
    availability: "1",
    summary:
      "Adds manual control to an already-installed weapon mount (vehicles only, not drones) - a flat add-on to that mount's own cost/Availability, not a standalone weapon mount by itself.",
  },
];
