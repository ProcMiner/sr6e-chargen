// Complex Forms catalog - technomancers' equivalent of Spells. Core rulebook
// "Complex Forms" section, book pp. 189-191. Flavor/rules text is paraphrased
// in our own words; Fade Value/Duration are transcribed as printed.
//
// A few entries (Diffusion, Infusion, Emulate) target a Matrix attribute or
// program that isn't itself part of this flat catalog schema, and the book
// says they're explicitly repeatable (buy the same complex form again for a
// different target) - same "free-text notes + no duplicate-blocking"
// treatment as AdeptPowerCatalogEntry's Attribute Boost/Elemental Strike
// family, not a formal param picker.

export interface ComplexFormCatalogEntry {
  id: string;
  name: string;
  /**
   * Fade Value: a flat number, "Hits" (Hack & Slash's newer convention -
   * equal to total hits, not net hits, on the Electronics + Resonance test),
   * "None" for the one core form with no fading at all (Emulate), or
   * "Varies" for the rare form whose Fade Value depends on what it merges.
   */
  fadeValue: number | "Hits" | "None" | "Varies";
  /** I (Instantaneous), S (Sustained), or P (Permanent); "I/S" for the one form whose duration changes based on its result. */
  duration: string;
  summary: string;
  /** Sourcebook this entry is transcribed from. */
  book: string;
}

export const coreComplexForms: ComplexFormCatalogEntry[] = [
  {
    id: "complex-form-cleaner",
    name: "Cleaner",
    fadeValue: 2,
    duration: "P",
    summary: "Make an Electronics + Resonance test. Each hit reduces your Overwatch Score by 1.",
    book: "Core p. 190",
  },
  {
    id: "complex-form-diffusion",
    name: "Diffusion (Matrix Attribute)",
    fadeValue: 4,
    duration: "S",
    summary:
      "Make an Electronics + Resonance vs. Willpower + Firewall opposed test. Each net hit reduces the target's chosen Matrix attribute by 1, to a minimum of 1. Repeatable, once per targeted attribute - use notes to record which.",
    book: "Core p. 190",
  },
  {
    id: "complex-form-editor",
    name: "Editor",
    fadeValue: 3,
    duration: "P",
    summary: "Take the Edit File action on a file even without the proper access level, as long as you can detect the file.",
    book: "Core p. 190",
  },
  {
    id: "complex-form-emulate",
    name: "Emulate (Program)",
    fadeValue: "None",
    duration: "S",
    summary:
      "Run one chosen program without owning it, including an autosoft at a rating equal to your current Data Processing. Repeatable, once per program - use notes to record which.",
    book: "Core p. 190",
  },
  {
    id: "complex-form-infusion",
    name: "Infusion (Matrix Attribute)",
    fadeValue: 4,
    duration: "S",
    summary:
      "Make a simple Electronics + Resonance (4) test; each net hit increases the target's chosen Matrix attribute by 1, up to twice its normal rating. Repeatable, once per targeted attribute - use notes to record which.",
    book: "Core p. 190",
  },
  {
    id: "complex-form-mirrored-persona",
    name: "Mirrored Persona",
    fadeValue: 3,
    duration: "S",
    summary:
      "Create a proxy persona identical to you in the Matrix. Make an Electronics + Resonance test; the hits set the proxy's rating. Opponents targeting you must beat a Matrix Perception test at that threshold or target the proxy instead, which then ends the form.",
    book: "Core p. 190",
  },
  {
    id: "complex-form-pulse-storm",
    name: "Pulse Storm",
    fadeValue: 3,
    duration: "I",
    summary: "Make an Electronics + Resonance vs. Logic + Data Processing test. Each net hit increases the target's noise rating by 1.",
    book: "Core p. 190",
  },
  {
    id: "complex-form-puppeteer",
    name: "Puppeteer",
    fadeValue: 5,
    duration: "S",
    summary: "Take the Control Device action on a device even without the proper access level, as long as you can detect it.",
    book: "Core p. 190",
  },
  {
    id: "complex-form-resonance-channel",
    name: "Resonance Channel",
    fadeValue: 2,
    duration: "S",
    summary: "Make an Electronics + Resonance test. Each hit reduces your noise level by 1.",
    book: "Core p. 190",
  },
  {
    id: "complex-form-resonance-spike",
    name: "Resonance Spike",
    fadeValue: 4,
    duration: "I",
    summary: "Make a Cracking + Resonance vs. Willpower + Firewall test; each net hit causes 1 box of unresisted Matrix damage.",
    book: "Core p. 191",
  },
  {
    id: "complex-form-resonance-veil",
    name: "Resonance Veil",
    fadeValue: 4,
    duration: "S",
    summary:
      "Create a convincing illusion of Matrix activity. Make an Electronics + Resonance vs. Intuition + Data Processing test; a target who suspects it's fake still needs a Matrix Perception test at a threshold equal to your net hits to see through it.",
    book: "Core p. 191",
  },
  {
    id: "complex-form-static-bomb",
    name: "Static Bomb",
    fadeValue: 6,
    duration: "I",
    summary:
      "Make an Electronics + Resonance vs. Intuition + Data Processing test against every target that can detect you. A target that scores no net hits loses perception of you and must re-locate you with a Matrix Perception test before acting against you again.",
    book: "Core p. 191",
  },
  {
    id: "complex-form-static-veil",
    name: "Static Veil",
    fadeValue: 3,
    duration: "S",
    summary:
      "Make an Electronics + Resonance vs. Willpower/Firewall + Firewall test. While sustained, illegal access maintained on a sprite doesn't accrue Overwatch Score (illegal actions still do).",
    book: "Core p. 191",
  },
  {
    id: "complex-form-stitches",
    name: "Stitches",
    fadeValue: 4,
    duration: "P",
    summary: "Make an Electronics + Resonance test. Each net hit repairs 1 box of Matrix damage on a sprite.",
    book: "Core p. 191",
  },
  {
    id: "complex-form-tattletale",
    name: "Tattletale",
    fadeValue: 3,
    duration: "P",
    summary: "Make an Electronics + Resonance test. Each hit increases the target's Overwatch Score by 1.",
    book: "Core p. 191",
  },
];
