// Mirrors server/src/rules/*.ts and server/src/types.ts. Kept as plain
// data-shape types (not logic) so there's little to drift; the derive.ts
// math is intentionally duplicated in ./derive.ts since it's a handful of
// lines and pulling in a shared workspace package wasn't worth the build
// complexity for an app this size.

export type PriorityLetter = "A" | "B" | "C" | "D" | "E";
export type Metatype = "Human" | "Dwarf" | "Elf" | "Ork" | "Troll";
export type MagicOption = "Full" | "Aspected" | "Mystic Adept" | "Adept" | "Technomancer" | "Mundane";

export interface PriorityMetatypeOption {
  metatype: Metatype;
  adjustmentPoints: number;
}

export interface PriorityMagicOption {
  option: MagicOption;
  rating?: number;
}

export interface PriorityRow {
  priority: PriorityLetter;
  metatype: PriorityMetatypeOption[];
  attributePoints: number;
  skillPoints: number;
  magic: PriorityMagicOption[];
  resources: number;
}

export interface AttributeRange {
  min: number;
  max: number;
}

export interface MetatypeAttributes {
  metatype: Metatype;
  body: AttributeRange;
  agility: AttributeRange;
  reaction: AttributeRange;
  strength: AttributeRange;
  willpower: AttributeRange;
  logic: AttributeRange;
  intuition: AttributeRange;
  charisma: AttributeRange;
  edge: AttributeRange;
  racialQualities: string[];
}

export interface PriorityRulesResponse {
  priorityTable: PriorityRow[];
  metatypeAttributes: MetatypeAttributes[];
  skillList: string[];
}

export interface Boost {
  amount: number;
  from: string[];
  count?: number;
}

export interface KnowledgeChoice {
  count: number;
  suggestions: string[];
  allowsLanguage?: boolean;
}

export interface QualitySlot {
  count: number;
  polarity: "positive" | "negative" | "either" | "positive-and-negative";
  note?: string;
}

export interface LifeModule {
  id: string;
  name: string;
  category: "starting" | "choice" | "event";
  restriction?: string;
  summary: string;
  boosts?: Boost[];
  knowledgeChoice?: KnowledgeChoice;
  resources?: number;
  contactPoints?: number;
  contactTypes?: string[];
  qualitySlots?: QualitySlot[];
  languageChoice?: { level: number; note?: string };
  notes?: string[];
}

export interface LifepathRulesResponse {
  startingModules: LifeModule[];
  adultModules: LifeModule[];
}

export interface QualityCatalogEntry {
  id: string;
  name: string;
  category: "positive" | "negative";
  /** Karma cost (positive quality) or Karma bonus (negative quality); always a positive number, `category` determines the sign. */
  karma: number;
  summary: string;
  effect: string;
  /** Only for qualities with a purchasable rating (e.g. Built Tough 1-4); karma is per level. */
  levels?: { min: number; max: number };
  /** Only for qualities that need the player to specify a target (e.g. Aptitude (Skill)). */
  requiresParam?: "skill" | "attribute" | "custom";
}

export interface QualityRulesResponse {
  positiveQualities: QualityCatalogEntry[];
  negativeQualities: QualityCatalogEntry[];
}

export interface GearCatalogEntry {
  id: string;
  name: string;
  /** Broad grouping key, e.g. "weapon" - opaque string, not a fixed union, since new categories arrive with each future chunk. */
  category: string;
  /** Narrower grouping for the picker UI, e.g. "Light Pistols". */
  subcategory?: string;
  /** Nuyen cost; per-level if `levels` is set. */
  cost: number;
  /** Availability code, e.g. "4", "8R", "12F". */
  availability: string;
  summary: string;
  /** For rated items; cost is PER LEVEL, same convention as QualityCatalogEntry.levels. */
  levels?: { min: number; max: number };
  /** Free-form display-only stat fields (Damage, Modes, Attack Ratings, Ammo, Mount, Blast...). */
  stats?: Record<string, string>;
  /** Essence consumed per unit (cyberware/bioware); PER LEVEL if `levels` is set, same convention as `cost`. Undefined for everything else. */
  essenceCost?: number;
  /** Karma cost to bond this item (magical foci); PER LEVEL if `levels` is set, same convention as `cost`. Undefined for everything else. */
  bondingKarma?: number;
}

export interface GearRulesResponse {
  gear: GearCatalogEntry[];
}

export interface PackCatalogEntry {
  id: string;
  name: string;
  /** Broad grouping key, e.g. "weapon-pack" - opaque string, not a fixed union, matching GearCatalogEntry.category. */
  category: string;
  /** Narrower grouping for the picker UI, e.g. "Heavy Pistols". */
  subcategory?: string;
  /** The book's stated flat nuyen price for the whole bundle. */
  cost: number;
  summary: string;
  /** References into the existing gear catalogs - not new items of their own. */
  items: { itemId: string; qty: number; rating?: number; notes?: string }[];
}

export interface PackRulesResponse {
  packs: PackCatalogEntry[];
}

export interface SpellCatalogEntry {
  id: string;
  name: string;
  category: "Combat" | "Detection" | "Health" | "Illusion" | "Manipulation";
  /** Free-form descriptors from the book, e.g. "Direct Combat", "Area", "Single-Sense". */
  tags?: string[];
  /** Touch, LOS, or LOS(A) for an area effect. */
  range: string;
  /** M (mana) or P (physical). */
  type: "M" | "P";
  /** I (Instantaneous), S (Sustained), L (Limited), or P (Permanent). */
  duration: string;
  /** Drain Value; "Special" for the rare spell whose Drain is defined narratively instead of a flat number. */
  drainValue: number | string;
  /** Combat spells only: S (Stun), P (Physical), or "P, Special" for spells with a non-standard damage model explained in the summary. */
  damage?: string;
  summary: string;
  /** Sourcebook this entry is transcribed from. */
  book: string;
}

export interface SpellRulesResponse {
  spells: SpellCatalogEntry[];
}

export interface AdeptPowerCatalogEntry {
  id: string;
  name: string;
  /** Power Point cost; PER LEVEL if `levels` is set. */
  cost: number;
  /** For rated powers; cost is PER LEVEL, same convention as GearCatalogEntry.levels. */
  levels?: { min: number; max: number };
  /** Passive, Minor Action, Major Action, or a longer free-form description. */
  activation: string;
  /** Another power this one requires, e.g. "Killing Hands". */
  prerequisite?: string;
  /** Free-form descriptors, e.g. "Element" for the Elemental Missile/Strike/Weapon family. */
  tags?: string[];
  summary: string;
  /** Sourcebook this entry is transcribed from. */
  book: string;
}

export interface AdeptPowerRulesResponse {
  adeptPowers: AdeptPowerCatalogEntry[];
}

export interface Attributes {
  body: number;
  agility: number;
  reaction: number;
  strength: number;
  willpower: number;
  logic: number;
  intuition: number;
  charisma: number;
  edge: number;
  magic?: number;
  resonance?: number;
}
