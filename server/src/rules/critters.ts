// Critters chunk of the NPC template catalog - see npcTemplates.ts's header
// for the full rationale (this is the same NpcTemplateEntry shape, split
// into its own file the same way augmentations.ts/armor.ts/etc. split
// gear.ts's chunks by book chapter).
//
// Transcribed from SR6_Core_RuleBook_noimg.pdf, "Critters" chapter, book pp.
// 215-220: Mundane Critters (p. 215), Awakened Critters (p. 216-219), and
// Dracoforms (p. 219-220). Stat-block numbers are transcribed as printed;
// flavor text is paraphrased in our own words. 18 entries total: 5 Mundane
// Critters, 10 Awakened Critters, 3 Dracoforms.
//
// Known gaps/notes, flagged rather than guessed at:
// - Unlike Grunts (which always share one combined Condition Monitor), the
//   book's intro text says "Select critters have both Physical and Stun
//   Condition Monitors" - and five of these do print a genuine split CM
//   (Vampire, Ghoul, and all three dragons), unlike the other 13 which
//   print one combined number like Grunts. Each entry below maps its own
//   printed CM correctly rather than reusing one blanket rule - see each
//   entry's physicalMonitor/stunMonitor and notes.
// - The three dragon entries (Eastern Dragon, Western Dragon, Feathered
//   Serpent/"feathered spirit") repeat the book's shared "Common
//   Skills"/"Common Powers"/"Individual Powers" text in each entry's
//   `combat` field so every imported card is self-contained, rather than
//   only printing it once as the book does.
// - Dragons print a Physical/Mystic Defense split (e.g. "26 Physical/19
//   Mystic") rather than a single Defense Rating - `armor` uses the
//   Physical number; the Mystic figure is noted in `combat`.
// - The Critter Powers glossary (book pp. 221-228, e.g. what "Armor N" or
//   "Paralyzing Howl" mechanically does) is rules reference text, not
//   per-critter data - not transcribed here, same treatment as how the
//   Grunts chunk doesn't transcribe the Adept Powers/Spells catalogs it
//   references by name.
// - Sirrush (p. 219, an Asia Minor dragon variant) is explicitly "identical
//   to an eastern dragon" in game statistics per the book - not given a
//   separate entry, noted in the Eastern Dragon entry's notes instead.

import type { NpcTemplateEntry } from "./npcTemplates.js";

const CORE = "Core Rulebook";

/** "X/Y" printed Initiative rank/Initiative Dice -> "X + Yd6". */
function initiative(rank: number, dice: number): string {
  return `${rank} + ${dice}d6`;
}

const SHARED_CM_NOTE =
  "Condition Monitor is ONE combined Physical+Stun track, same convention as this book's Grunts (core rulebook p. 204) - treat the Physical and Stun trackers below as a single shared pool, not two separate ones.";

const DRAGON_COMMON_SKILLS = "Common Skills: Astral 9, Athletics 7 (Flying +2), Close Combat 7, Conjuring 7, Perception 8, Sorcery 9";
const DRAGON_COMMON_POWERS =
  "Common Powers: Dragonspeech, Dual Natured, Elemental Attack (usually Fire), Enhanced Senses (smell, low-light vision, thermographic vision, wide-band hearing), Hardened Armor (MAG), Hardened Mystic Armor (MAG), Natural Weapon, Sapience";
const DRAGON_INDIVIDUAL_POWERS =
  "Individual Powers (varies per specimen): Animal Control, Compulsion, Corrosive Saliva, Fear, Influence, Noxious Breath, Venom";
const DRAGON_NOTE = "All dragons have a Magician ranking and know several spells beyond what's listed here - this is a typical average adult's baseline, not an exhaustive list.";

export const coreCritterTemplates: NpcTemplateEntry[] = [
  // --- Mundane Critters (book p. 215) ---
  {
    id: "npc-critter-dog",
    name: "Dog",
    group: "Mundane Critters",
    summary: "An ordinary dog - guard animal, pet, or just a hazard on the wrong side of a fence.",
    book: CORE,
    data: {
      description: "Mundane Critter. An ordinary dog.",
      physicalMonitor: 10,
      stunMonitor: 10,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 4,
      initiative: initiative(6, 1),
      combat: [
        "B3 A2 R3 S2 W2 L2 I3 C3 ESS6",
        "AC: A1, I2",
        "Skills: Athletics 5, Close Combat 4, Influence 2 (Intimidation +2), Outdoors 6, Perception 5 (Smell +2)",
        "Powers: Armor 1, Enhanced Senses (Hearing, Smell), Natural Weapon",
        "Attack: Claws/Bite: DV 2P, Attack Ratings 5/—/—/—/—",
      ].join("\n"),
      notes: SHARED_CM_NOTE,
    },
  },
  {
    id: "npc-critter-large-cat",
    name: "Large Cat",
    group: "Mundane Critters",
    summary: "A big cat - cougar, jaguar, or similar - fast, stealthy, and a real threat up close.",
    book: CORE,
    data: {
      description: "Mundane Critter. A big cat.",
      physicalMonitor: 11,
      stunMonitor: 11,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 7,
      initiative: initiative(10, 2),
      combat: [
        "B5 A5 R4 S4 W1 L1 I4 C3 ESS6",
        "AC: A2, I2",
        "Skills: Athletics 6, Close Combat 7, Influence 4 (Intimidation +2), Outdoors 4, Perception 5 (Visual +2), Stealth 6",
        "Powers: Armor 2, Enhanced Senses (Low-light vision, Smell), Natural Weapon",
        "Attack: Claws/Bite: DV 3P, Attack Ratings 8/—/—/—/—",
      ].join("\n"),
      notes: SHARED_CM_NOTE,
    },
  },
  {
    id: "npc-critter-horse",
    name: "Horse",
    group: "Mundane Critters",
    summary: "A horse - transportation, livestock, or an obstacle depending on where a run takes you.",
    book: CORE,
    data: {
      description: "Mundane Critter. A horse.",
      physicalMonitor: 10,
      stunMonitor: 10,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 9,
      initiative: initiative(7, 1),
      combat: [
        "B8 A2 R3 S7 W2 L2 I4 C2 ESS6",
        "AC: A1, I2",
        "Skills: Athletics 7, Close Combat 1, Perception 3",
        "Powers: Armor 1, Enhanced Senses (Hearing), Natural Weapon",
        "Attack: Kick: DV 3S, Attack Ratings 10/—/—/—/—",
      ].join("\n"),
      notes: SHARED_CM_NOTE,
    },
  },
  {
    id: "npc-critter-shark",
    name: "Shark",
    group: "Mundane Critters",
    summary: "A shark - a serious threat to anyone in the water, armored hide and all.",
    book: CORE,
    data: {
      description: "Mundane Critter. A shark.",
      physicalMonitor: 16,
      stunMonitor: 16,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 11,
      initiative: initiative(9, 1),
      combat: [
        "B5 A3 R5 S5 W2 L1 I4 C1 ESS6",
        "AC: A1, I2",
        "MOVE: 5/30/+3 (swimming)",
        "Skills: Athletics 6 (Swimming +2), Close Combat 8, Influence 5 (Intimidation +2), Perception 6 (Smell +2)",
        "Powers: Enhanced Senses (Smell), Hardened Armor 6, Natural Weapon",
        "Attack: Bite: DV 4P, Attack Ratings 10/—/—/—/—",
      ].join("\n"),
      notes: SHARED_CM_NOTE,
    },
  },
  {
    id: "npc-critter-wolf",
    name: "Wolf",
    group: "Mundane Critters",
    summary: "A wolf - pack hunter, territorial, easy to train as a guard animal.",
    book: CORE,
    data: {
      description: "Mundane Critter. A wolf.",
      physicalMonitor: 10,
      stunMonitor: 10,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 6,
      initiative: initiative(9, 2),
      combat: [
        "B4 A3 R5 S4 W2 L2 I4 C3 ESS6",
        "AC: A1, I3",
        "Skills: Athletics 5, Close Combat 4, Influence 2 (Intimidation +2), Outdoors 6, Perception 5 (Smell +2), Stealth 5",
        "Powers: Armor 2, Enhanced Senses (Hearing, Smell), Natural Weapon",
        "Attack: Claws/Bite: DV 2P, Attack Ratings 9/—/—/—/—",
      ].join("\n"),
      notes: SHARED_CM_NOTE,
    },
  },

  // --- Awakened Critters (book p. 216-219) ---
  {
    id: "npc-critter-barghest",
    name: "Barghest",
    group: "Awakened Critters",
    summary: "A metaspecies of the English mastiff - hunts alone or in pairs, packs of a dozen or more off-season.",
    book: CORE,
    data: {
      description: "Awakened Critter. A metaspecies of the English mastiff; corps have tried using them as guard animals, with mixed results.",
      physicalMonitor: 12,
      stunMonitor: 12,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 11,
      initiative: initiative(10, 2),
      combat: [
        "B7 A4 R5 S5 W3 L2 I5 C5 M6 ESS6",
        "AC: A1, I3",
        "Skills: Astral 4, Athletics 5, Close Combat 8, Influence 5 (Intimidation +2), Outdoors 6, Perception 6",
        "Powers: Armor 4, Dual Natured, Enhanced Senses (Hearing, Smell, Sonar), Fear, Immunity (Barghest Howls), Natural Weapon, Paralyzing Howl",
        "Attack: Claws/Bite: DV 3P, Attack Ratings 10/—/—/—/—",
      ].join("\n"),
      notes: SHARED_CM_NOTE,
    },
  },
  {
    id: "npc-critter-basilisk",
    name: "Basilisk",
    group: "Awakened Critters",
    summary: "A metaspecies of the komodo dragon - heavily armored, and its gaze petrifies.",
    book: CORE,
    data: {
      description: "Awakened Critter. A metaspecies of the komodo dragon; petrifies with its own gaze.",
      physicalMonitor: 11,
      stunMonitor: 11,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 13,
      initiative: initiative(6, 1),
      combat: [
        "B6 A2 R3 S6 W4 L1 I3 C4 M6 ESS6",
        "AC: A1, I2",
        "MOVE: 5/10/+1 (10/20/+2 swimming)",
        "Skills: Athletics 5 (Swimming +2), Close Combat 6, Perception 4, Stealth 3",
        "Powers: Armor 7, Natural Weapon, Petrification",
        "Weaknesses: Vulnerability (Own Gaze)",
        "Attack: Claws/Bite: DV 3P, Attack Ratings 9/—/—/—/—",
      ].join("\n"),
      notes: SHARED_CM_NOTE,
    },
  },
  {
    id: "npc-critter-cerberus-hound",
    name: "Cerberus Hound",
    group: "Awakened Critters",
    summary: "A three-headed hunter that runs prey down over long distances and rarely gives up the chase.",
    book: CORE,
    data: {
      description: "Awakened Critter. Three-headed pack hunter; sometimes trained for corporate security tracking work.",
      physicalMonitor: 15,
      stunMonitor: 15,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 12,
      initiative: initiative(11, 2),
      combat: [
        "B6 A4 R5 S6 W4 L2 I6 C3 M5 ESS6",
        "AC: A2, I3",
        "Skills: Athletics 6, Close Combat 9, Influence 5 (Intimidation +2), Outdoors 8, Perception 6",
        "Powers/Qualities: Armor 6, Built Tough 4, Concealment (Self), Corrosive Spit, Enhanced Senses (Hearing, Smell, Sonar), Fear, Immunity (Cold, Fire), Movement (Self), Natural Weapon, Search",
        "Attack: Claws/Bite: DV 4P, Attack Ratings 11/—/—/—/—",
      ].join("\n"),
      notes: SHARED_CM_NOTE,
    },
  },
  {
    id: "npc-critter-cockatrice",
    name: "Cockatrice",
    group: "Awakened Critters",
    summary: "A metaspecies of the chicken - hunts in packs, paralyzes prey with its tail before tearing in.",
    book: CORE,
    data: {
      description: "Awakened Critter. A metaspecies of the chicken; popular imprinted security critter for corps.",
      physicalMonitor: 10,
      stunMonitor: 10,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 4,
      initiative: initiative(5, 2),
      combat: [
        "B3 A4 R3 S3 W1 L2 I1 C5 M6 ESS6",
        "AC: A1, I3",
        "Skills: Athletics 7, Close Combat 7, Perception 3, Stealth 5",
        "Powers: Armor 1, Immunity (own touch), Natural Weapon, Paralyzing Touch (Tail)",
        "Attack: Claws: DV 2P, Attack Rating 6/—/—/—/—",
      ].join("\n"),
      notes: SHARED_CM_NOTE,
    },
  },
  {
    id: "npc-critter-devil-rat",
    name: "Devil Rat",
    group: "Awakened Critters",
    summary: "Hairless, meter-long, nocturnal pack hunters - the mildest of the devil/demon/glitch rat family.",
    book: CORE,
    data: {
      description: "Awakened Critter. Devil/Demon/Glitch Rat family - nocturnal pack hunters, urban worldwide.",
      physicalMonitor: 9,
      stunMonitor: 9,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 1,
      initiative: initiative(10, 1),
      combat: [
        "B1 A4 R5 S1 W2 L1 I5 C4 M4 ESS6",
        "AC: A1, I2",
        "MOVE: 5/10/+1",
        "Skills: Athletics 4 (Climbing +2), Close Combat 5, Perception 4, Stealth 6",
        "Powers: Animal Control (ordinary rats), Concealment (self only), Immunity (toxins), Natural Weapon",
        "Weaknesses: Allergy (Sunlight, Mild)",
        "Attack: Bite: DV 1P, Attack Ratings 6/—/—/—/—",
      ].join("\n"),
      notes: SHARED_CM_NOTE,
    },
  },
  {
    id: "npc-critter-demon-rat",
    name: "Demon Rat",
    group: "Awakened Critters",
    summary: "A subspecies of devil rat, one and a half times the size, with a venomous bite.",
    book: CORE,
    data: {
      description: "Awakened Critter. Devil/Demon/Glitch Rat family - a larger, venomous devil rat subspecies.",
      physicalMonitor: 10,
      stunMonitor: 10,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 5,
      initiative: initiative(10, 2),
      combat: [
        "B3 A4 R5 S3 W3 L2 I5 C5 M6 ESS6",
        "AC: A1, I3",
        "MOVE: 5/10/+1",
        "Skills: Athletics 3 (Climbing +2), Close Combat 6, Perception 5, Stealth 7",
        "Powers: Armor 2, Animal Control (ordinary rats, devil rats, glitch rats), Concealment (self only), Immunity (toxins), Natural Weapon, Venom",
        "Weaknesses: Allergy (sunlight, Severe)",
        "Attack: Bite: DV 2P, Attack Ratings 8/—/—/—/—",
      ].join("\n"),
      notes: SHARED_CM_NOTE,
    },
  },
  {
    id: "npc-critter-glitch-rat",
    name: "Glitch Rat",
    group: "Awakened Critters",
    summary: "A devil rat subspecies whose bite has an unnerving side effect: temporary rotten luck.",
    book: CORE,
    data: {
      description: "Awakened Critter. Devil/Demon/Glitch Rat family - about two-thirds the size of a devil rat, with a Luck-Disruption bite.",
      physicalMonitor: 9,
      stunMonitor: 9,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 1,
      initiative: initiative(7, 1),
      combat: [
        "B1 A3 R4 S0 W2 L1 I3 C2 M6 ESS6",
        "AC: A1, I2",
        "MOVE: 5/10/+1",
        "Skills: Athletics 3 (Climbing +2), Close Combat 3, Perception 4, Stealth 3",
        "Powers/Qualities: Accident, Animal Control (ordinary rats), Immunity (toxins), Luck Disruption*, Natural Weapon",
        "Weaknesses: Allergy (sunlight, Mild)",
        "Attack: Bite: DV 0P, Attack Ratings 4/—/—/—/—",
        "*Luck Disruption (unique): Range LOS(A), Type M, Major Action. Roll Magic + Reaction vs. the target's Edge - a single net hit temporarily gives the target the Bad Luck quality for 1 minute per hit.",
      ].join("\n"),
      notes: SHARED_CM_NOTE,
    },
  },
  {
    id: "npc-critter-ghoul",
    name: "Ghoul",
    group: "Awakened Critters",
    summary: "A metahuman infected with the mildest strain of HMHVV - pitiable, feral hunters of metahuman flesh in packs.",
    book: CORE,
    data: {
      description: "Awakened Critter (Infected). Type-3 HMHVV; feral packs hunt in the barrens and abandoned undercity.",
      physicalMonitor: 13,
      stunMonitor: 10,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 7,
      initiative: initiative(7, 2),
      combat: [
        "B6 A2 R4 S5 W4 L1 I3 C1 M5 (ESS not printed)",
        "AC: A1, I3",
        "MOVE: 12/18/+1",
        "Skills: Astral 5, Athletics 4, Close Combat 7, Perception 5, Stealth 6",
        "Powers/Qualities: Armor 1, Built Tough 2, Dual Natured, Enhanced Senses (Hearing, Smell), Natural Weapon, Sapience",
        "Weaknesses: Allergy (sunlight, Moderate), Dietary Requirement (metahuman flesh), Reduced Senses (blind)",
        "Attack: Claws: DV 3P, Attack Ratings 9/—/—/—/—; Bite: DV 4P, Attack Rating 9, Infection",
      ].join("\n"),
      notes:
        "Physical/Stun Condition Monitor is printed as a genuine split (13/10), not a shared track. Stats given are for a standard human ghoul who's retained most of their intellect - for other metaspecies, use the Metahuman Adjustment Chart and recalculate. Some ghouls are adepts, magicians, or mystic adepts; feral ones increase all physical attributes and decrease all mental attributes by 1.",
    },
  },
  {
    id: "npc-critter-hell-hound",
    name: "Hell Hound",
    group: "Awakened Critters",
    summary: "A metaspecies of German shepherd wreathed in fire immunity - popular as a security animal.",
    book: CORE,
    data: {
      description: "Awakened Critter. A metaspecies of German shepherd; fire-immune pack hunter used as a security animal.",
      physicalMonitor: 11,
      stunMonitor: 11,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 10,
      initiative: initiative(9, 2),
      combat: [
        "B6 A4 R5 S4 W3 L2 I4 C3 M5 ESS6",
        "AC: A1, I3",
        "Skills: Astral 5, Athletics 7, Close Combat 4, Influence 4 (Intimidation +2), Outdoors 5, Perception 3, Stealth 5",
        "Powers: Armor 4, Dual Natured, Elemental Attack (Fire), Enhanced Senses (Hearing, Low-light Vision), Fear, Immunity (Fire), Natural Weapon",
        "Attack: Bite: DV 3P, Attack Ratings 9/—/—/—/—",
      ].join("\n"),
      notes: SHARED_CM_NOTE,
    },
  },
  {
    id: "npc-critter-vampire",
    name: "Vampire",
    group: "Awakened Critters",
    summary: "A human infected with HMHVV Type-1 - regenerating, shapeshifting, and dependent on metahuman blood.",
    book: CORE,
    data: {
      description: "Awakened Critter (Infected). Type-1 HMHVV (Harz-Greenbaum strain); \"average\" vampire baseline.",
      physicalMonitor: 10,
      stunMonitor: 10,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 3,
      initiative: initiative(7, 2),
      combat: [
        "B3 A2 R4 S3 W3 L2 I3 C4 M* ESS 2D6",
        "AC: A1, I3",
        "MOVE: 15/20/+2",
        "Skills: Athletics 7, Close Combat 7, Perception 8, Stealth 7",
        "Powers: Dual Natured, Enhanced Senses (Hearing, Smell, Thermographic Vision), Essence Drain, Immunity (age, pathogens, toxins), Infection, Mist Form, Natural Weapon (bite), Regeneration, Sapience",
        "Weaknesses: Allergy (sunlight, Severe), Allergy (wood, Severe), Dietary Requirement (metahuman blood), Essence Loss, Induced Dormancy (Lack of Air, [Essence] Minutes)",
        "Attack: Bite: DV 3P, Attack Ratings 7/—/—/—/—",
        "Defense Rating: 3 + worn Armor.",
      ].join("\n"),
      notes:
        "Physical/Stun Condition Monitor is printed as a genuine split (10/10), not a shared track. Some vampires are adepts, magicians, or mystic adepts and always have a Magic rating whether magically active or not (*starting Magic = 6 or Essence, whichever is lower). Can only consume blood - Nauseated status within a minute otherwise; drains 1 Essence from a victim monthly. -4 dice pool to swimming tests. Sunlight-Allergy damage can't be healed by Regeneration.",
    },
  },

  // --- Dracoforms (book p. 219-220) ---
  {
    id: "npc-critter-eastern-dragon",
    name: "Eastern Dragon",
    group: "Dracoforms",
    summary: "Long, serpentine, and colorful, native to eastern Asia - intelligent, devious, and possibly immortal.",
    book: CORE,
    data: {
      description: "Dracoform. Native to eastern Asia; colorful and serpentine, ~30m long.",
      physicalMonitor: 17,
      stunMonitor: 13,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 26,
      initiative: initiative(15, 3),
      combat: [
        "B16 A7 R7 S30 W9 L10 I8 C9 M10 ESS10",
        "AC: A2, I3",
        "MOVE: 5/15/+2 (20/30/+4 flying)",
        "Defense: 26 Physical / 19 Mystic (Armor (Phys/Myst): 10H/10H)",
        DRAGON_COMMON_SKILLS,
        DRAGON_COMMON_POWERS,
        DRAGON_INDIVIDUAL_POWERS,
        "Attack: Claws/Bite: DV 15P, Attack Ratings 37/—/—/—/—",
      ].join("\n"),
      notes: `Physical/Stun Condition Monitor is printed as a genuine split (17/13), not a shared track. Sirrush (an Asia Minor variant, ~25m, longer limbs, shorter tail, earth-toned) is identical to an Eastern Dragon in game statistics. ${DRAGON_NOTE}`,
    },
  },
  {
    id: "npc-critter-western-dragon",
    name: "Western Dragon",
    group: "Dracoforms",
    summary: "The largest dragon species, from Europe and western Asia - four legs plus wings, heavy armored scales.",
    book: CORE,
    data: {
      description: "Dracoform. Native to Europe/western Asia; the largest dragon species, over 37m long.",
      physicalMonitor: 19,
      stunMonitor: 12,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 30,
      initiative: initiative(16, 2),
      combat: [
        "B20 A7 R8 S40 W8 L8 I8 C8 M10 ESS10",
        "AC: A2, I2",
        "MOVE: 10/20/+2 (20/30/+4 flying)",
        "Defense: 30 Physical / 18 Mystic (Armor (Phys/Myst): 10H/10H)",
        DRAGON_COMMON_SKILLS,
        DRAGON_COMMON_POWERS,
        DRAGON_INDIVIDUAL_POWERS,
        "Attack: Claws/Bite: DV 20P, Attack Rating 48/—/—/—/—",
      ].join("\n"),
      notes: `Physical/Stun Condition Monitor is printed as a genuine split (19/12), not a shared track. ${DRAGON_NOTE}`,
    },
  },
  {
    id: "npc-critter-feathered-serpent",
    name: "Feathered Serpent",
    group: "Dracoforms",
    summary: "A feathered, winged dragon of South/Central American and African myth - dexterous, opposable-thumbed paws.",
    book: CORE,
    data: {
      description: "Dracoform. Feathered and winged, ~20m long, from South/Central American and African myth; printed as \"feathered spirit\" in its stat block.",
      physicalMonitor: 15,
      stunMonitor: 13,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 24,
      initiative: initiative(19, 2),
      combat: [
        "B14 A8 R10 S25 W10 L8 I9 C8 M10 ESS10",
        "AC: A2, I3",
        "MOVE: 5/15/+1 (25/40/+5 flying)",
        "Defense: 24 Physical / 10 Mystic (Armor (Phys/Myst): 10H/10H)",
        DRAGON_COMMON_SKILLS,
        DRAGON_COMMON_POWERS,
        DRAGON_INDIVIDUAL_POWERS,
        "Attack: Claws/Bite: DV 13P, Attack Rating 35/—/—/—/—",
      ].join("\n"),
      notes: `Physical/Stun Condition Monitor is printed as a genuine split (15/13), not a shared track. ${DRAGON_NOTE}`,
    },
  },
];
