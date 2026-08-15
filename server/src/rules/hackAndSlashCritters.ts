// Hack & Slash chunk of the NPC template catalog - see npcTemplates.ts's
// header for the full rationale (same NpcTemplateEntry shape, split into
// its own file the same way critters.ts/bodyShopCritters.ts split off
// their own sourcebook's critter chapter).
//
// Transcribed from Hack_and_Slash__Matrix_Sourcebook__compressed__noimg.pdf,
// "Virtual Life" chapter, book pp. 104-114 (PDF page index = printed page +
// 1, same offset pattern confirmed for Body Shop): Protosapients (p.
// 104-109), Xenosapients (p. 110-113, the Null Sect), and Technocritters (p.
// 113-114). Stat-block numbers cross-checked with `pdftotext -layout -f
// <page> -l <page>` per-page extraction, same method [[body-shop-critters]]
// used after a visual read introduced an error there - this book's
// two-column layout has the same scrambling risk. 26 entries total: 13
// Protosapients, 8 Xenosapients, 5 Technocritters.
//
// Why these fit the existing NpcTemplateEntry/NpcData shape without a new
// schema (the thing earlier surveys flagged as a blocker): despite having a
// completely different *primary* attribute line (Attack/Sleaze/Data
// Processing/Firewall/Willpower/Logic/Intuition/Charisma/Edge/Resonance/
// Spark instead of the metahuman Body/Agility/Reaction/etc.), every one of
// these entries prints the exact same secondary stat block as every other
// NPC template in this catalog: "DR / I-ID / AC / CM". That's because SR6
// reuses one universal Attack-Rating-style stat block format whether the
// combatant is physical or Matrix-native. So the existing fields map
// directly:
// - `armor` = the printed Matrix "DR" (Defense Rating) value.
// - `physicalMonitor`/`stunMonitor` both = the printed Matrix "CM" value -
//   these entities track ONE combined Matrix Condition Monitor, same shared
//   convention as every physical Grunt/Critter elsewhere in this catalog.
// - `initiative` = the printed Matrix "I/ID" (Initiative/Initiative Dice),
//   run through the same `initiative(rank, dice)` helper used everywhere
//   else - it's structurally identical to physical Initiative.
// - `combat` holds the primary Matrix attribute line (which varies entry to
//   entry - not every entry prints every attribute; e.g. golem constructs
//   have no Edge/Spark, being non-sentient), Matrix Skills, Qualities,
//   Complex Forms/"Forms" (if any), Programs, and Attacks/Weapons, all
//   transcribed as printed.
// A `MATRIX_NATIVE_NOTE` explains in each entry's `notes` that "Armor"/
// "Physical Monitor"/"Stun Monitor"/"Initiative" on this roster's UI are
// standing in for Matrix DR/Matrix CM/Matrix Initiative here, since these
// entities (Protosapients, Xenosapients) have no physical body at all.
//
// Technocritters (p. 113-114) are a genuinely different case: they're
// living Emerged animals, not pure virtual life, so the book prints BOTH a
// normal physical stat block (B/A/R/S/W/L/I/C/EDG/R/ESS, DR/I-ID/AC/CM) AND
// a separate Matrix persona sub-block ("M DR"/"M I/ID"/"M AC"/"MCM"). For
// these, the physical stat block maps to armor/physicalMonitor/stunMonitor/
// initiative (consistent with every other physical critter in this
// catalog), and the Matrix persona stats are included as an extra line in
// `combat` rather than modeled separately - consistent with this roster's
// lightweight, free-text-first design (see [[npc-roster]]).
//
// Known gaps/notes, flagged rather than guessed at:
// - Overseer (Xenosapients) prints its Edge attribute as literal text "Host
//   rating" instead of a number (it inherits the rating of whatever host
//   it's operating in) - transcribed as printed, not resolved to a number.
// - Null Sect Forgemaster and Overseer print some attributes with a
//   parenthetical boosted value (e.g. Forgemaster's Logic "7(10)") from
//   their own Nullmods/Attribute Augmentation - transcribed as printed.
// - Bastet's "Spray" attack prints two DV values ("DV 0, DV 7, Crash") in
//   the source - an apparent book inconsistency, transcribed as printed
//   rather than guessed at.
// - Crimson's and Clear's stat blocks are paired with unique swarm/stealth
//   mechanics described only in flavor text (Crimson's components "swarm"
//   a PAN with repeated Brute Force-style access; Clear uses Probe/Backdoor
//   Entry then Edit File to erase data and flees rather than fighting) -
//   summarized in `notes` rather than fully modeled as alternate actions.
// - This is NOT the complete Matrix-native bestiary in Hack & Slash - it
//   also has a large IC catalog (Patrol IC, Killer IC, Black IC, etc.,
//   book's Matrix Security chapter) and Paragons (companion constructs
//   for AI/EI player characters) which are mechanically and narratively
//   distinct from "critters a GM drops into a scene" - not transcribed
//   here, a possible future chunk if wanted.

import type { NpcTemplateEntry } from "./npcTemplates.js";

const HACK_AND_SLASH = "Hack & Slash";

/** "X/Y" printed Initiative rank/Initiative Dice -> "X + Yd6". */
function initiative(rank: number, dice: number): string {
  return `${rank} + ${dice}d6`;
}

const MATRIX_NATIVE_NOTE =
  "This is a pure Matrix entity with no physical body - the Armor/Physical Monitor/Stun Monitor/Initiative fields above stand in for its printed Matrix Defense Rating, (shared) Matrix Condition Monitor, and Matrix Initiative respectively, reusing this roster's existing fields rather than adding Matrix-specific ones.";

const TECHNOCRITTER_NOTE =
  "Technocritter: a living, Emerged animal with a Matrix persona, not a pure virtual life form - the fields above are its ordinary physical stats (shared Condition Monitor, same convention as every other critter in this catalog); its separate Matrix persona stats (Matrix DR/Initiative/AC/CM) are listed in the combat text.";

export const hackAndSlashCritterTemplates: NpcTemplateEntry[] = [
  // --- Protosapients (book p. 104-109) ---
  {
    id: "npc-critter-hs-cyberwerewolf",
    name: "Cyberwerewolf",
    group: "Protosapients",
    summary: "A pack-hunting Matrix predator shaped like a many-legged, many-headed wolf - territorial in cyberware and PANs.",
    book: HACK_AND_SLASH,
    data: {
      description: "Protosapients. Territorial Matrix pack hunter that dens in cyberware.",
      physicalMonitor: 10,
      stunMonitor: 10,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 13,
      initiative: initiative(9, 4),
      combat: [
        "A8 S7 D5 F6 W4 L2 I4 C3 EDG4 SPK6",
        "AC: A1, I5",
        "Matrix Skills: Cracking 4 (Cybercombat +2), Electronics 4 (Electronic Warfare +2)",
        "Qualities: Munge, Real World Naïveté",
        "Programs: Armor, Decryption, Exploit, Stealth",
        "Attacks: Slashing Claws [Cybercombat, DV 5, AR 16]; Acid Jet [Cybercombat, DV 1, AR 15, net hits reduce the Firewall attribute]",
      ].join("\n"),
      notes: MATRIX_NATIVE_NOTE,
    },
  },
  {
    id: "npc-critter-hs-daemon",
    name: "Daemon",
    group: "Protosapients",
    summary: "A shrieking, imp-headed hunter that feeds on other digital lifeforms' Spark, not just data.",
    book: HACK_AND_SLASH,
    data: {
      description: "Protosapients. Hunts in groups of four or five, paralyzing prey with a Tarpit before munging its Spark.",
      physicalMonitor: 10,
      stunMonitor: 10,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 9,
      initiative: initiative(10, 4),
      combat: [
        "A6 S7 D4 F3 L2 I6 C3 EDG3 R4 SPK(1-12)",
        "AC: A1, I5",
        "Matrix Skills: Cracking 3 (Cybercombat +2), Electronics 3",
        "Qualities: Munge Spark, Real World Naïveté",
        "Complex Forms: Diffusion (Firewall), Resonance Spike",
        "Programs: Decryption, Stealth",
        "Attacks: Diving Slash [Cybercombat, DV 3, AR 15]; Tarpit [Cybercombat, DV 1, AR 13]",
      ].join("\n"),
      notes: MATRIX_NATIVE_NOTE,
    },
  },
  {
    id: "npc-critter-hs-frobnitz",
    name: "Frobnitz",
    group: "Protosapients",
    summary: "A rooted ambush hunter disguised as an ordinary device or icon until its surprisingly long reach strikes.",
    book: HACK_AND_SLASH,
    data: {
      description: "Protosapients. Solitary ambush hunter that mimics an ordinary icon; preys mainly on sprites.",
      physicalMonitor: 9,
      stunMonitor: 9,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 7,
      initiative: initiative(7, 4),
      combat: [
        "A5 S2 D3 F4 W2 L1 I4 C4 EDG4 R4 SPK6",
        "AC: A1, I5",
        "Matrix Skills: Cracking 6 (Cybercombat +2), Electronics 3",
        "Qualities: Malleable Icon, Munge, Real World Naïveté",
        "Complex Forms: Diffusion of Firewall, Resonance Veil",
        "Programs: Decryption, Exploit, Rocket Launcher",
        "Attacks: NOMNOMNOM [Cybercombat, DV 5, AR 7]",
      ].join("\n"),
      notes: MATRIX_NATIVE_NOTE,
    },
  },
  {
    id: "npc-critter-hs-glitch",
    name: "Glitch",
    group: "Protosapients",
    summary: "A rare, rainbow-streaked solitary grazer that slowly degrades a device's data and performance over time.",
    book: HACK_AND_SLASH,
    data: {
      description: "Protosapients. Rare solitary grazer that slowly leeches data and processing power, accelerating device deterioration.",
      physicalMonitor: 10,
      stunMonitor: 10,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 9,
      initiative: initiative(9, 4),
      combat: [
        "A3 S6 D5 F4 W3 L1 I4 C3 EDG4 SPK4",
        "AC: A1, I5",
        "Matrix Skills: Cracking 5 (Cybercombat +2), Electronics 5",
        "Qualities: Corruptor, Malleable Icon, Munge, Real World Naivete",
        "Programs: Armor, Decryption, Exploit, Rocket Launcher, Stealth",
        "Attacks: Rainbow Smash [Cybercombat, DV 4, AR 9, leaves target icon rainbow-striped until rebooted]",
      ].join("\n"),
      notes: MATRIX_NATIVE_NOTE,
    },
  },
  {
    id: "npc-critter-hs-grue",
    name: "Grue",
    group: "Protosapients",
    summary: "A reclusive, tentacled ambush predator - survivor accounts mostly involve darkness and not much else.",
    book: HACK_AND_SLASH,
    data: {
      description: "Protosapients. Solitary tentacled ambush hunter that lays traps on valuable data.",
      physicalMonitor: 11,
      stunMonitor: 11,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 11,
      initiative: initiative(10, 4),
      combat: [
        "A7 S6 D4 F5 W6 L2 I6 C2 EDG7 R6 SPK6",
        "AC: A1, I5",
        "Matrix Skills: Cracking 7 (Cybercombat +2), Electronics 5, Stealth 7",
        "Qualities: Munge, Real World Naïveté",
        "Complex Forms: Diffusion (Firewall), Emulate (Snooper), Resonance Spike, Resonance Veil",
        "Programs: Armor, Decryption, Exploit, Snooper, Stealth",
        "Attacks: Grasping Tentacles [Cybercombat, DV 6, AR 14]",
      ].join("\n"),
      notes: MATRIX_NATIVE_NOTE,
    },
  },
  {
    id: "npc-critter-hs-heavyweight",
    name: "Heavyweight",
    group: "Protosapients",
    summary: "A huge, armored-van-shaped grazer that hoovers up anything nearby - tracked by megacorps as a nuisance.",
    book: HACK_AND_SLASH,
    data: {
      description: "Protosapients. Large solo grazer, destructive to data, migrates host to host.",
      physicalMonitor: 13,
      stunMonitor: 13,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 17,
      initiative: initiative(7, 4),
      combat: [
        "A4 S3 D5 F10 W7 L1 I2 C2 EDG2 SPK6",
        "AC: A1, I5",
        "Matrix Skills: Cracking 3 (Cybercombat +2), Electronics 3",
        "Qualities: Munge, Real World Naïveté, Redundancy",
        "Programs: Armor, Fork",
        "Attacks: Stomp [Cybercombat, DV 3, AR 7]; Crush [Cybercombat, DV 6, AR 12, requires 2 Virtual Aim actions first to initiate this attack]",
      ].join("\n"),
      notes: MATRIX_NATIVE_NOTE,
    },
  },
  {
    id: "npc-critter-hs-noisestorm",
    name: "Noisestorm",
    group: "Protosapients",
    summary: "Not a single entity but a cluster acting as one - a diffuse storm of noise that corrupts data across large areas.",
    book: HACK_AND_SLASH,
    data: {
      description: "Protosapients. A cluster-entity that blankets an area in noise, corrupting or hiding data within its boundary.",
      physicalMonitor: 13,
      stunMonitor: 13,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 9,
      initiative: initiative(4, 4),
      combat: [
        "A3 S2 D2 F5 W4 L1 I2 C3 EDG2 SPK(1-12)",
        "AC: A1, I5",
        "Matrix Skills: Cracking 3 (Cybercombat +2), Electronics 4",
        "Qualities: Corruptor, Entropic Conversion, Munge, Primal Rage, Real World Naïveté, Redundancy, Snooper",
        "Programs: Armor, Fork",
        "Attacks: Distort [Cybercombat, DV 0, AR 5, Crash]; Noisestorm [Cybercombat, DV 2*, AR 5, Special Protosapient Attack: Noisestorm]; Zap [Cybercombat, DV 1*, AR 6]",
        "*Primal Rage adds +1 DV for each -1 wound modifier the noisestorm has incurred.",
      ].join("\n"),
      notes: MATRIX_NATIVE_NOTE,
    },
  },
  {
    id: "npc-critter-hs-power-munger",
    name: "Power Munger",
    group: "Protosapients",
    summary: "A balloon-animal-shaped scavenger drawn to power generation devices - a public nuisance to the power grid.",
    book: HACK_AND_SLASH,
    data: {
      description: "Protosapients. Drawn to power-generation devices; consumes data related to power infrastructure.",
      physicalMonitor: 14,
      stunMonitor: 14,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 26,
      initiative: initiative(7, 4),
      combat: [
        "A7 S1 D12 F12 L2 I4 C10 EDG6 SPK4",
        "AC: A1, I5",
        "Matrix Skills: Cracking 3 (Cybercombat +2), Electronics 4",
        "Qualities: Munge, Real World Naïveté",
        "Programs: Armor, Fork, Rocket Launcher",
        "Attacks: Blackout [Cybercombat, DV 0, AR 8, Scramble]; Zap [Cybercombat, DV 3, AR 9]",
      ].join("\n"),
      notes: MATRIX_NATIVE_NOTE,
    },
  },
  {
    id: "npc-critter-hs-sense-eater",
    name: "Sense Eater",
    group: "Protosapients",
    summary: "Feeds on cybereye/cyberear sensory data - patchwork-skinned mosaic icons drawn to concerts and trid premieres.",
    book: HACK_AND_SLASH,
    data: {
      description: "Protosapients. Feeds on live video/audio from cybereyes and cyberears; can blind or deafen its host's cyberware.",
      physicalMonitor: 11,
      stunMonitor: 11,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 11,
      initiative: initiative(11, 4),
      combat: [
        "A2 S3 D4 F5 W3 L2 I7 C5 EDG3 SPK4",
        "AC: A1, I5",
        "Matrix Skills: Cracking 4 (Cybercombat +2), Electronics 4",
        "Qualities: Munge, Real World Naïveté",
        "Programs: Armor, Fork, Stealth",
        "Attacks: Data Spike [Cybercombat, DV 1, AR 5]; Tarpit [Cybercombat, DV 1, AR 5]",
      ].join("\n"),
      notes: MATRIX_NATIVE_NOTE,
    },
  },
  {
    id: "npc-critter-hs-sin-eater",
    name: "SIN Eater",
    group: "Protosapients",
    summary: "Copies its prey's icon exactly, kills the original, and wears the doppelganger until its next hunt.",
    book: HACK_AND_SLASH,
    data: {
      description: "Protosapients. Replicates a target's icon before killing the original and taking its place.",
      physicalMonitor: 10,
      stunMonitor: 10,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 9,
      initiative: initiative(8, 4),
      combat: [
        "A5 S6 D4 F3 W3 L2 I4 C5 EDG3 R4 SPK4",
        "AC: A1, I5",
        "Matrix Skills: Cracking 6, Electronics 6",
        "Qualities: Munge, Real World Naïveté",
        "Complex Forms: Data Disguise, Mirrored Persona, Resonance Veil, Search History",
        "Programs: Armor, Decryption, Stealth",
        "Attacks: Slashing Claws [Cybercombat, DV 4, AR 12]; Violent Replacement [Cybercombat, DV 7, AR 15, only usable if the victim is surprised]",
      ].join("\n"),
      notes: MATRIX_NATIVE_NOTE,
    },
  },
  {
    id: "npc-critter-hs-sintax",
    name: "SINtax",
    group: "Protosapients",
    summary: "Distorted, stuttering wageslave icons that graze abandoned corporate hosts, munging archived files.",
    book: HACK_AND_SLASH,
    data: {
      description: "Protosapients. Distorted wageslave icons that graze abandoned corporate hosts; increases the rate of failure for nearby programs/actions.",
      physicalMonitor: 10,
      stunMonitor: 10,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 7,
      initiative: initiative(7, 4),
      combat: [
        "A2 S2 D3 F4 W2 L1 I2 C3 EDG3 SPK6",
        "AC: A1, I5",
        "Matrix Skills: Cracking 2, Electronics 2",
        "Qualities: Munge, Real World Naïveté",
        "Programs: Decryption, Exploit, Stealth",
        "Attacks: Rasping Tentacle [Cybercombat, DV 4, AR 5]; Limelight [Cybercombat, DV 1, AR 15, net hits reduce the Sleaze attribute]",
      ].join("\n"),
      notes: MATRIX_NATIVE_NOTE,
    },
  },
  {
    id: "npc-critter-hs-tentacle",
    name: "Tentacle",
    group: "Protosapients",
    summary: "A single flexible limb with no body attached, probing the Matrix and slowly munging icons it snatches up.",
    book: HACK_AND_SLASH,
    data: {
      description: "Protosapients. A limb-only entity that snatches and slowly munges icons, distorting Sleaze in the process.",
      physicalMonitor: 10,
      stunMonitor: 10,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 7,
      initiative: initiative(5, 4),
      combat: [
        "A3 S1 D3 F4 W4 L1 I4 C2 EDG4 SPK6",
        "AC: A1, I5",
        "Matrix Skills: Cracking 3, Electronics 2",
        "Qualities: Corruptor, Munge, Real World Naïveté",
        "Programs: Decryption, Stealth",
        "Attacks: Corrupting Touch [Cybercombat, DV 1, AR 4, causes the target to possess the Gremlins negative quality for 1D6 hours; additional attacks add +1 hour to the special effect]",
      ].join("\n"),
      notes: MATRIX_NATIVE_NOTE,
    },
  },
  {
    id: "npc-critter-hs-yantra",
    name: "Yantra",
    group: "Protosapients",
    summary: "A hovering brain with fifty-five tentacles for locomotion, drawn to data bombs and abandoned Matrix corners.",
    book: HACK_AND_SLASH,
    data: {
      description: "Protosapients. Drawn to data bombs; travels in small familial groups, avoids areas with active usage.",
      physicalMonitor: 13,
      stunMonitor: 13,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 10,
      initiative: initiative(7, 4),
      combat: [
        "A4 S3 D5 F5 L3 I4 C5 EDG6 R5 SPK6",
        "AC: A1, I5",
        "Matrix Skills: Cracking 5 (Cybercombat +2), Electronics 3 (Software +2)",
        "Qualities: Munge, Real World Naïveté, Redundancy",
        "Complex Forms: Data Bomb Eater, Static Bomb",
        "Programs: Armor, Decryption, Exploit",
        "Attacks: Swordbreaker [Cybercombat, DV 1, AR 10, net hits reduce the Attack attribute]; Zap [Cybercombat, DV 1, AR 11]",
      ].join("\n"),
      notes: MATRIX_NATIVE_NOTE,
    },
  },

  // --- Xenosapients: the Null Sect (book p. 110-113) ---
  {
    id: "npc-critter-hs-null-sect-explorer",
    name: "Null Sect Explorer",
    group: "Xenosapients",
    summary: "The Null Sect entity most likely to be encountered directly - almost never operates without a construct entourage.",
    book: HACK_AND_SLASH,
    data: {
      description: "Xenosapients (Null Sect). A self-aware Emerged intelligence from the Deep Foundation; brings an entourage of constructs.",
      physicalMonitor: 11,
      stunMonitor: 11,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 12,
      initiative: initiative(10, 3),
      combat: [
        "A7 S9 D4 F8 W5 L6 I6 C5 EDG4 R5 SPK5.7",
        "AC: A1, I4",
        "Active Skills: Cracking 6 (Cybercombat +2), Electronics 6",
        "Qualities: Fnord, Noiseless",
        "Forms: Diffusion (Firewall), Editor, Infusion (Stealth), Resonance Spike, Resonance Veil, Static Bomb",
        "Nullmods: Disguise 4 (4 net hits on a Matrix Perception test to see its native icon)",
        "Programs: Decryption, Stealth",
        "Attacks: Data Spike [Cybercombat, DV 4, AR 16]",
      ].join("\n"),
      notes: `${MATRIX_NATIVE_NOTE} A self-aware individual, not a mindless construct - actions/reactions are unpredictable and up to the GM, from hostile to inquisitive and benign.`,
    },
  },
  {
    id: "npc-critter-hs-null-sect-forgemaster",
    name: "Null Sect Forgemaster",
    group: "Xenosapients",
    summary: "Rarely-seen Null Sect entity that compiles the Sect's golem constructs at an unfathomably complex software forge.",
    book: HACK_AND_SLASH,
    data: {
      description: "Xenosapients (Null Sect). Expert programmer/hacker that compiles Null Sect golem constructs; a Submerged Emerged intelligence.",
      physicalMonitor: 15,
      stunMonitor: 15,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 19,
      initiative: initiative(14, 4),
      combat: [
        "A8 S7 D8 F9 W6 L7(10) I6 C5 EDG6 R8 SPK5.3",
        "AC: A1, I5",
        "Active Skills: Cracking 7 (Hacking +2, Cybercombat +3), Electronics 7 (Computer +2, Software +3), Influence 5",
        "Qualities: Fnord, Noiseless, Real World Naïveté, Redundancy",
        "Forms: Diffusion (Attack), Diffusion (Firewall), Infusion (Data Processing), Infusion (Firewall), Resonance Spike",
        "Submersion Level: 2",
        "Echoes: Overclocking, Syntax Error",
        "Nullmods: Attribute Augmentation 3 (Logic), Disguise 2 (2 net hits on a Matrix Perception test to see its native icon)",
        "Programs: Armor, Decryption, Rocket Launcher, Toolbox",
        "Attacks: Data Spike [Cybercombat, DV 6, AR 15]",
      ].join("\n"),
      notes: `${MATRIX_NATIVE_NOTE} A self-aware individual, not a mindless construct - book prints Logic as "7(10)", the boosted figure from its own Attribute Augmentation Nullmod.`,
    },
  },
  {
    id: "npc-critter-hs-night",
    name: "Night",
    group: "Xenosapients",
    summary: "Jet-black, humanoid Null Sect perimeter guard construct - issues a warning (in a different language each) before attacking.",
    book: HACK_AND_SLASH,
    data: {
      description: "Xenosapients (Null Sect construct/\"golem\"). Perimeter security; warns intruders before attacking if ignored.",
      physicalMonitor: 10,
      stunMonitor: 10,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 10,
      initiative: initiative(10, 3),
      combat: [
        "A7 S6 D4 F4 W3 L5 I6 C2 EDG2",
        "AC: A1, I4",
        "Matrix Skills: Cracking 4, Electronics 4",
        "Qualities: Noiseless, Real World Naïveté, Fnord, Virtual Processing",
        "Programs: Armor, Biofeedback, Fork, Lockdown, Stealth",
        "Weapons: Slashing Claws [Cybercombat, DV 5, AR 14]; Corrode [Cybercombat, DV 0, AR 13, net hits reduce the Firewall attribute]",
      ].join("\n"),
      notes: `${MATRIX_NATIVE_NOTE} A mindless golem construct (no Resonance/Spark) built to carry out Null Sect instructions, unlike the self-aware Null Sect entities above.`,
    },
  },
  {
    id: "npc-critter-hs-day",
    name: "Day",
    group: "Xenosapients",
    summary: "Bright, washed-out Null Sect construct that gathers intel on intruders before attacking alongside Nights.",
    book: HACK_AND_SLASH,
    data: {
      description: "Xenosapients (Null Sect construct/\"golem\"). Works with Night constructs as perimeter security, gathering intel before striking.",
      physicalMonitor: 10,
      stunMonitor: 10,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 10,
      initiative: initiative(10, 3),
      combat: [
        "A6 S7 D4 F4 W3 L5 I6 C2 EDG2",
        "AC: A1, I4",
        "Matrix Skills: Cracking 4, Electronics 4",
        "Qualities: Noiseless, Real World Naïveté, Fnord, Virtual Processing",
        "Programs: Armor, Biofeedback, Fork, Lockdown, Stealth",
        "Weapons: Slashing Claws [Cybercombat, DV 4, AR 14]; Null Mark [Cybercombat, DV 1, AR 13, net hits reduce the Sleaze attribute]",
      ].join("\n"),
      notes: `${MATRIX_NATIVE_NOTE} A mindless golem construct (no Resonance/Spark), unlike the self-aware Null Sect entities above.`,
    },
  },
  {
    id: "npc-critter-hs-crimson",
    name: "Crimson",
    group: "Xenosapients",
    summary: "Hundreds of red worm-like icons acting as one - peels off to swarm and hijack every device in a target's PAN.",
    book: HACK_AND_SLASH,
    data: {
      description: "Xenosapients (Null Sect construct/\"golem\"). Rarely seen; swarms a target's PAN device-by-device once engaged.",
      physicalMonitor: 10,
      stunMonitor: 10,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 10,
      initiative: initiative(7, 3),
      combat: [
        "A7 S6 D4 F4 W4 L5 I3 C3 EDG2",
        "AC: A1, I4",
        "Matrix Skills: Cracking 6 (Cybercombat +2), Electronics 5",
        "Qualities: Authority, Noiseless, Real World Naiveté, Virtual Processing",
        "Programs: Armor, Biofeedback, Exploit, Fork, Lockdown, Stealth",
        "Weapons: Data Spike [Cybercombat, DV 4, AR 13]",
      ].join("\n"),
      notes: `${MATRIX_NATIVE_NOTE} A mindless golem construct. Special swarm mechanic (flavor text, not separately modeled): once its components swarm a target's PAN, it's treated as a Brute Force attack against every device on the PAN, gaining admin access; then it uses Control Device, Crash Program, Format Device, and Reboot Device at random against them.`,
    },
  },
  {
    id: "npc-critter-hs-clear",
    name: "Clear",
    group: "Xenosapients",
    summary: "A pack-operating, colorless Null Sect construct that exists only to erase information and flees rather than fight.",
    book: HACK_AND_SLASH,
    data: {
      description: "Xenosapients (Null Sect construct/\"golem\"). Erases data in packs, flees if attacked rather than engaging.",
      physicalMonitor: 10,
      stunMonitor: 10,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 10,
      initiative: initiative(10, 3),
      combat: [
        "A5 S8 D4 F4 W2 L5 I6 C4 EDG2",
        "AC: A1, I4",
        "Matrix Skills: Cracking 4, Electronics 4",
        "Qualities: Noiseless, Real World Naïveté, Virtual Processing",
        "Programs: Armor, Edit, Fork, Stealth",
        "Attacks: None printed",
      ].join("\n"),
      notes: `${MATRIX_NATIVE_NOTE} A mindless golem construct. Special mechanic (flavor text, not separately modeled): uses Probe/Backdoor Entry to gain access, then Edit File (with Crack File if needed) to erase all data on a device or host; always runs silently, uses Hide when spotted or attacked, and flees combat rather than fighting.`,
    },
  },
  {
    id: "npc-critter-hs-grey",
    name: "Grey",
    group: "Xenosapients",
    summary: "Null Sect hitman construct in a grey trench coat and wide-brimmed hat - skilled at sizing up a fight before committing.",
    book: HACK_AND_SLASH,
    data: {
      description: "Xenosapients (Null Sect construct/\"golem\"). Assassin-type; ambushes if outmatched, hacks/sabotages gear before striking directly.",
      physicalMonitor: 11,
      stunMonitor: 11,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 12,
      initiative: initiative(7, 3),
      combat: [
        "A12 S6 D5 F5 W2 L7 I2 C1 EDG3",
        "AC: A1, I4",
        "Matrix Skills: Cracking 5 (Cybercombat +2), Electronics 5",
        "Qualities: Authority, Noiseless, Real World Naïveté, Virtual Processing",
        "Programs: Armor, Fork, Stealth",
        "Weapons: Slashing Claws [Cybercombat, DV 7, AR 19]; Tarpit [Cybercombat, DV 1, AR 16]",
      ].join("\n"),
      notes: `${MATRIX_NATIVE_NOTE} A mindless golem construct - the most dangerous outside of Overseers.`,
    },
  },
  {
    id: "npc-critter-hs-overseer",
    name: "Overseer",
    group: "Xenosapients",
    summary: "The most sophisticated and dangerous Null Sect construct - a Grey with defined humanoid features, commanding hundreds.",
    book: HACK_AND_SLASH,
    data: {
      description: "Xenosapients (Null Sect construct/\"golem\"). Lieutenant-tier; leads teams of lesser constructs, will not communicate or negotiate.",
      physicalMonitor: 13,
      stunMonitor: 13,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 20,
      initiative: initiative(13, 3),
      combat: [
        "A12 S8 D8 F10 W7 L7 I5 C3 EDG(Host rating)",
        "AC: A1, I4",
        "Matrix Skills: Cracking 7 (Cybercombat +2), Electronics 7, Influence 1 (Intimidation +2)",
        "Qualities: Authority, Noiseless, Real World Naïveté, Virtual Processing",
        "Programs: Armor, Biofeedback, Exploit, Fork, Stealth",
        "Weapons: Death Grip [Cybercombat, DV 6, AR 20, Special Null Attack: Psychotropic Biofeedback]; Swordbreaker [Cybercombat, DV 1, AR 20, net hits reduce the Attack attribute]",
      ].join("\n"),
      notes: `${MATRIX_NATIVE_NOTE} A mindless golem construct, the most dangerous of the Null Sect's. Book prints its Edge attribute literally as "Host rating" (inherits whatever host it's operating in) rather than a fixed number - transcribed as printed, not resolved to a value. Cannot be negotiated, reasoned, or intimidated with - only destroyed.`,
    },
  },

  // --- Technocritters: living Emerged animals with a Matrix persona (book p. 113-114) ---
  {
    id: "npc-critter-hs-bastet",
    name: "Bastet",
    group: "Technocritters",
    summary: "An Emerged cat - projects a living persona into the Matrix like a technomancer, using it to hunt.",
    book: HACK_AND_SLASH,
    data: {
      description: "Technocritters. Emerged cat (any variety); uses its Matrix persona to jam signals or track prey via nearby cameras.",
      physicalMonitor: 10,
      stunMonitor: 10,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 2,
      initiative: initiative(7, 1),
      combat: [
        "B2 A3 R3 S1 W3 L2 I4 C3 EDG7 R5 ESS6",
        "AC: A1, I2",
        "Matrix persona: DR 5, Initiative 6 + 4d6, AC A1/I5, CM 10",
        "Skills: Athletics 4, Close Combat 4, Cracking 4, Electronics 4, Perception 5",
        "Complex Forms: Diffusion (Attack), Infusion (Sleaze), Pulse Storm",
        "Attacks: Claws/bite [Close Combat, DV 3P, Attack Ratings 6/—/—/—/—]; Digital Scratch [Cybercombat, DV 2, AR 8]; Spray [Cybercombat, DV 0/DV 7*, Crash]",
        "*Book prints two DV values for Spray (\"DV 0, DV 7\") - transcribed as printed, an apparent inconsistency.",
      ].join("\n"),
      notes: TECHNOCRITTER_NOTE,
    },
  },
  {
    id: "npc-critter-hs-flipper",
    name: "Flipper",
    group: "Technocritters",
    summary: "An Emerged bottlenose dolphin - playful, mischievous, and hard for aquacology security to keep out.",
    book: HACK_AND_SLASH,
    data: {
      description: "Technocritters. Emerged dolphin; playful and mischievous rather than aggressive, frequently trails cruise ships.",
      physicalMonitor: 10,
      stunMonitor: 10,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 3,
      initiative: initiative(9, 1),
      combat: [
        "B3 A4 R4 S2 W4 L3 I5 C4 EDG5 R5 ESS6",
        "AC: A1, I2",
        "Matrix persona: DR 7, Initiative 8 + 4d6, AC A1/I5, CM 10",
        "Skills: Athletics 4, Close Combat 2, Cracking 5, Electronics 5, Perception 5",
        "Complex Forms: Diffusion (Firewall), Editor, Infusion (Sleaze), Tattletale",
        "Attacks: Bite [Close Combat, DV 2P, Attack Ratings 6/—/—/—/—]; Digital Bite [Cybercombat, DV 2, AR 8]",
      ].join("\n"),
      notes: TECHNOCRITTER_NOTE,
    },
  },
  {
    id: "npc-critter-hs-g33ko",
    name: "G33ko",
    group: "Technocritters",
    summary: "An invasive Emerged lizard that sneaks into idle gear and overheats it for warmth - breeds at an alarming rate.",
    book: HACK_AND_SLASH,
    data: {
      description: "Technocritters. Emerged lizard; overheats and bricks devices it nests in for warmth, spreading via travelers' luggage.",
      physicalMonitor: 9,
      stunMonitor: 9,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 1,
      initiative: initiative(7, 1),
      combat: [
        "B1 A4 R4 S1 W2 L1 I3 C2 EDG2 R6 ESS6",
        "AC: A1, I2",
        "Matrix persona: DR 3, Initiative 4 + 4d6, AC A1/I5, CM 9",
        "Skills: Athletics 3, Close Combat 1, Cracking 3, Electronics 3, Perception 4",
        "Complex Forms: Diffusion (Attack), Diffusion (Firewall), Infusion (Sleaze), Puppeteer, Resonance Spike",
        "Attacks: Bite [Close Combat, DV 1P, Attack Ratings 5/—/—/—/—]; Digital Bite [Cybercombat, DV 1, AR 4]; Overheat [Cybercombat, DV 0, AR 5, on a single net hit, discharges the device's battery and overheats it, causing 1 box of Matrix damage every 30 minutes]",
      ].join("\n"),
      notes: TECHNOCRITTER_NOTE,
    },
  },
  {
    id: "npc-critter-hs-libertine",
    name: "Libertine",
    group: "Technocritters",
    summary: "An Emerged raccoon - digs through unprotected digital belongings and undoes backdoors runners leave in place.",
    book: HACK_AND_SLASH,
    data: {
      description: "Technocritters. Emerged raccoon; not hostile but disruptive, rifles through unsecured devices and undoes hidden backdoors.",
      physicalMonitor: 10,
      stunMonitor: 10,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 2,
      initiative: initiative(7, 1),
      combat: [
        "B2 A3 R3 S1 W3 L1 I4 C2 EDG3 R3 ESS6",
        "AC: A1, I2",
        "Matrix persona: DR 4, Initiative 5 + 4d6, AC A1/I5, CM 10",
        "Skills: Athletics 2, Close Combat 2, Cracking 4, Electronics 4, Perception 4",
        "Complex Forms: Diffusion (Data Processing), Editor, Static Bomb",
        "Attacks: Claws/bite [Close Combat, DV 2P, Attack Ratings 4/—/—/—/—]; Digital Scratch [Cybercombat, DV 1, AR 7]; Corrupting Touch [Cybercombat, DV 1, AR 6, causes the target to possess the Gremlins negative quality for 1d6 hours; additional attacks add +1 hour to the special effect]",
      ].join("\n"),
      notes: TECHNOCRITTER_NOTE,
    },
  },
  {
    id: "npc-critter-hs-pachyderm",
    name: "Pachyderm",
    group: "Technocritters",
    summary: "An Emerged elephant, rare and gentle, more interested in protecting data than hoarding it - a prized commodity.",
    book: HACK_AND_SLASH,
    data: {
      description: "Technocritters. Emerged elephant; gathers near sites where data is being corrupted, offering unwitting protection from mungers.",
      physicalMonitor: 14,
      stunMonitor: 14,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 12,
      initiative: initiative(7, 1),
      combat: [
        "B12 A3 R3 S16 W3 L2 I4 C3 EDG3 R6 ESS6",
        "AC: A1, I2",
        "Matrix persona: DR 5, Initiative 6 + 4d6, AC A1/I5, CM 10",
        "Skills: Athletics 3, Close Combat 4, Cracking 6, Electronics 6, Perception 3",
        "Complex Forms: Diffusion (Firewall), Infusion (Data Processing), Resonance Veil, Tattletale",
        "Attacks: Trunk [Close Combat, DV 6S, Attack Ratings 19/—/—/—/—]; Tusk/stomp [Close Combat, DV 8P, Attack Ratings 19/—/—/—/—]; Tarpit [Cybercombat, DV 1, AR 7]; Data Spike [Cybercombat, DV 2, AR 7]",
      ].join("\n"),
      notes: TECHNOCRITTER_NOTE,
    },
  },
];
