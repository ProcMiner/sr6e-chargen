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
