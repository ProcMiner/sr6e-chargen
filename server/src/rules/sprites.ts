// Sprite catalog - core rulebook "Technomancers" chapter, "Types of
// Sprites" section, book pp. 193-194 (SR6_Core_RuleBook_noimg.pdf, printed
// p. 193). The five sprites printed there: Courier, Crack, Data, Fault,
// Machine. Powers referenced below are defined in spritePowers.ts.
//
// Extraction note: this page's two-column stat-block layout badly scrambles
// `pdftotext -layout`'s reading order (each stat block's numbers get
// interleaved with the next type's flavor text) - cross-checked against
// `pdftotext -raw` on the same page, which preserves the original text
// stream order correctly and confirms every type/stat/power pairing below.
//
// "Sprite skill ratings...equal their Level" (p. 193) - unlike spirits,
// sprites are never given a Body/Agility/etc. attribute-mods table; they're
// pure Matrix constructs with only Matrix attributes, so there's no
// SpiritAttributeMods equivalent here. "Device Rating and Resonance equal
// to their rating [Level]" (p. 193) is a flat 1:1, not stored per-entry.
//
// Matrix attribute formulas are all "Level + a flat per-type modifier" (see
// SpriteMatrixMods below), resolved at a chosen Level by deriveSprites.ts.
// Initiative keeps "L" as a literal Level placeholder, substituted the same
// way spirits.ts's Force-template strings are.
//
// Unlike spirits, sprites have no optional-power pool - every power listed
// is always present, so there's just one `powers` list per entry (no
// fixed/optional split, no SpiritPowerRef sub-choice notes needed either,
// since none of the five types' powers carry a sub-choice in the book).

export interface SpriteMatrixMods {
  attack: number;
  sleaze: number;
  dataProcessing: number;
  firewall: number;
}

export interface SpriteCatalogEntry {
  id: string;
  name: string;
  book: string;
  summary: string;
  matrixMods: SpriteMatrixMods;
  /** Initiative formula with "L" as a literal Level placeholder, e.g. "[(L x 2) + 1] + 4D6". */
  initiative: string;
  /** Skill names; each is at a rank equal to the sprite's Level. */
  skills: string[];
  /** spritePowers.ts ids - always present, no optional selection. */
  powers: string[];
}

const CORE = "Core Rulebook";

export const sprites: SpriteCatalogEntry[] = [
  {
    id: "sprite-courier",
    name: "Courier Sprite",
    book: CORE,
    summary: "Great at delivering messages securely and a pretty good tracker.",
    matrixMods: { attack: 0, sleaze: 3, dataProcessing: 1, firewall: 2 },
    initiative: "[(L x 2) + 1] + 4D6",
    skills: ["Electronics", "Cracking"],
    powers: ["sprite-power-cookie", "sprite-power-hash"],
  },
  {
    id: "sprite-crack",
    name: "Crack Sprite",
    book: CORE,
    summary: "For a quiet run that stays under the radar.",
    matrixMods: { attack: 0, sleaze: 3, dataProcessing: 2, firewall: 1 },
    initiative: "[(L x 2) + 2] + 4D6",
    skills: ["Electronics", "Cracking"],
    powers: ["sprite-power-phantom", "sprite-power-suppression"],
  },
  {
    id: "sprite-data",
    name: "Data Sprite",
    book: CORE,
    summary: "Masters of finding and manipulating data - great librarians, search bots, and trivia contest ringers.",
    matrixMods: { attack: -1, sleaze: 0, dataProcessing: 4, firewall: 1 },
    initiative: "[(L x 2) + 4] + 4D6",
    skills: ["Electronics", "Cracking"],
    powers: ["sprite-power-camouflage", "sprite-power-watermark"],
  },
  {
    id: "sprite-fault",
    name: "Fault Sprite",
    book: CORE,
    summary: "The one you want at your back in a fight - cold as IC and twice as tenacious.",
    matrixMods: { attack: 3, sleaze: 0, dataProcessing: 1, firewall: 2 },
    initiative: "[(L x 2) + 1] + 4D6",
    skills: ["Electronics", "Cracking"],
    powers: ["sprite-power-electron-storm", "sprite-power-trap"],
  },
  {
    id: "sprite-machine",
    name: "Machine Sprite",
    book: CORE,
    summary: "The sprite most likely to interact with the physical world (through a device) - experts at all sorts of electronics.",
    matrixMods: { attack: 1, sleaze: 0, dataProcessing: 3, firewall: 2 },
    initiative: "[(L x 2) + 3] + 4D6",
    skills: ["Electronics", "Engineering"],
    powers: ["sprite-power-diagnostics", "sprite-power-override", "sprite-power-stability"],
  },
];
