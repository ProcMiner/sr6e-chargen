// Adept Powers catalog, Street Wyrd chunk - see adeptPowers.ts's header for
// the overall multi-sourcebook rationale.
//
// Transcribed from Street_Wyrd__Magic_Sourebook__noimg.pdf's "Force and
// Grace" chapter, "New Adept Powers" section (pp. 77-84). Stat numbers are
// transcribed as printed; flavor/effect text is paraphrased in our own
// words, same convention as every other catalog file in this project.
//
// Known gaps in this pass, flagged rather than guessed at:
// - "Adept Ways and Their Benefits" (pp. 76-77, a 20-Karma quality granting
//   Innate Talent/Focused Channeling/Spark of Brilliance plus a chosen
//   Way's specific benefit - Artisan's, Artist's, Athlete's, Beast's,
//   Burnout's, Invisible, Magician's, Speaker's, or Warrior's Way) is
//   modeled as a single quality entry in qualities.ts, not here - same
//   Mentor-Spirit-style "pick via notes, effect text points to the book"
//   precedent, since these are narrative-mechanical benefits this app
//   doesn't otherwise simulate for any quality.
// - "Adept Metamagics" (pp. 84-85: Animal Attunement, Astral Projection,
//   Finding Your Way, Infusion, Item Attunement, Virtuoso) require
//   Initiation, which this app doesn't track - excluded, same as the core
//   catalog's Metamagics gap.
// - Powers requiring a sub-choice (element, attribute, skill) use the same
//   "choose via notes" convention as the core catalog - see
//   AdeptPowerLine.notes in character.ts.

import type { AdeptPowerCatalogEntry } from "./adeptPowers.js";

const STREET_WYRD = "Street Wyrd";

export const streetWyrdAdeptPowers: AdeptPowerCatalogEntry[] = [
  {
    id: "power-aid-sorcery",
    name: "Aid Sorcery",
    cost: 0.5,
    levels: { min: 1, max: 6 },
    activation: "Major Action (Minor to maintain)",
    summary:
      "Touch a spellcaster and maintain contact to open a mana conduit; the caster adds the adept's ranks in this power as bonus dice on Sorcery tests (including Counterspelling and Ritual Spellcasting). The adept resists Stun drain each time the bonus dice are used.",
    book: STREET_WYRD,
  },
  {
    id: "power-air-dance",
    name: "Air Dance",
    cost: 1.5,
    activation: "Passive",
    summary: "Gain +1 Minor Action for every (10 - Initiate Grade) Initiative Points the adept beats their fastest opponent by at the start of the round.",
    book: STREET_WYRD,
  },
  {
    id: "power-analytics",
    name: "Analytics",
    cost: 0.5,
    activation: "Passive",
    summary: "Gain a bonus Edge (must be spent on that test or it's lost) when making any Logic-based test.",
    book: STREET_WYRD,
  },
  {
    id: "power-animal-empathy",
    name: "Animal Empathy",
    cost: 0.5,
    levels: { min: 1, max: 2 },
    activation: "Passive",
    summary:
      "Level 1: reduces the cost of Edge Boosts by one on Charisma-based tests against mundane critters. Level 2: the same bonus also applies against Awakened critters.",
    book: STREET_WYRD,
  },
  {
    id: "power-attribute-boost-mental",
    name: "Attribute Boost: Mental",
    cost: 0.25,
    levels: { min: 1, max: 6 },
    activation: "Major Action",
    summary:
      "Choose Logic, Intuition, Charisma, or Willpower at purchase (use notes) - repeatable for another attribute. Roll Magic + this power's rating; each hit temporarily boosts the chosen attribute by 1 (max +4, dice pools only). Resist drain equal to the power's level when the boost ends.",
    book: STREET_WYRD,
  },
  {
    id: "power-berserk",
    name: "Berserk",
    cost: 1,
    levels: { min: 1, max: 4 },
    activation: "Minor Action",
    summary:
      "While active, gain +1 to all Physical attributes and ignore damage equal to your rank per level (both capped/stack per the usual rules), but suffer -1 to all Mental attributes per level and must attack the nearest target each round. Lasts (levels x 2) rounds; ending it early requires an Adept Drain test.",
    book: STREET_WYRD,
  },
  {
    id: "power-blind-fighting",
    name: "Blind Fighting",
    cost: 0.5,
    activation: "Passive",
    summary: "Never grants a Close Combat opponent bonus Edge for vision-based penalties (darkness, flash-paks, tear gas, blindness), though you're still vulnerable to ambush.",
    book: STREET_WYRD,
  },
  {
    id: "power-cloak",
    name: "Cloak",
    cost: 0.25,
    levels: { min: 1, max: 6 },
    activation: "Passive",
    summary: "Imposes a -1 dice pool penalty per rank on tests made to read your aura.",
    book: STREET_WYRD,
  },
  {
    id: "power-commanding-voice",
    name: "Commanding Voice",
    cost: 1.5,
    levels: { min: 1, max: 6 },
    activation: "Major Action",
    summary:
      "Adds +1 die per level to opposed Intimidation tests you initiate; on success the target must obey your order (never to directly self-harm) for up to (level) rounds in dangerous situations.",
    book: STREET_WYRD,
  },
  {
    id: "power-cool-resolve",
    name: "Cool Resolve",
    cost: 0.25,
    levels: { min: 1, max: 6 },
    activation: "Passive",
    summary: "Adds +1 die per level to opposed social tests resisting Influence skills, and +1 die per level to resist the Fear critter power.",
    book: STREET_WYRD,
  },
  {
    id: "power-cosmetic-control",
    name: "Cosmetic Control",
    cost: 1,
    levels: { min: 1, max: 2 },
    activation: "Major Action",
    summary:
      "Level 1: alter your appearance cosmetically within your metatype's normal range. Level 2: alter appearance and size beyond your metatype's usual limits. Each level also lowers Edge Boost cost by one on Acting/Disguise/Impersonation-style Con tests.",
    book: STREET_WYRD,
  },
  {
    id: "power-countermagic",
    name: "Countermagic",
    cost: 0.5,
    levels: { min: 1, max: 6 },
    activation: "Minor Action",
    summary: "Adds one die per level to tests to resist spells.",
    book: STREET_WYRD,
  },
  {
    id: "power-counterstrike",
    name: "Counterstrike",
    cost: 0.5,
    levels: { min: 1, max: 6 },
    activation: "Minor Action",
    summary: "After successfully Blocking a Close Combat attack, add dice equal to your ranks plus the Block's net hits to your next Close Combat attack against that same attacker.",
    book: STREET_WYRD,
  },
  {
    id: "power-dash",
    name: "Dash",
    cost: 0.25,
    levels: { min: 1, max: 6 },
    activation: "Minor Action",
    summary: "When making a Sprint test after spending a Minor Action to focus, add +1 meter of movement per rank.",
    book: STREET_WYRD,
  },
  {
    id: "power-distance-grasp",
    name: "Distance Grasp",
    cost: 0.5,
    levels: { min: 1, max: 6 },
    activation: "Minor Action",
    summary:
      "Manipulate the physical world at range (Magic x this power's rating, in meters) with an effective Strength equal to your rank - remote skill use, picking up small objects, flipping switches, picking locks. Cannot be used to attack (see Distance Strike).",
    book: STREET_WYRD,
  },
  {
    id: "power-distance-strike",
    name: "Distance Strike",
    cost: 2,
    activation: "Passive",
    summary: "Strike a target at range (up to Magic in meters) without touching them, dealing damage and Attack Rating as your unarmed attack (including Killing Hands/Elemental Strike); the target may defend as against a Close Combat or ranged attack.",
    book: STREET_WYRD,
  },
  {
    id: "power-elemental-missile",
    name: "Elemental Missile",
    cost: 0.5,
    tags: ["Element", "Weapon"],
    activation: "Minor Action",
    summary:
      "Choose one element and one ranged-attack category (thrown, projectile, a Firearms or Exotic Weapon specialization, or Gunnery) at purchase (use notes) - repeatable for another combination. Activating infuses attacks of that category with the chosen elemental damage type for (Magic) rounds.",
    book: STREET_WYRD,
  },
  {
    id: "power-elemental-strike",
    name: "Elemental Strike",
    cost: 0.5,
    tags: ["Element"],
    prerequisite: "Killing Hands",
    activation: "Minor Action",
    summary:
      "Choose an element at purchase (use notes) - repeatable for another element. Activating infuses unarmed attacks with that elemental damage type for (Magic) rounds; only one element active at a time.",
    book: STREET_WYRD,
  },
  {
    id: "power-elemental-weapon",
    name: "Elemental Weapon",
    cost: 0.5,
    levels: { min: 1, max: 6 },
    tags: ["Element"],
    activation: "Minor Action",
    summary:
      "Choose an element at purchase (use notes) - repeatable for another element. Activating infuses Close Combat weapon attacks with that elemental damage type for (Magic) rounds; only one element active at a time.",
    book: STREET_WYRD,
  },
  {
    id: "power-empathic-healing",
    name: "Empathic Healing",
    cost: 0.75,
    activation: "Major Action",
    summary:
      "Through sustained physical contact, transfer a target's Physical/Overflow damage into yourself (1 box per hit on a Magic + Willpower roll, then 1 box per Major Action), taking Stun then Physical damage in return. Counts as the target's one allowed Heal-style treatment for those injuries.",
    book: STREET_WYRD,
  },
  {
    id: "power-empathic-sense",
    name: "Empathic Sense",
    cost: 0.5,
    activation: "Minor Action",
    summary: "A weaker form of Assensing: roll Intuition + Perception to sense a visible target's emotional state and physical health per the Assensing Table.",
    book: STREET_WYRD,
  },
  {
    id: "power-enthralling-performance",
    name: "Enthralling Performance",
    cost: 0.5,
    activation: "Minor Action",
    summary:
      "Choose a performance skill/specialty at purchase (use notes) - repeatable for another. While performing, your hits set a Perception threshold that mesmerizes the audience into a relaxed, distracted state until something snaps them out of it.",
    book: STREET_WYRD,
  },
  {
    id: "power-freefall",
    name: "Freefall",
    cost: 0.25,
    levels: { min: 1, max: 3 },
    activation: "Passive",
    summary: "Adds 3 meters of safe falling distance per level before damage is calculated.",
    book: STREET_WYRD,
  },
  {
    id: "power-great-leap",
    name: "Great Leap",
    cost: 0.25,
    levels: { min: 1, max: 6 },
    activation: "Minor Action",
    summary:
      "After spending a Minor Action to focus, a Jumping test gains extra distance per hit (2m running/1m standing horizontal/0.5m standing vertical) plus +1 die per level.",
    book: STREET_WYRD,
  },
  {
    id: "power-improved-mental-attribute",
    name: "Improved Mental Attribute",
    cost: 1,
    levels: { min: 1, max: 6 },
    activation: "Passive",
    summary:
      "Choose Intuition, Logic, Charisma, or Willpower at purchase (use notes) - repeatable for another attribute. Ongoing increase equal to the power's level, capped at the augmented maximum or 1.5x the current rating, whichever is lower.",
    book: STREET_WYRD,
  },
  {
    id: "power-iron-will",
    name: "Iron Will",
    cost: 0.25,
    levels: { min: 1, max: 6 },
    activation: "Passive",
    summary: "Adds +1 die per level to resist magical mind control or emotional manipulation (Manipulation spells, critter powers, adept powers).",
    book: STREET_WYRD,
  },
  {
    id: "power-kinesics-mastery",
    name: "Kinesics Mastery",
    cost: 0.25,
    levels: { min: 1, max: 6 },
    prerequisite: "Kinesics",
    activation: "Passive",
    summary: "Lets two adepts with this power hold a secret full conversation via line-of-sight body language, and increases how often the base Kinesics power grants Edge per encounter, per level.",
    book: STREET_WYRD,
  },
  {
    id: "power-linguistics",
    name: "Linguistics",
    cost: 0.25,
    activation: "Passive",
    summary: "Learn a new Language Skill at basic level after just one hour of exposure, at no Karma cost; also grants a bonus die on Perception tests to understand a trained language.",
    book: STREET_WYRD,
  },
  {
    id: "power-living-focus",
    name: "Living Focus",
    cost: 1,
    levels: { min: 1, max: 6 },
    activation: "Passive",
    summary: "Self-sustain a spell cast on you without a roll (still takes the usual -2 sustaining penalty); additional levels let you sustain more spells or reduce the sustaining penalty instead.",
    book: STREET_WYRD,
  },
  {
    id: "power-maneuver",
    name: "Maneuver",
    cost: 0.5,
    activation: "Major Action",
    summary: "Roll Close Combat + Intuition opposed by a chosen combatant's Intuition; net hits become bonus dice for your next Close Combat attack on or Defense against that opponent, lost if unused by the end of the next round.",
    book: STREET_WYRD,
  },
  {
    id: "power-missile-mastery",
    name: "Missile Mastery",
    cost: 1,
    activation: "Passive",
    summary: "Purpose-built non-explosive thrown weapons gain +1 DV and Attack Rating; improvised thrown objects (coins, cards, chopsticks) become usable weapons using Athletics + Strength for Attack Rating.",
    book: STREET_WYRD,
  },
  {
    id: "power-missile-parry",
    name: "Missile Parry",
    cost: 0.5,
    activation: "Passive",
    summary: "Use the Block Minor Action against non-explosive thrown/projectile attacks even outside melee, adding Close Combat to your Defense test; enough net hits lets you catch the weapon instead of deflecting it.",
    book: STREET_WYRD,
  },
  {
    id: "power-momentum",
    name: "Momentum",
    cost: 0.25,
    levels: { min: 1, max: 6 },
    activation: "Passive",
    summary: "Ignore one level of the progressive dice pool penalty on Extended tests per level of this power.",
    book: STREET_WYRD,
  },
  {
    id: "power-nerve-strike",
    name: "Nerve Strike",
    cost: 1,
    activation: "Passive",
    summary: "Declared before a Close Combat attack: instead of normal damage, lower the target's Agility or Reaction by 1 per net hit (paralyzing them at 0); no effect on targets without a working nervous system.",
    book: STREET_WYRD,
  },
  {
    id: "power-nimble-fingers",
    name: "Nimble Fingers",
    cost: 0.25,
    levels: { min: 1, max: 6 },
    activation: "Passive",
    summary:
      "Level 1 lowers Edge Boost cost by one on fine-manipulation tests (Palming, Lockpicking, sleight of hand). Further levels add a dice pool bonus and a bonus Minor Action usable to offset quick-fingers action costs (Reload Weapon, Pick Up/Put Down Object, etc.).",
    book: STREET_WYRD,
  },
  {
    id: "power-pain-relief",
    name: "Pain Relief",
    cost: 1,
    activation: "Major Action",
    summary: "Roll Agility + Magic; the target may ignore one point of Stun damage per hit for wound-modifier purposes (damage isn't healed) for (Magic) hours, or instead have the effects of a prior Nerve Strike permanently removed.",
    book: STREET_WYRD,
  },
  {
    id: "power-penetrating-strike",
    name: "Penetrating Strike",
    cost: 0.25,
    levels: { min: 1, max: 6 },
    activation: "Passive",
    summary: "Increases Attack Rating with Close Combat attacks by 1 per level.",
    book: STREET_WYRD,
  },
  {
    id: "power-power-throw",
    name: "Power Throw",
    cost: 0.5,
    levels: { min: 1, max: 6 },
    activation: "Passive",
    summary: "Choose +1 DV or +2 Attack Rating per level (at purchase) for direct-damage thrown weapons, capped at doubling the weapon's base DV/AR.",
    book: STREET_WYRD,
  },
  {
    id: "power-quick-draw",
    name: "Quick Draw",
    cost: 0.25,
    activation: "Passive",
    summary: "Use the Quick Draw Minor Action with weapons larger than a pistol or small throwing weapon, and without needing a specialized holster or quality.",
    book: STREET_WYRD,
  },
  {
    id: "power-quick-strike",
    name: "Quick Strike",
    cost: 3,
    activation: "Passive",
    summary: "When Initiative is rolled, may act first in the round regardless of Initiative order (score itself unaffected, no bonus Minor Actions granted).",
    book: STREET_WYRD,
  },
  {
    id: "power-side-step",
    name: "Side Step",
    cost: 0.25,
    levels: { min: 1, max: 6 },
    activation: "Passive",
    summary: "Adds +1 die per level to Defense tests augmented by an action expenditure (Block, Dodge), stacking with those actions' own bonuses.",
    book: STREET_WYRD,
  },
  {
    id: "power-spell-shroud",
    name: "Spell Shroud",
    cost: 0.25,
    levels: { min: 1, max: 6 },
    activation: "Passive",
    summary: "Adds +1 die per level to tests opposing Detection spells targeting you.",
    book: STREET_WYRD,
  },
  {
    id: "power-sustenance",
    name: "Sustenance",
    cost: 0.25,
    activation: "Passive",
    summary: "One good meal and three hours of sleep provide as much nourishment/rest as a normal day; reduces Lifestyle cost by 250 nuyen/month.",
    book: STREET_WYRD,
  },
  {
    id: "power-three-dimensional-memory",
    name: "Three-Dimensional Memory",
    cost: 0.5,
    activation: "Major Action",
    summary: "Memorize an area viewed firsthand; later recall it on a Logic + Intuition test (Magic may replace one attribute), difficulty scaling with how long ago it was seen.",
    book: STREET_WYRD,
  },
];
