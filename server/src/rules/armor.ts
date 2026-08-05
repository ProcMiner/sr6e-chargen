// Gear catalog, Armor chunk - second in the Companion PACKs-aligned sequence
// (see gear.ts's header for the full rationale and chunk ordering).
//
// Transcribed from SR6_Core_RuleBook_noimg.pdf, book pp. 265-267 (PDF pp.
// 266-268): the "Clothing and Armor" chapter's Clothes, Armor, Armor
// Modifications, and Helmets & Shields tables. Corrected range from the
// README's original "265-278ish" estimate: pp. 268-278 is actually
// Electronics/ID & Credit/Tools, not Armor - confirmed by reading the pages
// directly rather than trusting the earlier TOC-based guess (same kind of
// correction the Weapons chunk needed for its own page range).
//
// Stat-block numbers are transcribed as printed since they're game rules;
// flavor text is paraphrased in our own words, same convention as
// qualities.ts and gear.ts.
//
// Known gaps in this pass:
// - "Clothing" (book p. 265) is priced as a 10¥-10,000¥ range depending on
//   style, not a flat cost - catalogued at its 10¥ baseline ("flats") with
//   the full range noted in the summary, same treatment as the Weapons
//   chunk's rating-priced Bow entry.
// - Chemical/Cold/Fire/Electricity Resistance armor mods (book p. 266) give
//   a Capacity-cost-per-Rating formula but no printed rating cap of their
//   own - they're limited in practice by the wearer's specific armor
//   Capacity stat, not a fixed maximum. `levels: {min:1, max:6}` below is a
//   practical UI bound (matching the 1-6 convention used elsewhere in this
//   chapter for Headjammers/Jammers/White Noise Generators), not a
//   transcribed rule.
// - Ballistic Shield and Riot Shield are armor (Defense Rating + Capacity)
//   that are also Close Combat weapons per their own small stat line in the
//   book - both stats are captured in one entry's `stats` bag rather than
//   duplicating them into the Weapons catalog too, since they're sold and
//   priced once as a single item.

import type { GearCatalogEntry } from "./gear.js";

export const armorGear: GearCatalogEntry[] = [
  // --- Clothes (book p. 265) ---
  {
    id: "clothing",
    name: "Clothing",
    category: "armor",
    subcategory: "Clothes",
    cost: 10,
    availability: "1",
    summary: "Everyday clothing, no armor value. Priced 10¥-10,000¥ depending on style; the value here is the cheap \"flats\" baseline.",
  },
  {
    id: "electrochromic-feature",
    name: "Electrochromic Feature",
    category: "armor",
    subcategory: "Clothes",
    cost: 75,
    availability: "1",
    summary: "Threads that change color with voltage; can display images, text, or video from a commlink when wireless.",
  },
  {
    id: "feedback-feature",
    name: "Feedback Feature",
    category: "armor",
    subcategory: "Clothes",
    cost: 150,
    availability: "2",
    summary: "Haptic clothing that adds a tactile component to augmented reality.",
  },

  // --- Armor (book p. 266) ---
  {
    id: "synthleather-jacket",
    name: "Synthleather Jacket",
    category: "armor",
    subcategory: "Armor",
    cost: 300,
    availability: "1",
    summary: "The street-standard waist-length to duster-length jacket; never goes out of style, offers a modicum of protection.",
    stats: { defenseRating: "+1", capacity: "3" },
  },
  {
    id: "actioneer-business-clothes",
    name: "Actioneer Business Clothes",
    category: "armor",
    subcategory: "Armor",
    cost: 1500,
    availability: "2",
    summary: "The fancy armored suit favored by Mr. Johnsons, faces, and fixers; features a concealable holster in the jacket.",
    stats: { defenseRating: "+2", capacity: "6" },
  },
  {
    id: "armor-clothing",
    name: "Armor Clothing",
    category: "armor",
    subcategory: "Armor",
    cost: 500,
    availability: "2",
    summary: "Lightweight ballistic weave, nearly undetectable as armor. Less protective than real armor, but comes in any style.",
    stats: { defenseRating: "+2", capacity: "4" },
  },
  {
    id: "armor-jacket",
    name: "Armor Jacket",
    category: "armor",
    subcategory: "Armor",
    cost: 1000,
    availability: "2",
    summary: "Good protection without drawing much attention, in all manner of styles - though not to a social event or government building.",
    stats: { defenseRating: "+4", capacity: "8" },
  },
  {
    id: "armor-vest",
    name: "Armor Vest",
    category: "armor",
    subcategory: "Armor",
    cost: 750,
    availability: "2",
    summary: "A flexible-wrap vest worn under regular clothing without displaying any bulk.",
    stats: { defenseRating: "+3", capacity: "6" },
  },
  {
    id: "chameleon-suit",
    name: "Chameleon Suit",
    category: "armor",
    subcategory: "Armor",
    cost: 2000,
    availability: "4(I)",
    summary: "A ruthenium-polymer suit with a sensor suite that scans and replicates surroundings; bonus Edge on Stealth tests to hide while active.",
    stats: { defenseRating: "+2", capacity: "4" },
  },
  {
    id: "full-body-armor",
    name: "Full Body Armor",
    category: "armor",
    subcategory: "Armor",
    cost: 2000,
    availability: "4(L)",
    summary: "Military/security heavy-duty armor with tactical holsters, pouches, and webbing; very attention-drawing. Modifiable for hot/cold environments or full chemical sealing.",
    stats: { defenseRating: "+5", capacity: "10" },
  },
  {
    id: "full-body-armor-helmet",
    name: "Full Body Armor Helmet",
    category: "armor",
    subcategory: "Armor",
    cost: 500,
    availability: "4(L)",
    summary: "The matching helmet option for Full Body Armor, with room for vision/audio enhancements.",
    stats: { defenseRating: "+2", capacity: "6" },
  },
  {
    id: "lined-coat",
    name: "Lined Coat",
    category: "armor",
    subcategory: "Armor",
    cost: 900,
    availability: "2",
    summary: "A cowboy-style duster, popular for fifty years running; bonus Edge against tests to spot items hidden underneath.",
    stats: { defenseRating: "+3", capacity: "7" },
  },
  {
    id: "urban-explorer-jumpsuit",
    name: "Urban Explorer Jumpsuit",
    category: "armor",
    subcategory: "Armor",
    cost: 800,
    availability: "2",
    summary: "The armored version of \"flats\" for couriers, athletes, and freerunners, in a stupid array of styles; includes a built-in music player and biomonitor.",
    stats: { defenseRating: "+3", capacity: "6" },
  },

  // --- Armor Modifications (book p. 266) ---
  {
    id: "armor-mod-chemical-protection",
    name: "Chemical Protection",
    category: "armor",
    subcategory: "Armor Modifications",
    cost: 250,
    availability: "3",
    summary: "Protects against Contact-vector chemical attacks; neutralizes the Corrosive status a number of times equal to its Rating, then wears away. Capacity cost limited by the specific armor's Capacity, not a fixed rating cap.",
    levels: { min: 1, max: 6 },
  },
  {
    id: "armor-mod-chemical-seal",
    name: "Chemical Seal",
    category: "armor",
    subcategory: "Armor Modifications",
    cost: 3000,
    availability: "5",
    summary: "Full Body Armor only: an airtight environmental control (Major Action to activate) blocking Contact/Inhalation chemical statuses for up to an hour of air supply; also neutralizes Corrosive six times before wearing away. Capacity cost 6.",
  },
  {
    id: "armor-mod-cold-resistance",
    name: "Cold Resistance",
    category: "armor",
    subcategory: "Armor Modifications",
    cost: 250,
    availability: "3",
    summary: "Cancels the Chilled status a number of times equal to its Rating, then wears away. Capacity cost limited by the specific armor's Capacity, not a fixed rating cap.",
    levels: { min: 1, max: 6 },
  },
  {
    id: "armor-mod-fire-resistance",
    name: "Fire Resistance",
    category: "armor",
    subcategory: "Armor Modifications",
    cost: 250,
    availability: "3",
    summary: "Cancels the Burning status a number of times equal to its Rating, then wears away. Capacity cost limited by the specific armor's Capacity, not a fixed rating cap.",
    levels: { min: 1, max: 6 },
  },
  {
    id: "armor-mod-electricity-resistance",
    name: "Electricity Resistance",
    category: "armor",
    subcategory: "Armor Modifications",
    cost: 250,
    availability: "3",
    summary: "Cancels the Zapped status a number of times equal to its Rating, then wears away. Capacity cost limited by the specific armor's Capacity, not a fixed rating cap.",
    levels: { min: 1, max: 6 },
  },

  // --- Helmets & Shields (book p. 267) ---
  {
    id: "helmet",
    name: "Helmet",
    category: "armor",
    subcategory: "Helmets & Shields",
    cost: 200,
    availability: "4",
    summary: "Protects your noggin from trauma; Capacity usable for accessories like trode nets and vision enhancements.",
    stats: { defenseRating: "+1", capacity: "4" },
  },
  {
    id: "ballistic-shield",
    name: "Ballistic Shield",
    category: "armor",
    subcategory: "Helmets & Shields",
    cost: 900,
    availability: "1",
    summary: "The black shield used by SWAT teams and in urban combat, with a clear plasteel window and a ladder frame for climbing short obstacles. Also usable as a Close Combat weapon.",
    stats: { defenseRating: "+2", capacity: "2", meleeDamage: "2S", meleeAttackRatings: "4/—/—/—/—" },
  },
  {
    id: "riot-shield",
    name: "Riot Shield",
    category: "armor",
    subcategory: "Helmets & Shields",
    cost: 1200,
    availability: "4",
    summary: "The clear plasteel cousin of the Ballistic Shield, with a built-in electricity attack (Close Combat, Stun Baton characteristics, 10 charges, recharges plugged in).",
    stats: { defenseRating: "+2", capacity: "2", meleeDamage: "4S(e)", meleeAttackRatings: "4/—/—/—/—" },
  },
];
