import type { Attributes, Metatype } from "./rules";

export interface Contact {
  name: string;
  connection: number;
  loyalty: number;
}

export interface GearLine {
  name: string;
  qty: number;
  notes?: string;
}

export interface PrioritySystemState {
  priorities: {
    metatype?: "A" | "B" | "C" | "D" | "E";
    attributes?: "A" | "B" | "C" | "D" | "E";
    skills?: "A" | "B" | "C" | "D" | "E";
    magic?: "A" | "B" | "C" | "D" | "E";
    resources?: "A" | "B" | "C" | "D" | "E";
  };
  magicOption?: string;
}

export interface LifepathSystemState {
  /** Module ids chosen for the 8 adult slots, in order (one id may repeat once). */
  selectedModuleIds: string[];
  /** Record of which option was picked for each boost/knowledge slot, keyed by an instance-specific id. */
  choices: Record<string, string>;
  /** Mundane / Full Magician / Aspected Magician / Mystic Adept / Adept / Emerged, from Born This Way. */
  awakenedType?: string;
  /** The 4 skills chosen (at rank 2) from Growing Up. */
  growingUpSkills?: string[];
  /** The skill chosen (rank 4, or 6 if also a Growing Up pick) from Coming of Age. */
  comingOfAgeSkill?: string;
}

export interface CharacterData {
  metatype?: Metatype;
  attributes: Attributes;
  skills: Record<string, number>;
  knowledgeSkills: string[];
  qualities: string[];
  contacts: Contact[];
  gear: GearLine[];
  nuyen: number;
  karma: number;
  notes?: string;
  systemState: PrioritySystemState | LifepathSystemState | Record<string, never>;
}

export const emptyAttributes: Attributes = {
  body: 1,
  agility: 1,
  reaction: 1,
  strength: 1,
  willpower: 1,
  logic: 1,
  intuition: 1,
  charisma: 1,
  edge: 1,
};

export function emptyCharacterData(): CharacterData {
  return {
    attributes: { ...emptyAttributes },
    skills: {},
    knowledgeSkills: [],
    qualities: [],
    contacts: [],
    gear: [],
    nuyen: 0,
    karma: 0,
    systemState: {},
  };
}
