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
  /** Stable per-line id, generated for every line created after weapon-accessory attachment shipped - see GearPicker.tsx's gearLineKey(). Absent on older saved lines; deriveGear.ts falls back to itemId/name for those instead of migrating them. */
  id?: string;
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
  /** For a Weapon Accessory line (gear.ts subcategory "Weapon Accessories"): the owned weapon line it's mounted on - see GearPicker.tsx's gearLineKey() for what value this holds. Undefined if unattached. Meaningless for non-accessory gear. */
  attachedTo?: string;
  /**
   * Set only for a custom-built cyberdeck (Hack & Slash pp.34-39, "Custom
   * Cyberdecks") - the four numbers a deckmeister-built deck is assembled
   * from. Everything else (cost, Core Slot budget, active program slots,
   * Availability) is derived from these, never stored redundantly - see
   * deriveCustomCyberdeck.ts. A line with this field has no `itemId` (no
   * catalog SKU exists for a one-off build) and is excluded from
   * deriveDeckerPersona.ts's free ASDF-reassignment pool: the book states
   * explicitly "you may not rotate out your Attack and Sleaze attributes"
   * for a custom deck, unlike stock gear (core p.174/178's "rotate any
   * non-zero attributes... even if they originated from different
   * devices" only applies to factory decks).
   */
  customCyberdeck?: {
    coreRating: number;
    attackRating: number;
    sleazeRating: number;
    /** Internal Program Slots bought beyond the free allotment (equal to Core Rating) - Dedicated Program Slots aren't modeled, see deriveCustomCyberdeck.ts's header comment. */
    extraProgramSlots: number;
    /**
     * The "Building Your Own" DIY path (Hack & Slash p.35): "each Karma you
     * spend covers 4,000 nuyen of the component's cost." `unitCost` on this
     * line is the nuyen actually still owed after this many Karma covered
     * part of the build - see deriveCustomCyberdeck.ts's karmaFundedCost().
     * The book's own extended Matrix Search + Electronics tests that gate
     * this in play aren't modeled at chargen - "the building happens behind
     * the scenes and the time taken doesn't matter" (this app's own house
     * simplification, confirmed with the user rather than assumed).
     */
    karmaSpent: number;
  };
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
  /**
   * "Elite" alternate power level (Sixth World Companion p.16, "Alternate
   * Power Levels"): "choose ten adult life modules instead of eight...
   * there are no availability restrictions on any gear for elite
   * characters." Only the module-count half is real work here - this app
   * has never enforced gear Availability as a chargen restriction for
   * anyone (Availability only governs finding a seller via Contacts in
   * play, which this app doesn't simulate), so that half is already true
   * by default. Undefined = standard 8 modules. The Companion's other
   * variant for Life Path (Street-level, six modules) isn't implemented -
   * don't assume it exists from this field's shape alone.
   */
  powerLevel?: "elite";
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
  /**
   * Stable per-selection id, only set for qualities purchased post-creation
   * (see QualityPurchaseEntry) so a purchase's undo can find the exact
   * selection it added back out of `qualities`, the same way GearLine.id
   * disambiguates gear lines. Absent on chargen-selected qualities, which
   * have no undo concept to begin with.
   */
  instanceId?: string;
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
 * A decker's assignment of their owned devices' printed Matrix-attribute
 * numbers (cyberdeck Attack/Sleaze, commlink/cyberjack Data
 * Processing/Firewall) across the four named slots - core rulebook p.174,
 * 178: "You can rotate any non-zero attributes through your persona, even
 * if they originated from different devices," confirmed by the
 * Slamm-0!/Jack worked example reassigning a 4/3 cyberdeck's numbers from
 * Attack/Sleaze to Sleaze/Attack. Each field holds the raw value assigned
 * (not an index), validated against the available pool in
 * deriveDeckerPersona.ts rather than here. Meaningless for technomancers,
 * who use LivingPersonaAllocation instead.
 */
export interface DeckerPersonaAllocation {
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
 * deriveInitiation.ts. `metamagicName` is the display name, normally
 * auto-filled by picking a catalog entry (see rules.ts's
 * MetamagicCatalogEntry/EchoCatalogEntry, server/src/rules/metamagics.ts)
 * but left freely editable for a homebrew/GM-approved name - `metamagicId`
 * is undefined in that case, and for any entry saved before the catalog
 * shipped. Only `metamagicId === "power-point"` and `"centering"`/
 * `"adept-centering"` are read back out anywhere (deriveAdeptPowers.ts's PP
 * pool, deriveAstral.ts's Drain Resistance) - everything else is display
 * only, same "no dice-rolling engine" boundary as the rest of this app.
 */
export interface InitiationEntry {
  id: string;
  type: "initiation" | "submersion";
  grade: number;
  /** Metamagic name (initiation) or Echo name (submersion) chosen for this grade. */
  metamagicName: string;
  /** Catalog id backing `metamagicName`, if chosen from the catalog rather than typed freeform. */
  metamagicId?: string;
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

/**
 * One post-chargen ("career mode") purchase of a brand-new Knowledge topic
 * or Language (at its Basic level) - core rulebook "Improvement Cost" table,
 * p. 71: "New Knowledge skills cost 3 Karma." See deriveKnowledge.ts.
 * References the KnowledgeSkillLine it created (by id) so undo can remove
 * exactly that line.
 */
export interface KnowledgePurchaseEntry {
  id: string;
  knowledgeLineId: string;
  name: string;
  type: "knowledge" | "language";
  karmaCost: number;
  date: string;
}

/**
 * One post-chargen Qualities action - core rulebook "Improvement Cost"
 * table, p. 71: purchasing a new positive quality or eliminating an
 * existing negative one both cost 2x the quality's normal Karma amount.
 * New negative qualities can't be purchased after character creation. See
 * deriveQualities.ts. `quality` is a full snapshot so "eliminated" can be
 * undone by re-adding the exact selection that was removed.
 */
export interface QualityPurchaseEntry {
  id: string;
  action: "purchased" | "eliminated";
  quality: SelectedQuality;
  name: string;
  karmaCost: number;
  date: string;
}

/**
 * One post-chargen Contact improvement - Connection or Loyalty raised by a
 * single point, 1 Karma each, reusing the same rate the Life Path build
 * system already uses for Karma-funded contact points at chargen
 * (deriveContacts.ts's withKarmaFundedPoint, Companion p.31) since the core
 * rulebook's own Improvement Cost table doesn't tabulate Contacts. Both
 * ratings cap at 12 in play (core p.51), not at Charisma - that narrower cap
 * is chargen-only.
 */
export interface ContactAdvancementEntry {
  id: string;
  contactId: string;
  field: "connection" | "loyalty";
  fromRating: number;
  toRating: number;
  karmaCost: number;
  date: string;
}

export interface CharacterData {
  metatype?: Metatype;
  /** Metavariant catalog id (server/src/rules/metavariants.ts); undefined for a base metatype. */
  metavariant?: string;
  /**
   * Free-text physical description fields from the character sheet's
   * "Personal Data" box (core rulebook chargen worksheet) - Sex, Age,
   * Height, Weight. Purely descriptive, player-chosen, no formula or
   * mechanical effect - see pdfSheet.ts's drawPage1 for where these land
   * on the printed sheet.
   */
  sex?: string;
  age?: string;
  height?: string;
  weight?: string;
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
  /** A decker's Matrix-attribute assignment from their owned devices (see deriveDeckerPersona.ts). Meaningless for Technomancers, who use livingPersonaAllocation instead. */
  deckerPersonaAllocation?: DeckerPersonaAllocation;
  /**
   * The attribute that pairs with Magic for a magically active character's
   * tradition - "Logic for hermetic mages, Charisma for shamans" (core
   * rulebook p.160-161, Astral Combat's Attack Rating). The book doesn't
   * force a specific named tradition beyond that attribute pairing (other
   * traditions may differ), so this is a direct attribute choice rather
   * than a tradition catalog. Also the attribute Drain resistance tests
   * use (Willpower + this), though this app doesn't model Drain testing
   * itself beyond Karma-cost bookkeeping. Undefined until chosen; only
   * meaningful for a magically active character (Magic, not Resonance).
   */
  traditionAttribute?: "logic" | "charisma";
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
  /**
   * Karma converted to nuyen during character creation's "Finishing
   * Touches" step (core rulebook p.66, "Spend Customization Karma") -
   * 2,000 nuyen per Karma point, or 5,000 with the In Debt quality. See
   * deriveGear.ts's karmaToNuyenRate/nuyenFromKarmaConversion. Chargen-only
   * (undefined/0 once in play) - the Companion's optional downtime
   * "Working for the Man" variant of this exchange isn't modeled.
   */
  karmaSpentOnNuyen?: number;
  /** Post-chargen Karma spent raising attributes/skills during play (see deriveAdvancement.ts). Empty/undefined for a character still in chargen. */
  advancement?: AdvancementEntry[];
  /** Itemized post-creation Knowledge/Language purchase log - see KnowledgePurchaseEntry. Empty/undefined for a character still in chargen. */
  knowledgePurchases?: KnowledgePurchaseEntry[];
  /** Itemized post-creation Qualities purchase/elimination log - see QualityPurchaseEntry. Empty/undefined for a character still in chargen. */
  qualityPurchases?: QualityPurchaseEntry[];
  /** Itemized post-creation Contact improvement log - see ContactAdvancementEntry. Empty/undefined for a character still in chargen. */
  contactAdvancement?: ContactAdvancementEntry[];
  /** Initiate Grade (Magic side) - 0/undefined until first initiation. Raises Magic's natural maximum; see deriveEssence.ts. */
  initiateGrade?: number;
  /** Submersion Grade (Resonance side), same shape as initiateGrade. */
  submersionGrade?: number;
  /**
   * "Running the Game" p. 235-237: a signed running score of how the
   * runner is regarded, GM-adjusted by narrative events (there's no
   * formula - the book's own Reputation Changes table is explicitly "more
   * a guideline than a definitive listing"). Undefined/0 for a fresh
   * character. See deriveReputation.ts for the >=10/<=-10 threshold
   * effects.
   */
  reputation?: number;
  /**
   * "Running the Game" p. 236-237: pressure from law enforcement, floored
   * at 0. Increases from the GM's end-of-session 2D6 roll (self-reported -
   * this app never rolls dice); decreases from Working a Contact, paying
   * bribes, or lying low, all book-guideline reference text rather than
   * simulated mechanics. See deriveReputation.ts for the Heat Effects tier
   * lookup.
   */
  heat?: number;
  /** Itemized Initiation/Submersion purchase log - see InitiationEntry and deriveInitiation.ts. */
  initiations?: InitiationEntry[];
  /**
   * Astral Reputation (Street Wyrd "A Congress of Spirits," p.63-65) - how
   * spirits as a community regard this conjurer, -10 to 10. Undefined/0 is
   * neutral. Player/GM-tracked by roleplay (there's a reference table of
   * suggested adjustments, not an automated one - see Spirits.tsx); only
   * the mechanical thresholds at the extremes are derived, in
   * deriveSpirits.ts's astralReputationEffect().
   */
  astralReputation?: number;
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
    // Must match derivePriorityVariant.ts's startingKarma() baseline for an
    // untouched character (no powerLevel set yet) - PowerLevelStep.tsx's
    // Prime Runner toggle rebases off whatever this starts at, so a mismatch
    // here (previously 0) makes that rebase land on the wrong total the
    // first time a fresh character touches Power Level before Qualities.
    karma: 50,
    advancement: [],
    knowledgePurchases: [],
    qualityPurchases: [],
    contactAdvancement: [],
    initiations: [],
    systemState: {},
  };
}
