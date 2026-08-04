// Transcribed from the SR6e core rulebook, "Priority Table" (p. 64) and
// "Metatype Attributes Table" (p. 65).

export type PriorityLetter = "A" | "B" | "C" | "D" | "E";
export type Metatype = "Human" | "Dwarf" | "Elf" | "Ork" | "Troll";
export type MagicOption =
  | "Full"
  | "Aspected"
  | "Mystic Adept"
  | "Adept"
  | "Technomancer"
  | "Mundane";

export interface PriorityMetatypeOption {
  metatype: Metatype;
  adjustmentPoints: number;
}

export interface PriorityMagicOption {
  option: MagicOption;
  /** Starting Magic or Resonance rating; undefined for Mundane. */
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

export const priorityTable: PriorityRow[] = [
  {
    priority: "A",
    metatype: [
      { metatype: "Dwarf", adjustmentPoints: 13 },
      { metatype: "Ork", adjustmentPoints: 13 },
      { metatype: "Troll", adjustmentPoints: 13 },
    ],
    attributePoints: 24,
    skillPoints: 32,
    magic: [
      { option: "Full", rating: 4 },
      { option: "Aspected", rating: 5 },
      { option: "Mystic Adept", rating: 4 },
      { option: "Adept", rating: 4 },
      { option: "Technomancer", rating: 4 },
    ],
    resources: 450_000,
  },
  {
    priority: "B",
    metatype: [
      { metatype: "Dwarf", adjustmentPoints: 11 },
      { metatype: "Elf", adjustmentPoints: 11 },
      { metatype: "Ork", adjustmentPoints: 11 },
      { metatype: "Troll", adjustmentPoints: 11 },
    ],
    attributePoints: 16,
    skillPoints: 24,
    magic: [
      { option: "Full", rating: 3 },
      { option: "Aspected", rating: 4 },
      { option: "Mystic Adept", rating: 3 },
      { option: "Adept", rating: 3 },
      { option: "Technomancer", rating: 3 },
    ],
    resources: 275_000,
  },
  {
    priority: "C",
    metatype: [
      { metatype: "Dwarf", adjustmentPoints: 9 },
      { metatype: "Elf", adjustmentPoints: 9 },
      { metatype: "Human", adjustmentPoints: 9 },
      { metatype: "Ork", adjustmentPoints: 9 },
      { metatype: "Troll", adjustmentPoints: 9 },
    ],
    attributePoints: 12,
    skillPoints: 20,
    magic: [
      { option: "Full", rating: 2 },
      { option: "Aspected", rating: 3 },
      { option: "Mystic Adept", rating: 2 },
      { option: "Adept", rating: 2 },
      { option: "Technomancer", rating: 2 },
    ],
    resources: 150_000,
  },
  {
    priority: "D",
    metatype: [
      { metatype: "Dwarf", adjustmentPoints: 4 },
      { metatype: "Elf", adjustmentPoints: 4 },
      { metatype: "Human", adjustmentPoints: 4 },
      { metatype: "Ork", adjustmentPoints: 4 },
      { metatype: "Troll", adjustmentPoints: 4 },
    ],
    attributePoints: 8,
    skillPoints: 16,
    magic: [
      { option: "Full", rating: 1 },
      { option: "Aspected", rating: 2 },
      { option: "Mystic Adept", rating: 1 },
      { option: "Adept", rating: 1 },
      { option: "Technomancer", rating: 1 },
    ],
    resources: 50_000,
  },
  {
    priority: "E",
    metatype: [
      { metatype: "Dwarf", adjustmentPoints: 1 },
      { metatype: "Elf", adjustmentPoints: 1 },
      { metatype: "Human", adjustmentPoints: 1 },
      { metatype: "Ork", adjustmentPoints: 1 },
      { metatype: "Troll", adjustmentPoints: 1 },
    ],
    attributePoints: 2,
    skillPoints: 10,
    magic: [{ option: "Mundane" }],
    resources: 8_000,
  },
];

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

export const metatypeAttributes: MetatypeAttributes[] = [
  {
    metatype: "Human",
    body: { min: 1, max: 6 },
    agility: { min: 1, max: 6 },
    reaction: { min: 1, max: 6 },
    strength: { min: 1, max: 6 },
    willpower: { min: 1, max: 6 },
    logic: { min: 1, max: 6 },
    intuition: { min: 1, max: 6 },
    charisma: { min: 1, max: 6 },
    edge: { min: 1, max: 7 },
    racialQualities: [],
  },
  {
    metatype: "Dwarf",
    body: { min: 1, max: 7 },
    agility: { min: 1, max: 6 },
    reaction: { min: 1, max: 5 },
    strength: { min: 1, max: 8 },
    willpower: { min: 1, max: 7 },
    logic: { min: 1, max: 6 },
    intuition: { min: 1, max: 6 },
    charisma: { min: 1, max: 6 },
    edge: { min: 1, max: 6 },
    racialQualities: ["Toxin Resistance", "Thermographic Vision"],
  },
  {
    metatype: "Elf",
    body: { min: 1, max: 6 },
    agility: { min: 1, max: 7 },
    reaction: { min: 1, max: 6 },
    strength: { min: 1, max: 6 },
    willpower: { min: 1, max: 6 },
    logic: { min: 1, max: 6 },
    intuition: { min: 1, max: 6 },
    charisma: { min: 1, max: 8 },
    edge: { min: 1, max: 6 },
    racialQualities: ["Low-light Vision"],
  },
  {
    metatype: "Ork",
    body: { min: 1, max: 8 },
    agility: { min: 1, max: 6 },
    reaction: { min: 1, max: 6 },
    strength: { min: 1, max: 8 },
    willpower: { min: 1, max: 6 },
    logic: { min: 1, max: 6 },
    intuition: { min: 1, max: 6 },
    charisma: { min: 1, max: 5 },
    edge: { min: 1, max: 6 },
    racialQualities: ["Low-light Vision", "Built Tough 1"],
  },
  {
    metatype: "Troll",
    body: { min: 1, max: 9 },
    agility: { min: 1, max: 5 },
    reaction: { min: 1, max: 6 },
    strength: { min: 1, max: 9 },
    willpower: { min: 1, max: 6 },
    logic: { min: 1, max: 6 },
    intuition: { min: 1, max: 6 },
    charisma: { min: 1, max: 5 },
    edge: { min: 1, max: 6 },
    racialQualities: ["Dermal Deposits", "Thermographic Vision", "Built Tough 2"],
  },
];
