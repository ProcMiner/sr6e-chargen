// NPC template catalog for the GM's Bar NPC roster (see npcs.ts route,
// client/src/npc.ts's NpcData, client/src/pages/play/NpcRoster.tsx). Unlike
// every other catalog in this project, these don't feed the character
// builder - they're pre-built stat blocks a GM can drop straight into their
// own NPC library. This file covers the Grunts/Prime Runners chunk; see
// critters.ts for the Critters chapter (same NpcTemplateEntry shape).
//
// Transcribed from SR6_Core_RuleBook_noimg.pdf, "Non-Player Characters
// (NPCs)" section, book pp. 203-211: the Grunts framework, organized by
// Professional Rating 0-10 (Untrained through Elite), each rating printing
// a named category with a base grunt and a specialized lieutenant (decker,
// mage, rigger, technomancer, or adept variant) - except Professional
// Rating 7, which the book prints with only one example, no lieutenant.
// Stat-block numbers (attributes, Defense Rating, Initiative, Condition
// Monitor, Skills, Gear, Weapons, Augmentations, Spells, Powers, Complex
// Forms) are transcribed as printed; category/flavor text is paraphrased in
// our own words, same convention as every other catalog file in this
// project. 21 entries total.
//
// Known gaps, flagged rather than guessed at:
// - The book explicitly notes grunts (and every NPC printed in this
//   section, including the two Prime Runner stat blocks) track ONE
//   combined Condition Monitor rather than separate Physical/Stun tracks
//   like a PC (p. 204: "grunts only have a single Condition Monitor,
//   tracking both Physical and Stun damage all in one place"). NpcData
//   models two separate tracks (matching PC-style Live Play tracking), so
//   both physicalMonitor and stunMonitor below are set to the same printed
//   CM value, with a note in each entry's `notes` field explaining the two
//   trackers should be treated as one shared pool - not a data-model change,
//   just a documented mapping limitation, consistent with npc.ts's existing
//   "lightweight, mostly free-text" design. (Some Critters instead print a
//   genuine Physical/Stun split - see critters.ts.)
// - The book's separate "Sample Contacts" section (p. 211+: Bartender,
//   Fixer, Mr. Johnson, etc.) has no Defense Rating/Condition
//   Monitor/weapons at all ("no gear or gear stats are included," per the
//   book's own text) - these are roleplay contacts, not combat NPCs, and
//   don't fit this roster's shape. Not transcribed here; belongs with a
//   future Contacts feature instead (see README's "Contact purchasing UI"
//   gap).
// - Firing Squad's "Fighting Forces" chapter is now covered too - see
//   firingSquadCritters.ts (35 entries). Collapsing Now was surveyed
//   (~40+ more NPC-shaped stat blocks) but not yet transcribed - a future
//   chunk. Power Plays (Corp Info) has no stat-block-formatted NPCs at
//   all.

export interface NpcTemplateEntry {
  id: string;
  name: string;
  /** Pre-formatted display label for the "Import from book" UI's grouping headers, e.g. "Professional Rating 0 - Thugs and Mobs" or "Mundane Critters". Deliberately a single free-text field (not a separate rating+category pair) so entries from different book sections/sourcebooks with no shared taxonomy can still group sensibly. */
  group: string;
  summary: string;
  book: string;
  data: {
    description: string;
    physicalMonitor: number;
    stunMonitor: number;
    physicalDamage: number;
    stunDamage: number;
    armor: number;
    initiative: string;
    combat: string;
    notes: string;
  };
}

const CORE = "Core Rulebook";

/** Grunt bail-behavior text by Professional Rating tier, paraphrased from p. 203-204. */
function bailNote(pr: number): string {
  if (pr === 0) return "Turns tail and runs the moment anyone in the group goes down.";
  if (pr <= 4) return "Breaks and retreats if the group loses more than a quarter of its number.";
  if (pr <= 7) return "Makes a tactical withdrawal (not a rout) if the group takes over half casualties.";
  return "Will not break - fights to the last or until ordered to withdraw.";
}

function cmNote(pr: number): string {
  return `Condition Monitor is ONE combined Physical+Stun track per SR6's grunt rules (core rulebook p. 204) - treat the Physical and Stun trackers below as a single shared pool, not two separate ones. Professional Rating ${pr}: ${bailNote(pr)}`;
}

function group(professionalRating: number, category: string): string {
  return `Professional Rating ${professionalRating} - ${category}`;
}

/** "X/Y" printed Initiative rank/Initiative Dice -> "X + Yd6". */
function initiative(rank: number, dice: number): string {
  return `${rank} + ${dice}d6`;
}

export const coreNpcTemplates: NpcTemplateEntry[] = [
  // --- Professional Rating 0: Thugs and Mobs (book p. 204) ---
  {
    id: "npc-humanis-goon",
    name: "Humanis Goon",
    group: group(0, "Thugs and Mobs"),
    summary: "Untrained street muscle who intimidate for money or a cause - real combatants break them fast.",
    book: CORE,
    data: {
      description: "Professional Rating 0 - Thugs and Mobs. Untrained brute relying on size and anger to intimidate; folds against any real combatant.",
      physicalMonitor: 9,
      stunMonitor: 9,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 2,
      initiative: initiative(4, 1),
      combat: [
        "B2 A2 R2 S2 W2 L2 I2 C1 ESS6",
        "AC: A1, I2",
        "Skills: Athletics 1, Close Combat 3, Influence 1 (Intimidation +2)",
        "Gear: Commlink (Device Rating 1)",
        "Weapons: Club [Club, DV 3S, Attack Ratings 6/—/—/—/—]",
      ].join("\n"),
      notes: cmNote(0),
    },
  },
  {
    id: "npc-terrafirst-shaman",
    name: "TerraFirst! Shaman (Magic)",
    group: group(0, "Thugs and Mobs"),
    summary: "The lieutenant tier of the angry-mob archetype - a mob with a magically active member backing it up.",
    book: CORE,
    data: {
      description: "Professional Rating 0 lieutenant - Thugs and Mobs. Adds basic combat spells to an otherwise untrained mob.",
      physicalMonitor: 10,
      stunMonitor: 10,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 1,
      initiative: initiative(4, 1),
      combat: [
        "B1 A2 R3 S2 W3 L2 I2 C2 M2 ESS6",
        "AC: A1, I2",
        "Skills: Astral 2, Conjuring 2, Sorcery 2",
        "Spells: Acid Stream, Antidote, Blast, Cleansing Heal",
        "Gear: Commlink (Device Rating 1)",
      ].join("\n"),
      notes: cmNote(0),
    },
  },

  // --- Professional Rating 1: Gangers and Mob Muscle (book p. 204-205) ---
  {
    id: "npc-eye-fiver-go-ganger",
    name: "Eye-Fiver Go-ganger",
    group: group(1, "Gangers and Mob Muscle"),
    summary: "Street gangers and go-gangers - a step above an angry mob, with a rep and a little more discipline.",
    book: CORE,
    data: {
      description: "Professional Rating 1 - Gangers and Mob Muscle. A step above an angry mob, still just a ganger.",
      physicalMonitor: 9,
      stunMonitor: 9,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 3,
      initiative: initiative(4, 1),
      combat: [
        "B2 A2 R2 S2 W2 L2 I2 C1 ESS6",
        "AC: A1, I2",
        "Skills: Athletics 2, Close Combat 3, Firearms 2, Influence 3 (Intimidation +2), Perception 1, Piloting 2",
        "Gear: Commlink (Device Rating 1), gang leathers (Defense Rating +1)",
        "Weapons: Bike chain [Club, DV 4P, Attack Ratings 7/—/—/—/—]; Streetline Special [Hold-out, DV 2P, SS, Attack Ratings 8/8/—/—/—]",
      ].join("\n"),
      notes: cmNote(1),
    },
  },
  {
    id: "npc-mafia-debt-collector",
    name: "Mafia Debt Collector (Augmented)",
    group: group(1, "Gangers and Mob Muscle"),
    summary: "Knee-breakers and debt collectors for crime syndicates - a little cyber-augmented weight behind the threats.",
    book: CORE,
    data: {
      description: "Professional Rating 1 lieutenant - Gangers and Mob Muscle. Syndicate muscle with light augmentation.",
      physicalMonitor: 10,
      stunMonitor: 10,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 7,
      initiative: initiative(4, 1),
      combat: [
        "B2 A2 R2 S2 W2 L2 I2 C1 ESS4.9",
        "AC: A1, I2",
        "Skills: Athletics 2, Biotech 1, Close Combat 4, Firearms 2, Perception 3",
        "Augmentations: Bone Lacing (Plastic), Dermal Plating 2",
        "Gear: Armor clothing (+2), Commlink (Device Rating 2)",
        "Weapons: Beretta 201T [Light Pistol, DV 2P, SA/FA, Attack Ratings 9/8/6/—/—, w/ detachable shoulder stock]; Club [Club, DV 3S, Attack Ratings 6/—/—/—/—]",
      ].join("\n"),
      notes: cmNote(1),
    },
  },

  // --- Professional Rating 2: militant gangs/policlubs (book p. 205) ---
  {
    id: "npc-sons-of-sauron-brute",
    name: "Sons of Sauron Brute (Ork Adjustments Applied)",
    group: group(2, "Militant Gangs"),
    summary: "Professional gangs and militant policlub muscle - more time under fire, but still not pros.",
    book: CORE,
    data: {
      description: "Professional Rating 2 - Militant Gangs. Professional gang muscle, ork metatype adjustments already applied.",
      physicalMonitor: 10,
      stunMonitor: 10,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 4,
      initiative: initiative(4, 1),
      combat: [
        "B3 A2 R2 S4 W2 L1 I2 C1 ESS6",
        "AC: A1, I2",
        "Skills: Athletics 2, Close Combat 4, Firearms 3, Influence 5 (Intimidation +2), Perception 3",
        "Gear: Armor clothing (+2), commlink (Device Rating 2)",
        "Weapons: Beretta 101T [Light Pistol, DV 2P, SA, Attack Ratings 9/8/6/—/—]; Knucks [Unarmed, DV 3P, Attack Ratings 6/—/—/—/—]",
      ].join("\n"),
      notes: cmNote(2),
    },
  },
  {
    id: "npc-cutters-data-harvester",
    name: "Cutters Data Harvester (Decker)",
    group: group(2, "Militant Gangs"),
    summary: "A gang's own decker, running just enough Matrix support to back up the muscle.",
    book: CORE,
    data: {
      description: "Professional Rating 2 lieutenant - Militant Gangs. Gang decker support.",
      physicalMonitor: 12,
      stunMonitor: 12,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 2,
      initiative: initiative(6, 1),
      combat: [
        "B3 A2 R3 S1 W4 L4 I4 C1 ESS4.9",
        "AC: A1, I2",
        "Skills: Close Combat 2, Con 1, Cracking 3, Electronics 3, Firearms 2, Influence 1, Perception 2, Stealth 1",
        "Augmentations: Cyberjack 1 (DR 1, D 4, F 3, +1 IS/ID/I), cybereyes (Rating 1, w/ image link, camera, low-light)",
        "Gear: Commlink (DR 3), Erika MCD-6 cyberdeck (DR 1, A/S 4/3, Program slots 2), gang leathers (+1)",
        "Weapons: Combat knife [Blade, DV 4P, Attack Ratings 8/2*/—/—/—, *max range 15m]; Fichetti Security 600 [Light Pistol, DV 2P, SA, Attack Ratings 10/9/6/—/—, w/ detachable folding stock, laser sight]",
      ].join("\n"),
      notes: cmNote(2),
    },
  },

  // --- Professional Rating 3: beat cops and basic corpsec (book p. 206) ---
  {
    id: "npc-lone-star-patrolman",
    name: "Lone Star Patrolman",
    group: group(3, "Beat Cops and Corporate Security"),
    summary: "Trained but green - one of the most frequently encountered opponents for a shadowrunner.",
    book: CORE,
    data: {
      description: "Professional Rating 3 - Beat Cops and Corporate Security. Trained, standard-issue street cop.",
      physicalMonitor: 10,
      stunMonitor: 10,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 6,
      initiative: initiative(6, 1),
      combat: [
        "B3 A3 R3 S3 W3 L2 I3 C2 ESS6",
        "AC: A1, I2",
        "Skills: Athletics 1, Biotech 1, Close Combat 4, Con 1, Electronics 1, Firearms 4, Influence 2, Perception 4, Piloting 2",
        "Gear: Armor vest (+3), commlink (Device Rating 3), 2 x jazz inhalers (+1 Reaction, +2 Initiative, +2 Initiative Dice)",
        "Weapons: Colt America L36 [Light Pistol, DV 2P, SA, Attack Ratings 8/8/6/—/—]; Stun baton [Club, DV 5S(e), Attack Ratings 6/—/—/—/—]",
      ].join("\n"),
      notes: cmNote(3),
    },
  },
  {
    id: "npc-minuteman-security-rigger",
    name: "Minuteman Security Rigger",
    group: group(3, "Beat Cops and Corporate Security"),
    summary: "Basic corporate security's drone/vehicle support - a step above a beat cop's own gear.",
    book: CORE,
    data: {
      description: "Professional Rating 3 lieutenant - Beat Cops and Corporate Security. Rigger support with a drone/vehicle loadout.",
      physicalMonitor: 13,
      stunMonitor: 13,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 5,
      initiative: initiative(9, 1),
      combat: [
        "B2 A3 R4(5) S2 W4 L4 I4 C1 ESS4.6",
        "AC: A1, I2",
        "Skills: Athletics 1, Close Combat 2, Cracking 4, Electronics 3, Engineering 4, Firearms 3, Influence 1, Outdoors 2, Perception 3, Piloting 4, Stealth 2",
        "Augmentations: Datajack, Control Rig 1, Reaction Enhancer 1",
        "Gear: Armor vest (+3), commlink (DR 4), Horizon Overseer RCC (DR 4, D 5, F 4), MCT-Nissan Rotodrone (w/ AK-97), 2 x Horizon Flying Eye, Chrysler-Nissan Pursuit V, GMC Bulldog",
        "Weapons: Ares Light Fire 70 [Light Pistol, DV 2P, SA, Attack Ratings 10/7/6/—/—, w/ laser sight]; Telescoping staff [Club, DV 4S, Attack Ratings 8/—/—/—/—]",
      ].join("\n"),
      notes: cmNote(3),
    },
  },

  // --- Professional Rating 4: Organized Crime Gang (book p. 207) ---
  {
    id: "npc-mafia-soldato",
    name: "Mafia Soldato",
    group: group(4, "Organized Crime Gang"),
    summary: "Syndicate soldiers who fight dirty and hard - honor, face, and rep on the line.",
    book: CORE,
    data: {
      description: "Professional Rating 4 - Organized Crime Gang. Syndicate soldier.",
      physicalMonitor: 10,
      stunMonitor: 10,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 4,
      initiative: initiative(4, 1),
      combat: [
        "B3 A2 R2 S3 W2 L1 I2 C1 ESS6",
        "AC: A1, I2",
        "Skills: Athletics 3, Biotech 2, Close Combat 5, Con 3, Firearms 4, Influence 4 (Intimidation +2), Perception 4, Piloting 1",
        "Gear: Armor clothing (+2), commlink (Device Rating 3)",
        "Weapons: Beretta 101T [Light Pistol, DV 2P, SA, Attack Ratings 9/8/6/—/—]; Sap [Club, DV 2S, Attack Ratings 6/—/—/—/—]",
      ].join("\n"),
      notes: cmNote(4),
    },
  },
  {
    id: "npc-yakuza-blademaster",
    name: "Yakuza Blademaster (Adept)",
    group: group(4, "Organized Crime Gang"),
    summary: "An adept enforcer bringing real martial skill to back a crime syndicate's soldiers.",
    book: CORE,
    data: {
      description: "Professional Rating 4 lieutenant - Organized Crime Gang. Adept blade specialist.",
      physicalMonitor: 14,
      stunMonitor: 14,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 6,
      initiative: initiative(8, 2),
      combat: [
        "B3 A5(6) R4(5) S3 W3 L2 I3 C2 M4 ESS6",
        "AC: A1, I3",
        "Skills: Astral 2, Athletics 4, Close Combat 5(6) (Blades +2), Outdoors 2 (Tracking +2), Perception 4, Stealth 5",
        "Powers: Astral Perception, Improved Close Combat 1, Improved Agility 1, Improved Reflexes 1",
        "Gear: Armor vest (+3), commlink (Device Rating 4)",
        "Weapons: Katana [Blade, DV 4P, Attack Ratings 10/—/—/—/—]",
      ].join("\n"),
      notes: cmNote(4),
    },
  },

  // --- Professional Rating 5: Police/Corporate SWAT (book p. 207-208) ---
  {
    id: "npc-lone-star-combat-mage",
    name: "Lone Star Combat Mage",
    group: group(5, "Police/Corporate SWAT"),
    summary: "Trained, tactical, and magically active - SWAT-tier teams that make order from a runner's chaos.",
    book: CORE,
    data: {
      description: "Professional Rating 5 - Police/Corporate SWAT. Magically active tactical support.",
      physicalMonitor: 10,
      stunMonitor: 10,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 9,
      initiative: initiative(8, 1),
      combat: [
        "B3 A4 R4 S2 W4 L4 I4 C4 M5 ESS6",
        "AC: A1, I2",
        "Skills: Astral 4, Athletics 2, Biotech 2, Close Combat 2, Conjuring 4, Electronics 1, Enchanting 2, Firearms 3, Influence 2 (Intimidation +2), Perception 4, Piloting 1, Sorcery 5, Stealth 2",
        "Spells: Armor, Blast, Clairvoyance, Clout, Combat Sense, Confusion, Detect Enemies, Detect Magic, Heal, Levitate, Light, Physical Barrier, Stunbolt",
        "Gear: Commlink (DR 4), full body armor w/ helmet (+7)",
        "Weapons: Colt America L36 [Light Pistol, DV 2P, SA, Attack Ratings 9/9/6/—/—, w/ laser sight]; Stun baton [Club, DV 5S(e), Attack Ratings 6/—/—/—/—]",
      ].join("\n"),
      notes: cmNote(5),
    },
  },
  {
    id: "npc-docwagon-htr-support-engineer",
    name: "DocWagon HTR Support Engineer (Technomancer)",
    group: group(5, "Police/Corporate SWAT"),
    summary: "Technomancer Matrix support riding along with a High Threat Response team.",
    book: CORE,
    data: {
      description: "Professional Rating 5 lieutenant - Police/Corporate SWAT. Technomancer Matrix support.",
      physicalMonitor: 17,
      stunMonitor: 17,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 6,
      initiative: initiative(9, 1),
      combat: [
        "B2 A2 R4 S2 W5 L5 I5 C4 RS6 ESS6",
        "AC: A1, I2",
        "Skills: Athletics 2, Biotech 3, Close Combat 3, Con 4, Cracking 6, Electronics 6, Engineering 3, Firearms 4, Influence 2, Outdoors 3 (Tracking +2), Perception 5, Piloting 6, Stealth 4, Tasking 5",
        "Complex Forms: Diffusion of Attack, Diffusion of Firewall, Infusion of Attack, Infusion of Firewall, Machine Mind, Pulse Storm, Resonance Spike, Stitches, Tattletale",
        "Gear: Armor jacket (+4), commlink (Device Rating 4)",
        "Weapons: Colt Government 2076 [Heavy Pistol, DV 3S, SA, Attack Ratings 11/9/6/—/—, w/ laser sight, gel ammo]; Shock gloves [Close Combat, DV 4S(e), Attack Ratings 5/—/—/—/—]",
      ].join("\n"),
      notes: cmNote(5),
    },
  },

  // --- Professional Rating 6: DocWagon HTR-tier response (book p. 207-208) ---
  {
    id: "npc-docwagon-htr-officer",
    name: "DocWagon HTR Officer",
    group: group(6, "DocWagon HTR-Tier Response"),
    summary: "Trained and exposed to live fire almost daily - driven to complete the assignment, not just survive.",
    book: CORE,
    data: {
      description: "Professional Rating 6 - DocWagon HTR-Tier Response. Heavily augmented HTR officer.",
      physicalMonitor: 11,
      stunMonitor: 11,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 14,
      initiative: initiative(9, 3),
      combat: [
        "B4 A4(6) R5(7) S4(6) W5 L3 I4 C3 ESS2.24",
        "AC: A1, I4",
        "Skills: Athletics 4 (Throwing +2), Biotech 4 (First Aid +2), Close Combat 6, Electronics 2, Firearms 5, Influence 4 (Intimidation +2), Perception 6, Piloting 3, Stealth 3",
        "Augmentations: Cyberears (alphaware, Rating 2 w/ audio enhancement, damper, sound link, select sound filter 2), cybereyes (alphaware, Rating 2 w/ image link, camera, smartlink), dermal plating 3, muscle replacement 2, wired reflexes 2",
        "Gear: Commlink (Device Rating 4), 6 x flashpaks, full body armor w/ helmet (+7), 2 x smoke grenades",
        "Weapons: Ares Alpha [Rifle, DV 4P, SA/BF/FA, Attack Ratings 4/10/9/7/2, w/ smartgun, underbarrel grenade launcher]; Colt Manhunter [Heavy Pistol, DV 3P, SA, Attack Ratings 12/10/8/—/—, w/ smartgun, gel ammo]; Stun baton [Club, DV 5S(e), Attack Ratings 6/—/—/—/—]; 4 x stun grenades (DV 10S/8S/6S; Blast 15m)",
      ].join("\n"),
      notes: cmNote(6),
    },
  },
  {
    id: "npc-seraphim-avenging-angel",
    name: "Seraphim Avenging Angel (Adept)",
    group: group(6, "DocWagon HTR-Tier Response"),
    summary: "An initiated adept enforcer, kinesics and vocal control layered onto serious combat ability.",
    book: CORE,
    data: {
      description: "Professional Rating 6 lieutenant - DocWagon HTR-Tier Response. Initiated adept.",
      physicalMonitor: 20,
      stunMonitor: 20,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 10,
      initiative: initiative(10, 4),
      combat: [
        "B6 A5(7) R5(8) S5 W5 L4 I5 C4 M8 ESS6",
        "AC: A1, I5",
        "Skills: Astral 5, Athletics 8, Biotech 3, Close Combat 8, Con 6, Electronics 3, Firearms 7 (SMG +2), Influence 5, Outdoors 6, Perception 7, Piloting 4, Stealth 6",
        "Powers: Combat Sense 2, Enhanced Perception, Improved Agility 2, Improved Reflexes 3, Kinesics, Vocal Control",
        "Initiate Grade: 2. Metamagics: Flexible signature, masking",
        "Gear: Armor jacket (+4), commlink (Device Rating 6)",
        "Weapons: Ares Light Fire 75 [Light Pistol, DV 3P, SA, Attack Ratings 10/7/6/—/—, w/ barrel-mounted silencer, laser sight, explosive ammo]; FN P93 Praetor [Submachine Gun, DV 4P, SA/BF, Attack Ratings 8/11/6/—/—, w/ rigid stock, laser sight, flashlight, silencer]; Telescoping staff [Club, DV 4S, Attack Ratings 8/—/—/—/—]",
      ].join("\n"),
      notes: cmNote(6),
    },
  },

  // --- Professional Rating 7: Elite Corporate Security (book p. 208) ---
  {
    id: "npc-renraku-red-samurai",
    name: "Renraku Red Samurai",
    group: group(7, "Elite Corporate Security"),
    summary: "Trained, disciplined, and loyal to the corp above everything else - the book prints only this one example at this tier, no lieutenant.",
    book: CORE,
    data: {
      description: "Professional Rating 7 - Elite Corporate Security. Heavily augmented corporate elite guard.",
      physicalMonitor: 11,
      stunMonitor: 11,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 16,
      initiative: initiative(10, 3),
      combat: [
        "B5 A5(8) R5(7) S4(7) W4 L4 I5 C4 ESS2.05",
        "AC: A1, I4",
        "Skills: Athletics 6 (Throwing +2), Biotech 3, Close Combat 6 (Blades +2), Electronics 3, Firearms 7, Influence 4, Outdoors 5, Perception 6, Piloting 3, Stealth 5",
        "Augmentations: Cybereyes (deltaware, Rating 3 w/ camera, image link, low-light vision, smartlink, vision enhancement), cyberears (deltaware, Rating 2 w/ damper, sound link, audio enhancement, select sound filter 2), muscle augmentation 3, muscle toner 3, orthoskin 4, pain editor, platelet factories, synaptic booster 2",
        "Gear: Commlink (Device Rating 6), full body armor w/ helmet (+7)",
        "Weapons: Ares Predator VI [Heavy Pistol, DV 2P, Attack Ratings 12/12/10/—/—, w/ smartgun, APDS ammo]; Katana [Blade, DV 4P, Attack Ratings 10/—/—/—/—]; SCK Model 100 [Submachine Gun, DV 4P, SA/BF, Attack Ratings 12/12/9/—/—, w/ smartgun, folding stock, explosive ammo]",
      ].join("\n"),
      notes: cmNote(7),
    },
  },

  // --- Professional Rating 8: Special Forces (book p. 208-209) ---
  {
    id: "npc-marine-corps-special-operations-forces",
    name: "Marine Corps Special Operations Forces",
    group: group(8, "Special Forces"),
    summary: "World-class infiltrators and assassins - the definition of a surgical strike.",
    book: CORE,
    data: {
      description: "Professional Rating 8 - Special Forces. Military special operations soldier.",
      physicalMonitor: 11,
      stunMonitor: 11,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 15,
      initiative: initiative(15, 4),
      combat: [
        "B6 A5(8) R6(9) S5(8) W4 L3 I6 C4 ESS1.1",
        "AC: A1, I5",
        "Skills: Athletics 8, Biotech 4, Close Combat 8, Electronics 3, Engineering 2, Firearms 8, Influence 4 (Intimidation +2), Outdoors 4 (Tracking +2), Perception 8, Piloting 4, Stealth 7",
        "Augmentations: Cybereyes (betaware, rating 4, w/ camera, image link, flare compensation, low-light vision, smartlink, thermographic vision, vision enhancement), cyberears (betaware, rating 3 w/ audio enhancement, damper, select sound filter 2, sound link, spatial recognizer), dermal plating 4 (betaware), muscle replacement 3 (betaware), wired reflexes 3 (betaware)",
        "Gear: Armor jacket (+4), commlink (Device Rating 6), helmet (+1)",
        "Weapons: Colt Manhunter [Heavy Pistol, DV 3S, SA, Attack Ratings 12/10/8/—/—, w/ smartlink, gel ammo]; Colt M23 [Rifle, DV 5P, SA/BF/FA Attack Ratings 6/9/9/9/5, w/ explosive ammo, flashlight, smartlink, silencer]; Combat knife [Blade, DV 4P, Attack Ratings 8/2*/—/—/—, *max range 15m]",
      ].join("\n"),
      notes: cmNote(8),
    },
  },
  {
    id: "npc-seal-team-6-counter-electronics-commando",
    name: "SEAL Team 6 Counter-Electronics Commando (Decker)",
    group: group(8, "Special Forces"),
    summary: "Elite military decking support, running a top-tier cyberdeck alongside special-ops firepower.",
    book: CORE,
    data: {
      description: "Professional Rating 8 lieutenant - Special Forces. Military decker.",
      physicalMonitor: 19,
      stunMonitor: 19,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 11,
      initiative: initiative(16, 3),
      combat: [
        "B4 A4 R6(10) S4 W5 L6 I6 C5 ESS0.88",
        "AC: A1, I4",
        "Skills: Athletics 4, Biotech 3, Close Combat 6, Cracking 8, Electronics 8, Engineering 4, Firearms 6, Influence 3 (Intimidation +2), Outdoors 3, Perception 8, Piloting 5, Stealth 5",
        "Augmentations: Cybereyes (alphaware, rating 3 w/ camera, flare compensation, image link, low-light, smartlink, vision enhancement), cyberears (alphaware, rating 3 w/ audio enhancement, damper, select sound filter 2, sound link, spatial recognizer), cyberjack 5 (alphaware, D 8, F 7, +3 IS/ID/I), dermal plating 2, reaction enhancer 2, wired reflexes 2",
        "Gear: Armor jacket (+4), commlink (Device Rating 6), helmet (+1), Shiawase Cyber-6 cyberdeck (Device Rating 5, A 8, S 7, program slots 10)",
        "Weapons: Ares Viper Slivergun [Heavy Pistol, DV 4P(f), SA/BF, Attack Ratings 12/8/6/—/—, w/ built-in silencer, smartgun]; Combat knife [Blade, DV 4P, Attack Ratings 8/2*/—/—/—, *max range 15m]; Ingram Smartgun X [Submachine Gun, DV 3P, SA/BF, Attack Ratings 13/11/8/—/—, w/ smartgun]",
      ].join("\n"),
      notes: cmNote(8),
    },
  },

  // --- Professional Rating 9: Top-Tier Special Forces (book p. 209) ---
  {
    id: "npc-tir-ghost",
    name: "Tír Ghost (Elf Adjustments Applied)",
    group: group(9, "Top-Tier Special Forces"),
    summary: "Fanatical, near-unkillable operatives - replacements aren't found easily, so they don't quit.",
    book: CORE,
    data: {
      description: "Professional Rating 9 - Top-Tier Special Forces. Elf metatype adjustments already applied.",
      physicalMonitor: 11,
      stunMonitor: 11,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 8,
      initiative: initiative(14, 3),
      combat: [
        "B5 A7(11) R6(8) S5(7) W6 L4 I6 C6 ESS1.2",
        "AC: A1, I4",
        "Skills: Athletics 7(8) (Throwing +2), Biotech 4 (First Aid +2), Close Combat 7(8) (Blades +2), Con 4, Electronics 4, Firearms 9(10), Influence 7 (Intimidation +2), Outdoors 6 (Tracking +2), Perception 7, Piloting 5, Stealth 7",
        "Augmentations: Adrenaline pump 2 (+2 Strength/Agility/Reaction/Willpower), muscle augmentation 2, muscle toner 4, platelet factories, pain editor, reflex recorder (Athletics), reflex recorder (Close Combat), reflex recorder (Firearms), sleep regulator, smartlink, synaptic booster 2",
        "Gear: Commlink (Device Rating 4), lined coat (+3)",
        "Weapons: Ares Predator VI [Heavy Pistol, DV 3P, Attack Ratings 11/11/9/—/—, w/ smartgun]; Fragmentation Grenade (DV 16P/12P/8P; Blast 20m); Sword [Blade, DV 3P, Attack Ratings 9/—/—/—/—]; Stun baton [Club, DV 5S(e), Attack Ratings 6/—/—/—/—]; Stun grenade (DV 10S/8S/6S; Blast 15m); Yamaha Raiden [Rifle, DV 3P, SA/BF/FA Attack Ratings 7/14/13/10/5, w/ integral silencer, smartgun, APDS]",
      ].join("\n"),
      notes: cmNote(9),
    },
  },
  {
    id: "npc-delta-force-logistics-support-rigger",
    name: "Delta Force Logistics and Support Rigger (Delta \"Loser\")",
    group: group(9, "Top-Tier Special Forces"),
    summary: "Rigger support fielding an entire vehicle/drone fleet behind a top-tier special forces unit.",
    book: CORE,
    data: {
      description: "Professional Rating 9 lieutenant - Top-Tier Special Forces. Rigger with a full vehicle/drone loadout.",
      physicalMonitor: 20,
      stunMonitor: 20,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 12,
      initiative: initiative(15, 2),
      combat: [
        "B4(6) A4 R6(9) S5 W5 L6 I6 C5 ESS0.84",
        "AC: A1, I3",
        "Skills: Athletics 4, Biotech 4, Close Combat 6, Cracking 9, Electronics 9, Engineering 8, Firearms 7, Influence 4 (Intimidation +2), Outdoors 6 (Tracking +2), Perception 7, Piloting 8 (Aircraft +2), Stealth 7",
        "Augmentations: Bone lacing (aluminum, alphaware), commlink (internal, alphaware, DR 7), control rig 3 (alphaware), cybereyes (alphaware, rating 3; w/ camera, flare compensation, image link, low-light vision, smartlink, vision enhancement), sound link, internal air tank 2, reaction enhancer 2, wired reflexes 1",
        "Gear: Armor jacket (+4), commlink (Device Rating 7)",
        "Vehicles/Drones: Ares Dragon (w/ 4 x Ingram Valiant), Cyberspace Designs Dalmatian, 4 x Cyberspace Designs Quadrotor, 2 x Horizon Flying Eye, 2 x Lockheed Optic-X, MCT-Nissan Rotodrone (w/ 2 x AK-97), 4 x Sikorsky-Bell Microskimmer, Steel Lynx drone (w/ Vindicator minigun)",
        "Weapons: Colt Manhunter [Heavy Pistol, DV 4P, SA, Attack Ratings 12/10/8/—/—, w/ smartgun system, explosive ammo]; Combat knife [Blade, DV 4P, Attack Ratings 8/2*/—/—/—, *max range 15m]",
      ].join("\n"),
      notes: cmNote(9),
    },
  },

  // --- Professional Rating 10: Elite Special Forces / Prime Runners (book p. 210) ---
  {
    id: "npc-sioux-wildcat-combat-specialist",
    name: "Sioux Wildcat Combat Specialist",
    group: group(10, "Elite Special Forces"),
    summary: "Considered the best in the world - intense training, fierce loyalty, and precision discipline.",
    book: CORE,
    data: {
      description: "Professional Rating 10 - Elite Special Forces / Prime Runner. Top-of-the-world combat specialist.",
      physicalMonitor: 12,
      stunMonitor: 12,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 9,
      initiative: initiative(16, 5),
      combat: [
        "B5(7) A6(10) R5(9) S5(9) W5 L4 I6 C5 ESS0.95 (DR 9(11) with augmentations active)",
        "AC: A1, I6",
        "Skills: Athletics 7 (Throwing +2), Biotech 6 (First Aid +2), Close Combat 8 (Blades +2), Con 4, Electronics 4, Engineering 4, Firearms 8 (Automatic Rifles +2), Influence 6 (Intimidation +2), Outdoors 8 (Tracking +2), Perception 7, Piloting 5, Stealth 8",
        "Augmentations: Bone lacing (titanium, deltaware), cyberears (deltaware, rating 5, w/ audio enhancement, balance augmenter, damper, select sound filter 6, sound link, spatial recognizer), cybereyes (deltaware, rating 5, w/ camera, flare compensation, image link, low-light vision, thermographic, vision enhancement, vision magnification), dermal plating 4 (deltaware), muscle replacement 4 (deltaware), wired reflexes 4 (deltaware)",
        "Gear: Armor jacket (+4), commlink (Device Rating 8), 2 x flashpak, helmet (+1)",
        "Weapons: Browning Ultra Power [Heavy Pistol, DV 3P, SA, Attack Ratings 10/9/6/—/—, w/ laser sight]; Combat knife [Blade, DV 4P, Attack Ratings 8/2*/—/—/—, *max range 15m]; FN-HAR [Rifle, DV 5P, SA/BF/FA Attack Ratings 4/12/10/6/1, w/ laser sight]; Fragmentation grenade (DV 16P/12P/8P; Blast 20m); High explosive grenade (DV 16P/10P/4P; Blast 15m); Shock gloves [Unique, DV 4S(e), Attack Ratings 5/—/—/—/—]; Stun grenade (DV 10S/8S/6S; Blast 15m); 6 x throwing knives [Thrown, DV 3P, Attack Ratings 10/9/3/—/—]",
      ].join("\n"),
      notes:
        "Prime Runner (core rulebook p. 210) - built up from the grunt framework but treated as more than nameless cannon fodder; give this one a name and an agenda. Condition Monitor is printed as one combined Physical+Stun track, same convention as the grunts above - see other entries' notes for the full explanation.",
    },
  },
  {
    id: "npc-sioux-wildcat-shamanic-support",
    name: "Sioux Wildcat Shamanic Support",
    group: group(10, "Elite Special Forces"),
    summary: "The magical half of the world's best fighting force - a full combat-spell arsenal backing elite training.",
    book: CORE,
    data: {
      description: "Professional Rating 10 lieutenant - Elite Special Forces / Prime Runner. Magically active support for a Sioux Wildcat team.",
      physicalMonitor: 21,
      stunMonitor: 21,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 9,
      initiative: initiative(12, 1),
      combat: [
        "B5 A6 R6 S4 W6 L4 I6 C6 M10 ESS6",
        "AC: A1, I2",
        "Skills: Astral 8, Athletics 8, Biotech 6 (First Aid +2), Close Combat 7 (Blades +3) (Clubs +2), Con 6, Conjuring 8 (Fire +3), Enchanting 6, Firearms 8, Influence 8 (Intimidation +3), Outdoors 6 (Tracking +3), Perception 8, Piloting 3, Sorcery 9 (Combat Spells +2), Stealth 8",
        "Spells: Agony, Analyze Magic, Animate Metal, Animate Stone, Animate Wood, Armor, Blast, Chaos, Clout, Combat Sense, Darkness, Detect Enemies, Detect Life, Heal, Light, Lightning Ball, Lightning Bolt, Overclock, Improved Invisibility, Levitate, Mana Barrier, Physical Barrier, Shape Stone, Silence, Stunball, Stunbolt, Thunder",
        "Initiate Level: 4. Metamagics: Centering, masking, quickening, spell shaping",
        "Gear: Armor jacket (+4), commlink (Device Rating 8)",
        "Weapons: Combat knife [Blade, DV 4P, Attack Ratings 8/2*/—/—/—, *max range 15m]; Mossberg CMDT [Shotgun, DV 4P, SA/BF, Attack Ratings 5/12/7/—/—, w/ laser sight]; Ruger Super Warhawk [Heavy Pistol, DV 4P, SA, Attack Ratings 8/11/8/—/—]; 2 x throwing knives [Thrown, DV 3P, Attack Ratings 10/9/3/—/—]",
      ].join("\n"),
      notes:
        "Prime Runner (core rulebook p. 210) - built up from the grunt framework but treated as more than nameless cannon fodder; give this one a name and an agenda. Condition Monitor is printed as one combined Physical+Stun track, same convention as the grunts above - see other entries' notes for the full explanation.",
    },
  },
];
