import type { Attributes, Metatype } from "./rules";

export interface Contact {
  name: string;
  connection: number;
  loyalty: number;
}

export interface GearLine {
  /** Catalog entry id; absent for freeform/custom items not in any catalog. */
  itemId?: string;
  name: string;
  qty: number;
  /** Nuyen per unit, snapshotted at purchase time so later catalog price edits don't rewrite the cost of gear someone already bought. */
  unitCost: number;
  /** Chosen level, for catalog entries with a `levels` range. */
  rating?: number;
  /** Essence consumed per unit, snapshotted at purchase time like `unitCost`. Undefined for non-augmentation gear. */
  essenceCost?: number;
  /** Karma cost to bond this item, snapshotted at purchase time like `unitCost`. Undefined for non-magical gear. */
  bondingKarma?: number;
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
  /**
   * House rule (not RAW): attribute keys whose "special racial attribute"
   * cost (p. 63 - normally just the portion above 6) is instead funded
   * entirely from Adjustment Points, freeing the equivalent Attribute
   * Points to spend elsewhere. Only meaningful for attributes where the
   * chosen metatype's max exceeds 6.
   */
  adjustmentFundedAttributes?: string[];
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
  /** The attribute chosen as "best" from Coming of Age; gains +5 (never Edge/Magic/Resonance). */
  comingOfAgeBestAttribute?: string;
  /**
   * Only used when comingOfAgeBestAttribute's metatype max is 5: since a
   * base-1 attribute can't take the full +5 without exceeding that cap,
   * the attribute is instead set to 5 and the player redirects the
   * leftover +1 to a different attribute of their choice.
   */
  comingOfAgeRedirectAttribute?: string;
}

export interface SelectedQuality {
  id: string;
  /** Chosen level, for catalog entries with a `levels` range (e.g. Built Tough). */
  rating?: number;
  /** Chosen skill/attribute/custom target, for catalog entries with `requiresParam`. */
  param?: string;
}

export interface CharacterData {
  metatype?: Metatype;
  attributes: Attributes;
  skills: Record<string, number>;
  knowledgeSkills: string[];
  qualities: SelectedQuality[];
  contacts: Contact[];
  gear: GearLine[];
  /** Known spell catalog ids. The first freeSpellAllotment() of these are free (Priority build only); every one beyond that costs 5 Karma (see deriveSpells.ts). */
  spells: string[];
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
    spells: [],
    nuyen: 0,
    karma: 0,
    systemState: {},
  };
}
