// Critter/Spirit Powers glossary - core rulebook "Wild Life" chapter,
// "Powers" section, book pp. 221-229 (SR6_Core_RuleBook_noimg.pdf), plus
// Street Wyrd's "A Congress of Spirits" chapter, "Spirit Powers" section,
// pp. 66-71 (Street_Wyrd__Magic_Sourebook__noimg.pdf). Every spirit type in
// spirits.ts references these by name for its fixed and optional powers;
// this file is what actually explains what each one does, transcribed
// directly from the book (paraphrased into our own words for flavor,
// mechanics/numbers transcribed as printed).
//
// Only the entries actually used by a spirit type in spirits.ts are
// included here - the full glossaries also cover non-spirit critter powers
// (Armor, Dual Natured, Mist Form, Petrification, etc.) and powers Street
// Wyrd tags "(Free)"/"(Great)" (only available to free spirits or Great
// Form spirits - Astral Gateway, Astral Projection, Aura Masking,
// Endowment, Energy Drain, Hidden Life, Mutable Form, Personal Domain,
// Quake, Regeneration, Storm, Temporal Displacement, Vessel Trading,
// Wealth, etc.), neither referenced by any spirit type this app's catalog
// currently supports - left out rather than padded in for completeness.
// One exception: Divining is tagged "(Free, Great)" in Street Wyrd's own
// glossary header, yet Guidance Spirits' printed stat block lists it as a
// plain fixed power anyway - transcribed as printed, not "corrected".
//
// Type/Action/Range/Duration follow the book's own legend (p. 221):
// Type M (mana - no effect on nonliving targets) or P (physical - unusable
// in astral space or against astral forms); Action is Minor/Major/Auto
// (Auto = always on, no action needed) or, for a couple of Street Wyrd
// powers, "Special" (the power's own text spells out what's needed); Range
// is LOS/Touch/Self; Duration is Instant/Sustained/Always/Special.

export interface SpiritPowerEntry {
  id: string;
  name: string;
  type: "M" | "P";
  action: "Minor" | "Major" | "Auto" | "Special";
  range: "LOS" | "Touch" | "Self" | "Special" | "Varies" | "As spell";
  duration: "Instant" | "Sustained" | "Always" | "Special";
  /** Mechanical effect text, paraphrased from the book with numbers transcribed as printed. "F"/"Force" refers to the spirit's Force. */
  summary: string;
}

export const spiritPowers: SpiritPowerEntry[] = [
  {
    id: "power-accident",
    name: "Accident",
    type: "P",
    action: "Major",
    range: "LOS",
    duration: "Instant",
    summary:
      "Causes a seemingly normal accident (GM's call on the exact nature). Opposed test: spirit's Magic + Willpower vs. target's Reaction + Charisma. A win treats the target as if they'd glitched; 4+ net hits makes it a critical glitch.",
  },
  {
    id: "power-animal-control",
    name: "Animal Control",
    type: "M",
    action: "Major",
    range: "LOS",
    duration: "Sustained",
    summary:
      "Manipulates other (usually mundane) animals into normal-for-them behavior. New commands need line of sight; targets keep following prior commands for the spirit's Charisma in minutes after. Controls small animals up to Charisma x5, larger animals up to Charisma, or one paranormal critter. Can't be used on a target with Sapience.",
  },
  {
    id: "power-astral-form",
    name: "Astral Form",
    type: "M",
    action: "Auto",
    range: "Self",
    duration: "Always",
    summary:
      "The spirit exists only on the astral plane until it uses Materialization - only astral attacks or mana spells/powers affect it, and it can only affect dual-natured beings or those astrally perceiving/projecting.",
  },
  {
    id: "power-binding",
    name: "Binding",
    type: "P",
    action: "Major",
    range: "Varies",
    duration: "Instant",
    summary:
      "Sticks a target to a surface (webbing, goo, etc.). At LOS range: Magic + Agility vs. Athletics + Reaction, hit applies Immobilized. At Touch range: Magic + Agility vs. Close Combat + Reaction, hit sticks the target to the spirit itself (still Immobilized). Escaping needs a Major Action, Strength + Body vs. the spirit's Magic + Willpower.",
  },
  {
    id: "power-concealment",
    name: "Concealment",
    type: "P",
    action: "Major",
    range: "LOS",
    duration: "Sustained",
    summary:
      "Mystically hides people/things, applying Invisible (Improved) equal to the spirit's Magic. Overcoming it needs an Observe in Detail Major Action + Perception test. Covers a number of average-sized targets up to the spirit's Magic (Body over 5 counts double), or much smaller targets up to Magic x5.",
  },
  {
    id: "power-confusion",
    name: "Confusion",
    type: "M",
    action: "Major",
    range: "LOS",
    duration: "Sustained",
    summary:
      "Makes the target indecisive and befuddled. Opposed test: spirit's Magic + Willpower vs. target's Willpower + Logic. Any net hits apply Dazed and Confused (rating = net hits).",
  },
  {
    id: "power-elemental-attack",
    name: "Elemental Attack",
    type: "P",
    action: "Major",
    range: "LOS",
    duration: "Instant",
    summary:
      "Ranged elemental damage bolt (element fixed per power, e.g. Fire/Cold/Electricity/Chemical). Attack roll is Magic + Agility. DV (Magic)P, Attack Ratings Near (Magic x2)/Close (Magic x2)-2/Medium (Magic x2)-8/Far (Magic x2)-10. Target also gains the matching status: Zapped (Electricity), Burning (Fire), Corroded (Chemical), Chilled (Cold).",
  },
  {
    id: "power-energy-aura",
    name: "Energy Aura",
    type: "P",
    action: "Auto",
    range: "Self",
    duration: "Always",
    summary:
      "A damaging energy field (element fixed per power) surrounds the spirit, adding (Magic/2, rounded up) to the DV of its Close Combat attacks and +Magic to their Attack Rating, plus the matching status effect. Unarmed attackers striking the spirit take damage back.",
  },
  {
    id: "power-engulf",
    name: "Engulf",
    type: "P",
    action: "Major",
    range: "Touch",
    duration: "Sustained",
    summary:
      "Envelops a target, smothering it. Close Combat attack, DV (Magic)P plus +Magic to Attack Rating; engulfed target gets Immobilized and takes automatic damage each of the spirit's turns until it escapes (Major Action, Strength + Athletics vs. spirit's Magic + Body). Elemental variants add secondary effects: Air/Water Engulf resist Stun (DV Magic+2, Stun overflows to Physical if it knocks the target out, Fatigued I); Earth Engulf resists Physical (DV Magic+2, Fatigued I); Fire Engulf resists Physical and applies Burning for as long as engulfed +1 round; Water Engulf also applies Wet.",
  },
  {
    id: "power-enhanced-senses",
    name: "Enhanced Senses",
    type: "P",
    action: "Auto",
    range: "Self",
    duration: "Always",
    summary:
      "Grants specific improved/augmented senses beyond normal human range (e.g. low-light vision, thermographic vision, enhanced hearing/smell) - the exact senses are listed per spirit type.",
  },
  {
    id: "power-fear",
    name: "Fear",
    type: "M",
    action: "Major",
    range: "LOS",
    duration: "Special",
    summary:
      "Fills the target with overwhelming terror; they flee in panic until safely away, then gain Panicked and Frightened. Opposed test: spirit's Willpower + Magic vs. target's Willpower + Logic. Effect lasts 1 combat round per net hit, the status lasts double that. Even after fear fades, the target needs a Willpower + Logic test (threshold = spirit's Magic/2) to face the spirit again.",
  },
  {
    id: "power-guard",
    name: "Guard",
    type: "M",
    action: "Major",
    range: "LOS",
    duration: "Sustained",
    summary:
      "Protects a number of targets (up to the spirit's Magic) against the Accident power and dice-roll glitches: critical glitches downgrade to glitches, and glitches become plain failures (unless Accident is in play, in which case Guard cancels it outright).",
  },
  {
    id: "power-influence",
    name: "Influence",
    type: "M",
    action: "Major",
    range: "LOS",
    duration: "Instant",
    summary:
      "Plants a suggestion in the target's mind. Opposed test: spirit's Magic + Charisma vs. target's Willpower + Logic. On a win the target acts on the suggestion as if it were their own idea; if confronted with an obviously wrong suggestion, the target can resist with a Willpower (spirit's Magic) test, hits imposing a dice-pool penalty on the compelled action instead.",
  },
  {
    id: "power-innate-spell",
    name: "Innate Spell",
    type: "M",
    action: "Major",
    range: "As spell",
    duration: "Special",
    summary:
      "Lets the spirit cast one specific spell (chosen by the summoner at summoning, from the normal spell list - only one spell effect). Uses Sorcery if the spirit has it, otherwise Magic with no penalty; can be opposed with Counterspelling. Produces Drain as normal and a -2 penalty while sustained. Critters/spirits resist Drain with Willpower + Intuition or Charisma, whichever is higher.",
  },
  {
    id: "power-materialization",
    name: "Materialization",
    type: "M",
    action: "Major",
    range: "Self",
    duration: "Sustained",
    summary:
      "Lets an astral spirit take a temporary physical body (pulled from local resources, no exploitable loopholes) so it can interact with the physical world, gaining Immunity to Normal Weapons while materialized. Materializing takes a Major Action; dematerializing back to astral takes a Minor Action.",
  },
  {
    id: "power-movement",
    name: "Movement",
    type: "P",
    action: "Major",
    range: "LOS",
    duration: "Sustained",
    summary:
      "Speeds up or slows down a target's movement rate (characters, critters, or vehicles), multiplying it by up to the spirit's Magic. Against an unwilling target: Magic + Willpower vs. Logic + Willpower Opposed test; success applies Hobbled for a number of rounds equal to net hits. Against a vehicle: Magic + Willpower test with a threshold of half the vehicle's Body (round up, min 2); meeting it adjusts the vehicle's Acceleration/Speed.",
  },
  {
    id: "power-natural-weapon",
    name: "Natural Weapon",
    type: "P",
    action: "Auto",
    range: "Touch",
    duration: "Instant",
    summary:
      "A built-in means of inflicting Physical damage (claws, bite, etc. - specifics noted per spirit). Uses Close Combat for melee natural weapons or Exotic Weapons for ranged ones; counts as a normal weapon for Immunity to Normal Weapons purposes.",
  },
  {
    id: "power-noxious-breath",
    name: "Noxious Breath",
    type: "P",
    action: "Major",
    range: "Special",
    duration: "Instant",
    summary:
      "A nauseating stench treated as a Spray Ranged Attack using the spirit's Agility + Magic (Attack Rating Near Magic x2, Close Magic). Vector: Inhalation, Speed: Immediate, Power: Magic, Effect: Stun damage plus Dazed and Nauseated. Armor doesn't help, but an active chemical seal does.",
  },
  {
    id: "power-psychokinesis",
    name: "Psychokinesis",
    type: "P",
    action: "Minor",
    range: "LOS",
    duration: "Sustained",
    summary:
      "Telekinetically moves an object with an invisible \"hand\" whose Strength and Agility equal the hits scored on a Magic + Willpower test; moves 10 meters per Combat Round and can make Close Combat or Ranged attacks with the appropriate skill.",
  },
  {
    id: "power-sapience",
    name: "Sapience",
    type: "P",
    action: "Auto",
    range: "Self",
    duration: "Always",
    summary:
      "The spirit is self-aware and Untrained rather than fully unaware in skills it doesn't formally have (see p. 93), and can learn new skills.",
  },
  {
    id: "power-search",
    name: "Search",
    type: "P",
    action: "Major",
    range: "Special",
    duration: "Special",
    summary:
      "Finds a target the spirit has seen before (or, for spirits, one its summoner can describe with a mental image) via a Magic + Intuition (5, 10 minutes) Extended test, modified by the Search Modifiers table (distance +1 per km, behind a ward +ward Force x5, concealment power in use +concealer's Magic x3, inanimate/non-living target +5). Astral-capable spirits can search from astral space but must materialize to search for an inanimate physical target; living things with auras can be searched for astrally.",
  },
  {
    id: "power-venom",
    name: "Venom",
    type: "P",
    action: "Auto",
    range: "Touch",
    duration: "Instant",
    summary:
      "Secretes a toxin (Vector: Injection, Speed: 1 combat round, Power: Magic, Effect: Dazed, Poisoned (Magic)P) - some spirits/critters have variant vectors noted individually.",
  },
  {
    id: "power-weather-control",
    name: "Weather Control",
    type: "P",
    action: "Major",
    range: "LOS",
    duration: "Sustained",
    summary:
      "Manipulates local weather within reason (must be realistically possible for the environment), building up to full effect over a Magic + Willpower (10, 30 minutes) Extended Test. Summons/redirects existing conditions (e.g. can call up a thunderstorm) rather than creating precise effects (can't aim lightning bolts).",
  },

  // --- Street Wyrd, "A Congress of Spirits" (book pp. 66-71) ---
  {
    id: "power-divining",
    name: "Divining",
    type: "M",
    action: "Special",
    range: "Self",
    duration: "Special",
    summary: "Functions like the Divination metamagic (core rulebook p. 117), except the spirit uses Magic + Intuition.",
  },
  {
    id: "power-magical-guard",
    name: "Magical Guard",
    type: "M",
    action: "Special",
    range: "LOS",
    duration: "Instant",
    summary: "Lets the spirit use the Boosted Defense aspect of Counterspelling (core rulebook p. 143) to provide spell defense.",
  },
  {
    id: "power-shadow-cloak",
    name: "Shadow Cloak",
    type: "P",
    action: "Minor",
    range: "Special",
    duration: "Sustained",
    summary:
      "Envelops the spirit in darkness. In any lighting except broad daylight, grants a point of Edge in combat, stealth, or social situations; in low-light conditions, also grants the Invisible (Force/2) status.",
  },
  {
    id: "power-silence",
    name: "Silence",
    type: "P",
    action: "Major",
    range: "Special",
    duration: "Sustained",
    summary:
      "Surrounds the spirit in a sphere of silence with a radius equal to its Magic in meters - sounds from within are muffled, and sounds entering the area are harder to hear. Creates the Silent (Force/2) status.",
  },
  {
    id: "power-skill",
    name: "Skill",
    type: "P",
    action: "Auto",
    range: "Self",
    duration: "Always",
    summary:
      "Grants a specific active skill (plus, per the spirit's own entry, sometimes a Specialization and/or a matching Knowledge skill) at a rank equal to the spirit's Force - the exact skill choices are spelled out on the spirit type that carries this power (e.g. Task Spirits choose one of Biotech, Electronics, Engineering, Outdoors, or Piloting).",
  },
  {
    id: "power-skill-specialization",
    name: "Skill Specialization",
    type: "P",
    action: "Auto",
    range: "Self",
    duration: "Always",
    summary:
      "Grants a specialization in a skill the spirit already has - the allowed choices are spelled out on the spirit type that carries this power (e.g. Guardian Spirits may choose any Close Combat skill specialization).",
  },
];
