// Adept Powers catalog. Like spells.ts, this deliberately spans multiple
// sourcebooks (Core Rulebook here, Street Wyrd in adeptPowersStreetWyrd.ts)
// since a character's known powers accumulate across their whole career
// rather than being scoped to one PACKs-aligned gear chunk. Every entry
// carries a `book` field for that reason.
//
// This file covers the Core Rulebook: Adept Powers, book pp. 156-158
// (SR6_Core_RuleBook_noimg.pdf). Stat numbers (Power Point cost, Activation)
// are transcribed as printed; flavor/effect text is paraphrased in our own
// words, same convention as every other catalog file in this project.
//
// Known gaps in this pass, flagged rather than guessed at:
// - "Improved Ability (Skill)" prices Combat skills (1.0 PP/level) and other
//   skills (0.5 PP/level) differently - split into two catalog entries
//   since a single flat/per-level `cost` can't express a dual price, same
//   treatment as dual-priced gear items elsewhere in this project.
// - Several powers (Attribute Boost, Improved Ability, Improved Physical
//   Attribute, Improved Sense) require the player to specify a target
//   attribute/skill/sense at purchase, and can be bought multiple times for
//   different targets. This app doesn't have a formal param-picker for
//   Adept Powers (see AdeptPowerLine.notes in character.ts) - same
//   "choose via notes" precedent as Magical Equipment's Spell/Spirit Focus.
// - "Adept Ways" (a 20-Karma quality with a chosen sub-benefit) is modeled
//   as a single entry in qualities.ts, not here, since it's purchased with
//   Karma rather than Power Points and isn't itself a Power - see that
//   file's "adept-way" entry.
// - Metamagics (Astral Projection, Infusion, Item Attunement, etc.) require
//   Initiation, which this app doesn't track (see deriveEssence.ts's
//   header) - out of scope here regardless of source book.

export interface AdeptPowerCatalogEntry {
  id: string;
  name: string;
  /** Power Point cost; PER LEVEL if `levels` is set, same convention as GearCatalogEntry.cost. */
  cost: number;
  /** For rated powers; cost is PER LEVEL, same convention as GearCatalogEntry.levels. */
  levels?: { min: number; max: number };
  /** Passive, Minor Action, Major Action, or a longer free-form description (e.g. "Major Action (Minor to maintain)"). */
  activation: string;
  /** Another power this one requires, e.g. "Killing Hands". */
  prerequisite?: string;
  /** Free-form descriptors, e.g. "Element" for the Elemental Missile/Strike/Weapon family. */
  tags?: string[];
  summary: string;
  /** Sourcebook this entry is transcribed from. */
  book: string;
}

const CORE = "Core Rulebook";

export const coreAdeptPowers: AdeptPowerCatalogEntry[] = [
  {
    id: "power-attribute-boost",
    name: "Attribute Boost (Attribute)",
    cost: 0.25,
    levels: { min: 1, max: 6 },
    activation: "Major Action",
    summary:
      "Choose Body, Agility, Reaction, or Strength at purchase (use notes) - repeatable for another attribute. Roll Magic + this power's rating; each hit temporarily boosts the chosen attribute by 1 (max +4, dice pools only). Resist drain equal to the power's level when the boost ends.",
    book: CORE,
  },
  {
    id: "power-adrenaline-boost",
    name: "Adrenaline Boost",
    cost: 0.25,
    levels: { min: 1, max: 6 },
    activation: "Minor Action",
    summary: "Add 2 Initiative per level for a number of combat rounds equal to Magic, then resist drain equal to the power's level.",
    book: CORE,
  },
  {
    id: "power-astral-perception",
    name: "Astral Perception",
    cost: 1,
    activation: "Minor Action",
    summary: "Grants the ability to astrally perceive, becoming dual-natured and able to attack astral forms while active.",
    book: CORE,
  },
  {
    id: "power-combat-sense",
    name: "Combat Sense",
    cost: 0.5,
    levels: { min: 1, max: 6 },
    activation: "Passive",
    summary: "Adds a +1 dice pool bonus per level on defensive tests and Surprise tests.",
    book: CORE,
  },
  {
    id: "power-critical-strike",
    name: "Critical Strike",
    cost: 1.0,
    levels: { min: 1, max: 6 },
    activation: "Passive",
    summary: "Increases the damage of melee attacks by 1 per level; stacks with weapon and other adept-power enhancements unless prohibited.",
    book: CORE,
  },
  {
    id: "power-danger-sense",
    name: "Danger Sense",
    cost: 0.5,
    activation: "Passive",
    summary: "Grants Edge before making Surprise tests.",
    book: CORE,
  },
  {
    id: "power-direction-sense",
    name: "Direction Sense",
    cost: 0.25,
    activation: "Passive",
    summary: "Grants an Edge point on Outdoors tests related to directions, provided it's spent immediately on that test.",
    book: CORE,
  },
  {
    id: "power-enhanced-accuracy",
    name: "Enhanced Accuracy",
    cost: 0.5,
    activation: "Passive",
    summary: "Increases the Attack Rating of any weapon wielded by 2.",
    book: CORE,
  },
  {
    id: "power-enhanced-perception",
    name: "Enhanced Perception",
    cost: 0.5,
    activation: "Passive",
    summary: "Grants Edge when Observing in Detail or making a Perception test to find something hidden or overhear something.",
    book: CORE,
  },
  {
    id: "power-improved-ability-combat",
    name: "Improved Ability (Combat Skill)",
    cost: 1.0,
    levels: { min: 1, max: 6 },
    activation: "Passive",
    summary:
      "Choose a combat skill you already have at least 1 rank in (use notes) - repeatable for another skill. Ongoing boost equal to the power's level, capped at 1.5x the original rank or the augmented maximum, whichever is lower.",
    book: CORE,
  },
  {
    id: "power-improved-ability-other",
    name: "Improved Ability (Other Skill)",
    cost: 0.5,
    levels: { min: 1, max: 6 },
    activation: "Passive",
    summary:
      "Same as Improved Ability (Combat Skill), at the cheaper non-combat-skill rate. Choose a non-combat skill you already have at least 1 rank in (use notes) - repeatable for another skill.",
    book: CORE,
  },
  {
    id: "power-improved-physical-attribute",
    name: "Improved Physical Attribute",
    cost: 1,
    levels: { min: 1, max: 6 },
    activation: "Passive",
    summary:
      "Choose Body, Agility, Reaction, or Strength at purchase (use notes) - repeatable for another attribute. Ongoing boost equal to the power's level, capped at 1.5x the current rating or the augmented maximum, whichever is lower.",
    book: CORE,
  },
  {
    id: "power-improved-reflexes",
    name: "Improved Reflexes",
    cost: 1,
    levels: { min: 1, max: 4 },
    activation: "Passive",
    summary: "Adds an Initiative Die and +1 Reaction per level (max 4 levels). Cannot combine with any other Initiative or Reaction boost.",
    book: CORE,
  },
  {
    id: "power-improved-sense",
    name: "Improved Sense",
    cost: 0.25,
    activation: "Passive",
    summary:
      "Choose a sense (sight, hearing, touch, taste, or smell) at purchase (use notes) - repeatable for another sense. Gain a bonus Edge on tests involving that sense, but only if spent on that test.",
    book: CORE,
  },
  {
    id: "power-killing-hands",
    name: "Killing Hands",
    cost: 0.5,
    activation: "Minor Action",
    summary:
      "Unarmed attacks can deal Stun or Physical damage at will, are considered magical (bypassing protection against normal weapons), and can strike astral beings.",
    book: CORE,
  },
  {
    id: "power-kinesics",
    name: "Kinesics",
    cost: 0.25,
    activation: "Passive",
    summary: "Gain an Edge point (once per encounter) when resisting Social tests or attempts to read your emotions, intentions, or truthfulness.",
    book: CORE,
  },
  {
    id: "power-mystic-armor",
    name: "Mystic Armor",
    cost: 0.25,
    levels: { min: 1, max: 6 },
    activation: "Passive",
    summary: "Grants 1 point of Armor per level, cumulative with worn armor and boosting Defense Rating; also active on the astral plane.",
    book: CORE,
  },
  {
    id: "power-pain-resistance",
    name: "Pain Resistance",
    cost: 0.25,
    levels: { min: 1, max: 6 },
    activation: "Passive",
    summary: "Shifts damage-based dice pool penalties one Condition Monitor box later per level, for both Stun and Physical.",
    book: CORE,
  },
  {
    id: "power-rapid-healing",
    name: "Rapid Healing",
    cost: 0.5,
    levels: { min: 1, max: 6 },
    activation: "Passive",
    summary: "Adds one hit per level on Healing tests performed to heal the adept.",
    book: CORE,
  },
  {
    id: "power-spell-resistance",
    name: "Spell Resistance",
    cost: 0.5,
    activation: "Passive",
    summary: "Grants a point of Edge when targeted by spells.",
    book: CORE,
  },
  {
    id: "power-traceless-walk",
    name: "Traceless Walk",
    cost: 0.5,
    activation: "Passive",
    summary:
      "Leaves no trace of passage - doesn't trigger tripwires, pressure pads, or other leg-movement traps. Hearing tests to hear you passing and Outdoors tests to spot your tracks cannot gain or spend Edge.",
    book: CORE,
  },
  {
    id: "power-vocal-control",
    name: "Vocal Control",
    cost: 0.5,
    activation: "Passive",
    summary: "Gain Edge (once per encounter) on a Con or Influence test involving vocal pitch, modulation, or mimicry.",
    book: CORE,
  },
  {
    id: "power-wall-running",
    name: "Wall Running",
    cost: 0.5,
    activation: "Minor Action",
    summary: "Use a Sprint action to run up a vertical surface. Cannot be used twice in a row without a turn on a horizontal surface between.",
    book: CORE,
  },
];
