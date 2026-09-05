// The Matrix (core rulebook p.174-185): Matrix Actions, Overwatch Score,
// Noise, Matrix Perception, Cybercombat, Programs. Same "no dice-rolling
// engine" treatment as deriveAstral.ts/deriveSpirits.ts - this is all pure
// reference data (paraphrased from the book, mechanics/numbers transcribed
// as printed), not simulated. Hosts and IC are deliberately excluded, same
// as the existing Rules Coverage boundary: they're GM-facing NPC/location
// content, not character-build data.
//
// hackingDicePools() below is the one exception - unlike everything else in
// this file it's a real computed number (skill rank + attribute), same
// treatment deriveCombat.ts gives unarmedAttackRating()/defenseRating()
// alongside its own reference tables. The five {skill, attribute} pairings
// are every combo Electronics/Cracking actually appear with across
// MATRIX_ACTIONS below (Cracking+Logic, Cracking+Intuition for Hide,
// Electronics+Logic, Electronics+Intuition for Matrix
// Perception/Search/Trace Icon, Electronics+Willpower for Jack Out) -
// Specialization/Expertise bonuses are listed alongside each pool rather
// than folded into it, since (per core rulebook p.92) they only apply when
// the test actually falls within that narrow focus, not to every use of
// the skill.
import type { CharacterData, SkillSpecialization } from "./character";
import type { Attributes } from "./rules";

export interface MatrixActionEntry {
  name: string;
  legal: "Legal" | "Illegal";
  access: string;
  test: string;
  actionType: "Minor" | "Major" | "Extended" | "Anytime";
  summary: string;
}

/** Overwatch Score reaches Convergence at this value (core rulebook p.176). */
export const CONVERGENCE_OS = 40;

export const MATRIX_ACTIONS: MatrixActionEntry[] = [
  {
    name: "Backdoor Entry",
    legal: "Illegal",
    access: "Outsider",
    test: "Cracking + Logic vs. Willpower + Firewall",
    actionType: "Major",
    summary:
      "Linked to Sleaze. Use a backdoor already put in place by a prior successful Probe (net hits from that test are a dice pool bonus here) to gain Admin access without it counting as illegal Admin access. Failing removes the backdoor - you'll need a fresh Probe.",
  },
  {
    name: "Brute Force",
    legal: "Illegal",
    access: "Outsider/User/Admin",
    test: "Cracking + Logic vs. Willpower + Firewall (or Willpower + [Firewall+2], +4 Defense Rating to target, for Admin without prior User access)",
    actionType: "Major",
    summary:
      "Linked to Attack. The fast, loud way to gain illicit access - always alerts the target, so Overwatch Score accumulates with every attempt. Failure lets you retry next combat round.",
  },
  {
    name: "Change Icon",
    legal: "Legal",
    access: "User/Admin",
    test: "No test",
    actionType: "Minor",
    summary: "Change your (or the target's) icon to one you have a copy of or designed - cosmetic only, doesn't defeat a Matrix Perception check.",
  },
  {
    name: "Check OS",
    legal: "Illegal",
    access: "Admin",
    test: "Cracking + Logic (4)",
    actionType: "Major",
    summary: "Learn your current Overwatch Score.",
  },
  {
    name: "Control Device",
    legal: "Legal",
    access: "User/Admin (varies with action chosen)",
    test: "Electronics + Logic vs. Willpower + Firewall (or the device's own test, if it has one)",
    actionType: "Major",
    summary:
      "Extended remote control of a device, usable as its owner until you relinquish it or are forced out. Fails automatically against a device someone else is currently jumped into.",
  },
  {
    name: "Crack File",
    legal: "Illegal",
    access: "User/Admin",
    test: "Cracking + Logic vs. Encryption Rating x 2",
    actionType: "Major",
    summary: "Remove a file's protection, making it readable.",
  },
  {
    name: "Crash Program",
    legal: "Illegal",
    access: "Admin",
    test: "Cracking + Logic vs. Data Processing + Device Rating",
    actionType: "Major",
    summary: "Scramble a named running program on the target - it ends and can't restart until the device reboots.",
  },
  {
    name: "Data Spike",
    legal: "Illegal",
    access: "Outsider/User/Admin",
    test: "Cracking + Logic vs. Data Processing + Firewall",
    actionType: "Major",
    summary: "Linked to Attack. One of the two primary cybercombat attacks - Damage Value (Attack/2, rounded up), +1 box per net hit.",
  },
  {
    name: "Disarm Data Bomb",
    legal: "Legal",
    access: "User/Admin",
    test: "Cracking + Logic vs. Data Bomb Rating x 2",
    actionType: "Major",
    summary: "Disarm a Data Bomb you've detected (usually via Matrix Perception); any net hits remove and delete it, otherwise it triggers.",
  },
  {
    name: "Edit File",
    legal: "Legal",
    access: "User/Admin",
    test: "Electronics + Logic vs. Intuition + Firewall (or Firewall + Sleaze)",
    actionType: "Major",
    summary: "Create, change, copy, delete, or protect one detail of a file per action. Copying a protected file auto-fails; a Data Bomb on the file triggers on you.",
  },
  {
    name: "Encrypt File",
    legal: "Legal",
    access: "User/Admin",
    test: "Electronics + Logic",
    actionType: "Major",
    summary: "Hits establish an Encryption Rating that opposes future Crack File attempts against the file.",
  },
  {
    name: "Enter/Exit Host",
    legal: "Legal",
    access: "Depends on host settings",
    test: "No test",
    actionType: "Minor",
    summary: "Enter or leave a host - leaving never requires any particular access level.",
  },
  {
    name: "Erase Matrix Signature",
    legal: "Illegal",
    access: "User/Admin",
    test: "Electronics + Logic vs. Willpower + Firewall (or Firewall x 2)",
    actionType: "Major",
    summary: "Requires a Resonance rating. Eradicate a Resonance being's (technomancer or sprite) astral/Matrix signature.",
  },
  {
    name: "Format Device",
    legal: "Legal",
    access: "Admin",
    test: "Electronics + Logic vs. Willpower + Firewall (or Firewall x 2)",
    actionType: "Major",
    summary: "Rewrite the target's boot code so its next reboot shuts it down for good - loses wireless modifiers and can't be accessed from the Matrix until repaired (hits needed = Device Rating), same process as a bricked device.",
  },
  {
    name: "Full Matrix Defense",
    legal: "Legal",
    access: "Outsider/User/Admin",
    test: "See description",
    actionType: "Anytime",
    summary: "The Matrix equivalent of Full Defense - add Firewall to all Matrix defense tests until the end of the combat round. Usable outside your own turn.",
  },
  {
    name: "Hack",
    legal: "Illegal",
    access: "Outsider/User",
    test: "See Brute Force or Probe",
    actionType: "Major",
    summary: "Header entry - hacking in is done via either Brute Force (fast, loud) or Probe (slow, quiet), not a separate mechanic of its own.",
  },
  {
    name: "Hash Check",
    legal: "Illegal",
    access: "User/Admin",
    test: "Electronics + Logic",
    actionType: "Major",
    summary:
      "A specialized Matrix search for an encrypted file by hash value instead of decrypting everything. Threshold 1 with a known hash, 4 guessing blind; meeting it narrows possible matches to 32, halved per net hit.",
  },
  {
    name: "Hide",
    legal: "Illegal",
    access: "Outsider/User/Admin",
    test: "Cracking + Intuition vs. Intuition + Data Processing (or Data Processing + Sleaze)",
    actionType: "Major",
    summary: "Break a target's spotting of you - they need a fresh Matrix Perception action to find you again. Doesn't work against an icon with User/Admin access to your network.",
  },
  {
    name: "Jack Out",
    legal: "Legal",
    access: "Outsider/User/Admin",
    test: "Electronics + Willpower vs. Charisma + Data Processing (or Attack + Data Processing)",
    actionType: "Major",
    summary: "Exit the Matrix and reboot your device, suffering dumpshock if in VR. The defense roll only matters if you're link-locked - beat every persona holding your link, one roll compared against each.",
  },
  {
    name: "Jam Signals",
    legal: "Illegal",
    access: "Admin",
    test: "Cracking + Logic",
    actionType: "Major",
    summary: "Turn your device into a local jammer - hits add to the noise rating for all Matrix actions within 100 meters, as long as you take no further Matrix actions with it.",
  },
  {
    name: "Jump into Rigged Device",
    legal: "Legal",
    access: "User/Admin",
    test: "Electronics + Logic vs. Willpower + Firewall (or Firewall x 2)",
    actionType: "Major",
    summary: "Jump into a rigger-adapted device (vehicle/drone) - requires VR, a control rig, and the proper access level; no test needed if you own the device or have permission.",
  },
  {
    name: "Matrix Perception",
    legal: "Legal",
    access: "Outsider/User/Admin",
    test: "Electronics + Intuition vs. Willpower + Sleaze",
    actionType: "Major",
    summary: "Learn about a target icon - 1 net hit gives basics (device rating, name), 2+ gives attribute ratings and running programs, more per GM discretion. Can also spot silent-running icons nearby.",
  },
  {
    name: "Matrix Search",
    legal: "Legal",
    access: "Outsider/User/Admin",
    test: "Electronics + Intuition",
    actionType: "Extended",
    summary: "Extended test (10-minute interval) searching the publicly accessible grid - more hits means more information, per the Legwork Results table.",
  },
  {
    name: "Probe",
    legal: "Illegal",
    access: "Outsider/User/Admin",
    test: "Cracking + Logic vs. Willpower + Firewall (or Firewall x 2)",
    actionType: "Extended",
    summary:
      "Linked to Sleaze. Extended test (1-minute interval) - the slow, quiet way to gain access. Doesn't auto-alert (only a glitch does), and net hits become a dice pool bonus on a later Backdoor Entry. Backdoors last roughly (10 - Host/Device Rating) hours.",
  },
  {
    name: "Reboot Device",
    legal: "Legal",
    access: "Admin",
    test: "Electronics + Logic vs. Willpower + Firewall (or Firewall x 2)",
    actionType: "Major",
    summary: "Target goes offline and returns at the end of the following combat round - resets its Overwatch Score and any access achieved on/by it.",
  },
  {
    name: "Reconfigure Matrix Attribute",
    legal: "Legal",
    access: "Admin",
    test: "No test",
    actionType: "Minor",
    summary: "Swap the base ratings of two non-zero Matrix attributes on your persona, even across different devices - the live, per-round version of the build-time assignment the Decker Persona panel models.",
  },
  {
    name: "Send Message",
    legal: "Legal",
    access: "Outsider/User/Admin",
    test: "No test",
    actionType: "Minor",
    summary: "Send a short text/audio message, image, or file to a known commcode - or open a live feed - longer messages possible via DNI.",
  },
  {
    name: "Set Data Bomb",
    legal: "Illegal",
    access: "Admin",
    test: "Electronics + Logic vs. Device Rating x 2",
    actionType: "Major",
    summary: "Attach a Data Bomb to a file, rating up to your net hits, choosing whether it deletes the file and what passcode disarms it.",
  },
  {
    name: "Snoop",
    legal: "Illegal",
    access: "Admin",
    test: "Cracking + Logic vs. Logic + Firewall (or Data Processing + Firewall)",
    actionType: "Major",
    summary: "Intercept Matrix traffic to/from the target for as long as you maintain access - watch live or save for later.",
  },
  {
    name: "Spoof Command",
    legal: "Illegal",
    access: "Outsider/User/Admin",
    test: "Cracking + Logic vs. Data Processing (or Pilot + Firewall)",
    actionType: "Major",
    summary: "Send a device a command it perceives as coming from its owner - it attempts the action on its next available Major Action.",
  },
  {
    name: "Switch Interface Mode",
    legal: "Legal",
    access: "Admin",
    test: "No test",
    actionType: "Minor",
    summary: "Switch your interface between AR and VR.",
  },
  {
    name: "Tarpit",
    legal: "Illegal",
    access: "Outsider/User/Admin",
    test: "Cracking + Logic vs. Data Processing + Firewall",
    actionType: "Major",
    summary:
      "Linked to Attack. The other primary cybercombat attack - (1 + net hits) damage plus the same reduction to the target's Data Processing (recovers 1/round); Data Processing at 0 blocks Matrix actions entirely until it recovers.",
  },
  {
    name: "Trace Icon",
    legal: "Illegal",
    access: "Admin",
    test: "Electronics + Intuition vs. Willpower + Sleaze (or Firewall + Sleaze)",
    actionType: "Major",
    summary: "Find a device or persona's physical location for as long as you can detect it. Doesn't work on IC/hosts with no physical location, but does work on offline hosts with physical hardware.",
  },
];

export interface MatrixProgramEntry {
  name: string;
  category: "Basic" | "Hacking";
  linkedAttribute?: "Attack" | "Sleaze";
  summary: string;
}

/**
 * Named Matrix programs (core rulebook p.184-185) - loaded into a device's
 * Active Program Slots. The gear catalog only sells generic "Cyberprogram,
 * Basic/Hacking" placeholder lines (matching the freeform-notes precedent
 * used for Mentor Spirits/Metamagics elsewhere); this is the reference
 * glossary of what each named choice actually does.
 */
export const MATRIX_PROGRAMS: MatrixProgramEntry[] = [
  { name: "Baby Monitor", category: "Basic", summary: "Tells you your current Overwatch Score without needing an action." },
  { name: "Browse", category: "Basic", summary: "Matrix searches gain 1 Edge, spent immediately on that action or lost." },
  {
    name: "Configurator",
    category: "Basic",
    summary: "Store an alternate deck configuration and swap to it instead of changing two attributes (i.e. instead of using Reconfigure Matrix Attribute).",
  },
  { name: "Edit", category: "Basic", summary: "Edit File actions gain 1 Edge, spent immediately or lost." },
  { name: "Encryption", category: "Basic", summary: "+2 dice on Encrypt File actions." },
  { name: "Signal Scrubber", category: "Basic", summary: "Reduce your noise level by 2." },
  { name: "Toolbox", category: "Basic", summary: "+1 to Data Processing." },
  {
    name: "Virtual Machine",
    category: "Basic",
    summary: "2 extra program slots, but take 1 extra box of unresisted Matrix damage whenever attacked.",
  },
  { name: "Armor", category: "Hacking", summary: "+2 to Defense Rating." },
  {
    name: "Biofeedback",
    category: "Hacking",
    linkedAttribute: "Attack",
    summary: "Matrix attacks cause Stun damage (cold-sim target) or Physical damage (hot-sim target) instead of Matrix damage.",
  },
  { name: "Biofeedback Filter", category: "Hacking", summary: "Allows a Device Rating or Body roll to soak Matrix damage." },
  { name: "Blackout", category: "Hacking", linkedAttribute: "Attack", summary: "Like Biofeedback, but Stun damage only." },
  { name: "Decryption", category: "Hacking", summary: "+2 dice on Crack File actions." },
  { name: "Defuse", category: "Hacking", summary: "Allows a Device Rating or Body roll to soak Data Bomb damage." },
  { name: "Exploit", category: "Hacking", summary: "Reduce a hacking target's Defense Rating by 2." },
  { name: "Fork", category: "Hacking", summary: "Hit two targets with a single Matrix action without splitting your dice pool." },
  { name: "Lockdown", category: "Hacking", summary: "Cause link-lock whenever you deal Matrix damage." },
  { name: "Overclock", category: "Hacking", summary: "Add two dice to a Matrix action." },
  {
    name: "Stealth",
    category: "Hacking",
    linkedAttribute: "Sleaze",
    summary: "Hide actions gain 1 Edge, spent as part of the action or lost.",
  },
  {
    name: "Trace",
    category: "Hacking",
    linkedAttribute: "Sleaze",
    summary: "Trace Icon actions gain 1 Edge, spent as part of the action or lost.",
  },
];

export interface RunningProgramBonuses {
  dataProcessingBonus: number;
  defenseRatingBonus: number;
  activeLabels: string[];
}

/**
 * Of every named program in MATRIX_PROGRAMS, only two have a numeric effect
 * on the persona's own Attack/Sleaze/Data Processing/Firewall math - Toolbox
 * (+1 Data Processing) and Armor (+2 Defense Rating). Everything else is a
 * dice/Edge bonus scoped to one specific Matrix action, a damage-type
 * change, or flavor text - those stay reference-only, not folded into any
 * live number. `running` is keyed by program name (PlayState's
 * matrixProgramsRunning), same keys as MATRIX_PROGRAMS entries' `name`.
 */
export function runningProgramBonuses(running: Record<string, boolean>): RunningProgramBonuses {
  const activeLabels: string[] = [];
  let dataProcessingBonus = 0;
  let defenseRatingBonus = 0;
  if (running["Toolbox"]) {
    dataProcessingBonus += 1;
    activeLabels.push("Toolbox +1 Data Processing");
  }
  if (running["Armor"]) {
    defenseRatingBonus += 2;
    activeLabels.push("Armor +2 Defense Rating");
  }
  return { dataProcessingBonus, defenseRatingBonus, activeLabels };
}

/** Active Program Slots (core rulebook p.174): capped by Data Processing, not by whatever the device can store - Matrix.tsx's own existing hint text already says this ("Your device's Data Processing rating limits how many can run at once, though more may be stored"). Agent counts as one running program like any other. */
export function runningProgramCount(running: Record<string, boolean>): number {
  return Object.values(running).filter(Boolean).length;
}

export const NOISE_TABLE: { condition: string; noise: string }[] = [
  { condition: "Directly connected (any distance)", noise: "0" },
  { condition: "Up to 100 meters", noise: "0" },
  { condition: "100-1,000 meters", noise: "1" },
  { condition: "1,001-10,000 meters (10 km)", noise: "3" },
  { condition: "10,001 meters to 100 km", noise: "5" },
  { condition: "Greater than 100 km", noise: "8" },
  { condition: "Dense foliage", noise: "1 per 5 meters" },
  { condition: "Faraday cage", noise: "No signal, action blocked" },
  { condition: "Fresh water", noise: "1 per 10 cm" },
  { condition: "Jamming", noise: "1 per hit on Jam Signals actions" },
  { condition: "Metal-laced earth or wall", noise: "1 per 5 meters" },
  { condition: "Salt water", noise: "1 per centimeter" },
  { condition: "Spam zone or static zone", noise: "Rating" },
  { condition: "Wireless negation (e.g. wallpaper or paint)", noise: "Rating" },
];

export const MATRIX_EDGE_ACTIONS: { name: string; cost: string; summary: string }[] = [
  { name: "Emergency Boost", cost: "1 Edge", summary: "Temporarily increase a Matrix attribute by 1 for one test." },
  {
    name: "Hog",
    cost: "2 Edge",
    summary: "Blast a host or persona with recursive requests, lowering its Data Processing by 2 and active program slots by 1 for (Attack Rating) rounds.",
  },
  { name: "Signal Scream", cost: "2 Edge", summary: "The next action ignores any penalty from noise." },
  {
    name: "Technobabble",
    cost: "2 Edge",
    summary: "Technomancers only. Use Charisma instead of Logic on the next Matrix action.",
  },
  {
    name: "Under the Radar",
    cost: "3 Edge",
    summary: "The next illegal action this turn doesn't increase Overwatch Score (it isn't retroactively legal, though).",
  },
];

export const OVERWATCH_SCORE_SOURCES: string[] = [
  "Using a hacking program: OS +1 per Matrix action modified by it (loading it without using it doesn't count)",
  "Maintaining illegal access: +1 OS/round per host with illegal User-level access, +3 OS/round per host with illegal Admin-level access",
  "Performing illegal actions: +1 OS per hit on the opposing roll, win or lose",
];

export interface HackingDicePool {
  label: string;
  skill: string;
  skillRank: number;
  attributeLabel: string;
  attributeValue: number;
  pool: number;
  focusBonuses: { focus: string; tier: "specialization" | "expertise"; bonus: number }[];
  usedFor: string;
}

function focusBonusesFor(specializations: SkillSpecialization[] | undefined, skill: string) {
  return (specializations ?? [])
    .filter((s) => s.skill === skill)
    .map((s) => ({ focus: s.focus, tier: s.tier, bonus: s.tier === "expertise" ? 3 : 2 }));
}

/**
 * A decker/technomancer's hacking-relevant dice pools - Electronics and
 * Cracking (both Logic-linked) plus their Intuition/Willpower-linked
 * pairings for Matrix Perception-style and exit actions. `effectiveAttrs`
 * should already have gear/adept modifiers folded in (see
 * effectiveAttributes() in derive.ts) so an augmentation like a Cerebral
 * Booster is reflected here the same way it is everywhere else this app
 * shows a derived number.
 */
export function hackingDicePools(data: CharacterData, effectiveAttrs: Attributes): HackingDicePool[] {
  const electronics = data.skills["Electronics"] ?? 0;
  const cracking = data.skills["Cracking"] ?? 0;

  const pools: Omit<HackingDicePool, "pool">[] = [
    {
      label: "Electronics + Logic",
      skill: "Electronics",
      skillRank: electronics,
      attributeLabel: "Logic",
      attributeValue: effectiveAttrs.logic,
      focusBonuses: focusBonusesFor(data.specializations, "Electronics"),
      usedFor:
        "Control Device, Crack File (defense), Edit File, Encrypt File, Format Device, Hash Check, Reboot Device, Set Data Bomb, and most other Electronics-linked Matrix actions",
    },
    {
      label: "Cracking + Logic",
      skill: "Cracking",
      skillRank: cracking,
      attributeLabel: "Logic",
      attributeValue: effectiveAttrs.logic,
      focusBonuses: focusBonusesFor(data.specializations, "Cracking"),
      usedFor:
        "Backdoor Entry, Brute Force, Check OS, Crack File, Crash Program, Data Spike, Disarm Data Bomb, Jam Signals, Probe, Snoop, Spoof Command, Tarpit, and most other Cracking-linked Matrix actions",
    },
    {
      label: "Electronics + Intuition",
      skill: "Electronics",
      skillRank: electronics,
      attributeLabel: "Intuition",
      attributeValue: effectiveAttrs.intuition,
      focusBonuses: [],
      usedFor: "Matrix Perception, Matrix Search, Trace Icon",
    },
    {
      label: "Cracking + Intuition",
      skill: "Cracking",
      skillRank: cracking,
      attributeLabel: "Intuition",
      attributeValue: effectiveAttrs.intuition,
      focusBonuses: [],
      usedFor: "Hide",
    },
    {
      label: "Electronics + Willpower",
      skill: "Electronics",
      skillRank: electronics,
      attributeLabel: "Willpower",
      attributeValue: effectiveAttrs.willpower,
      focusBonuses: [],
      usedFor: "Jack Out",
    },
  ];

  return pools.map((p) => ({ ...p, pool: p.skillRank + p.attributeValue }));
}
