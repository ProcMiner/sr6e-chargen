import type { Attributes, Metatype, ModifierTarget } from "./rules";

/** A resolved (not symbolic) stat bonus snapshotted onto a purchased line - mirrors StatModifier from ./rules but with `amount`/`target` already resolved (no "rating"/"netHits"/"choice"), same snapshot convention as GearLine.essenceCost. */
export interface ResolvedModifier {
  target: Exclude<ModifierTarget, "choice">;
  amount: number;
  stackingGroup?: string;
}

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
  /** Resolved attribute/derived-stat bonuses, snapshotted at purchase time like `essenceCost`. Undefined for non-augmentation gear. */
  modifiers?: ResolvedModifier[];
  /** True if this item was acquired for free during play (loot/payment-in-kind from a run) rather than bought with the nuyen pool. `unitCost` still holds the item's normal market value for reference; `gearCostTotal` (deriveGear.ts) just excludes free lines from the spend total. Undefined (falsy) for everything bought normally, including at chargen. */
  free?: boolean;
  notes?: string;
}

export interface LifestyleLine {
  /** Catalog entry id (server/src/rules/lifestyles.ts); absent for a freeform/custom lifestyle not in the catalog. */
  itemId?: string;
  name: string;
  monthsPrepaid: number;
  /** Nuyen per month, snapshotted at purchase time so later catalog price edits don't rewrite an already-bought line, same convention as GearLine.unitCost. */
  costPerMonth: number;
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

export interface AdeptPowerLine {
  /** Catalog entry id. */
  powerId: string;
  /** Chosen level, for catalog entries with a `levels` range. */
  level?: number;
  /** Free-text sub-choice for powers that need one (an element, attribute, or skill) - see AdeptPowerCatalogEntry's header comment. */
  notes?: string;
  /** Resolved attribute/derived-stat bonuses, snapshotted at purchase time - see GearLine.modifiers. Undefined for powers with no numeric effect. */
  modifiers?: ResolvedModifier[];
}

export interface ComplexFormLine {
  /** Catalog entry id (server/src/rules/complexForms.ts / complexFormsHackAndSlash.ts). */
  formId: string;
  /** Free-text sub-choice for forms that need one (e.g. which Matrix attribute Diffusion/Infusion targets, or which program Emulate runs) - mirrors AdeptPowerLine.notes. Also lets the same form be bought more than once, same as adept powers. */
  notes?: string;
}

/** A technomancer's Living Persona bonus-point distribution across their four Matrix attributes (core rulebook p. 189) - see deriveLivingPersona.ts. */
export interface LivingPersonaAllocation {
  attack?: number;
  sleaze?: number;
  dataProcessing?: number;
  firewall?: number;
}

/**
 * One post-chargen ("career mode") Karma purchase raising an attribute or
 * skill by one rating - core rulebook "Improvement Cost" table, p. 71.
 * Itemized rather than a running total so the total Karma spent can always
 * be derived from the log (see deriveAdvancement.ts's advancementKarmaTotal),
 * same convention as gear's bondingKarma total in deriveGear.ts.
 */
export interface AdvancementEntry {
  id: string;
  type: "attribute" | "skill";
  /** Attribute key (e.g. "body") or skill name (e.g. "Firearms"). */
  key: string;
  fromRating: number;
  toRating: number;
  karmaCost: number;
  date: string;
}

export interface CharacterData {
  metatype?: Metatype;
  /** Metavariant catalog id (server/src/rules/metavariants.ts); undefined for a base metatype. */
  metavariant?: string;
  attributes: Attributes;
  skills: Record<string, number>;
  knowledgeSkills: string[];
  qualities: SelectedQuality[];
  contacts: Contact[];
  gear: GearLine[];
  /** Purchased lifestyle-months. Multiple lines are allowed (e.g. a primary residence plus a safehouse). */
  lifestyles: LifestyleLine[];
  /** Known spell catalog ids. The first freeSpellAllotment() of these are free (Priority build only); every one beyond that costs 5 Karma (see deriveSpells.ts). */
  spells: string[];
  /** Known adept powers, purchased with Power Points (see deriveAdeptPowers.ts). Meaningful only for Adept/Mystic Adept characters. */
  adeptPowers: AdeptPowerLine[];
  /** Known complex forms. The first freeComplexFormAllotment() of these are free (Priority build only); every one beyond that costs 5 Karma (see deriveComplexForms.ts). Meaningful only for Technomancer characters. */
  complexForms: ComplexFormLine[];
  /** Living Persona Matrix-attribute bonus distribution (see deriveLivingPersona.ts). Meaningful only for Technomancer characters. */
  livingPersonaAllocation?: LivingPersonaAllocation;
  /**
   * Mystic Adepts split their Magic between Power Points and spells at
   * chargen (core rulebook p. 158-159): this many points of Magic are
   * dedicated to the adept side (1 Power Point each), and the remainder is
   * doubled for their free spell allotment (see deriveSpells.ts). Meaningful
   * only when magicOption/awakenedType is "Mystic Adept"; undefined/0
   * elsewhere.
   */
  mysticAdeptPowerPoints?: number;
  nuyen: number;
  karma: number;
  /** Post-chargen Karma spent raising attributes/skills during play (see deriveAdvancement.ts). Empty/undefined for a character still in chargen. */
  advancement?: AdvancementEntry[];
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
    lifestyles: [],
    spells: [],
    adeptPowers: [],
    complexForms: [],
    nuyen: 0,
    karma: 0,
    advancement: [],
    systemState: {},
  };
}
