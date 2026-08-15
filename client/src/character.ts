import type { Attributes, Metatype, ModifierTarget } from "./rules";

/** A resolved (not symbolic) stat bonus snapshotted onto a purchased line - mirrors StatModifier from ./rules but with `amount`/`target` already resolved (no "rating"/"netHits"/"choice"), same snapshot convention as GearLine.essenceCost. */
export interface ResolvedModifier {
  target: Exclude<ModifierTarget, "choice">;
  amount: number;
  stackingGroup?: string;
}

export interface Contact {
  id: string;
  name: string;
  /** Contact archetype from the book's fixed list (Academic, Corporate, Criminal, Engineering, Government, Magic, Matrix, Media, Medical, Street) - only meaningful for Life Path contacts, whose points are granted per-type by life modules. Priority contacts have no type restriction (core rulebook p.66-67 doesn't mention types), so this is left blank there. */
  type?: string;
  connection: number;
  loyalty: number;
  /**
   * Life Path only: how many of connection/loyalty's points were bought with
   * customization Karma (1 Karma each) instead of a life module's contact
   * points - see deriveContacts.ts. A Karma-funded point may never push a
   * rating above Charisma (Sixth World Companion p.31), unlike module-funded
   * points, which may reach the hard cap of 8.
   */
  karmaFunded?: { connection: number; loyalty: number };
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
  /**
   * "Different Levels of Play" (core rulebook p.63 sidebar). "street"
   * reads every priority row's table values (metatype options, attribute
   * points, skill points, magic options, resources) one row worse than the
   * letter actually assigned - the assignment itself and its A-E
   * uniqueness are unaffected, only the lookup. "prime" doubles
   * customization Karma from 50 to 100. undefined = standard play. See
   * derivePriorityVariant.ts.
   */
  powerLevel?: "street" | "prime";
}

export interface LifepathSystemState {
  /** Module ids chosen for the 8 adult slots, in order (one id may repeat once). */
  selectedModuleIds: string[];
  /** Record of which option was picked for each boost slot, keyed by an instance-specific id. */
  choices: Record<string, string>;
  /**
   * Record of what was picked for each module's knowledgeChoice slot, keyed
   * the same way as `choices` (`${instanceKey}:knowledge:${k}`) but carrying
   * a type + name instead of a bare string, since a slot can be spent on
   * either a knowledge topic or a language (Companion p.31: "If you choose a
   * language skill, you may select a new language at rank 1 or increase the
   * rank of a language you already know, up to a maximum of rank 3") - see
   * recompute() in LifepathBuilder.tsx for how repeated language names
   * become a level-up instead of a duplicate entry.
   */
  knowledgeChoices?: Record<string, { type: "knowledge" | "language"; name: string }>;
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

export type LanguageLevel = 1 | 2 | 3 | 4;

export const LANGUAGE_LEVEL_NAMES: Record<LanguageLevel, string> = {
  1: "Basic",
  2: "Specialist",
  3: "Expert",
  4: "Native",
};

/**
 * One Knowledge or Language skill (core rulebook p.97-99). Knowledge topics
 * don't have ranks - they're just known or not ("Knowledge skills do not
 * have ranks, because they are not used directly in skill tests", p.98).
 * Language skills are "Knowledge skills with specialization ranks": four
 * levels (Basic/Specialist/Expert/Native, p.99). `level` is only meaningful
 * for `type: "language"`.
 */
export interface KnowledgeSkillLine {
  id: string;
  name: string;
  type: "knowledge" | "language";
  level?: LanguageLevel;
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

/**
 * One Initiation (Magic) or Submersion (Resonance) grade purchase - see
 * deriveInitiation.ts. `metamagicName`/`echoName` is freeform (this app
 * doesn't have a mechanical Metamagic/Echo catalog yet, same "pick via
 * notes, effect text points to the book" precedent as Mentor Spirits and
 * Adept Ways in qualities.ts).
 */
export interface InitiationEntry {
  id: string;
  type: "initiation" | "submersion";
  grade: number;
  /** Metamagic name (initiation) or Echo name (submersion) chosen for this grade. */
  metamagicName: string;
  karmaCost: number;
  date: string;
}

/**
 * A skill specialization or expertise (core rulebook p. 92, "Specializations
 * and Expertise"). One entry per {skill, focus} pair - a skill can carry at
 * most two entries (one "expertise" + one "specialization"), never two of
 * the same tier, per the book's hard cap. `tier` is mutated in place when a
 * specialization is upgraded to an expertise (see deriveSpecializations.ts),
 * rather than replaced with a new entry, so its `id` is stable across that
 * upgrade for undo purposes.
 */
export interface SkillSpecialization {
  id: string;
  skill: string;
  /** The narrow area, e.g. "Light Pistols" for Firearms - freeform text (the book's own per-skill lists are explicitly "not exhaustive... if their gamemaster approves it, they can have it"), not a fixed enum. */
  focus: string;
  tier: "specialization" | "expertise";
}

/**
 * One post-chargen ("career mode") Karma purchase in the Specializations/
 * Expertise chain - see deriveSpecializations.ts for the cost/prerequisite
 * rules. Kept separate from AdvancementEntry since specializations aren't a
 * numeric rating (no fromRating/toRating), and from SkillSpecialization
 * since this is the itemized log, not the resolved current state.
 */
export interface SpecializationEntry {
  id: string;
  skill: string;
  focus: string;
  /** "new" = bought a fresh specialization; "expertise" = upgraded an existing specialization; "second" = added the post-expertise second specialization. */
  action: "new" | "expertise" | "second";
  karmaCost: number;
  date: string;
}

export interface CharacterData {
  metatype?: Metatype;
  /** Metavariant catalog id (server/src/rules/metavariants.ts); undefined for a base metatype. */
  metavariant?: string;
  attributes: Attributes;
  skills: Record<string, number>;
  /** Skill specializations/expertise - see SkillSpecialization. One skill-point-worth each at chargen (Priority: one per skill; Life Path: one total for the whole character - the two systems genuinely differ here, confirmed from both books), or 5 Karma each post-creation. */
  specializations?: SkillSpecialization[];
  /** Itemized post-creation Specialization/Expertise purchase log - see SpecializationEntry. Empty/undefined for a character still in chargen. */
  specializationLog?: SpecializationEntry[];
  knowledgeSkills: KnowledgeSkillLine[];
  /**
   * The single free Native-level language every character begins with
   * (core rulebook p.67; Companion p.31 confirms this is universal
   * regardless of build system: "All characters, regardless of what
   * character creation system is used, begin with a single language at
   * level 4 (Native)"). Kept separate from `knowledgeSkills` since it's
   * guaranteed free and singular, not drawn from either system's
   * knowledge/language budget - see deriveKnowledge.ts.
   */
  nativeLanguage?: string;
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
  /** Initiate Grade (Magic side) - 0/undefined until first initiation. Raises Magic's natural maximum; see deriveEssence.ts. */
  initiateGrade?: number;
  /** Submersion Grade (Resonance side), same shape as initiateGrade. */
  submersionGrade?: number;
  /** Itemized Initiation/Submersion purchase log - see InitiationEntry and deriveInitiation.ts. */
  initiations?: InitiationEntry[];
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
    specializations: [],
    specializationLog: [],
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
    initiations: [],
    systemState: {},
  };
}
