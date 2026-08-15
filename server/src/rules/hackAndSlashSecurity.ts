// Hack & Slash "Matrix Security Operatives" chunk of the NPC template
// catalog - see npcTemplates.ts's header for the full rationale (same
// NpcTemplateEntry shape). Kept in its own file, separate from
// hackAndSlashCritters.ts, the same way npcTemplates.ts (Grunts) and
// critters.ts (Critters) are split for the Core Rulebook - these are
// metahuman security personnel with a Professional Rating, not critters.
//
// Transcribed from Hack_and_Slash__Matrix_Sourcebook__compressed__noimg.pdf,
// "Know Your Enemy" chapter, book pp. 166-168 (PDF page index = printed
// page + 1): Security Spider (PR4), Security Spider Lieutenant (PR5),
// Lesser DemiGOD (PR7), GOD Operative (PR9). 4 entries total.
//
// Like Body Shop's Technocritters, each of these prints BOTH a normal
// physical stat block (B/A/R/S/W/L/I/C/ESS, DR/I-ID/AC/CM) AND a separate
// Matrix persona sub-block ("M DR"/"M I/ID"/"M AC"/"MCM") - they're deckers
// operating from a physical body, not pure virtual life. Physical stats map
// to armor/physicalMonitor/stunMonitor/initiative as usual; Matrix persona
// stats are included as an extra line in `combat` rather than modeled
// separately, same convention as bodyShopCritters.ts's Technocritters.
//
// Deliberately NOT included (surveyed, explicitly out of scope - see
// [[hack-and-slash-critters]] and the session that added this file for the
// full reasoning):
// - "Additional Types of IC" (p. 168-169: Nonlethal Black IC, Psychotropic,
//   Cerebropathic, Infection, Eraser) - these have no fixed stat block at
//   all. Every number in them is "host rating" or "net hits" (e.g.
//   Psychotropic IC does "(host rating + net hits) Stun Damage"), resolving
//   only once a GM picks a specific host - there's nothing to put in
//   Armor/Condition Monitor/Initiative. Cataloging them as NpcTemplateEntry
//   rows would mean inventing placeholder numbers for content the book
//   deliberately leaves variable. User confirmed skip after being shown the
//   full "Psychotropic" entry as an example.
// - "Dominion Response Teams" (p. 167-168) isn't new stat blocks - it's a
//   team composition that reuses existing Core Rulebook Grunts (Marine
//   Corps Special Operations Forces, Renraku Red Samurai, Seraphim
//   Avenging Angel, Lone Star Combat Mage, Delta Forces Logistics and
//   Support Rigger) plus the Lesser DemiGOD already covered here, plus a
//   vehicle (Dominion Samael Transport) and two drones (Malakim/Ophanim) -
//   vehicle/drone content is out of scope for this roster (Double Clutch
//   territory, deferred - see [[gear-catalog-rollout]]).
// - Paragons (p. 129-130) are not combat NPCs at all - they're a
//   mentor-spirit-style alignment option for technomancer/EI player
//   characters (bonuses/restrictions from aligning with one), not something
//   a GM fights. Doesn't belong in a GM's "Import from book" combat roster;
//   user confirmed skip. Would fit a future technomancer chargen feature
//   instead, analogous to how mentor spirits work for magic users.

import type { NpcTemplateEntry } from "./npcTemplates.js";

const HACK_AND_SLASH = "Hack & Slash";

/** "X/Y" printed Initiative rank/Initiative Dice -> "X + Yd6". */
function initiative(rank: number, dice: number): string {
  return `${rank} + ${dice}d6`;
}

function group(professionalRating: number): string {
  return `Professional Rating ${professionalRating} - Matrix Security Operatives`;
}

export const hackAndSlashSecurityTemplates: NpcTemplateEntry[] = [
  {
    id: "npc-hs-security-security-spider",
    name: "Security Spider",
    group: group(4),
    summary: "Run-of-the-mill Matrix security - contracted or in-house, monitoring hosts that are worth defending but not top-tier.",
    book: HACK_AND_SLASH,
    data: {
      description: "Matrix Security Operatives. Rent-a-cop-tier Matrix defender for hosts an owner cares enough about to spend money on.",
      physicalMonitor: 11,
      stunMonitor: 11,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 5,
      initiative: initiative(6, 1),
      combat: [
        "B3 A3 R2 S2 W5 L5 I4 C3 ESS5.9",
        "AC: A1, I2",
        "Matrix persona: DR 11, Initiative 8 + 3d6, AC A1/I4, CM 10",
        "Skills: Close Combat 2, Cracking 5, Electronics 5, Engineering 4, Firearms 3, Influence 2, Perception 3, Piloting 3",
        "Augmentations: Datajack",
        "Gear: Armor clothing (+2), commlink (Erika Elite), Microdeck Watchman Cyberterminal, Yamaha Pulsar Taser",
        "Programs: Armor, Biofeedback, Fork, Lockdown, Trace",
        "ASDF (Matrix Attack/Sleaze/Data Processing/Firewall): 6/3/4/5, or host's",
        "Attacks: Tarpit [Cybercombat, DV 1, AR 9]; Data Spike [Cybercombat, DV 3, AR 9]; Yamaha Pulsar [Firearms, DV 4S(e), Attack Ratings 9/9/—/—/—]",
      ].join("\n"),
      notes:
        "Dual-natured NPC: a metahuman decker with both a physical body and a Matrix persona. Armor/Physical Monitor/Stun Monitor/Initiative above are its physical stats; its separate Matrix persona stats (Matrix DR/Initiative/AC/CM) are listed in the combat text.",
    },
  },
  {
    id: "npc-hs-security-lieutenant",
    name: "Security Spider Lieutenant",
    group: group(5),
    summary: "A more experienced security hacker, capable of handling most Matrix security encounters, doubling as a rigger.",
    book: HACK_AND_SLASH,
    data: {
      description: "Matrix Security Operatives. Experienced security hacker/rigger; leads a team or operates alone in more secure hosts.",
      physicalMonitor: 11,
      stunMonitor: 11,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 8,
      initiative: initiative(7, 1),
      combat: [
        "B4 A3 R3 S3 W5 L6 I4 C4 ESS2.8",
        "AC: A1, I2",
        "Matrix persona: DR 14, Initiative 10 + 4d6, AC A1/I5, CM 10",
        "Skills: Close Combat 2, Cracking 6, Electronics 6, Engineering 4, Firearms 3, Influence 3 (Intimidation +2), Perception 4, Piloting 3",
        "Qualities: Hardening",
        "Augmentations: Commlink (Erika Elite), control rig 1, cyberjack 3",
        "Gear: Armor jacket (+4), Renraku Kitsune cyberdeck, Yamaha Pulsar taser",
        "Programs: Armor, Biofeedback, Biofeedback Filter, Blaster-Charger, Fork, Lockdown, Overclock, Trace",
        "ASDF (Matrix Attack/Sleaze/Data Processing/Firewall): 7/5/6/6, or host's",
        "Attacks: Tarpit [Cybercombat, DV 1, AR 12]; Data Spike [Cybercombat, DV 4, AR 12]; Yamaha Pulsar [Firearms, DV 4S(e), Attack Ratings 9/9/—/—/—]",
      ].join("\n"),
      notes:
        "Dual-natured NPC: a metahuman decker with both a physical body and a Matrix persona. Armor/Physical Monitor/Stun Monitor/Initiative above are its physical stats; its separate Matrix persona stats (Matrix DR/Initiative/AC/CM) are listed in the combat text.",
    },
  },
  {
    id: "npc-hs-security-lesser-demigod",
    name: "Lesser DemiGOD",
    group: group(7),
    summary: "A Grid Overwatch Division agent - the SWAT-team equivalent of Matrix security, monitoring Overwatch Score for convergence.",
    book: HACK_AND_SLASH,
    data: {
      description: "Matrix Security Operatives (GOD). Grid Overwatch Division agent; monitors OS and converges on illicit Matrix activity.",
      physicalMonitor: 11,
      stunMonitor: 11,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 7,
      initiative: initiative(8, 1),
      combat: [
        "B3 A3 R3 S2 W5 L6(8) I5 C4 ESS2.1",
        "AC: A1, I2",
        "Matrix persona: DR 16, Initiative 12 + 5d6, AC A1/I6, CM 11",
        "Skills: Cracking 6 (Cybercombat +2), Electronics 6, Engineering 4, Firearms 4, Influence 4 (Intimidation +2), Perception 3, Piloting 3",
        "Qualities: Analytical Mind, Hardening",
        "Augmentations: Cerebral booster 2, commlink (Hermes Ikon), control rig 1, cyberjack 4",
        "Gear: Armor jacket (+4), Shiawase Cyber-6 cyberdeck, Yamaha Pulsar taser",
        "Programs: Armor, Biofeedback, Biofeedback Filter, Blackout, Blaster-Charger, Fork, Lockdown, Overclock, Stealth, Trace",
        "ASDF (Matrix Attack/Sleaze/Data Processing/Firewall): 8/6/7/7, or host's",
        "Attacks: Tarpit [Cybercombat, DV 1, AR 14]; Data Spike [Cybercombat, DV 4, AR 14]; Yamaha Pulsar [Firearms, DV 4S(e), Attack Ratings 9/9/—/—/—]",
      ].join("\n"),
      notes:
        "Dual-natured NPC: a metahuman decker with both a physical body and a Matrix persona. Armor/Physical Monitor/Stun Monitor/Initiative above are its physical stats; its separate Matrix persona stats (Matrix DR/Initiative/AC/CM) are listed in the combat text. Book prints Logic as \"6(8)\", the boosted figure from its own augmentation. Can also lead/support a Dominion Response Team (book p. 167-168) alongside Core Rulebook Grunts - not separately modeled here.",
    },
  },
  {
    id: "npc-hs-security-god-operative",
    name: "GOD Operative",
    group: group(9),
    summary: "The Matrix equivalent of an HTR or Special Forces operative - on call to handle true threats to the Matrix.",
    book: HACK_AND_SLASH,
    data: {
      description: "Matrix Security Operatives (GOD). Elite HTR/Special-Forces-equivalent Matrix defender.",
      physicalMonitor: 11,
      stunMonitor: 11,
      physicalDamage: 0,
      stunDamage: 0,
      armor: 8,
      initiative: initiative(9, 1),
      combat: [
        "B4 A3 R3 S3 W6 L7(10) I6 C5 ESS1.2",
        "AC: A1, I2",
        "Matrix persona: DR 19, Initiative 14 + 5d6, AC A1/I6, CM 12",
        "Skills: Cracking 8 (Cybercombat +3), Electronics 8, Engineering 4, Firearms 4, Influence 5 (Intimidation +2), Perception 4, Piloting 3 (Drone Operation +2)",
        "Qualities: Analytical Mind, Exceptional Attribute (Logic), Hardening",
        "Augmentations: Cerebral booster 3, commlink (Transys Avalon), control rig 1, cyberjack 6",
        "Gear: Armor jacket (+4), Fairlight Excalibur cyberdeck, Yamaha Pulsar taser",
        "Programs: Armor, Biofeedback, Biofeedback Filter, Blackout, Blaster-Charger, Directional Shield, Fork, Lockdown, Overclock, Rocket Launcher, Stealth, Trace",
        "ASDF (Matrix Attack/Sleaze/Data Processing/Firewall): 9/8/8/9, or host's",
        "Attacks: Tarpit [Cybercombat, DV 1, AR 17]; Data Spike [Cybercombat, DV 7, AR 17]; Yamaha Pulsar [Firearms, DV 4S(e), Attack Ratings 9/9/—/—/—]",
      ].join("\n"),
      notes:
        "Dual-natured NPC: a metahuman decker with both a physical body and a Matrix persona. Armor/Physical Monitor/Stun Monitor/Initiative above are its physical stats; its separate Matrix persona stats (Matrix DR/Initiative/AC/CM) are listed in the combat text. Book prints Logic as \"7(10)\", the boosted figure from its own Exceptional Attribute quality.",
    },
  },
];
