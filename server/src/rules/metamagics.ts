// Metamagics (core rulebook pp. 167-168 + Street Wyrd "Adept Metamagics" pp.
// 84-85) and Echoes (core rulebook pp. 194-195) - the named catalog an
// Initiate/Submersion Grade purchase grants, replacing the freeform-text
// entry this app shipped with initially (see deriveInitiation.ts). Same
// multi-sourcebook `book` convention as spells.ts/adeptPowers.ts.
//
// Only a handful of these have an effect this app can compute automatically
// (Power Point, Centering/Adept Centering feed deriveAdeptPowers.ts's PP
// pool and deriveAstral.ts's Drain Resistance respectively - see those
// files). Everything else is opposed-test/situational bonus text the app
// has never simulated for anything else either (no dice-rolling engine
// anywhere in this project) - `summary` still states the real mechanical
// effect, it's just not wired into a derived number.
export interface MetamagicCatalogEntry {
  id: string;
  name: string;
  /** Adepts/Mystic Adepts only - most Street Wyrd entries and two core entries (Adept Centering, Power Point). */
  adeptOnly?: boolean;
  /** Another metamagic required first, e.g. Infusion requires Adept Centering. */
  prerequisite?: string;
  /** Power Point is the one metamagic explicitly "as many times as you like" (p. 168); everything else is once-only per RAW. */
  repeatable?: boolean;
  summary: string;
  book: string;
}

export interface EchoCatalogEntry {
  id: string;
  name: string;
  /** Set for the two Echoes explicitly repeatable in the text; undefined means once-only (default RAW). */
  maxRepeats?: number;
  summary: string;
  book: string;
}

const CORE = "Core Rulebook";
const STREET_WYRD = "Street Wyrd";

export const coreMetamagics: MetamagicCatalogEntry[] = [
  {
    id: "centering",
    name: "Centering",
    summary:
      "Add your Initiate Grade to Drain Resistance tests (Willpower + Tradition Attribute), using a mundane activity appropriate to your tradition as a Minor Action.",
    book: CORE,
  },
  {
    id: "adept-centering",
    name: "Adept Centering",
    adeptOnly: true,
    summary:
      "By performing a centering action (Minor Action), opponents cannot gain Edge against you from environmental conditions or Illusion spells on your turn or their next turn.",
    book: CORE,
  },
  {
    id: "fixation",
    name: "Fixation",
    summary:
      "Infuse an alchemical preparation with 1+ Karma (up to its Potency) at creation: its Potency decays 1/day instead of 1 every [Potency x 2] hours, and gains a dice pool bonus against Disjoining equal to the Karma spent.",
    book: CORE,
  },
  {
    id: "flexible-signature",
    name: "Flexible Signature",
    summary:
      "Alter your astral signature at will - disguise it, forge another assensed magician's signature, or reduce how long it lasts (by your Initiate Grade in hours). A forged signature adds your Initiate Grade to the Assensing test threshold to detect.",
    book: CORE,
  },
  {
    id: "masking",
    name: "Masking",
    summary:
      "Change your aura's appearance (mundane, or Magic rank raised/lowered by up to your Initiate Grade); an Assensing test to see through it is opposed by Magic + Initiate Grade. Can also mask a number of bonded foci equal to your Initiate Grade.",
    book: CORE,
  },
  {
    id: "power-point",
    name: "Power Point",
    adeptOnly: true,
    repeatable: true,
    summary: "Gain a Power Point instead of a metamagic. May be taken as many times as you like.",
    book: CORE,
  },
  {
    id: "quickening",
    name: "Quickening",
    summary:
      "Major Action + Karma (at least 1, up to the hits on the original Spellcasting test) while sustaining a spell makes it permanent and self-sustaining, gaining a dice pool bonus against dispelling equal to the Karma spent.",
    book: CORE,
  },
  {
    id: "shielding",
    name: "Shielding",
    summary:
      "When declaring Boosted Defense against a spell, add dice equal to your Initiate Grade directly to the spell defense pool (not usable for other Counterspelling, including dispelling).",
    book: CORE,
  },
  {
    id: "spell-shaping",
    name: "Spell Shaping",
    summary:
      "Reshape an area spell at cast time: for every -1 Spellcasting dice pool penalty (up to your Magic rating), increase/decrease the radius by 1 meter or carve out a 1-meter unaffected bubble. No effect on Drain Value.",
    book: CORE,
  },
];

export const streetWyrdAdeptMetamagics: MetamagicCatalogEntry[] = [
  {
    id: "animal-attunement",
    name: "Animal Attunement",
    adeptOnly: true,
    prerequisite: "Animal Empathy",
    summary:
      "Bond with a friendly mundane critter for (15 - animal's Essence) Karma. See through its senses out to (Magic) km, send it brief silent commands, and it rolls +1 die per level of Initiation you have.",
    book: STREET_WYRD,
  },
  {
    id: "astral-projection-adept",
    name: "Astral Projection",
    adeptOnly: true,
    prerequisite: "Astral Perception",
    summary: "An adept with Astral Perception can fully astrally project, under the normal Astral Projection rules.",
    book: STREET_WYRD,
  },
  {
    id: "finding-your-way",
    name: "Finding Your Way",
    adeptOnly: true,
    summary:
      "Spend a Major Action (or more) to perfectly memorize a location you can see; recall it in exacting detail later (limited by what was actually observed).",
    book: STREET_WYRD,
  },
  {
    id: "infusion",
    name: "Infusion",
    adeptOnly: true,
    prerequisite: "Adept Centering",
    summary:
      "Major Action to focus and center: add 0.5 PP of temporary power to existing adept powers per level of Initiate Grade, lasting (Magic) rounds. Afterward, resist Stun Drain equal to your Magic rating.",
    book: STREET_WYRD,
  },
  {
    id: "item-attunement",
    name: "Item Attunement",
    adeptOnly: true,
    summary:
      "Bond with a favorite item (Karma cost by item type) so mundane tests made directly with it gain +1 die per level of Initiation you have, while actively using and in contact with it.",
    book: STREET_WYRD,
  },
  {
    id: "virtuoso",
    name: "Virtuoso",
    adeptOnly: true,
    prerequisite: "Enthralling Performance",
    summary:
      "Create a masterwork (physical or performance) that counts as an Enthralling Performance to all first-time witnesses, grants a bonus on your Enthralling Performance test equal to your Initiate Grade, and instills a chosen emotional effect.",
    book: STREET_WYRD,
  },
];

export const metamagics: MetamagicCatalogEntry[] = [...coreMetamagics, ...streetWyrdAdeptMetamagics];

export const echoes: EchoCatalogEntry[] = [
  {
    id: "living-network",
    name: "Living Network",
    summary: "Your living persona can participate in a PAN.",
    book: CORE,
  },
  {
    id: "machine-mind",
    name: "Machine Mind",
    summary: "Gain the benefits of a Rating 1 Control Rig.",
    book: CORE,
  },
  {
    id: "matrix-attribute-upgrade",
    name: "Matrix Attribute Upgrade",
    maxRepeats: undefined,
    summary:
      "Upgrade one of your living persona's Matrix Attributes (Attack/Sleaze/Data Processing/Firewall) by 1. May be taken multiple times, but each Matrix Attribute may only be upgraded twice.",
    book: CORE,
  },
  {
    id: "neurofilter",
    name: "NeuroFilter",
    maxRepeats: 2,
    summary: "+1 dice pool bonus to resist biofeedback damage. May be taken twice.",
    book: CORE,
  },
  {
    id: "overclocking",
    name: "Overclocking",
    summary: "Gain an additional Minor Action and +1D6 Initiative Dice while in hot-sim VR.",
    book: CORE,
  },
  {
    id: "resonance-link",
    name: "Resonance Link",
    summary:
      "Establish a low-level, one-way empathic link with a chosen technomancer - you sense their mood, stress, pain, or danger. Two-way if both take this Echo with each other.",
    book: CORE,
  },
  {
    id: "skinlink",
    name: "Skinlink",
    summary: "Connect to a device as if using a DNI simply by touching it.",
    book: CORE,
  },
];
