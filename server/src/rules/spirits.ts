// Spirit catalog - core rulebook "Conjuring" chapter, "Types of Spirits"
// section, book pp. 147-149 (SR6_Core_RuleBook_noimg.pdf). The six spirits
// printed there: Air, Beasts, Earth, Fire, Kin (Kindred Spirits), Water.
// Plus Street Wyrd's "A Congress of Spirits" chapter, "Spirit Catalog"
// section, book pp. 55-56 (Street_Wyrd__Magic_Sourebook__noimg.pdf): Plant,
// Guardian, Guidance, and Task Spirits. Powers referenced below are defined
// in spiritPowers.ts.
//
// Deliberately not covered here (Street Wyrd pp. 56-71) - each is a
// genuinely different kind of feature, not a catalog entry:
// - Free Spirits: almost entirely GM-facing narrative rules (learning a
//   true name via a metaplanar quest, opposed tests to bind/banish them,
//   Karma-feeding rituals) with no catalog stat block to summon from a
//   list - doesn't fit this file's "pick a type, choose Force" shape.
// - Ally Spirits: a genuine build-your-own-spirit system with its own
//   5-step Karma-cost formula (Force x 8 base, then Karma for extra
//   powers/skills/spells) - a new subsystem, not a catalog addition.
// - Bound Tasks / Task Points: an expanded binding mechanic (spend Task
//   Points on Alternate Control, Autonomy, Edge Access, etc.) that would
//   apply to every spirit type, old and new alike - a separate enhancement
//   to the bind/track UI, not part of the catalog itself.
// - Great Form Spirits: one paragraph pointing at the Invocation
//   metamagic, which isn't implemented (metamagics are an existing,
//   separately-tracked gap - see initiation_submersion memory).
// All confirmed candidates for a future pass, not overlooked.
//
// "Spirits' stats are based on their Force... A spirit's attribute cannot
// be lower than one, even if the adjustment listed would make it so. Any
// skills they have are at a rank equal to their Force." (p. 147) - so
// `attributeMods` below are printed as F+/-N, resolved at a chosen Force by
// deriveSpirits.ts (floor of 1 applied there, not baked in here).
//
// Condition Monitor is printed identically for the core six as "(F/2)+8" -
// not stored per-entry since it's a shared default formula, computed in
// deriveSpirits.ts. A few Street Wyrd types print a different CM formula
// entirely (see ConditionMonitorOverride below) - Guidance Spirits happen
// to match the shared default, so it needs no override. Astral Initiative
// is likewise identical across every type so far ("(F x 2) + 3D6") but is
// still stored per-entry for literal-transcription clarity rather than
// assumed.
//
// "AC: A#, I#" (the book's per-type action-count shorthand) is kept as
// literal reference text rather than mechanically interpreted, same
// treatment as critters.ts's identical "AC: A1, I2"-style strings - it's
// display-only reference, not used in any calculation here.
//
// "Each spirit receives an optional power for every 3 full points of Force
// (so Force 1-2 spirits have no optional powers, Force 3-5 have one, Force
// 6-8 have two, and so on). The summoner selects the optional powers at the
// time of summoning, and they cannot be changed once the spirit is
// summoned." (p. 147) - see deriveSpirits.ts's optionalPowerCount.
//
// Known gaps, flagged rather than guessed at:
// - Movement ("Walk/Run/modifier") is printed as flat numbers per type, not
//   a Force-scaled formula - transcribed literally, not derived.
// - Attack damage-formula strings (e.g. "Elemental Attack [DV (F)P, Attack
//   Ratings (F x 2)/(F x 2)-2/...]") keep "F" as a literal placeholder,
//   substituted with the chosen Force at display time by deriveSpirits.ts,
//   rather than modeling combat mechanics this app doesn't simulate
//   anywhere else (no dice-rolling engine exists in this app - see
//   LivePlay's damage/Edge tracking, which is always player-reported, not
//   rolled).

export interface SpiritAttributeMods {
  body: number;
  agility: number;
  reaction: number;
  strength: number;
  willpower: number;
  logic: number;
  intuition: number;
  charisma: number;
}

/**
 * A reference to a spiritPowers.ts entry, plus whatever sub-choice or
 * restriction the book prints alongside it for this spirit type (e.g. "Air"
 * for Engulf, "hearing, low-light vision, smell" for Enhanced Senses, "Cold
 * or Electricity" for an optional Elemental Attack). `powerId` always
 * matches a spiritPowers.ts id exactly - never mix the sub-choice into the
 * id itself, or lookups against the glossary silently fail.
 */
export interface SpiritPowerRef {
  powerId: string;
  note?: string;
}

/**
 * Overrides the default Condition Monitor formula, "(Force/2, rounded up) +
 * 8" - present only for the handful of Street Wyrd spirit types whose
 * printed CM doesn't fit that shape (e.g. Plant Spirits' "(Body/2, rounded
 * up) + 8", Guardian Spirits' "([Force+1]/2, rounded up) + 8", Task
 * Spirits' unusually generous "(Force x 2) + 8"). `base` is the resolved
 * attribute the formula operates on; `preOffset` is added to it first;
 * `operation` is "half" (ceil, matching the core six's rounding) or
 * "double". Transcribed as printed, not "corrected" to match the core
 * six's shared formula - see deriveSpirits.ts's spiritConditionMonitor().
 */
export interface ConditionMonitorOverride {
  base: "force" | keyof SpiritAttributeMods;
  preOffset?: number;
  operation: "half" | "double";
  offset: number;
}

export interface SpiritCatalogEntry {
  id: string;
  name: string;
  book: string;
  summary: string;
  attributeMods: SpiritAttributeMods;
  /** Defense Rating = (Force x defenseRatingMultiplier) + defenseRatingMod. */
  defenseRatingMod: number;
  /** Defaults to 1 (a flat Force+mod formula, true of every core-rulebook spirit) - only set above 1 for the rare Street Wyrd type that doesn't fit that shape (Guardian Spirits' "(F x 2) + 1", p. 55). */
  defenseRatingMultiplier?: number;
  conditionMonitorOverride?: ConditionMonitorOverride;
  /** Initiative formula with "F" as a literal Force placeholder, e.g. "[(F x 2) + 4] + 2D6". */
  initiative: string;
  astralInitiative: string;
  /** The book's "AC: A#, I#" shorthand, kept as literal reference text. */
  actionsNote: string;
  /** "Walk/Run/modifier" as printed - not Force-scaled. */
  movement: string;
  /** Skill names; each is at a rank equal to the spirit's Force. */
  skills: string[];
  /** Powers the spirit always has. */
  fixedPowers: SpiritPowerRef[];
  /** Powers the summoner picks from - count = floor(Force / 3), fixed once chosen. */
  optionalPowers: SpiritPowerRef[];
  weaknesses: string[];
  /** Attack formula strings with "F" as a literal Force placeholder. */
  attacks: string[];
}

const CORE = "Core Rulebook";
const STREET_WYRD = "Street Wyrd";

export const spirits: SpiritCatalogEntry[] = [
  {
    id: "spirit-air",
    name: "Spirit of Air",
    book: CORE,
    summary: "A fast, elusive elemental spirit of wind and weather.",
    attributeMods: { body: -2, agility: 3, reaction: 4, strength: -3, willpower: 0, logic: 0, intuition: 0, charisma: 0 },
    defenseRatingMod: -2,
    initiative: "[(F x 2) + 4] + 2D6",
    astralInitiative: "(F x 2) + 3D6",
    actionsNote: "A1, I3",
    movement: "5/10/+5",
    skills: ["Astral", "Athletics", "Close Combat", "Exotic Ranged Weapon", "Perception"],
    fixedPowers: [
      { powerId: "power-accident" },
      { powerId: "power-astral-form" },
      { powerId: "power-concealment" },
      { powerId: "power-confusion" },
      { powerId: "power-engulf", note: "Air" },
      { powerId: "power-materialization" },
      { powerId: "power-movement" },
      { powerId: "power-sapience" },
      { powerId: "power-search" },
    ],
    optionalPowers: [
      { powerId: "power-elemental-attack", note: "Cold or Electricity" },
      { powerId: "power-energy-aura", note: "Cold or Electricity" },
      { powerId: "power-fear" },
      { powerId: "power-guard" },
      { powerId: "power-noxious-breath" },
      { powerId: "power-psychokinesis" },
    ],
    weaknesses: ["Allergy (Inhalation vector toxins, Severe)"],
    attacks: [
      "Elemental Attack [DV (F)P, Attack Ratings (F x 2)/(F x 2)-2/(F x 2)-8/(F x 2)-10/-]",
      "Engulf [DV (F+2)S + Fatigue I, Attack Ratings (F x 2)+1/-/-/-/-]",
    ],
  },
  {
    id: "spirit-beasts",
    name: "Spirit of Beasts",
    book: CORE,
    summary: "An animalistic spirit resembling a beast - claws, teeth, and instinct.",
    attributeMods: { body: 2, agility: 1, reaction: 0, strength: 2, willpower: 0, logic: 0, intuition: 0, charisma: 0 },
    defenseRatingMod: 2,
    initiative: "(F x 2) + 2D6",
    astralInitiative: "(F x 2) + 3D6",
    actionsNote: "A1, I3",
    movement: "5/10/+3",
    skills: ["Astral", "Close Combat", "Perception"],
    fixedPowers: [
      { powerId: "power-animal-control" },
      { powerId: "power-astral-form" },
      { powerId: "power-enhanced-senses", note: "hearing, low-light vision, smell" },
      { powerId: "power-fear" },
      { powerId: "power-materialization" },
      { powerId: "power-movement" },
      { powerId: "power-sapience" },
    ],
    optionalPowers: [
      { powerId: "power-concealment" },
      { powerId: "power-confusion" },
      { powerId: "power-guard" },
      { powerId: "power-natural-weapon", note: "claws/bite" },
      { powerId: "power-noxious-breath" },
      { powerId: "power-search" },
      { powerId: "power-venom" },
    ],
    weaknesses: ["Allergy (silver, Severe)"],
    attacks: ["Claw/Bite [DV (F/2)P, Attack Ratings (F x 2)/-/-/-/-]"],
  },
  {
    id: "spirit-earth",
    name: "Spirit of Earth",
    book: CORE,
    summary: "A slow, heavily-defended elemental spirit of stone and soil.",
    attributeMods: { body: 4, agility: -2, reaction: -1, strength: 4, willpower: 0, logic: -1, intuition: 0, charisma: 0 },
    defenseRatingMod: 4,
    initiative: "[(F x 2) - 1] + 2D6",
    astralInitiative: "(F x 2) + 3D6",
    actionsNote: "A1, I3",
    movement: "5/10/+1",
    skills: ["Astral", "Close Combat", "Exotic Ranged Weapon", "Perception"],
    fixedPowers: [
      { powerId: "power-astral-form" },
      { powerId: "power-binding" },
      { powerId: "power-guard" },
      { powerId: "power-materialization" },
      { powerId: "power-movement" },
      { powerId: "power-sapience" },
      { powerId: "power-search" },
    ],
    optionalPowers: [
      { powerId: "power-concealment" },
      { powerId: "power-confusion" },
      { powerId: "power-elemental-attack", note: "Chemical" },
      { powerId: "power-engulf", note: "Earth" },
      { powerId: "power-fear" },
    ],
    weaknesses: ["Allergy (Electricity, Severe)"],
    attacks: ["Elemental Attack [DV (F)P, Attack Ratings (F x 2)/(F x 2)-2/(F x 2)-8/(F x 2)-10/-]"],
  },
  {
    id: "spirit-fire",
    name: "Spirit of Fire",
    book: CORE,
    summary: "A fast, aggressive elemental spirit wreathed in flame.",
    attributeMods: { body: 1, agility: 2, reaction: 3, strength: -2, willpower: 0, logic: 0, intuition: 1, charisma: 0 },
    defenseRatingMod: 1,
    initiative: "[(F x 2) + 4] + 2D6",
    astralInitiative: "(F x 2) + 3D6",
    actionsNote: "A1, I3",
    movement: "5/10/+5",
    skills: ["Astral", "Athletics", "Close Combat", "Exotic Ranged Weapon", "Perception"],
    fixedPowers: [
      { powerId: "power-accident" },
      { powerId: "power-astral-form" },
      { powerId: "power-confusion" },
      { powerId: "power-elemental-attack", note: "Fire" },
      { powerId: "power-energy-aura", note: "Fire" },
      { powerId: "power-engulf", note: "Fire" },
      { powerId: "power-materialization" },
      { powerId: "power-sapience" },
    ],
    optionalPowers: [
      { powerId: "power-fear" },
      { powerId: "power-guard" },
      { powerId: "power-noxious-breath" },
      { powerId: "power-search" },
    ],
    weaknesses: ["Allergy (Cold, Severe)", "Vulnerability (fire extinguishers)"],
    attacks: [
      "Elemental Attack [DV (F)P, Attack Ratings (F x 2)/(F x 2)-2/(F x 2)-8/(F x 2)-10/-]",
      "Engulf [DV (F+2)S + Fatigue I, Attack Ratings (F x 2)+1/-/-/-/-]",
    ],
  },
  {
    id: "spirit-kin",
    name: "Spirit of Kin",
    book: CORE,
    summary: "A humanlike spirit (\"Kindred Spirit\") - social, communicative, and quick-witted.",
    attributeMods: { body: 1, agility: 0, reaction: 2, strength: -2, willpower: 0, logic: 0, intuition: 1, charisma: 0 },
    defenseRatingMod: 1,
    initiative: "[(F x 2) + 3] + 2D6",
    astralInitiative: "(F x 2) + 3D6",
    actionsNote: "A1, I3",
    movement: "5/10/+1",
    skills: ["Astral", "Close Combat", "Perception", "Sorcery"],
    fixedPowers: [
      { powerId: "power-accident" },
      { powerId: "power-astral-form" },
      { powerId: "power-concealment" },
      { powerId: "power-confusion" },
      { powerId: "power-enhanced-senses", note: "low-light vision, thermographic vision" },
      { powerId: "power-guard" },
      { powerId: "power-influence" },
      { powerId: "power-materialization" },
      { powerId: "power-sapience" },
      { powerId: "power-search" },
    ],
    optionalPowers: [
      { powerId: "power-fear" },
      { powerId: "power-innate-spell", note: "any one spell known by the summoner; only one spell effect" },
      { powerId: "power-movement" },
      { powerId: "power-psychokinesis" },
    ],
    weaknesses: ["Allergy (ferrous metal, Severe)"],
    attacks: ["Fists [DV (F/2)S, Attack Ratings (F x 2)/-/-/-/-]"],
  },
  {
    id: "spirit-water",
    name: "Spirit of Water",
    book: CORE,
    summary: "A fluid, evasive elemental spirit of rivers, rain, and tide.",
    attributeMods: { body: 0, agility: 1, reaction: 2, strength: 0, willpower: 0, logic: 0, intuition: 0, charisma: 0 },
    defenseRatingMod: 0,
    initiative: "[(F x 2) + 2] + 2D6",
    astralInitiative: "(F x 2) + 3D6",
    actionsNote: "A1, I3",
    movement: "5/10/+2",
    skills: ["Astral", "Athletics (Swimming)", "Close Combat", "Exotic Ranged Weapon", "Perception"],
    fixedPowers: [
      { powerId: "power-astral-form" },
      { powerId: "power-concealment" },
      { powerId: "power-confusion" },
      { powerId: "power-engulf", note: "Water" },
      { powerId: "power-materialization" },
      { powerId: "power-movement" },
      { powerId: "power-sapience" },
      { powerId: "power-search" },
    ],
    optionalPowers: [
      { powerId: "power-accident" },
      { powerId: "power-binding" },
      { powerId: "power-elemental-attack", note: "Cold" },
      { powerId: "power-energy-aura", note: "Cold" },
      { powerId: "power-guard" },
      { powerId: "power-weather-control" },
    ],
    weaknesses: ["Allergy (fire, Severe)"],
    attacks: [
      "Elemental Attack [DV (F)P, Attack Ratings (F x 2)/(F x 2)-2/(F x 2)-8/(F x 2)-10/-]",
      "Engulf [DV (F+2)S + Fatigue I, Attack Ratings (F x 2)+1/-/-/-/-]",
    ],
  },

  // --- Street Wyrd, "A Congress of Spirits" (book pp. 55-56) ---
  {
    id: "spirit-plant",
    name: "Spirit of Plants",
    book: STREET_WYRD,
    summary: "A flora spirit - from thorn-covered humanoids to Venus-flytrap-headed vine creatures.",
    attributeMods: { body: 2, agility: -1, reaction: 0, strength: 1, willpower: 0, logic: -1, intuition: 0, charisma: 0 },
    defenseRatingMod: 2,
    conditionMonitorOverride: { base: "body", operation: "half", offset: 8 },
    initiative: "(F x 2) + 2D6",
    astralInitiative: "(F x 2) + 3D6",
    actionsNote: "A1, I3",
    movement: "10/15/+1",
    skills: ["Astral", "Close Combat", "Exotic Ranged Weapon", "Perception", "Spellcasting"],
    fixedPowers: [
      { powerId: "power-astral-form" },
      { powerId: "power-concealment" },
      { powerId: "power-engulf" },
      { powerId: "power-fear" },
      { powerId: "power-guard" },
      { powerId: "power-magical-guard" },
      { powerId: "power-materialization" },
      { powerId: "power-sapience" },
      { powerId: "power-silence" },
    ],
    optionalPowers: [
      { powerId: "power-accident" },
      { powerId: "power-confusion" },
      { powerId: "power-movement" },
      { powerId: "power-noxious-breath" },
      { powerId: "power-search" },
    ],
    weaknesses: [],
    attacks: ["Engulf [DV (F)P, Attack Ratings (F x 3)/-/-/-/-]"],
  },
  {
    id: "spirit-guardian",
    name: "Spirit of Guardians",
    book: STREET_WYRD,
    summary: "A protector spirit - avenging angels, Zulu warriors, and every shape between - bound by a warrior's code.",
    attributeMods: { body: 1, agility: 2, reaction: 3, strength: 2, willpower: 0, logic: 0, intuition: 0, charisma: 0 },
    defenseRatingMod: 1,
    defenseRatingMultiplier: 2,
    conditionMonitorOverride: { base: "force", preOffset: 1, operation: "half", offset: 8 },
    initiative: "[(F x 2) + 3] + 2D6",
    astralInitiative: "(F x 2) + 3D6",
    actionsNote: "A1, I4",
    movement: "10/15/+1",
    skills: ["Astral", "Close Combat", "Exotic Ranged Weapon", "Perception"],
    fixedPowers: [
      { powerId: "power-astral-form" },
      { powerId: "power-fear" },
      { powerId: "power-guard" },
      { powerId: "power-magical-guard" },
      { powerId: "power-materialization" },
      { powerId: "power-movement" },
      { powerId: "power-sapience" },
    ],
    optionalPowers: [
      { powerId: "power-animal-control" },
      { powerId: "power-concealment" },
      { powerId: "power-elemental-attack", note: "conjuror chooses element during summoning" },
      { powerId: "power-natural-weapon" },
      { powerId: "power-psychokinesis" },
      { powerId: "power-skill-specialization", note: "choose any Close Combat skill specialization" },
    ],
    weaknesses: [],
    attacks: ["Optional Natural Weapon [Close Combat, DV [(F/2)+1]P, Attack Ratings (F x 2)/-/-/-/-]"],
  },
  {
    id: "spirit-guidance",
    name: "Spirit of Guidance",
    book: STREET_WYRD,
    summary: "A wise-sage spirit summoned for advice rather than service - the quality of counsel scales with the conjurer's Astral Reputation.",
    attributeMods: { body: 3, agility: -1, reaction: 2, strength: 1, willpower: 0, logic: 0, intuition: 0, charisma: 0 },
    defenseRatingMod: 3,
    initiative: "[(F x 2) + 2] + 2D6",
    astralInitiative: "(F x 2) + 3D6",
    actionsNote: "A1, I3",
    movement: "10/15/+1",
    skills: ["Astral", "Close Combat", "Perception", "Spellcasting"],
    fixedPowers: [
      { powerId: "power-astral-form" },
      { powerId: "power-confusion" },
      { powerId: "power-divining" },
      { powerId: "power-guard" },
      { powerId: "power-magical-guard" },
      { powerId: "power-materialization" },
      { powerId: "power-sapience" },
      { powerId: "power-search" },
      { powerId: "power-shadow-cloak" },
    ],
    optionalPowers: [
      { powerId: "power-engulf" },
      { powerId: "power-enhanced-senses", note: "Hearing, Low-Light Vision, Thermographic Vision, or Smell" },
      { powerId: "power-fear" },
      { powerId: "power-influence" },
    ],
    weaknesses: [],
    attacks: [],
  },
  {
    id: "spirit-task",
    name: "Spirit of Task",
    book: STREET_WYRD,
    summary: "A willing-worker spirit skilled in a specific trade - summon the wrong specialist and they can't help with a job outside their craft.",
    attributeMods: { body: 0, agility: 0, reaction: 2, strength: 2, willpower: 0, logic: 0, intuition: 0, charisma: 0 },
    defenseRatingMod: 0,
    conditionMonitorOverride: { base: "force", operation: "double", offset: 8 },
    initiative: "[(F x 2) + 2] + 2D6",
    astralInitiative: "(F x 2) + 3D6",
    actionsNote: "A1, I3",
    movement: "10/15/+1",
    skills: ["Astral", "Close Combat", "Perception"],
    fixedPowers: [
      { powerId: "power-accident" },
      { powerId: "power-astral-form" },
      { powerId: "power-binding" },
      { powerId: "power-materialization" },
      { powerId: "power-movement" },
      { powerId: "power-sapience" },
      { powerId: "power-search" },
      {
        powerId: "power-skill",
        note: "choose one from Biotech, Electronics, Engineering, Outdoors, or Piloting and a Specialization in the chosen skill as well as an appropriate Knowledge Skill",
      },
    ],
    optionalPowers: [
      { powerId: "power-concealment" },
      { powerId: "power-enhanced-senses", note: "Hearing, Low-Light Vision, Thermographic Vision, or Smell" },
      { powerId: "power-influence" },
      { powerId: "power-psychokinesis" },
      { powerId: "power-skill", note: "choose an additional skillset as above" },
    ],
    weaknesses: [],
    attacks: [],
  },
];
