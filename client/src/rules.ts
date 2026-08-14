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

export interface MetavariantCatalogEntry {
  id: string;
  name: string;
  parentMetatype: Metatype;
  /** Customization Karma cost, deducted from the 50-point customization Karma pool. */
  karma: number;
  /** Only set for entries whose printed Karma cost varies by an unmodeled sub-choice (e.g. Nartaki's Shiva Arms level). */
  karmaNote?: string;
  body: AttributeRange;
  agility: AttributeRange;
  reaction: AttributeRange;
  strength: AttributeRange;
  willpower: AttributeRange;
  logic: AttributeRange;
  intuition: AttributeRange;
  charisma: AttributeRange;
  edge: AttributeRange;
  /** Adjustment Points at each Priority letter; a missing letter means the metavariant isn't available at that priority. */
  adjustmentPoints: Partial<Record<PriorityLetter, number>>;
  racialTraits: string[];
}

export interface PriorityRulesResponse {
  priorityTable: PriorityRow[];
  metatypeAttributes: MetatypeAttributes[];
  metavariants: MetavariantCatalogEntry[];
  skillList: string[];
  /** Each skill's Primary Linked Attribute (core rulebook pp. 92-97), keyed by skill name - e.g. "Firearms": "agility". */
  skillLinkedAttribute: Record<string, string>;
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

/**
 * What a StatModifier changes. Mirrors server/src/rules/modifiers.ts -
 * deliberately narrow, see that file's comment for what's out of scope.
 */
export type ModifierTarget =
  | "body"
  | "agility"
  | "reaction"
  | "strength"
  | "willpower"
  | "logic"
  | "intuition"
  | "charisma"
  | "initiativeDice"
  | "armor"
  /** Player picks the actual target at purchase time - see the owning line's `notes` field. */
  | "choice";

export interface StatModifier {
  target: ModifierTarget;
  /** Fixed flat amount; "rating" if it scales with the purchased level/rating; "netHits" for spell magnitude set at cast time. Negative = penalty. */
  amount: number | "rating" | "netHits";
  /** Mutually-exclusive group key (SR6's "incompatible with other X" augmentations/powers) - only the highest amount in a group applies. */
  stackingGroup?: string;
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
  /** Structured attribute/derived-stat bonuses this item grants; undefined for everything else. */
  modifiers?: StatModifier[];
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
  /** Structured attribute/derived-stat bonuses this spell grants while sustained; undefined for everything else. */
  modifiers?: StatModifier[];
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
  /** Structured attribute/derived-stat bonuses this power grants; undefined for everything else. */
  modifiers?: StatModifier[];
}

export interface AdeptPowerRulesResponse {
  adeptPowers: AdeptPowerCatalogEntry[];
}

export interface LifestyleCatalogEntry {
  id: string;
  name: string;
  /** Nuyen per month; flat, no rating/levels for the basic tiers. */
  costPerMonth: number;
  summary: string;
  /** Sourcebook this entry is transcribed from. */
  book: string;
}

export interface LifestyleRulesResponse {
  lifestyles: LifestyleCatalogEntry[];
}

export interface ComplexFormCatalogEntry {
  id: string;
  name: string;
  /**
   * Fade Value: a flat number, "Hits" (Hack & Slash's newer convention -
   * equal to total hits, not net hits, on the Electronics + Resonance
   * test), "None" for the one core form with no fading at all, or "Varies"
   * for the rare form whose Fade Value depends on what it merges.
   */
  fadeValue: number | "Hits" | "None" | "Varies";
  /** I (Instantaneous), S (Sustained), or P (Permanent); "I/S" for the one form whose duration changes based on its result. */
  duration: string;
  summary: string;
  /** Sourcebook this entry is transcribed from. */
  book: string;
}

export interface ComplexFormRulesResponse {
  complexForms: ComplexFormCatalogEntry[];
}

/** Pre-built NPC stat block a GM can drop straight into the NPC roster - mirrors server/src/rules/npcTemplates.ts and critters.ts. */
export interface NpcTemplateEntry {
  id: string;
  name: string;
  /** Pre-formatted display label for the "Import from book" UI's grouping headers, e.g. "Professional Rating 0 - Thugs and Mobs" or "Mundane Critters". */
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

export interface NpcTemplateRulesResponse {
  npcTemplates: NpcTemplateEntry[];
}

/** Mirrors server/src/rules/spiritPowers.ts's SpiritPowerEntry. */
export interface SpiritPowerEntry {
  id: string;
  name: string;
  type: "M" | "P";
  action: "Minor" | "Major" | "Auto";
  range: "LOS" | "Touch" | "Self" | "Special" | "Varies" | "As spell";
  duration: "Instant" | "Sustained" | "Always" | "Special";
  summary: string;
}

/** Mirrors server/src/rules/spirits.ts's SpiritCatalogEntry. */
export interface SpiritAttributeMods {
  body: number;
  agility: number;
  reaction: number;
  strength: number;
  willpower: number;
  logic: number;
  intuition: number;
  charisma: number;
}

export interface SpiritPowerRef {
  powerId: string;
  note?: string;
}

export interface SpiritCatalogEntry {
  id: string;
  name: string;
  book: string;
  summary: string;
  attributeMods: SpiritAttributeMods;
  defenseRatingMod: number;
  initiative: string;
  astralInitiative: string;
  actionsNote: string;
  movement: string;
  skills: string[];
  fixedPowers: SpiritPowerRef[];
  optionalPowers: SpiritPowerRef[];
  weaknesses: string[];
  attacks: string[];
}

export interface SpiritRulesResponse {
  spirits: SpiritCatalogEntry[];
  spiritPowers: SpiritPowerEntry[];
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
