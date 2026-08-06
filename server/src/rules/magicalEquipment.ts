// Gear catalog, Magical Equipment chunk - sixth in the Companion
// PACKs-aligned sequence (see gear.ts's header for the full rationale and
// chunk ordering).
//
// Transcribed from SR6_Core_RuleBook_noimg.pdf, book pp. 294-295: Foci,
// Formulas, Magical Lodge Materials, Reagents. A small chunk - the section
// ends right before "Vehicles and Drones" starts on p. 295.
//
// Stat-block numbers are transcribed as printed; flavor text is paraphrased
// in our own words, same convention as qualities.ts/gear.ts/armor.ts/
// generalGear.ts/electronics.ts/augmentations.ts.
//
// Every focus also has a Karma bonding cost (Force x N, printed in the
// book's foci table) on top of its nuyen price. This is the first catalog
// chunk to need a Karma cost on a gear item, so `GearCatalogEntry` gained a
// `bondingKarma` field (server gear.ts + client rules.ts) alongside
// `essenceCost`, following the exact same "flat, or per-level if `levels`
// is set" convention as `cost`. `data.karma` (the character's Karma pool,
// set by QualityPicker.tsx to starting Karma + net quality Karma) is
// untouched by this - `karmaRemaining` in deriveGear.ts derives the pool
// minus gear-based bonding costs, mirroring `nuyenRemaining` exactly, so
// QualityPicker needed zero changes.
//
// Known gaps in this pass, flagged rather than guessed at:
// - No maximum Force is printed anywhere in this section for foci or
//   Magical Lodge Materials. Capped here at `levels: { max: 6 }`, the same
//   inferred-ceiling convention used for Augmentations' Cyberlimb Armor and
//   Hydraulic Jacks (which also had no printed cap) - raise manually via a
//   custom item if your table allows Force above 6.
// - The book prints a single generic "Focus formula = Focus cost x 0.25"
//   line rather than a per-focus-type row. Expanded here into one formula
//   entry per focus type (computed from that focus's own Force-scaled
//   cost), since a single generic entry can't price itself against another
//   catalog entry's cost.
// - Spell formulas are catalogued by category (Combat/Detection/Health/
//   Illusion/Manipulation) at the book's flat per-category price, not by
//   individual named spell - there's no spells catalog in this app yet (see
//   README's "Spells catalog" deferred item). Per the book, each formula
//   purchase represents learning ONE spell in that category; buy multiple
//   (via qty, or as separate custom-named lines) for multiple spells.

import type { GearCatalogEntry } from "./gear.js";

export const magicalEquipmentGear: GearCatalogEntry[] = [
  // --- Foci (book p. 294) ---
  {
    id: "focus-enchanting",
    name: "Enchanting Focus",
    category: "magic",
    subcategory: "Foci",
    cost: 5000,
    availability: "(Force)L",
    levels: { min: 1, max: 6 },
    bondingKarma: 3,
    summary: "Used for bolstering alchemy and focus creation.",
  },
  {
    id: "focus-metamagic",
    name: "Metamagic Focus",
    category: "magic",
    subcategory: "Foci",
    cost: 9000,
    availability: "(Force)L",
    levels: { min: 1, max: 6 },
    bondingKarma: 3,
    summary: "Boosts a metamagical ability; a separate focus is needed per ability.",
  },
  {
    id: "focus-power",
    name: "Power Focus",
    category: "magic",
    subcategory: "Foci",
    cost: 18000,
    availability: "(Force+3)L",
    levels: { min: 1, max: 6 },
    bondingKarma: 6,
    summary: "A rip between the astral and physical worlds, letting the caster channel greater mana and boost magic potential.",
  },
  {
    id: "focus-qi",
    name: "Qi Focus",
    category: "magic",
    subcategory: "Foci",
    cost: 3000,
    availability: "(Force)L",
    levels: { min: 1, max: 6 },
    bondingKarma: 2,
    summary: "Often a tattoo; boosts adept powers.",
  },
  {
    id: "focus-spell",
    name: "Spell Focus",
    category: "magic",
    subcategory: "Foci",
    cost: 4000,
    availability: "(Force)L",
    levels: { min: 1, max: 6 },
    bondingKarma: 2,
    summary:
      "Choose a spell category (Combat, Detection, Health, Illusion, or Manipulation) or function (counterspelling, spellcasting, ritual spellcasting, sustaining) at purchase - use the notes field. A separate focus is needed per category/function.",
  },
  {
    id: "focus-spirit",
    name: "Spirit Focus",
    category: "magic",
    subcategory: "Foci",
    cost: 4000,
    availability: "(Force)L",
    levels: { min: 1, max: 6 },
    bondingKarma: 2,
    summary:
      "Boosts power when dealing with spirits; choose a spirit type (Air, Fire, Kin, etc.) at purchase - use the notes field. A separate focus is needed per type.",
  },
  {
    id: "focus-weapon",
    name: "Weapon Focus",
    category: "magic",
    subcategory: "Foci",
    cost: 7000,
    availability: "(Force+3)L",
    levels: { min: 1, max: 6 },
    bondingKarma: 3,
    summary:
      "An enchanted weapon so in tune with its owner it boosts combat ability and bypasses some astral protections; treated as a magical weapon.",
  },

  // --- Formulas (book p. 294-295) ---
  {
    id: "formula-enchanting-focus",
    name: "Enchanting Focus Formula",
    category: "magic",
    subcategory: "Formulae",
    cost: 1250,
    availability: "(Force)L",
    levels: { min: 1, max: 6 },
    summary: "Needed to create an Enchanting Focus at the matching Force. Priced at the focus's own cost x0.25.",
  },
  {
    id: "formula-metamagic-focus",
    name: "Metamagic Focus Formula",
    category: "magic",
    subcategory: "Formulae",
    cost: 2250,
    availability: "(Force)L",
    levels: { min: 1, max: 6 },
    summary: "Needed to create a Metamagic Focus at the matching Force. Priced at the focus's own cost x0.25.",
  },
  {
    id: "formula-power-focus",
    name: "Power Focus Formula",
    category: "magic",
    subcategory: "Formulae",
    cost: 4500,
    availability: "(Force+3)L",
    levels: { min: 1, max: 6 },
    summary: "Needed to create a Power Focus at the matching Force. Priced at the focus's own cost x0.25.",
  },
  {
    id: "formula-qi-focus",
    name: "Qi Focus Formula",
    category: "magic",
    subcategory: "Formulae",
    cost: 750,
    availability: "(Force)L",
    levels: { min: 1, max: 6 },
    summary: "Needed to create a Qi Focus at the matching Force. Priced at the focus's own cost x0.25.",
  },
  {
    id: "formula-spell-focus",
    name: "Spell Focus Formula",
    category: "magic",
    subcategory: "Formulae",
    cost: 1000,
    availability: "(Force)L",
    levels: { min: 1, max: 6 },
    summary: "Needed to create a Spell Focus at the matching Force. Priced at the focus's own cost x0.25.",
  },
  {
    id: "formula-spirit-focus",
    name: "Spirit Focus Formula",
    category: "magic",
    subcategory: "Formulae",
    cost: 1000,
    availability: "(Force)L",
    levels: { min: 1, max: 6 },
    summary: "Needed to create a Spirit Focus at the matching Force. Priced at the focus's own cost x0.25.",
  },
  {
    id: "formula-weapon-focus",
    name: "Weapon Focus Formula",
    category: "magic",
    subcategory: "Formulae",
    cost: 1750,
    availability: "(Force+3)L",
    levels: { min: 1, max: 6 },
    summary: "Needed to create a Weapon Focus at the matching Force. Priced at the focus's own cost x0.25.",
  },
  {
    id: "formula-spell-combat",
    name: "Combat Spell Formula",
    category: "magic",
    subcategory: "Formulae",
    cost: 2000,
    availability: "3L",
    summary: "Needed to learn one Combat spell. Every individual spell has its own formula - buy separately for each spell learned.",
  },
  {
    id: "formula-spell-detection",
    name: "Detection Spell Formula",
    category: "magic",
    subcategory: "Formulae",
    cost: 500,
    availability: "2L",
    summary: "Needed to learn one Detection spell. Every individual spell has its own formula - buy separately for each spell learned.",
  },
  {
    id: "formula-spell-health",
    name: "Health Spell Formula",
    category: "magic",
    subcategory: "Formulae",
    cost: 500,
    availability: "2L",
    summary: "Needed to learn one Health spell. Every individual spell has its own formula - buy separately for each spell learned.",
  },
  {
    id: "formula-spell-illusion",
    name: "Illusion Spell Formula",
    category: "magic",
    subcategory: "Formulae",
    cost: 1000,
    availability: "3L",
    summary: "Needed to learn one Illusion spell. Every individual spell has its own formula - buy separately for each spell learned.",
  },
  {
    id: "formula-spell-manipulation",
    name: "Manipulation Spell Formula",
    category: "magic",
    subcategory: "Formulae",
    cost: 1500,
    availability: "3L",
    summary: "Needed to learn one Manipulation spell. Every individual spell has its own formula - buy separately for each spell learned.",
  },

  // --- Magical Supplies (book p. 295) ---
  {
    id: "magical-lodge-materials",
    name: "Magical Lodge Materials",
    category: "magic",
    subcategory: "Magical Supplies",
    cost: 500,
    availability: "(Force)L",
    levels: { min: 1, max: 6 },
    summary:
      "Sold with a bag holding all components for a shaman's lodge or hermetic's circle. Some parts are reusable - breaking one down properly takes hours equal to its rating, and replacing only the missing components halves the rebuild cost.",
  },
  {
    id: "reagents",
    name: "Reagents (per dram)",
    category: "magic",
    subcategory: "Magical Supplies",
    cost: 50,
    availability: "2",
    summary: "Powders that mitigate some of the difficulty of using magic in the Sixth World. Lose potency after use.",
  },
];
