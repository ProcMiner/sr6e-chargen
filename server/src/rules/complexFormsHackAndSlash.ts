// Complex Forms catalog, Hack & Slash addition - "Techno Tools" chapter's
// "New Complex Forms" section (book pp. 62-67). Most of these use the book's
// newer "Hits" Fade Value convention (total hits, not net hits, on the
// Electronics + Resonance test - see ComplexFormCatalogEntry.fadeValue).
//
// Also includes the three complex forms tied to a Resonant Stream
// ("New Technomancer Qualities: Resonant Streams," book pp. 130-132: Loto/
// Machinists, Hyperthreading/Sourcerors, Control Virtual Life/Technoshamans)
// - each summary notes the stream it requires. The stream itself is
// transcribed as a single lightweight quality (see qualities.ts's
// "resonant-stream" entry), same "book-reference effect text" treatment as
// Adept Way/Paragon/Mentor Spirit, not a fully simulated system (the
// streams' fixed benefits and Aspect Peripheral powers aren't modeled).
import type { ComplexFormCatalogEntry } from "./complexForms.js";

export const hackAndSlashComplexForms: ComplexFormCatalogEntry[] = [
  {
    id: "complex-form-arc-feedback",
    name: "Arc Feedback",
    fadeValue: 3,
    duration: "S",
    summary:
      "Make an Electronics + Resonance test and record your hits. While sustained, if you take Matrix damage from a Data Spike, Resonance Spike, or IC, the attacker takes Matrix damage equal to your recorded hits - then the form collapses.",
    book: "Hack & Slash p. 63",
  },
  {
    id: "complex-form-attack-attribution",
    name: "Attack Attribution",
    fadeValue: "Hits",
    duration: "S",
    summary:
      "Target a willing persona and make an Electronics + Resonance test. While sustained, the target gains (or upgrades) an Attack Matrix attribute equal to your total hits, and may use Cracking-based illegal Matrix actions.",
    book: "Hack & Slash p. 63",
  },
  {
    id: "complex-form-bubble-shield",
    name: "Bubble Shield",
    fadeValue: "Hits",
    duration: "S",
    summary:
      "Make an Electronics + Resonance test on a Matrix-connected target and record total hits. For every two full hits, the target gains a bonus die resisting complex forms and sprite powers.",
    book: "Hack & Slash p. 63",
  },
  {
    id: "complex-form-btl-irl",
    name: "BTL IRL",
    fadeValue: 4,
    duration: "S",
    summary:
      "Requires a target with headware augmentations. Make an Electronics + Resonance test (threshold 6 minus target's Essence) to grant Perception bonus dice equal to net hits, at the cost of Con/Influence penalties and a chance of Physical biofeedback damage on a glitch - mechanically and narratively equivalent to a BTL chip.",
    book: "Hack & Slash p. 63",
  },
  {
    id: "complex-form-cyber-spike",
    name: "Cyber Spike",
    fadeValue: "Hits",
    duration: "I",
    summary:
      "Targets a character with wireless-enabled (or directly connected) cyberware. Make an Electronics + Resonance vs. Body + Essence test; net hits deal unresistable Physical damage and stress all of the target's cyberware as if from augmentation overdrive.",
    book: "Hack & Slash p. 64",
  },
  {
    id: "complex-form-cyberjack-overclock",
    name: "Cyberjack Overclock",
    fadeValue: "Hits",
    duration: "S",
    summary:
      "Targets a persona using a cyberjack or cyberhack device. Make an Electronics + Resonance test; each hit adds 1 to the target's Matrix Initiative score while sustained.",
    book: "Hack & Slash p. 64",
  },
  {
    id: "complex-form-cyberware-stamina",
    name: "Cyberware Stamina",
    fadeValue: 3,
    duration: "S",
    summary:
      "Targets a character with augmentations (via Skinlink/Aura Link if not wireless). Make an Electronics + Resonance test (threshold 6 minus target's Essence); while sustained, the target's augmentations are immune to augmentation overdrive stress.",
    book: "Hack & Slash p. 64",
  },
  {
    id: "complex-form-data-bomb-eater",
    name: "Data Bomb Eater",
    fadeValue: 3,
    duration: "S",
    summary:
      "Make an Electronics + Resonance test and record total hits. If a Data Bomb triggers while sustaining this form, its rating is reduced by your hits - reduced to zero or below, it's harmlessly defused and the protected file survives.",
    book: "Hack & Slash p. 64",
  },
  {
    id: "complex-form-data-disguise",
    name: "Data Disguise",
    fadeValue: 2,
    duration: "S",
    summary:
      "Make an Electronics + Resonance test on a targeted icon and record total hits; disguises its type and Matrix attributes. A Matrix Perception test against it only sees through the disguise if it beats your recorded hits.",
    book: "Hack & Slash p. 64",
  },
  {
    id: "complex-form-enhance-autosofts",
    name: "Enhance Autosofts",
    fadeValue: "Hits",
    duration: "S",
    summary:
      "Targets a device capable of running an autosoft. Make an Electronics + Resonance test; for every two hits, add a bonus die to tests made using an autosoft on that device while sustained.",
    book: "Hack & Slash p. 65",
  },
  {
    id: "complex-form-enlighten-automaton",
    name: "Enlighten Automaton",
    fadeValue: "Hits",
    duration: "S",
    summary:
      "Targets an unoccupied device with a Pilot rating. Make an Electronics + Resonance test; you may split your hits to boost its Pilot and/or Sensor rating (each capped at double its original), and it auto-passes tests to understand complex/chaotic orders while sustained.",
    book: "Hack & Slash p. 65",
  },
  {
    id: "complex-form-host-emulator",
    name: "Host Emulator",
    fadeValue: 6,
    duration: "S",
    summary:
      "Targets a persona or IC within a host. Make an Electronics + Resonance vs. Intuition + Firewall test; on net hits, the target's next Matrix Actions automatically fail while it believes they succeeded, for as long as the form is sustained.",
    book: "Hack & Slash p. 65",
  },
  {
    id: "complex-form-ic-pick",
    name: "IC Pick",
    fadeValue: 4,
    duration: "I/S",
    summary:
      "Targets IC running on a host. Make an Electronics + Resonance vs. Host Rating x2 test; the IC takes Matrix damage equal to your Attack attribute plus net hits. If you crash it, the form becomes sustained and blocks the host from launching another instance of that IC type.",
    book: "Hack & Slash p. 65",
  },
  {
    id: "complex-form-machine-merge",
    name: "Machine Merge",
    fadeValue: "Hits",
    duration: "S",
    summary:
      "Targets a character with a control rig (or equivalent echo). Make an Electronics + Resonance test; for every two hits, the target gains a bonus die on Piloting/Engineering/defense tests while jumped into a vehicle or drone, for as long as sustained.",
    book: "Hack & Slash p. 65",
  },
  {
    id: "complex-form-marionette",
    name: "Marionette",
    fadeValue: 6,
    duration: "S",
    summary:
      "Targets a character with a bodyware augmentation or cyberlimb connected to their nervous system (needs line of sight and the Aura Link echo if the target's ware isn't wireless). Make an Electronics + Resonance vs. Willpower + Firewall test; net hits let you force physical actions on the target's body, one net hit consumed per action.",
    book: "Hack & Slash p. 65",
  },
  {
    id: "complex-form-primed-charge",
    name: "Primed Charge",
    fadeValue: "Hits",
    duration: "S",
    summary:
      "Make an Electronics + Resonance test and record total hits. The next Matrix Action or complex form you use gains a point of Edge per two full hits (all of it lost once that action resolves); requires a non-empty Edge pool to use.",
    book: "Hack & Slash p. 66",
  },
  {
    id: "complex-form-resonance-wires",
    name: "Resonance Wires",
    fadeValue: 2,
    duration: "S",
    summary:
      "Establishes a remote direct connection to a targeted device or character even with wireless mode fully disabled. Make an Electronics + Resonance test (threshold 2 plus noise).",
    book: "Hack & Slash p. 66",
  },
  {
    id: "complex-form-restore-continuity",
    name: "Restore Continuity",
    fadeValue: "Hits",
    duration: "P",
    summary:
      "Heals Matrix damage on software (remote agents, AI, Matrix fauna, IC). Make an Electronics + Resonance test; restores one box per hit. Has no effect on devices or sprites.",
    book: "Hack & Slash p. 66",
  },
  {
    id: "complex-form-search-history",
    name: "Search History",
    fadeValue: 2,
    duration: "P",
    summary:
      "Make an Electronics + Resonance vs. Willpower (or device rating) + Firewall test on a targeted device; net hits reveal a log of its Matrix Actions and their targets over roughly the past 24 hours.",
    book: "Hack & Slash p. 66",
  },
  {
    id: "complex-form-sleaze-attribution",
    name: "Sleaze Attribution",
    fadeValue: "Hits",
    duration: "S",
    summary:
      "Target a willing persona and make an Electronics + Resonance test. While sustained, the target gains (or upgrades) a Sleaze Matrix attribute equal to your total hits, and may use Electronics-based illegal Matrix actions.",
    book: "Hack & Slash p. 66",
  },
  {
    id: "complex-form-smartgun-amplifier",
    name: "Smartgun Amplifier",
    fadeValue: "Hits",
    duration: "S",
    summary:
      "Targets a smartgun-equipped weapon or M-TOC device. Make an Electronics + Resonance test to boost the Attack Rating of connected weapons.",
    book: "Hack & Slash p. 67",
  },
  {
    id: "complex-form-loto",
    name: "Loto",
    fadeValue: 4,
    duration: "I",
    summary:
      "Requires the Machinists stream. Targets any device. Make an Electronics + Resonance vs. Willpower + Firewall opposed test; the device (and its Pilot, if any) is disabled for a number of Combat Turns equal to net hits.",
    book: "Hack & Slash p. 131",
  },
  {
    id: "complex-form-hyperthreading",
    name: "Hyperthreading",
    fadeValue: "Varies",
    duration: "Varies",
    summary:
      "Requires the Sourcerors stream. Merges multiple complex forms with the same target/level into a single Software + Resonance test, sharing one result. Fade Value is the highest merged form's FV plus 1 per additional form merged.",
    book: "Hack & Slash p. 131",
  },
  {
    id: "complex-form-control-virtual-life",
    name: "Control Virtual Life",
    fadeValue: 5,
    duration: "S",
    summary:
      "Requires the Technoshamans stream. Targets virtual life (a sprite, protosapient, xenosapient, construct, or technocritter). Make an Electronics + Resonance vs. Firewall + Willpower opposed test; net hits set how many turns you can command the target's actions.",
    book: "Hack & Slash p. 132",
  },
];
