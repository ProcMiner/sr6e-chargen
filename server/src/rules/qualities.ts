// Positive/Negative Qualities, transcribed from multiple SR6 sourcebooks.
// Flavor text and game-effect text below are paraphrased in our own words
// rather than quoted from the books; Karma costs/bonuses are transcribed as
// printed since they are game rules, not protected expression. Each block
// below is commented with its source book and page range.
//
// Sources transcribed so far:
// - SR6 core rulebook, "Qualities" chapter (pp. 70-80).
// - SR6 Companion, "People of Exceptional Quality" chapter (book pp.
//   132-138 / PDF pp. 133-139). The Companion's "Quality Paths" narrative
//   advancement system (book pp. 138-143) is a separate, story-gated
//   system, not a flat catalog - out of scope, same precedent as the
//   curated Life Path module subset.
// - Hack & Slash, "Quality Hacking" chapter (book pp. 80-86 / PDF pp.
//   81-87). Excludes AI/protosapient-only qualities (book pp. 114,
//   119-120) - no AI character type exists in this app, see README.
//   Includes the one Technomancer-specific quality in that flat catalog
//   (Resonance Burn). "Quality Path: Cyberadept" (book p. 86) is a
//   separate narrative system, out of scope like the Companion's Quality
//   Paths. Also includes "Paragon" (book p. 129, "Virtual Life" chapter) -
//   a Mentor-Spirit-shaped quality for technomancers/EIs that align with a
//   paragon - and "Resonant Stream" (book pp. 130-132, "New Technomancer
//   Qualities: Resonant Streams"), added the same lightweight way: the three
//   streams' fixed benefits and Aspect Peripheral powers aren't individually
//   modeled, only the book-reference effect text and the complex form each
//   stream unlocks (see complexFormsHackAndSlash.ts's Loto/Hyperthreading/
//   Control Virtual Life entries).
// - Double Clutch, "Gearhead Anatomy" chapter (book pp. 167-172). The five
//   "Driving Style: X" entries are genuinely five separate qualities, each
//   with its own distinct Karma cost and fixed list of specific Edge-cost
//   discounts, not one parameterized quality - confirmed by page-level
//   read, resolving the ambiguity flagged during scoping.
// - Street Wyrd, "New Qualities for Awakened Characters" (book pp.
//   113-114). The two-column layout is deceptive here: "Possession
//   Tradition" and "Representation I/II" visually sit in a column that
//   starts mid-page, but they're a continuation of the Negative Qualities
//   list (confirmed by their "Bonus:" cost lines, the negative-quality
//   convention used throughout this file), not additional Positive
//   Qualities - the initial scoping pass misread this page's flow.
//   "Representation I" and "II" are two flat-cost severity variants (5 vs
//   8 Karma) of the same quality, not per-level-multiplied costs, so
//   they're transcribed as two separate entries, same precedent as the
//   Double Clutch Driving Styles.
// - Firing Squad, "The Ugly Consequences (New and Modified Qualities)"
//   (book pp. 129-130) - six flat qualities, all negative, takeable at
//   normal character creation per the book's own text. The much larger
//   "Quality Paths" system later in that chapter (Boundaries of Honor,
//   Once Bitten, Eye for an Eye, etc., book pp. 130+) is explicitly
//   story/prerequisite-gated and not normally available at chargen - out
//   of scope, same precedent as the Companion's and Hack & Slash's Quality
//   Paths. "Phobia (Object)" prices by rarity (Common/Uncommon/Rare/Very
//   Rare: 12/9/6/3 Karma) along a single dimension, so - unlike Allergy's
//   2D severity-x-rarity table, which stays a placeholder - it's split
//   into four flat entries, same precedent as Representation I/II.
//   "Compulsion (Behavior, 1 to 5)" is transcribed as levels 1-5 only:
//   the header text says "1 to 6," but that's a confirmed book typo - the
//   printed Compulsion Table only ever defined 5 levels.
// - Body Shop, two separate chapters: "Atavism/Transgenics" (book pp.
//   104-105) and "Edge of Essence" (book pp. 168-171). "Conspicuous
//   Alterations" prices two severity degrees at 6/8 Karma (not a uniform
//   per-level multiple), so - same precedent as Representation I/II - it's
//   split into two flat entries. The "Inhuman" quality name referenced in
//   several transgenic-modification sidebars (Aggression Pack, Claws/
//   Talons, etc.) as a recommended pairing never gets its own full
//   Cost/Effect writeup anywhere in the chapter; "Conspicuous Alterations"
//   is the only quality whose effect text matches that description (it
//   explicitly can't combine with Human-Looking) and is likely the same
//   quality under an informal nickname - noted in its effect text, not
//   invented as a separate entry. "Cybermancy" (book pp. 171-174) is a
//   narrative/procedural ritual for pushing a character below zero
//   Essence, explicitly framed as something the gamemaster adjudicates,
//   not a player-purchasable quality or normal chargen option - out of
//   scope, not a Quality Paths-style system so not worth a README item
//   either.
// - Power Plays, scattered per-corporation "Game Information" sections -
//   the weakest-signal book in the original scoping pass, so each
//   candidate location was individually page-verified rather than trusted
//   from the recon skim: Aztechnology (book p. 56, 1 positive + 1
//   negative), Renraku (book p. 113, 1 positive + 1 negative - includes
//   "Honorbound: Corporate Bushido," a named variant of the core
//   rulebook's Honorbound quality with its own distinct mechanic, kept as
//   a separate entry rather than merged into the base Honorbound), and
//   Shiawase (book p. 146, 3 positive, 0 negative). Only these three
//   locations (the ones the recon pass specifically flagged) were
//   checked - this book has a dozen-plus other corporation chapters that
//   weren't individually scanned for qualities, so more may exist.
// - No Future, "New Qualities" (book p. 178) - 3 positive (Candle in the
//   Darkness, Massive Network, Networker) + 1 negative (Stolen Gear,
//   cleanly leveled 1-20 at 1 Karma/level). The "Life Modules" content
//   immediately following this section (Further Education, Real Life,
//   etc.) is explicitly for the Life Module system from Run Faster (a
//   different, older edition's chargen book) - NOT this app's SR6
//   Companion-based Life Path system - so it's unrelated to the
//   "Remaining Adult Life Modules" README item, despite surface-level
//   similarity in name.
//
// This completes the planned sourcebook qualities pass (Companion, Hack &
// Slash, Double Clutch, Street Wyrd, Firing Squad, Body Shop, Power Plays,
// No Future, on top of the core rulebook). AI/protosapient character
// creation itself is a separate deferred item (see README), as is the
// Power Plays gap noted above (only 3 of a dozen-plus corp chapters
// checked).
//
// Two core-rulebook entries are deliberately omitted rather than guessed
// at: Astral Beacon (negative, p. 76) and Scorched (negative, p. 79) both
// have their Karma cost/bonus and Game Effect text missing from the
// extractable PDF text layer even after cross-checking layout and
// non-layout extraction across the page break - likely a text-layer gap in
// this PDF rather than a column-ordering mixup (verified by reading both
// the page each starts on and the following page in full). Add them once
// the numbers can be confirmed against the book directly.

export interface QualityCatalogEntry {
  id: string;
  name: string;
  category: "positive" | "negative";
  /** Karma cost (positive quality) or Karma bonus (negative quality); always a positive number here, `category` determines the sign. */
  karma: number;
  summary: string;
  effect: string;
  /** Only for qualities with a purchasable rating (e.g. Built Tough 1-4); karma is PER LEVEL. */
  levels?: { min: number; max: number };
  /** Only for qualities that need the player to specify a target (e.g. Aptitude (Skill)). */
  requiresParam?: "skill" | "attribute" | "custom";
}

export const positiveQualities: QualityCatalogEntry[] = [
  {
    id: "analytical-mind",
    name: "Analytical Mind",
    category: "positive",
    karma: 3,
    summary: "A gifted problem solver who can separate the signal from the noise.",
    effect: "Gain a bonus Edge on any Logic-based test.",
  },
  {
    id: "ambidextrous",
    name: "Ambidextrous",
    category: "positive",
    karma: 4,
    summary: "Equally skilled with either hand, whether shooting, throwing, or striking.",
    effect: "No penalty for off-hand weapon use.",
  },
  {
    id: "aptitude",
    name: "Aptitude (Skill)",
    category: "positive",
    karma: 12,
    summary: "A natural talent that lets you push past the usual ceiling in one skill.",
    effect: "Select a skill: its maximum rises to 10 (instead of 9) and its maximum starting rank to 7 (instead of 6).",
    requiresParam: "skill",
  },
  {
    id: "astral-chameleon",
    name: "Astral Chameleon",
    category: "positive",
    karma: 9,
    summary: "Your aura resists staying stable, letting you blend into the astral background.",
    effect:
      "Others take -2 dice on tests to recognize your aura or astral signature; your astral signature fades in half the normal time.",
  },
  {
    id: "blandness",
    name: "Blandness",
    category: "positive",
    karma: 8,
    summary: "Utterly average in every way, which makes you remarkably forgettable.",
    effect:
      "Others take a -2 penalty on Memory tests to recall having seen you, and the threshold to notice you following/observing them rises by 1. Lost if you acquire something permanently distinctive; suppressed while a temporary distinctive change lasts.",
  },
  {
    id: "built-tough",
    name: "Built Tough (1 to 4)",
    category: "positive",
    karma: 4,
    levels: { min: 1, max: 4 },
    summary: "Built like a brick, able to shrug off more punishment than most before going down.",
    effect: "Gain additional Physical Condition Monitor boxes equal to the rank of this quality.",
  },
  {
    id: "catlike",
    name: "Catlike",
    category: "positive",
    karma: 12,
    summary: "Innate feline grace - you move smoothly and tend to land on your feet.",
    effect: "Gain a bonus Edge on tests for balance, falling, and landing safely (subject to the Preventing Edge Abuse rules).",
  },
  {
    id: "dermal-deposits",
    name: "Dermal Deposits",
    category: "positive",
    karma: 7,
    summary: "Calcified deposits on your flesh make you tougher and a bit rougher around the edges.",
    effect: "Gain 1 level of natural Armor. Unarmed Melee attacks inflict Physical damage.",
  },
  {
    id: "double-jointed",
    name: "Double-Jointed",
    category: "positive",
    karma: 12,
    summary: "Your joints bend well beyond normal metahuman range.",
    effect: "Gain a bonus Edge on tests involving grappling, escaping bonds, flexibility, or fitting into tight spaces (subject to the Preventing Edge Abuse rules).",
  },
  {
    id: "elemental-resistance",
    name: "(Elemental) Resistance",
    category: "positive",
    karma: 12,
    summary: "Genetics or training have given you a strong tolerance for one form of damaging energy.",
    effect:
      "Select an elemental damage type when taking this quality. When attacked with a weapon, spell, or unarmed spirit attack of that type, gain a point of Edge before making your Defense test.",
    requiresParam: "custom",
  },
  {
    id: "exceptional",
    name: "Exceptional (Attribute)",
    category: "positive",
    karma: 12,
    summary: "Naturally built to be better than most at one physical or mental trait.",
    effect: "Select a Physical or Mental attribute; its maximum (not current) rank increases by 1. Can only be purchased once per attribute.",
    requiresParam: "attribute",
  },
  {
    id: "first-impression",
    name: "First Impression",
    category: "positive",
    karma: 12,
    summary: "You know how to make an entrance and put people at ease on a first meeting.",
    effect: "Gain 2 Edge for Social Tests during a first meeting with anyone; Heat and Reputation are ignored for that first encounter.",
  },
  {
    id: "focused-concentration",
    name: "Focused Concentration (1 to 3)",
    category: "positive",
    karma: 12,
    levels: { min: 1, max: 3 },
    summary: "A disciplined mind that can hold multiple arcane or emergent effects without strain.",
    effect: "Per level, sustain 1 additional spell or complex form without the usual penalty (the spell's modified Drain Value must be under 7).",
  },
  {
    id: "gearhead",
    name: "Gearhead",
    category: "positive",
    karma: 10,
    summary: "A natural mechanic who can get anything moving again in a hurry.",
    effect: "Gain an Edge on vehicle Repair tests and may spend Edge during downtime to make Extended Repair tests.",
  },
  {
    id: "guts",
    name: "Guts",
    category: "positive",
    karma: 12,
    summary: "Not fearless, just stubborn - you stand up to intimidation and hostile interrogation.",
    effect: "Gain an Edge when resisting Intimidation tests or effects that would cause the Frightened status.",
  },
  {
    id: "hardening",
    name: "Hardening",
    category: "positive",
    karma: 10,
    summary: "Repeated Matrix damage has taught your persona how to absorb the hits better.",
    effect:
      "Gain a bonus Edge on Matrix Damage Resistance tests (lost if unused on that test). When struck by Matrix damage, may convert up to two boxes to Stun Damage on yourself instead.",
  },
  {
    id: "high-pain-tolerance",
    name: "High Pain Tolerance",
    category: "positive",
    karma: 7,
    summary: "Injury and pain simply don't slow you down the way they do most people.",
    effect: "Reduce your wound penalty by one, to a minimum of 0.",
  },
  {
    id: "home-ground",
    name: "Home Ground",
    category: "positive",
    karma: 10,
    summary: "You know a chosen neighborhood or Matrix host like the back of your hand.",
    effect:
      "Select a neighborhood or Matrix host each time you take this quality. Outdoors and Perception tests made there gain an Edge (lost if unused on that test).",
  },
  {
    id: "human-looking",
    name: "Human-Looking",
    category: "positive",
    karma: 8,
    summary: "Through genetics or modification, you pass for human despite your birth metatype.",
    effect: "You generally appear human at first glance and gain +2 dice on Disguise tests to hide your metatype.",
  },
  {
    id: "indomitable",
    name: "Indomitable",
    category: "positive",
    karma: 12,
    summary: "A mind that is hard to break, whether through training, discipline, or sheer will.",
    effect: "Edge Boost costs are reduced by 1 on tests involving Willpower.",
  },
  {
    id: "juryrigger",
    name: "Juryrigger",
    category: "positive",
    karma: 12,
    summary: "You can get a machine working again with duct tape, spare wire, and a swift kick.",
    effect: "When performing a Juryrigging test, gain a point of Edge that must be spent on that test or it's lost.",
  },
  {
    id: "long-reach",
    name: "Long Reach",
    category: "positive",
    karma: 12,
    summary: "Long limbs or exceptional reach let you engage melee targets other people can't.",
    effect: "When using a melee weapon, Close range is extended to 5 meters instead of 3.",
  },
  {
    id: "low-light-vision",
    name: "Low-Light Vision",
    category: "positive",
    karma: 6,
    summary: "Enhanced rod cells or augmentation let you see clearly in dim conditions.",
    effect: "You can see clearly in any light level short of total darkness.",
  },
  {
    id: "magic-resistance",
    name: "Magic Resistance",
    category: "positive",
    karma: 8,
    summary: "For whatever reason, mana just doesn't want to connect with you.",
    effect:
      "Gain a bonus Edge on any Magic Resistance test (lost if unused on that test). When a Health spell is cast on you, treat your Essence as 2 points lower than actual for that spell.",
  },
  {
    id: "mentor-spirit",
    name: "Mentor Spirit",
    category: "positive",
    karma: 10,
    summary: "You draw on a guiding totem, deity, or belief to shape and focus your magic.",
    effect:
      "Gain the benefits associated with your chosen mentor spirit (see the Mentor Spirit list). Failing to uphold its tenets costs you your connection and its bonuses.",
    requiresParam: "custom",
  },
  {
    id: "adept-way",
    name: "Adept Way (Street Wyrd)",
    category: "positive",
    karma: 20,
    summary: "Adepts and Mystic Adepts only. You've committed to a specific philosophy of channeling your magic - Artisan's, Artist's, Athlete's, Beast's, Burnout's, Invisible, Magician's, Speaker's, or Warrior's Way.",
    effect:
      "Gain Innate Talent, Focused Channeling, and Spark of Brilliance (reduce Edge Boost costs by one once per encounter on tests modified by an adept power/metamagic; may resist adept drain with an alternate attribute, chosen and fixed when the way is taken), plus your chosen Way's specific benefit (Street Wyrd pp. 76-77 - each Way swaps in a wild die on a different pair of skills, or grants a mentor-spirit-style bonus).",
    requiresParam: "custom",
  },
  {
    id: "photographic-memory",
    name: "Photographic Memory",
    category: "positive",
    karma: 12,
    summary: "You retain far more detail from your life than most people ever could.",
    effect: "Gain a bonus Edge point when making a Memory test (lost if unused on that test).",
  },
  {
    id: "quick-healer",
    name: "Quick Healer",
    category: "positive",
    karma: 8,
    summary: "Your body mends faster from injury than most.",
    effect: "Halve the interval for natural healing tests (Stun Damage heals in half an hour, Physical Damage in half a day).",
  },
  {
    id: "resistance-to-pathogens",
    name: "Resistance to Pathogens",
    category: "positive",
    karma: 12,
    summary: "A remarkably healthy immune system that fights off illness with ease.",
    effect: "Gain a bonus point of Edge when making a Pathogen Resistance test (lost if unused on that test).",
  },
  {
    id: "spirit-sprite-affinity",
    name: "Spirit/Sprite Affinity",
    category: "positive",
    karma: 14,
    summary: "A particular kind of spirit or sprite holds you in high regard.",
    effect:
      "Select a type of spirit or sprite when taking this quality. Gain a bonus point of Edge on Conjuring or Tasking tests involving that type. Can be taken multiple times for different types.",
    requiresParam: "custom",
  },
  {
    id: "thermographic-vision",
    name: "Thermographic Vision",
    category: "positive",
    karma: 8,
    summary: "You can pick out heat signatures even where ordinary light fails.",
    effect: "You can see the heat of objects in total darkness, provided they differ from ambient temperature.",
  },
  {
    id: "toughness",
    name: "Toughness",
    category: "positive",
    karma: 12,
    summary: "Through training, conditioning, or sheer stubbornness, you shrug off injury better than most.",
    effect: "Gain a bonus point of Edge when making Damage Resistance tests (lost if unused on that test).",
  },
  {
    id: "toxin-resistance",
    name: "Toxin Resistance",
    category: "positive",
    karma: 12,
    summary: "Your body handles toxins in the Sixth World better than most.",
    effect: "Gain a bonus point of Edge when making a Toxin Resistance test (lost if unused on that test).",
  },
  {
    id: "will-to-live",
    name: "Will to Live (1 to 3)",
    category: "positive",
    karma: 8,
    levels: { min: 1, max: 3 },
    summary: "A tenacity that lets you hang on far past the point most people would give out.",
    effect: "Per rank, gain two additional Damage Overflow boxes.",
  },

  // --- SR6 Companion, "People of Exceptional Quality" (book pp. 132-135) ---
  {
    id: "augmentation-acclimation",
    name: "Augmentation Acclimation (1 to 10)",
    category: "positive",
    karma: 2,
    levels: { min: 1, max: 10 },
    summary: "Your body has adapted to carrying augmentations, freeing up capacity for further upgrades.",
    effect:
      "Requires Essence 3 or less. Each level frees up 0.1 Essence worth of capacity for additional augmentations, without changing your actual Essence total.",
  },
  {
    id: "bravado",
    name: "Bravado",
    category: "positive",
    karma: 6,
    summary: "Shadows be damned - you were built for the spotlight.",
    effect:
      "Once per session, gain a point of Edge for any action you take, provided you show off in the process. Using this raises your Heat modifier by 1.",
  },
  {
    id: "critter-dominator",
    name: "Critter Dominator",
    category: "positive",
    karma: 10,
    summary: "You use raw aggression and force of will to dominate creatures.",
    effect:
      "Spend a Major Action to attempt to dominate a non-sapient critter with an opposed Influence (Intimidation) + Charisma vs. the critter's Intuition + Willpower test. On success, you control the critter as if you had the Animal Control critter power for one minute per hit. You may only ever dominate a given individual critter once.",
  },
  {
    id: "critter-trainer",
    name: "Critter Trainer",
    category: "positive",
    karma: 10,
    summary: "You're skilled at taming non-sapient animals and critters and training them to follow commands.",
    effect:
      "Taming an untamed critter takes a week of effort and a successful Influence + Charisma test vs. the critter's Intuition + Willpower. Once tamed, you can teach it new commands (each taking a week and another training test); a critter can learn a maximum number of commands equal to twice its Logic. Each command needs a defined trigger and action; issuing one is a Minor Action.",
  },
  {
    id: "cyberjack-maximization",
    name: "Cyberjack Maximization",
    category: "positive",
    karma: 12,
    summary: "Your grey matter has adapted especially well to interfacing with your cyberjack.",
    effect: "Add 1 to the lower of your cyberjack's two Matrix attributes.",
  },
  {
    id: "cyborg",
    name: "Cyborg (1 to 10)",
    category: "positive",
    karma: 5,
    levels: { min: 1, max: 10 },
    summary: "An exemplary merge of metahuman and machine, able to carry far more augmentation than most could survive.",
    effect:
      "Requires Essence 1 or less and 10 levels of Augmentation Acclimation already taken. Like Augmentation Acclimation, each level frees up 0.1 Essence worth of capacity for additional augmentations.",
  },
  {
    id: "discreet-smuggler",
    name: "Discreet Smuggler",
    category: "positive",
    karma: 7,
    summary: "You know how to hide things where no one else will find them.",
    effect:
      "When you take a Major Action to conceal an item, gain a point of Edge that must be spent on that test or it's lost. If the item is no larger than a heavy pistol, its Concealability Threshold also increases by 1. This applies against both Perception tests and scanner sweeps.",
  },
  {
    id: "extended-overdrive",
    name: "Extended Overdrive",
    category: "positive",
    karma: 6,
    // Source text gives no maximum level ("6 Karma per Level"); treated as
    // a flat single purchase pending confirmation of a level cap.
    summary: "You can push your augmentations beyond all normal limits to eke out an extra burst of whatever you need.",
    effect:
      "When you engage augmentation overdrive, it lasts one round per level of this quality (instead of a single test). You must include the wild die on every test that uses the boosted attribute.",
  },
  {
    id: "focused-ambition",
    name: "Focused Ambition",
    category: "positive",
    karma: 6,
    summary: "You're driven to accomplish your goals, and nothing stands in your way for long.",
    effect:
      "Choose a specific goal with your GM's approval. You may substitute two wild dice for one of your dice on any test made in direct pursuit of that goal. On success, set a new goal; if you give up on a goal instead, you can't pick a new one for at least a month.",
  },
  {
    id: "inspire-competence",
    name: "Inspire Competence",
    category: "positive",
    karma: 11,
    summary: "You know how to motivate people to get the most out of their capabilities.",
    effect:
      "As a Major Action, make an Influence (Leadership) + Charisma test to assist another character's Teamwork test with any skill. Either you or the character you assisted (player's choice) gains a point of Edge.",
  },
  {
    id: "many-talents",
    name: "Many Talents",
    category: "positive",
    karma: 18,
    summary: "You aren't limited to just one maxed-out attribute at character creation.",
    effect: "May only be taken at character creation. You may have up to two attributes at their metatype maximum instead of one.",
  },
  {
    id: "many-skills",
    name: "Many Skills",
    category: "positive",
    karma: 18,
    summary: "You aren't limited to just one maxed-out skill at character creation.",
    effect: "May only be taken at character creation. You may have up to two skills at rank 6 instead of one.",
  },
  {
    id: "martial-arts-prodigy",
    name: "Martial Arts Prodigy",
    category: "positive",
    karma: 14,
    summary: "You quickly master any martial art you learn.",
    effect:
      "New martial arts and techniques cost 2 Karma less to learn, and you may learn any number of martial arts and techniques during the same training period instead of just one.",
  },
  {
    id: "maximum-overdrive",
    name: "Maximum Overdrive",
    category: "positive",
    karma: 7,
    summary: "If most 'ware goes up to a ten, yours goes to eleven.",
    effect:
      "When you overdrive your cyberware, gain a point of Edge. If you overstress your augmentation with a glitch or critical glitch, the time your 'ware is affected is reduced by one round.",
  },
  {
    id: "more-machine-than-metahuman",
    name: "More Machine Than Metahuman",
    category: "positive",
    karma: 5,
    summary: "When it comes to repairing your injuries, a screwdriver is a better tool than a bandage.",
    effect:
      "Requires Essence 2 or less. When someone performs first aid on you, they use Biotech (Cybertechnology) in place of Biotech (First Aid), with a threshold equal to your Essence (round down).",
  },
  {
    id: "muscles",
    name: "Muscles",
    category: "positive",
    karma: 6,
    summary: "You know how to use your impressive physique to your advantage in social situations.",
    effect: "You may substitute Strength for Charisma on a social skill test, but only when your imposing physique would plausibly help.",
  },
  {
    id: "polyglot",
    name: "Polyglot",
    category: "positive",
    karma: 4,
    summary: "You've picked up a knack for languages.",
    effect:
      "Learn new language skills at a cost of 2 Karma per rank, and improve existing language skills for only 1 Karma per rank, up to rank 4 (native).",
  },
  {
    id: "relentless-tracker",
    name: "Relentless Tracker",
    category: "positive",
    karma: 6,
    summary: "They can run, and they can hide, but they won't get away from you.",
    effect: "Gain a point of Edge whenever you use the Tracking specialization of the Outdoors skill.",
  },
  {
    id: "rote-alchemist",
    name: "Rote Alchemist",
    category: "positive",
    karma: 10,
    summary: "You're so practiced at alchemy that your results are extremely reliable.",
    effect:
      "When creating an alchemical preparation, you may buy hits instead of rolling: one hit per three dice (round down). The opposing dice pool (the preparation's Drain Value) then buys hits at one hit per four dice (round down, minimum 1). If you also buy hits on the drain resistance test, you get one hit per three dice (round down).",
  },
  {
    id: "software-optimization",
    name: "Software Optimization",
    category: "positive",
    karma: 10,
    summary: "You know how to get the most out of your hardware by running more software.",
    effect: "Run one extra program on any device you own. Gain a point of Edge whenever you use that program.",
  },
  {
    id: "soothing-static",
    name: "Soothing Static",
    category: "positive",
    karma: 4,
    summary: "You've become used to the noise, and even find it comforting.",
    effect:
      "Whenever you're affected by Matrix noise, reduce the Edge cost of any boosts or actions by 1 (minimum 1). Applies only to Matrix actions, and only while some noise remains - if it's fully canceled, this quality doesn't apply.",
  },
  {
    id: "spell-components",
    name: "Spell Components",
    category: "positive",
    karma: 12,
    summary: "You know how to use reagents to reduce your risk of drain.",
    effect:
      "When you cast a spell, spend a Minor Action to use reagents on your drain resistance test. Gain an extra die per reagent spent, up to a maximum equal to your ranks in Enchanting (Alchemy).",
  },
  {
    id: "team-player",
    name: "Team Player",
    category: "positive",
    karma: 10,
    summary: "You're part of a team, and you know how to look out for your own.",
    effect:
      "You may spend Edge on a teammate's behalf on a one-for-one basis - combining your Edge with theirs to pay for a boost or action, or covering the whole cost yourself. Only one Edge boost or action may be used on any given test, regardless of who pays for it.",
  },
  {
    id: "teflon-coated",
    name: "Teflon Coated",
    category: "positive",
    karma: 12,
    summary: "Blame just doesn't seem to stick to you.",
    effect:
      "After the gamemaster rolls to determine Heat at the end of a run, you may force a re-roll that affects only your personal Heat. If multiple runners on the team have this quality, only one re-roll is allowed, and it affects all of them.",
  },

  // --- Hack & Slash, "Quality Hacking" (book pp. 80-84) ---
  {
    id: "at-home-in-the-matrix",
    name: "At Home in the Matrix",
    category: "positive",
    karma: 15,
    summary: "You feel truly at home in the Matrix, as if you were born to be there.",
    effect:
      "While using hot sim VR, gain one more point of Edge per combat round than normal (characters are usually limited to two points per round).",
  },
  {
    id: "brilliant-heuristics",
    name: "Brilliant Heuristics",
    category: "positive",
    karma: 10,
    summary: "You have a special knack for efficiently focusing your processing power.",
    effect:
      "Spend a Minor Action to prepare and calibrate your processing power immediately before a Matrix Action, adding half your Data Processing attribute (round up) as bonus dice on that test. If you don't immediately follow with a Matrix Action, the bonus is lost. Only usable by a persona running on a cyberdeck.",
  },
  {
    id: "data-anomaly",
    name: "Data Anomaly",
    category: "positive",
    karma: 5,
    summary: "When you don't want to be noticed on the Matrix, you know a few extra tricks that help you stay hidden.",
    effect:
      "While running silent, gain a point of Edge whenever a Matrix Perception attempt is made to spot you or any icon in your network.",
  },
  {
    id: "data-haven-membership",
    name: "Data Haven Membership",
    category: "positive",
    karma: 5,
    // Source text gives no maximum level ("5 Karma/Level"); treated as a
    // flat single purchase pending confirmation of a level cap.
    summary: "You maintain a regular presence on a few underground Matrix data havens.",
    effect:
      "Each level grants access to an underground data haven of info brokers, fixers, and shadowrunners. When you need to Matrix Search for information kept hidden from the public, gain a point of Edge (more detail may be available at GM discretion). Using this on a run adds +1 to your team's Heat modifier.",
  },
  {
    id: "deck-builder",
    name: "Deck Builder",
    category: "positive",
    karma: 6,
    summary: "Your custom cyberdeck is never finished - there's always room for more upgrades.",
    effect:
      "When you spend Karma to build or upgrade hardware, each point is worth 5,000 nuyen instead of the usual 4,000. Hardware you build yourself is more modular: you may use the Reconfigure Device Matrix Action to swap Matrix attributes on a custom cyberdeck or cyberhack you built.",
  },
  {
    id: "fade-to-black",
    name: "Fade to Black",
    category: "positive",
    karma: 3,
    summary: "When trouble finds you in the Matrix, you get a thrill out of giving it the slip.",
    effect: "Gain a point of Edge whenever you successfully use the Hide Matrix Action.",
  },
  {
    id: "fractal-blast",
    name: "Fractal Blast",
    category: "positive",
    karma: 9,
    summary: "Some hackers depend entirely on their Attack attribute, but you know how to boost your Data Spikes using sheer mathematics.",
    effect:
      "Spend a Minor Action to focus your processing power, increasing the base DV of your next Data Spike by half your Data Processing attribute (round down). You must immediately follow with a Data Spike action or the bonus is lost. Only usable by a persona running on a cyberdeck.",
  },
  {
    id: "golden-screwdriver",
    name: "Golden Screwdriver",
    category: "positive",
    karma: 5,
    summary: "Whether using a screwdriver or a soldering iron, you're a hardware wizard.",
    effect: "When making an Extended test to repair Matrix damage, the interval is 10 minutes instead of 1 hour.",
  },
  {
    id: "hacker-combo",
    name: "Hacker Combo",
    category: "positive",
    karma: 10,
    summary: "You've practiced a sequence of actions in the Matrix to the point that they feel like one action.",
    effect:
      "Choose two specific Matrix actions. You may take both together using a Minor and a Major Action, choosing which resolves first each time. May be taken multiple times to learn more combos.",
  },
  {
    id: "hold-the-door",
    name: "Hold the Door",
    category: "positive",
    karma: 9,
    summary: "You've learned to share illegal Matrix access levels with other personas.",
    effect:
      "Whenever you gain illegal user or admin access to a host, you may share it with a number of additional personas equal to the net hits you scored, if they accept via a Minor Anytime Action. Granting illegal admin access to a persona without a Sleaze attribute increases their Overwatch Score by 2D6 at the end of every combat round.",
  },
  {
    id: "icu",
    name: "ICU",
    category: "positive",
    karma: 3,
    summary: "You get a thrill out of spotting hidden icons on the Matrix.",
    effect:
      "When you successfully spot an icon that's running silent, gain a point of Edge - but only when it's relevant to the story, not from routinely scanning random icons.",
  },
  {
    id: "impenetrable-logic",
    name: "Impenetrable Logic",
    category: "positive",
    karma: 7,
    summary: "Your quick and adaptable sense of logic helps you identify attack patterns and potential threats.",
    effect: "When you use Full Defense, use your Logic attribute in place of Willpower.",
  },
  {
    id: "jack-jockey",
    name: "Jack Jockey",
    category: "positive",
    karma: 11,
    summary: "You know how to take advantage of a direct connection.",
    effect:
      "When you have a direct connection to the target of your Matrix Action or complex form: no Edge may be gained or spent on the defense test against you; the target only gets the protection of its own Firewall, not any external source like a PAN; and if the target is powered off, you may use a Control Device action to turn it on.",
  },
  {
    id: "loner",
    name: "Loner",
    category: "positive",
    karma: 5,
    summary: "You work better on your own, at least in the Matrix.",
    effect:
      "Whenever you're using AR or VR mode with no agent program running, no compiled or registered sprites (including ally sprites or ones on standby), and no SimShare hitchhikers, gain a wild die on all Matrix Action and complex form tests. If that particular wild die rolls a 1, it doesn't add hits and doesn't subtract three hits as glitches normally would (though it still counts toward triggering a glitch). Other wild dice work normally.",
  },
  {
    id: "matrix-attribute-advancement",
    name: "Matrix Attribute Advancement (1 to 3)",
    category: "positive",
    karma: 15,
    levels: { min: 1, max: 3 },
    summary: "You've become extremely good with some aspects of the Matrix, or found unconventional ways to enhance your persona.",
    effect:
      "Choose a Matrix attribute (Attack, Sleaze, Data Processing, or Firewall); it's always increased by the level of this quality, applied after any swapping (it doesn't move if you reassign your attributes). May be taken multiple times for different attributes; available to any character. The increased rating counts as the unaugmented rating for the purpose of further boosts.",
  },
  {
    id: "natural-hacker",
    name: "Natural Hacker",
    category: "positive",
    karma: 15,
    summary: "You use your innate connection to the Resonance to get things done in the Matrix. It's all you need.",
    effect:
      "Whenever you take a Matrix action or a defense test against a Matrix action, complex form, or sprite power, you may use your Resonance attribute in place of any other non-Matrix attribute used on that test. You may not replace Attack, Sleaze, Data Processing, or Firewall with Resonance this way.",
  },
  {
    id: "online-fame",
    name: "Online Fame (1 to 6)",
    category: "positive",
    karma: 3,
    levels: { min: 1, max: 6 },
    summary: "Your persona is widely recognized in the Matrix. Oddly, this works in your favor more often than it gets in your way.",
    effect:
      "Whenever you make an Influence or Con test while in the Matrix, gain bonus dice equal to the level of this quality. Using it during a run adds +1 to your personal Heat modifier at the end of the run - it only affects you, not your teammates.",
  },
  {
    id: "profiler",
    name: "Profiler",
    category: "positive",
    karma: 7,
    summary: "You are good at gathering and compiling information about people for future reference.",
    effect:
      "Build a profile on any person via a Matrix Search test (threshold 6, 1-hour interval) followed by a programming test (threshold 6, 1-minute interval, can't be reduced). Once complete, the profile is permanent and holds the kind of basic info legwork would provide. When you have a profile on someone, gain a point of Edge on Con, Influence, or Judge Intentions tests against them - spend it on that test or bank it into the profile. Each profile can store up to 6 points of Edge, usable only by you, only on Edge Boosts and Actions against that target, but on any kind of test (not just Con/Influence/Judge Intentions). Stored Edge resets at the start of the next session.",
  },
  {
    id: "quick-config",
    name: "Quick Config",
    category: "positive",
    karma: 3,
    summary: "You're very good at recalibrating your cyberdeck on the fly.",
    effect:
      "When you take the Reconfigure Matrix Attribute action, you can swap any number of Matrix attributes and programs around with a single Minor Action. In a cybercombat or combat situation, once per round you gain a point of Edge when you use this action.",
  },
  {
    id: "reverberant",
    name: "Reverberant",
    category: "positive",
    karma: 5,
    summary: "Some people seem to have a sense for the Resonance, even if they can't use it themselves.",
    effect:
      "With a successful Matrix Perception action, you're capable of detecting and analyzing things in the Resonance that normally only entities with a Resonance attribute can perceive.",
  },
  {
    id: "satisfaction",
    name: "Satisfaction",
    category: "positive",
    karma: 3,
    summary: "Curiosity may have killed the cat, but you know what brought it back, don't you?",
    effect:
      "When you successfully crack encryption or defuse a data bomb on a file, gain a point of Edge - unless it was placed there solely to trigger this quality; only when it genuinely counts, per GM discretion.",
  },
  {
    id: "surgical-strike",
    name: "Surgical Strike",
    category: "positive",
    karma: 11,
    summary: "You have a talent for subtly hacking into hosts.",
    effect:
      "The Overwatch Score increase from having illegal user or admin access to a host occurs once per minute instead of once per combat round.",
  },
  {
    id: "voider-of-warranties",
    name: "Voider of Warranties",
    category: "positive",
    karma: 13,
    summary: "If you spend some extra time with an off-the-shelf device, you can make some unorthodox improvements.",
    effect:
      "With the relevant toolkit, take a factory-manufactured device and improve it with an extended Electronics (Hardware) + Logic or Engineering + Logic test (threshold equal to its Device Rating or 4, whichever is higher; 1-hour interval). The device gains upgrade points equal to your Logic attribute. Any time you use the upgraded device, you may spend an additional Minor Action to engage the upgrades, adding a wild die for every upgrade point spent; if any of those wild dice roll a 1, or once all the upgrade points are spent, the device stops working until you repeat the test (1-minute interval this time) to restore it. This can't be used on devices that generate a persona (commlinks, cyberdecks, RCCs), and augmentations, drones, and vehicles are also ineligible. Using this voids the manufacturer's warranty.",
  },

  // --- Hack & Slash, "Virtual Life" (book p. 129) ---
  {
    id: "paragon",
    name: "Paragon",
    category: "positive",
    karma: 10,
    summary: "You believe in something other than yourself to help guide and channel your resonance, and that something believes in you, too.",
    effect:
      "Gain the benefits associated with your chosen paragon (see the Sample Paragons list). Failing to stay aligned with its tenets costs you favor with your paragon and all associated bonuses.",
    requiresParam: "custom",
  },
  {
    id: "resonant-stream",
    name: "Resonant Stream",
    category: "positive",
    karma: 20,
    summary: "You've identified a path through the Resonance that focuses your abilities: Machinists, Sourcerors, or Technoshamans.",
    effect:
      "Choose one stream (Machinists, Sourcerors, or Technoshamans). Gain that stream's fixed benefits and Aspect Peripheral power, and unlock its associated complex form for purchase (not granted free) - see the Resonant Streams section for each stream's specifics. A technomancer can only follow one stream at a time; unlike most qualities, this one isn't subject to the double-Karma-cost-after-creation rule.",
    requiresParam: "custom",
  },

  // --- Double Clutch, "Gearhead Anatomy" (book pp. 167-171) ---
  {
    id: "affinity-for-transit",
    name: "Affinity for Transit (Mode)",
    category: "positive",
    karma: 6,
    requiresParam: "custom",
    summary: "Your character has used this method of travel for so long that you have an intimate knowledge of transit systems and how they function.",
    effect:
      "Choose one form of mass transit (air, train, subway, trolley, bus, etc.). Once a day with a successful Persuasion (4) test, gain one of: upgrading your ticket class at no additional cost; middle-class amenities for 12 hours (free food/drink coupons, VIP lounge, complimentary hotel accommodations); or the ability to move an illegal or forbidden personal item (up to the size of a small drone) onto the transit vehicle without hassle - spend 1 Edge to have it accessible while on the vehicle.",
  },
  {
    id: "always-ready",
    name: "Always Ready",
    category: "positive",
    karma: 8,
    // Source text gives no maximum level ("8 Karma/level... up to its
    // [chase pool's] maximum"); treated as a flat single purchase pending
    // confirmation of a level cap.
    summary: "When you're on the road (or in any other form of conveyance), you are always scoping the scene and ready to go after whoever needs going after.",
    effect:
      "When your chase pool becomes available, it begins with 1 Edge already in it. May be taken multiple times to increase how much Edge your chase pool starts with, up to the chase pool's maximum.",
  },
  {
    id: "attribute-mastery",
    name: "Attribute Mastery",
    category: "positive",
    karma: 3,
    requiresParam: "attribute",
    summary: "You have one particular part of you that just works out every time - when you have to rely on it, things just work out for you.",
    effect:
      "Choose one attribute: Body, Agility, Reaction, Strength, Willpower, Intuition, or Charisma. Gain a bonus Edge when you make any test based on that attribute, unless you also gain Edge from your Attack Rating on that test. May only be taken once, and is incompatible with Analytical Mind (having one blocks taking the other).",
  },
  {
    id: "determination",
    name: "Determination",
    category: "positive",
    karma: 11,
    summary: "Your focus and will can lift your driving above the norm.",
    effect:
      "Before making a Piloting test, you may declare an Edge boost or action. You may spend Minor Actions to reduce the cost of that Edge boost or action on the Piloting test by 1 per Minor Action spent, down to a minimum cost of 1. If you don't immediately follow the Minor Actions with the Piloting action, this effect is lost.",
  },
  {
    id: "driving-style-combat-ace",
    name: "Driving Style: Combat Ace",
    category: "positive",
    karma: 12,
    summary: "High speeds and sharp turns aren't dangerous enough for you, whether it's a dogfight in the sky, a combat biker game, or a running gun battle on the freeway.",
    effect:
      "You only pay half the required Edge cost for: Attack Run (2 Edge), Dead to Rights (3 Edge), Crossfire (3 Edge), and Double Down (1, 2, or 3 Edge, only on Engineering [Gunnery] tests).",
  },
  {
    id: "driving-style-getaway-driver",
    name: "Driving Style: Getaway Driver",
    category: "positive",
    karma: 10,
    summary: "You know a few maneuvers that are handy when evading pursuit, which come in handy more often than you'd probably like.",
    effect:
      "You only pay half the required Edge cost for: Evade Pursuit (2 or 4 Edge), Evasive Action (2 Edge), Escape! (2 Edge), and Double Down (1, 2, or 3 Edge, only on defense tests when piloting a vehicle).",
  },
  {
    id: "driving-style-interceptor",
    name: "Driving Style: Interceptor",
    category: "positive",
    karma: 8,
    summary: "Sometimes you need to chase someone down. You know how to make sure they don't get away.",
    effect:
      "You only pay half the required Edge cost for: Redline (2 Edge), Focus (1 Edge), In the Zone (2 Edge), and Double Down (1, 2, or 3 Edge, on any test made while chasing or shadowing a target).",
  },
  {
    id: "driving-style-reckless-driver",
    name: "Driving Style: Reckless Driver",
    category: "positive",
    karma: 8,
    summary: "You take risks whenever you get the chance, relying on the wild and chaotic nature of the chase and your own luck to get you through. You're either going to win big or crash and burn. Or both!",
    effect:
      "You only pay half the required Edge cost for: Double Down (1, 2, or 3 Edge, only on Piloting tests), Chicken (3 Edge), Equalizer (1 Edge), and Up the Ante (1, 2, or 3 Edge).",
  },
  {
    id: "driving-style-stunt-driver",
    name: "Driving Style: Stunt Driver",
    category: "positive",
    karma: 9,
    summary: "Starting with the legendary Evel Knievel, you idolize many of the vehicle stunts performed on the trid, and no one is going to tell you that it's all AROs and illusions.",
    effect:
      "You only pay half the required Edge cost for: Bootleg Turn (1 Edge), Tokyo Drift (2 Edge), Pickup (4 Edge), and The Exit (6 Edge).",
  },
  {
    id: "grease-monkey",
    name: "Grease Monkey (Engineering Spec.) (1 to 2)",
    category: "positive",
    karma: 4,
    levels: { min: 1, max: 2 },
    requiresParam: "custom",
    summary: "When you were young, you would much rather make a trip to the junkyard than the toy store.",
    effect:
      "Choose an Engineering specialization. At level 1 (4 Karma), the Base repair time for that specialization is reduced by 10 minutes. At level 2 (8 Karma), the Base Threshold is also reduced by 1.",
  },
  {
    id: "junkyard-king",
    name: "Junkyard King (1 to 2)",
    category: "positive",
    karma: 4,
    levels: { min: 1, max: 2 },
    summary: "It's a Harley... compatible... thing... basically the same, only with parts not made by the original manufacturers.",
    effect:
      "At level 1 (4 Karma), reduce the availability of parts by 1 when looking for used parts. At level 2 (8 Karma), also reduce the threshold penalty by 1 when using used parts for a repair test.",
  },
  {
    id: "the-motorpool",
    name: "The Motorpool (1 to 3)",
    category: "positive",
    karma: 3,
    levels: { min: 1, max: 3 },
    summary: "Like the face having contacts, a rigger can invest in a plethora of chop shops, junkyards, surplus, and used vehicle lots.",
    effect:
      "Level 1 (3 Karma) - Free Ride: once a day, a successful Influence + Charisma (4) test gets you a free ride in some form of transportation to get near your desired location. Level 2 (6 Karma) - Replacement Vehicle: keep the Free Ride benefit, and may spend 2 Edge to get a stock version of your normal vehicle for personal use for one day at no charge. Level 3 (9 Karma) - Alternate Transportation: with a successful Influence + Charisma (4) test, spend 4 Edge to access special transportation (plane, ship, sub, etc.) to use as fits for one day, subject to GM discretion on availability. If you return a vehicle damaged, you must pay for the repairs yourself. All levels of this quality are cumulative.",
  },
  {
    id: "signature-maneuver",
    name: "Signature Maneuver",
    category: "positive",
    karma: 4,
    requiresParam: "custom",
    summary: "You have your own special move that you keep doing for one simple reason: it keeps working. And it looks cool. So, two reasons.",
    effect:
      "Choose a combination of two specific Edge boosts or actions plus either a skill or Defense test, and name/describe your maneuver. When using the selected skill, you may combine the two chosen Edge boosts/actions together on a single test (paying full Edge cost for each), but you must declare and commit to using them before rolling the dice. May be taken multiple times to create additional signature maneuvers.",
  },
  {
    id: "silver-lining",
    name: "Silver Lining",
    category: "positive",
    karma: 8,
    summary: "When things go wrong, you find a way to make something good out of it. Eventually.",
    effect:
      "Whenever you glitch, gain an Edge. Whenever you critically glitch, your Edge pool fills to its max of 7. The glitch or critical glitch's normal effects still happen. If the glitch is somehow prevented, you don't gain Edge from this quality.",
  },
  {
    id: "speed-racer",
    name: "Speed Racer",
    category: "positive",
    karma: 8,
    summary: "You can drive fast, but it's always faster when you have someone to beat - or catch.",
    effect:
      "When you're in a chase or race, gain a point of Edge at the start of every round. This Edge can only be used in your Chase pool.",
  },
  {
    id: "underdog",
    name: "Underdog",
    category: "positive",
    karma: 7,
    summary: "You're not a front-runner. When you're behind, you feel inspired to do your best work. Or go out in a blaze of glory.",
    effect: "Whenever anyone has a position advantage against you in a chase, add a wild die to all of your Piloting tests.",
  },
  {
    id: "vehicle-empathy",
    name: "Vehicle Empathy (Pilot Specialization) (1 to 2)",
    category: "positive",
    karma: 4,
    levels: { min: 1, max: 2 },
    requiresParam: "custom",
    summary: "You seem to understand vehicles better than most people and can coax a little more performance through physical contact.",
    effect:
      "Choose a Pilot specialization. When piloting a vehicle of that specialization, its Acceleration and Speed Interval are increased by 2. At level 1 (4 Karma), this only applies when manually driving the vehicle. At level 2 (8 Karma), it applies whenever you're physically connected to the vehicle (manually driving or jacked in).",
  },

  // --- Street Wyrd, "New Qualities for Awakened Characters" (book p. 113) ---
  {
    id: "arcane-resilience-training",
    name: "Arcane Resilience Training (Attribute)",
    category: "positive",
    karma: 7,
    requiresParam: "custom",
    summary: "Students of magic learn the standard techniques of their tradition to resist the exhaustion that kicks in after using arcane powers, but some teachers help them do it more effectively.",
    effect:
      "Choose Logic, Intuition, or Charisma as your new tradition attribute, using it in place of your tradition's normal drain-resistance attribute on all drain resistance tests.",
  },
  {
    id: "scholastic-mage",
    name: "Scholastic Mage",
    category: "positive",
    karma: 1,
    summary: "A considerable share of mages don't train with a personal teacher but attend university classes instead - an education that pays off in mediated knowledge, at a price.",
    effect:
      "During character creation only, buy Knowledge Skills for 2 Karma each instead of the normal cost, or buy them with your starting nuyen at 1,000 nuyen per Knowledge skill. Can be combined with the In Debt quality, which raises the nuyen cost to 2,000 per Knowledge skill.",
  },
  {
    id: "shamanic-mask",
    name: "Shamanic Mask",
    category: "positive",
    karma: 4,
    summary: "Some magicians channel their arcane powers through their mentor spirit, manifesting a visible, temporary transformation as part of using their magic.",
    effect:
      "Define one visible transformation effect (e.g. a translucent wolf's face, eyes glowing with arcane fire) that accompanies any use of a magic skill (or, for adepts, any activation of an adept power). By investing an additional Minor Action, gain one Edge usable only on that test (for adepts, the first test involving the activated power). The transformation is mana-based and visible to anyone, which can expose you as Awakened and draw unwanted attention.",
  },

  // --- Body Shop, "Atavism/Transgenics" (book pp. 104) ---
  {
    id: "im-into-it",
    name: "I'm Into It",
    category: "positive",
    karma: 2,
    requiresParam: "custom",
    summary: "There are certain types of alterations that you find fascinating, and it shows up in interactions with those individuals.",
    effect: "Choose a particular transgenic alteration type. Gain +1 Edge for social tests during meetings with that group of people.",
  },
  {
    id: "previous-life-unicorn",
    name: "In a Previous Life, I Was a Unicorn",
    category: "positive",
    karma: 10,
    requiresParam: "custom",
    summary: "Transgenic treatments haven't changed you - they returned you to what you truly are, or were.",
    effect:
      "Choose an animal with which you identify. For all transgenic treatments related to that same animal type (e.g. tiger claws, tiger fur, cat-like reflexes), you only take half Essence loss.",
  },
  {
    id: "chimeric-soul",
    name: "Chimeric Soul",
    category: "positive",
    karma: 15,
    summary: "When you look down the path of evolutionary history, you see all the creatures that you were and could have been.",
    effect:
      "Gain one additional transgenic infusion from a different animal outside your initial choice (e.g. a leonine body with serpent venom sacs), raising your maximum possible infusions to six. Cannot be taken with Misaligned Souls.",
  },

  // --- Body Shop, "Edge of Essence" (book pp. 168-169) ---
  {
    id: "cyber-singularity-seeker",
    name: "Cyber Singularity Seeker",
    category: "positive",
    karma: 10,
    summary: "You believe that implanting more cyberware is bringing you closer to a state of true harmony between man and machine. Instead of feeling like you have sacrificed a portion of yourself, a set of replacement limbs makes you feel unequivocally whole.",
    effect:
      "Gain +1 Willpower for each pair of cyberlimbs (two arms or two legs) you have implanted, up to a maximum of +2 Willpower.",
  },
  {
    id: "drug-tolerant",
    name: "Drug Tolerant",
    category: "positive",
    karma: 5,
    summary: "You have a higher-than-average tolerance against becoming addicted to drugs. Whether because you're genetically predisposed to tolerance or you just happen to be stubborn as a mule, addictions have a harder time taking hold of you.",
    effect: "Gain a point of Edge when making Addiction tests.",
  },
  {
    id: "empathic-retention",
    name: "Empathic Retention (1 to 2)",
    category: "positive",
    karma: 4,
    levels: { min: 1, max: 2 },
    summary: "Either through a natural ability or by training and practice, you have maintained your awareness of the subtle non-verbal cues metahumans use when communicating with each other, offsetting the atrophy of social awareness usually caused by Essence loss.",
    effect:
      "Each level of this quality negates 1 point of negative Social Rating caused by Essence loss. Cannot generate a positive Social Rating modifier, and has no effect on negative Social Rating from other factors.",
  },
  {
    id: "redliner",
    name: "Redliner",
    category: "positive",
    karma: 10,
    summary: "Any cyberlimbs you have are overclocked and have their safety limits disabled, causing them to run at an increased capacity, but the additional stress takes its toll on your body.",
    effect:
      "For every pair of cyberlimbs installed (two cyberarms or two cyberlegs), your paired limbs get an additional +1 Strength and +1 Agility, up to a maximum of +2 total toward the augmented maximum. However, you only gain 1 Physical Condition Monitor box per full pair of cyberlimbs, instead of 1 per limb.",
  },

  // --- Power Plays, Aztechnology "New Qualities" (book p. 56) ---
  {
    id: "blood-magic-resistance",
    name: "Blood Magic Resistance",
    category: "positive",
    karma: 12,
    summary: "For whatever reason, blood magic simply does not work well on you.",
    effect:
      "Any blood magic practitioners have a -2 penalty performing rituals or spells against you, and can only gain 1 Edge in your presence per combat round, instead of the normal maximum of 2.",
  },

  // --- Power Plays, Renraku "Game Information" (book p. 113) ---
  {
    id: "networked-in",
    name: "Networked In",
    category: "positive",
    karma: 4,
    summary: "You're known for your ability to find the connected people in your community - and introduce them to people who help them further their reach.",
    effect: "When you gain a new contact whose Connection rating is 4 or less, immediately increase that rating by 1.",
  },

  // --- Power Plays, Shiawase "Game Information" (book p. 146) ---
  {
    id: "human-2-0",
    name: "Human 2.0",
    category: "positive",
    karma: 25,
    summary: "Thanks to Shiawase genetic manipulations and selective breeding, they have managed to make the human genome just a little bit better. It's up to you to meet your potential. Humans only.",
    effect:
      "Requires being Human. Your racial limit for Charisma and Willpower is increased by 1. You cannot be magically active or have Resonance.",
  },
  {
    id: "dog-on-a-leash",
    name: "Dog on a Leash",
    category: "positive",
    karma: 8,
    summary: "You've come up through the Dog program. Whatever your focus was, the most important aspect you have was Loyalty, and that you have in spades.",
    effect:
      "Gain +2 to any Willpower test that would result in you harming, defaming, or letting harm come to the Shiawase corporation.",
  },
  {
    id: "shinto-summoner",
    name: "Shinto Summoner",
    category: "positive",
    karma: 2,
    summary: "Your focus in the ways of Shinto give you a particular affinity with spirits connected to that tradition.",
    effect:
      "Requires being able to summon spirits. Gain +1 to Summon rolls while in Shinto shrines. Corrupted spirits will always select you over any other target.",
  },

  // --- No Future, "New Qualities" (book p. 178) ---
  {
    id: "candle-in-the-darkness",
    name: "Candle in the Darkness",
    category: "positive",
    karma: 5,
    summary: "In a world of 'I got mine Jack,' the rare person with an actual code of honor stands out like a candle in the darkness. Some people dismiss them as a sucker, but those who see the truth find themselves believing.",
    effect:
      "Requires having a Code of Honor negative quality. As long as you don't break your Code of Honor, all contacts are treated as having a Loyalty 2 higher than their actual rating. If you break your Code of Honor, your contacts are treated as having 1 Loyalty less than their rating until the mistake can be corrected.",
  },
  {
    id: "massive-network",
    name: "Massive Network",
    category: "positive",
    karma: 20,
    summary: "The character spends an obscene amount of time socializing, gathering friends from all rungs of society. This quality is often seen in fixers, newspaper editors, schoolteachers with two decades of graduates, and world-famous musicians - the type of people who seem to know everybody.",
    effect: "The cost of all contacts is reduced by 2, to a minimum cost of 2. Does not stack with Networker.",
  },
  {
    id: "networker",
    name: "Networker",
    category: "positive",
    karma: 5,
    summary: "This character has an extensive social network of loose friends and casual contacts. This quality is often found in reporters, business managers, and small-time musicians who may cast a wide but shallow social net.",
    effect: "The cost of all contacts is reduced by 1, to a minimum cost of 1. Does not stack with Massive Network.",
  },
];

export const negativeQualities: QualityCatalogEntry[] = [
  {
    id: "addiction",
    name: "Addiction (Substance, 1 to 6)",
    category: "negative",
    karma: 2,
    levels: { min: 1, max: 6 },
    summary: "A habit that's got a firm grip on you and won't let go easily.",
    effect:
      "Cannot earn or spend Edge while in withdrawal. Withdrawal timing depends on the addiction's level (see the Addiction Withdrawal table, p. 75); while in withdrawal, take a -2 dice pool penalty on all tests, increasing by 1 each time another withdrawal period passes.",
    requiresParam: "custom",
  },
  {
    id: "allergy",
    name: "Allergy (Substance, Severity)",
    category: "negative",
    // The book prices this 2-20 Karma via a rarity modifier (Rare -9 to
    // Common 0) combined with a severity base, per the Allergy Table (p.
    // 75) - not a simple flat/per-level value, so this is a placeholder;
    // pick the real number from that table for the chosen allergen/severity.
    karma: 10,
    summary: "You suffer some level of discomfort or worse from a substance found in the Sixth World.",
    effect:
      "Select an allergen and severity (Mild/Moderate/Severe/Extreme) using the Allergy Table to set the Karma value. Cannot spend or earn Edge while exposed. Mild/Moderate/Severe give a -2/-4/-4 dice pool penalty to Physical-attribute tests while exposed (Severe also inflicts 1 box of unresisted Physical Damage per minute of exposure); Extreme gives a -6 penalty to all actions plus 1 box of unresisted Physical Damage every 30 seconds of exposure.",
    requiresParam: "custom",
  },
  {
    id: "ar-vertigo",
    name: "AR Vertigo",
    category: "negative",
    karma: 10,
    summary: "Augmented reality leaves you dizzy and nauseated.",
    effect: "Cannot gain or spend Edge while using AR of any sort. Gain the Nauseated status while using AR and for one hour after.",
  },
  {
    id: "bad-luck",
    name: "Bad Luck",
    category: "negative",
    karma: 10,
    summary: "Things just go wrong around you, often.",
    effect: "Glitches occur more frequently: both 1s and 2s count toward determining a (non-critical) glitch.",
  },
  {
    id: "bad-rep",
    name: "Bad Rep",
    category: "negative",
    karma: 8,
    summary: "Word on the street doesn't speak well of you.",
    effect:
      "Cannot spend Edge on Social tests. If you assist a Social test via Teamwork, no one on the test can spend Edge and the opposition gains a point of Edge.",
  },
  {
    id: "combat-paralysis",
    name: "Combat Paralysis",
    category: "negative",
    karma: 8,
    summary: "You freeze up the moment the shooting actually starts.",
    effect:
      "Initiative Score is halved at the start of combat. Cannot take a Move or Sprint action in the first round and act last that round; movement returns to normal after round 1 but Initiative Score stays reduced.",
  },
  {
    id: "dependents",
    name: "Dependents (1 to 3)",
    category: "negative",
    karma: 4,
    levels: { min: 1, max: 3 },
    summary: "People rely on you for financial support.",
    effect:
      "Choose a level: Level 1 costs 5% of every score to support a non-cohabiting family member; Level 2 costs 10% for a more demanding household; Level 3 costs 25% for a full second life outside the shadows.",
  },
  {
    id: "distinctive-style",
    name: "Distinctive Style",
    category: "negative",
    karma: 6,
    summary: "Your look is unmistakably, permanently your own.",
    effect: "Cannot gain or spend Edge when not sporting your distinctive look. Others gain +2 dice on Memory tests to recall your appearance.",
  },
  {
    id: "elf-poser",
    name: "Elf Poser",
    category: "negative",
    karma: 6,
    summary: "Surgery and study have you passing for elf despite your birth metatype.",
    effect: "Elves, orks, and trolls gain a point of Edge on Influence (Etiquette) tests made against you.",
  },
  {
    id: "glass-jaw",
    name: "Glass Jaw",
    category: "negative",
    karma: 4,
    summary: "You've just never been able to take a punch.",
    effect: "Per level of this quality, lose 1 Stun Box, to a minimum of 2. (No fixed maximum level printed - Karma bonus is per level taken.)",
  },
  {
    id: "gremlins",
    name: "Gremlins",
    category: "negative",
    karma: 6,
    summary: "Every piece of tech you touch seems to find a way to malfunction.",
    effect:
      "Whenever you use a device, roll 2D6: a 1 on either die means the device glitches and needs a Minor Action to reset; snake eyes means the device is destroyed (treated as a critical glitch).",
  },
  {
    id: "honorbound",
    name: "Honorbound",
    category: "negative",
    karma: 10,
    summary: "You live and die by a personal code, whatever its particular tenets are.",
    effect:
      "Select a code (e.g. Bushido, Code Duello, Black Hat, Khalsa, Pirate Code, White Hat, Assassin's Creed) when taking this quality. Cannot spend or earn Edge for 24 hours after breaking one of its tenets; repeated or overlapping infractions stack additional 24/48-hour penalties.",
    requiresParam: "custom",
  },
  {
    id: "impaired",
    name: "Impaired (Attribute)",
    category: "negative",
    karma: 8,
    summary: "Genetics, injury, or illness have capped your potential in one attribute.",
    effect: "Per level, the chosen attribute's maximum decreases by 1, to a minimum of 2. (No fixed maximum level printed.)",
    requiresParam: "attribute",
  },
  {
    id: "in-debt",
    name: "In Debt",
    category: "negative",
    karma: 0,
    summary: "You owe money to someone dangerous to get a foothold in the shadows.",
    effect:
      "No Karma bonus. When spending Karma for cash, each point converts to 5,000 nuyen instead of 2,000, but also adds 5,000 nuyen of debt plus a 500 nuyen/Karma-spent monthly interest payment. Only obtainable at character creation; can be bought off by repaying the principal.",
  },
  {
    id: "incompetent",
    name: "Incompetent (Skill)",
    category: "negative",
    karma: 10,
    summary: "There are some skills you simply cannot get right, no matter how you practice.",
    effect:
      "Select a skill when taking this quality; you cannot gain ranks in it. Cannot be chosen for Magic skills without a Magic rating, or Tasking without a Resonance rating. Only one skill may be selected.",
    requiresParam: "skill",
  },
  {
    id: "insomnia",
    name: "Insomnia",
    category: "negative",
    karma: 4,
    summary: "A good night's sleep is a foreign concept to you.",
    effect:
      "Each day, make a Body + Willpower (3) test to get a successful night's rest; on failure, you cannot earn more than 2 Edge that day or spend more than 2 Edge on any test. A sleep regulator reduces the threshold to 1; medication (50 nuyen/dose) reduces it to 2.",
  },
  {
    id: "loss-of-confidence",
    name: "Loss of Confidence",
    category: "negative",
    karma: 6,
    summary: "Past failures or rejection have left you doubting yourself constantly.",
    effect: "During any encounter, make a Willpower (2) test as a Minor Action; on failure, cannot earn or spend Edge for the rest of the encounter.",
  },
  {
    id: "low-pain-tolerance",
    name: "Low Pain Tolerance",
    category: "negative",
    karma: 10,
    summary: "Sensitive nerves mean injuries and discomfort hit you harder than most.",
    effect: "All wound modifiers are doubled.",
  },
  {
    id: "ork-poser",
    name: "Ork Poser",
    category: "negative",
    karma: 6,
    summary: "Surgery and study have you passing for ork despite your birth metatype.",
    effect: "Elves, orks, and trolls gain a point of Edge on Influence (Etiquette) tests made against you.",
  },
  {
    id: "prejudiced",
    name: "Prejudiced (Group)",
    category: "negative",
    karma: 8,
    summary: "Deep-seated bias against a chosen group clouds your judgment around them.",
    effect:
      "Select a specific group or type of people; cannot gain or use Edge while a member of that group is present (unless directly opposing them). Use with care and group buy-in - never as cover for real-world prejudice.",
    requiresParam: "custom",
  },
  {
    id: "sensitive-system",
    name: "Sensitive System",
    category: "negative",
    karma: 8,
    summary: "Your body strongly rejects anything grafted or merged into it.",
    effect: "Essence costs are doubled for cyberware, bioware, and nanoware (geneware unaffected). Cannot have this quality alongside a Magic or Resonance rating.",
  },
  {
    id: "simsense-vertigo",
    name: "Simsense Vertigo",
    category: "negative",
    karma: 6,
    summary: "Logging into the Matrix in VR leaves you badly disoriented.",
    effect: "Cannot gain or spend Edge while accessing the Matrix via VR. Gain the Nauseated status for one hour after logging off.",
  },
  {
    id: "sinner",
    name: "SINner",
    category: "negative",
    karma: 8,
    summary: "You carry a legitimate, traceable SIN you can't simply burn.",
    effect:
      "Pay taxes to your SIN's issuer (a 10% increase in the cost of the associated lifestyle). Easier to track/identify: opponents gain a point of Edge on Trace Icon actions against you.",
  },
  {
    id: "social-stress",
    name: "Social Stress",
    category: "negative",
    karma: 8,
    summary: "A specific social situation is simply unbearable for you.",
    effect:
      "Select a specific social stressor. When encountering it, make a Charisma (2) test as a Minor Action; on failure, cannot earn or spend Edge until you succeed. May decline the test, but tests made against you then gain a bonus Edge.",
    requiresParam: "custom",
  },
  {
    id: "spirit-sprite-bane",
    name: "Spirit/Sprite Bane",
    category: "negative",
    karma: 12,
    summary: "A particular kind of spirit or sprite holds an inherent grudge against you.",
    effect:
      "Select a type of spirit or sprite when taking this quality. They gain a bonus point of Edge on Conjuring/Tasking tests against you, and will target you first and relentlessly in combat. Can be taken multiple times for different types.",
    requiresParam: "custom",
  },
  {
    id: "uncouth",
    name: "Uncouth",
    category: "negative",
    karma: 6,
    summary: "You've lost the filter between your thoughts and your mouth.",
    effect: "Cannot spend Edge on any test using Charisma.",
  },
  {
    id: "uneducated",
    name: "Uneducated",
    category: "negative",
    karma: 6,
    summary: "Formal education never took, leaving a real gap in your general knowledge.",
    effect: "Cannot spend Edge on any test using Logic.",
  },
  {
    id: "unsteady-hands",
    name: "Unsteady Hands",
    category: "negative",
    karma: 4,
    summary: "Tics, caffeine, or plain clumsiness make fine hand work a struggle.",
    effect: "Cannot spend Edge on any test using Agility that directly involves the hands (e.g. sleight-of-hand, attacks with a held weapon) - tests like running are unaffected.",
  },
  {
    id: "weak-immune-system",
    name: "Weak Immune System",
    category: "negative",
    karma: 8,
    summary: "You're sick almost constantly, from minor colds to worse.",
    effect:
      "Cannot spend Edge to resist infection; the threshold to fight off any infection you're exposed to rises by 1. While ill, take a -1 dice pool modifier to all tests.",
  },

  // --- SR6 Companion, "People of Exceptional Quality" (book pp. 135-138) ---
  {
    id: "all-business",
    name: "All Business",
    category: "negative",
    karma: 8,
    summary: "Your sense of professional detachment reassures most clients, but you rarely form close relationships.",
    effect:
      "None of your contacts may have a Loyalty rating higher than 3. When interacting with a professional client (such as a Mr. Johnson), gain a situational point of Edge on Influence (Etiquette) tests.",
  },
  {
    id: "bad-back",
    name: "Bad Back",
    category: "negative",
    karma: 12,
    summary: "You have a tendency to throw out your back, sprain your leg, or otherwise impede your mobility when your body suffers strain.",
    effect: "Whenever you suffer any wound modifiers, you also gain the Hobbled status. It goes away when the wound modifiers do.",
  },
  {
    id: "borrowed-time",
    name: "Borrowed Time",
    category: "negative",
    karma: 25,
    summary: "The Sword of Damocles hangs above your head by the merest thread - sooner or later, you are going to die.",
    effect:
      "You have a condition guaranteed to eventually kill you (a cortex bomb, nanites, a rare disease, a contract on your life, etc.). At the start of every session, roll your higher of Body or Willpower plus Edge against a threshold that starts at 1 and rises by 1 each session. If you fail, you die this session - the first potentially fatal thing that happens to you is fatal, or if nothing does, you collapse and die at the end of the session. You may burn a point of Edge to survive that one time, but the odds only get worse unless you buy off this quality.",
  },
  {
    id: "bounty",
    name: "Bounty",
    category: "negative",
    karma: 10,
    summary: "An individual or organization has placed a bounty on your head, open for any bounty hunter to collect.",
    effect: "When your personal Heat reaches 17 or higher, bounty hunters close in and you're forced to dodge the bounty.",
  },
  {
    id: "chronic-pain",
    name: "Chronic Pain",
    category: "negative",
    karma: 15,
    summary: "You frequently suffer from a condition that flares up sometimes, causing you pain.",
    effect:
      "At the beginning of each session (after Edge refreshes), roll Body + Willpower against a threshold of 3 plus the number of sessions since your last flare-up. On a failure, your pain flares for the rest of the session: -1 dice pool penalty on all tests except damage soak rolls. Drugs, spells, adept powers, and other effects that reduce wound penalties (including pain editors) don't help with this pain.",
  },
  {
    id: "combat-junkie",
    name: "Combat Junkie",
    category: "negative",
    karma: 6,
    summary: "You're always ready to throw down, and find it difficult to back off even when it would be wiser to avoid a fight.",
    effect:
      "When someone attempts to goad you into violence, they gain a point of Edge on their Influence or Con tests against you. You may not gain or spend Edge on Judge Intentions tests except during combat. Unless you've taken at least 6 boxes of damage, you may not retreat from a fight without penalty, and if you do run away, you may not gain or spend Edge until you enter combat again or the next session begins.",
  },
  {
    id: "cyber-psychosis",
    name: "Cyber Psychosis (1 to 3)",
    category: "negative",
    karma: 8,
    levels: { min: 1, max: 3 },
    summary: "Your extensive augmentations have made you something more than just metahuman, resulting in detachment interrupted by bouts of intense emotion.",
    effect:
      "Requires Essence 1 or less. Whenever your Edge pool reaches zero, you lose touch with your situation and surroundings - becoming detached and listless, or filled with an intense emotion that seems to come from nowhere. Until you regain Edge, you have one less Minor Action per round for every level of this quality.",
  },
  {
    id: "finesse",
    name: "Finesse",
    category: "negative",
    karma: 7,
    summary: "You prefer to accomplish your goals with subtlety, and find brute-force tactics unnerving.",
    effect:
      "You may not gain or spend Edge on any action that would generate a Heat modifier. If you personally generate no Heat modifiers during a run, apply -1 to your team's Heat modifier.",
  },
  {
    id: "gear-acquisition-syndrome",
    name: "Gear Acquisition Syndrome (1 to 3)",
    category: "negative",
    karma: 5,
    levels: { min: 1, max: 3 },
    summary: "When the going gets tough, the tough go shopping - and so do you, constantly.",
    effect:
      "Requires at least one skill specialization or expertise. You're driven to spend at least 1,000 nuyen per level of this quality on gear every month - you may use this on favors for contacts or to Work for the People instead. Falling behind makes you anxious or sad, and until you catch up you don't gain bonus ranks from any skill specialization or expertise. The unpaid amount caps at 1,000 nuyen per level and doesn't keep accumulating across missed months.",
  },
  {
    id: "glitchy",
    name: "Glitchy",
    category: "negative",
    karma: 12,
    summary: "Unexpected, unlikely, and unfortunate things happen to you on a regular basis.",
    effect: "Whenever you glitch, it counts as a critical glitch (no hits), regardless of how many hits you actually rolled.",
  },
  {
    id: "gourmand",
    name: "Gourmand",
    category: "negative",
    karma: 5,
    summary: "You loathe eating food that doesn't delight your sophisticated palate.",
    effect:
      "Whenever you eat food that isn't up to high-lifestyle standards, you gain the Nauseated status for one hour. Fast food, Stuffer Shack fare, instant meals, and generally anything costing less than 20 nuyen per plate sets this off.",
  },
  {
    id: "hooder",
    name: "Hooder (1 to 3)",
    category: "negative",
    karma: 5,
    levels: { min: 1, max: 3 },
    summary: "You're driven to do what you can to help others.",
    effect:
      "You must donate at least 1,000 nuyen per level of this quality every month - not to your own team or family, but to strangers via favors for contacts or Work for the People. Falling behind makes you anxious or guilty, and your opposition gains a situational point of Edge on opposed rolls against you until you catch up. The unpaid amount caps at 1,000 nuyen per level and doesn't keep accumulating across missed months.",
  },
  {
    id: "hunted",
    name: "Hunted (1 to 5)",
    category: "negative",
    karma: 5,
    levels: { min: 1, max: 5 },
    summary: "Someone wants you dead, and they have the means to get it done.",
    effect:
      "Whenever your personal Heat is 15 or higher, assassins catch up to you. At the start of every session (after your Edge pool refreshes), roll Body to resist 7P damage, with +1 DV per level of this quality. You may treat the wound with any available short-term healing (first aid, medkit, heal spell, etc.), but you may not take advantage of long-term healing before the session begins.",
  },
  {
    id: "indecisive",
    name: "Indecisive",
    category: "negative",
    karma: 11,
    summary: "You have trouble making snap decisions.",
    effect:
      "Requires 4 Minor Actions per combat round to take this quality. Unless you have at least 5 points of Edge available, you may not trade Minor Actions for an additional Major Action.",
  },
  {
    id: "injury-prone",
    name: "Injury Prone",
    category: "negative",
    karma: 15,
    summary: "Whenever you get hurt, you get hurt bad.",
    effect: "Whenever you suffer damage from any source, take one extra box of the same type (Physical or Stun).",
  },
  {
    id: "killer",
    name: "Killer",
    category: "negative",
    karma: 4,
    summary: "When it comes to combat, you prefer to kill your enemies, leaving no witnesses or anyone who will later seek revenge.",
    effect: "You may not gain or spend Edge when using an attack or spell that deals Stun damage.",
  },
  {
    id: "limited-attributes",
    name: "Limited Attributes",
    category: "negative",
    karma: 5,
    summary: "You haven't had the resources or opportunities to focus on developing your strengths.",
    effect:
      "May only be taken at, and only applies to, character creation. You may not start with any attributes at your metatype's maximum. If using the Life Path system, reduce your maxed-out attribute by 1 and assign that point to any other attribute.",
  },
  {
    id: "limited-skills",
    name: "Limited Skills",
    category: "negative",
    karma: 5,
    summary: "You've never been motivated to master any specific skill.",
    effect:
      "May only be taken at, and only applies to, character creation. You may not start with any skills at their maximum starting rank. If using the Life Path system, reduce your maxed-out skill by 1 rank and assign that point to any other skill.",
  },
  {
    id: "momentous-misfortune",
    name: "Momentous Misfortune",
    category: "negative",
    karma: 25,
    summary: "You just can't catch a break, and even when you do, it seems to make little or no difference.",
    effect: "You may only gain one point of Edge per round.",
  },
  {
    id: "non-lethal",
    name: "Non-Lethal",
    category: "negative",
    karma: 5,
    summary: "Even though you may have to fight, you prefer not to kill.",
    effect: "You may not gain or spend Edge when using an attack or spell that deals Physical damage.",
  },
  {
    id: "stim-patch-allergy",
    name: "Stim Patch Allergy",
    category: "negative",
    karma: 10,
    summary: "You have an unfortunate allergic reaction to stim patches.",
    effect: "If you're affected by a stim patch, you gain the Dazed condition until it wears off.",
  },
  {
    id: "toxin-susceptibility",
    name: "Toxin Susceptibility (Specify Toxin)",
    category: "negative",
    karma: 2,
    requiresParam: "custom",
    summary: "You're particularly susceptible to a common toxin.",
    effect:
      "Choose a toxin (e.g. CS/tear gas, gamma-scopolamine, narcoject, nausea gas, neurostun, pepper punch, or seven-7). When you're affected by that toxin, its Power increases by 2, and you may not gain or spend Edge on Toxin Resistance tests against it.",
  },
  {
    id: "trust-issues",
    name: "Trust Issues",
    category: "negative",
    karma: 10,
    summary: "You've been burned too many times, and are always watching closely for signs of betrayal.",
    effect:
      "You may not gain or spend Edge on Influence (Etiquette or Negotiation) or Judge Intentions tests. None of your contacts may have a Loyalty rating higher than 3, and if you join a magical group, your maximum Loyalty there is also 3.",
  },
  {
    id: "twitchy",
    name: "Twitchy",
    category: "negative",
    karma: 5,
    summary: "You're always ready for danger - perhaps a bit too ready.",
    effect: "You suffer a -1 dice pool penalty on all Composure tests for every initiative die you're able to roll.",
  },

  // --- Hack & Slash, "Quality Hacking" (book pp. 84-86) ---
  {
    id: "achilles-heel",
    name: "Achilles' Heel",
    category: "negative",
    karma: 12,
    summary: "Whether or not you know it, there's a certain kind of damage that you're especially vulnerable to in the Matrix.",
    effect:
      "Choose one: Data Spike actions, Resonance Spike complex forms, Resonance entities, or IC. Whenever you suffer Matrix damage from the chosen source, you may not reduce it with a soak roll. If you're a technomancer, your registered (and ally) sprites share this vulnerability. May only be taken once.",
  },
  {
    id: "binary-mentality",
    name: "Binary Mentality",
    category: "negative",
    karma: 10,
    summary: "Some people are good at some things and not others, and that's just the way it is - or so you believe. Your mindset limits your capabilities.",
    effect:
      "Choose either Electronics or Cracking. When using that skill for Matrix Actions or complex forms, you may not use Edge Boosts or Edge Actions that cost more than 2 points of Edge.",
  },
  {
    id: "buddy-system",
    name: "Buddy System",
    category: "negative",
    karma: 7,
    summary: "You don't feel safe enough to concentrate clearly without someone to watch your back.",
    effect:
      "Whenever you're alone, you may only gain a maximum of one point of Edge per combat round. In astral space, only astrally active allies count as company for this purpose (a summoned spirit is enough). In VR mode, only allies with you in the Matrix count, but an agent program, a sprite nearby, or even a SimShare hitchhiker is enough to prevent the penalty.",
  },
  {
    id: "bull-in-a-ceramics-store",
    name: "Bull in a Ceramics Store",
    category: "negative",
    karma: 8,
    summary: "You are the hacker equivalent of a combat monster, reveling in Matrix destruction.",
    effect:
      "You may not gain or spend Edge on Matrix actions and complex forms that don't have the potential to cause Matrix damage. Brute Force hacking is the one exception.",
  },
  {
    id: "compulsive-archivist",
    name: "Compulsive Archivist",
    category: "negative",
    karma: 8,
    summary: "You're the data equivalent of a pack rat - loath to delete anything, you keep incriminating files on your devices far longer than is wise.",
    effect:
      "Whenever the gamemaster makes a Heat roll at the end of a run, your personal Heat modifier increases by +1 for every full 50 points of Karma you've earned (round down; unspent character-creation Karma doesn't count). This only applies to you, not your teammates.",
  },
  {
    id: "curiosity-killed-the-cat",
    name: "Curiosity Killed the Cat? (1 to 3)",
    category: "negative",
    karma: 5,
    levels: { min: 1, max: 3 },
    summary: "When a file is protected, you become fixated on gaining access to it.",
    effect:
      "If you discover a file that's encrypted or protected by a data bomb, you may not gain or spend Edge except on tests made to crack the encryption, defuse the data bomb, and access the file. If you leave the file alone, after each hour passes you may make a Composure test (threshold 2 + the level of this quality); on success you can let it go and gain/spend Edge normally again. Each failed test grants a bonus die on future Composure tests to overcome the curiosity, with no cap other than the dice you actually roll.",
  },
  {
    id: "data-liberator",
    name: "Data Liberator",
    category: "negative",
    karma: 2,
    summary: "You have a strong, driving personal value that data should be made public, or at least kept out of the hands of those who want it kept secret.",
    effect:
      "You may not gain or spend Edge on any test related to selling valuable data, nor participate in a Teamwork test for that purpose. If you instead release valuable data publicly with the approval of everyone who participated in the run where you acquired it (usually involving compensating them with nuyen or favors), you and everyone on your team who didn't request compensation gain one bonus Karma. This applies once per run, and only if the data is worth at least 5,000 nuyen.",
  },
  {
    id: "defective-attribute",
    name: "Defective Attribute",
    category: "negative",
    karma: 7,
    summary: "There's just something about you that makes one of your Matrix attributes less effective.",
    effect:
      "Choose a Matrix attribute: Data Processing or Firewall. No matter what device you use - even a living persona - that attribute can never be boosted by cyberprograms, complex forms, echoes, or sprite powers. May not be taken more than once.",
  },
  {
    id: "like-a-boss",
    name: "Like a Boss",
    category: "negative",
    karma: 5,
    summary: "You consider yourself a professional hacker with finesse, and disdain the crude, brute-force approaches.",
    effect: "You may neither gain nor spend Edge on any test that has the possibility of inflicting Matrix damage.",
  },
  {
    id: "mode-lock",
    name: "Mode Lock",
    category: "negative",
    karma: 7,
    summary: "Whether it's AR mode, cold sim VR, or hot sim VR, you have a clear preference, and find using any other mode unwieldy and distracting.",
    effect:
      "Choose a preferred mode: AR, cold sim VR, or hot sim VR. Unless you're using your preferred mode, you may not gain Edge on any Matrix actions, and the cost of Edge actions and Edge boosts that assist your Matrix actions is doubled.",
  },
  {
    id: "program-dependency",
    name: "Program Dependency",
    category: "negative",
    karma: 2,
    summary: "You've become superstitiously attached to the use of a specific cyberprogram, most commonly Baby Monitor.",
    effect:
      "Choose a cyberprogram. Whenever your cyberdeck isn't running that cyberprogram, you become fixated on its absence: for each combat round in which you want to take any Matrix action other than reconfiguring your device to load the cyberprogram, you must first take a Minor Action to focus.",
  },
  {
    id: "resonance-burn",
    name: "Resonance Burn",
    category: "negative",
    karma: 13,
    summary: "Fading always hurts real bad, to the point that you are incredibly careful to avoid it.",
    effect: "Whenever you suffer fading damage, it's always Physical damage instead of Stun.",
  },
  {
    id: "simsense-dependency",
    name: "Simsense Dependency",
    category: "negative",
    karma: 16,
    summary: "You slotted one too many BTL chips, or your brain got fried real bad some other way. Now you feel out of place experiencing life through your own senses.",
    effect:
      "Using hot-sim VR, you feel fine. Cold-sim VR is almost as good - you can spend Edge but not gain any, though your Edge still refreshes normally at the start of a session. AR mode gets you by in meatspace but doesn't feel good: while in AR, you can neither gain nor spend Edge on Matrix actions, and Edge actions or boosts on non-Matrix actions cost 1 more point of Edge than usual. When you can't even use AR mode, you get the shakes and gain the Dazed condition until you're back in AR or VR mode. Awakened characters cannot take this quality.",
  },
  {
    id: "sloppy-coder",
    name: "Sloppy Coder",
    category: "negative",
    karma: 3,
    summary: "You write code fast, but you cut corners. Fixing bugs is not something you waste your time doing.",
    effect:
      "Whenever you make a programming test for any reason, the interval is halved. Any time the resulting program is used, it causes a glitch regardless of how many 1s are actually rolled. A critical glitch causes the device running the software to reboot - or, if it's running on a host, the host deletes it instead.",
  },
  {
    id: "wanted-by-god",
    name: "Wanted by GOD (1 to 4)",
    category: "negative",
    karma: 5,
    levels: { min: 1, max: 4 },
    summary: "Your persona is on GOD's most wanted list. You might not be number one, but you're working your way up the leader boards.",
    effect:
      "Your maximum Overwatch Score before GOD convergence is 5 lower per level of this quality: convergence happens at 35 at level 1, 30 at level 2, 25 at level 3, or 20 at level 4. When you're converged on, the first response is a high-threat team that treats you as an extreme threat. If you take any illegal Matrix Actions during a run, your Heat modifier increases by the level of this quality at the end of the run. This only applies to you, not your teammates.",
  },

  // --- Double Clutch, "Gearhead Anatomy" (book pp. 171-172) ---
  {
    id: "accident-prone",
    name: "Accident Prone",
    category: "negative",
    karma: 3,
    summary: "When bad things happen, you're a little worse at finding your way out of it.",
    effect: "If you roll a glitch or a critical glitch, you may not influence the outcome by spending Edge.",
  },
  {
    id: "bermuda-gremlins",
    name: "Bermuda Gremlins",
    category: "negative",
    karma: 4,
    summary: "Them be some special gremlins. They like to play with GridGuide and mimic the voice of the Pilot agent.",
    effect:
      "Whenever you're piloting a vehicle, roll 2D6. If either die rolls a 1, gremlins spoof your route and you miss a turnoff; roll 1D6 to determine how late you end up (from 10-20 minutes up to 2+ hours, or occasionally finding a new hangout instead). If both dice on the initial roll come up 1, you may have wandered into enemy or forbidden territory and face significant hostility trying to get out; alternately, the GM may simply double the delay for simplicity.",
  },
  {
    id: "dead-stick",
    name: "Dead Stick",
    category: "negative",
    karma: 4,
    summary: "This driving thing - it may not be for you. We're not saying you're bad at it, but cockatrices don't even try to cross the road when you're behind the wheel.",
    effect: "-2 dice pool penalty on all Crash tests.",
  },
  {
    id: "drone-animosity",
    name: "Drone Animosity",
    category: "negative",
    karma: 4,
    summary: "People say computers hate them. In this case, drones tend to give you attitude. Something about you annoys their algorithms.",
    effect:
      "In combat, drones tend to target you if given the choice. Your own drones develop an attitude no matter how many times you reset their dogbrain: when you aren't jumped into a drone, you can't spend Edge to pilot it or when it's assisting you (such as with a pit crew or Engineering kits). Every other drone dislikes only you specifically, which makes it hard to prove or pin down - the gamemaster decides how this plays out.",
  },
  {
    id: "easy-mark",
    name: "Easy Mark",
    category: "negative",
    karma: 5,
    summary: "No matter how hard you try to focus and keep an eye out for trouble, people always manage to find a way to avoid your notice.",
    effect: "You may not gain or spend Edge on Perception tests when opposing a Stealth test.",
  },
  {
    id: "fuzz-magnet",
    name: "Fuzz Magnet",
    category: "negative",
    karma: 8,
    summary: "When you do something wrong on the streets, people notice. Especially the wrong people.",
    effect:
      "Whenever you drive recklessly or erratically (gamemaster discretion), roll two dice. If both come up hits, you're noticed by local traffic police.",
  },
  {
    id: "motion-sickness",
    name: "Motion Sickness",
    category: "negative",
    karma: 4,
    summary: "Yes, there is a strong benefit from being able to move from place to place, but the journey does not agree with you.",
    effect:
      "Any time you're in a moving vehicle for longer than thirty minutes, you gain the Nausea status. It doesn't go away until ten minutes after the vehicle stops moving, and a Nausea test to recover from it only lasts temporarily (net hits in minutes).",
  },
  {
    id: "perforated-firewall",
    name: "Perforated Firewall",
    category: "negative",
    karma: 3,
    summary: "Maybe it's bad luck, or maybe it's because you keep hitting the wrong links on the Matrix, but any firewall you touch seems to start to crumble.",
    effect: "Whenever you must make a test using a device's Firewall, your opponent gains a point of Edge.",
  },
  {
    id: "remote-pilot",
    name: "Remote Pilot",
    category: "negative",
    karma: 12,
    summary: "Driving is a fine thing to do - unless you're actually in the vehicle, where all that movement is just too disorienting. You prefer to drive at a remove.",
    effect: "You may not gain or spend Edge when piloting a vehicle unless you are physically present within the vehicle.",
  },
  {
    id: "road-rage",
    name: "Road Rage",
    category: "negative",
    karma: 7,
    summary: "You've braved the roads of the Sixth World long enough to be perpetually on edge when you're out there. If someone does you wrong, you snap and can think of nothing more than getting them back.",
    effect:
      "If the vehicle or drone you're piloting takes damage, you may only gain or spend Edge on Opposed tests against the target that damaged you, until either the encounter ends or that target is defeated.",
  },
  {
    id: "sore-thumb",
    name: "Sore Thumb",
    category: "negative",
    karma: 7,
    summary: "Simply put, no matter where you go, you stick out.",
    effect: "You may not gain or spend Edge on Stealth tests.",
  },
  {
    id: "specialist",
    name: "Specialist",
    category: "negative",
    karma: 8,
    requiresParam: "skill",
    summary: "You have some hard-earned skills, but they came at a price. There is one thing you're particularly good at, but your focus there made you less good at other things.",
    effect:
      "Choose one of your skills. When using that skill for anything not covered under a specialization or expertise, you may not gain or spend Edge.",
  },
  {
    id: "target-fixation",
    name: "Target Fixation",
    category: "negative",
    karma: 8,
    summary: "You are super-aware of who is coming after you in a fight - which limits your overall situational awareness and sometimes makes you forget who else is out there.",
    effect:
      "If you attack, you may not gain or spend Edge on Defense tests except against the target of your attack, for the remainder of that combat round.",
  },

  // --- Street Wyrd, "New Qualities for Awakened Characters" (book pp. 113-114) ---
  {
    id: "pusillanimous-summoner",
    name: "Pusillanimous Summoner",
    category: "negative",
    karma: 8,
    summary: "Be it because of an unpleasant experience in the past, or the peculiarities of your arcane upbringing, you're stricken with awe whenever summoning a spirit - sensing the discomfort, the spirit gains the upper hand.",
    effect:
      "Requires qualifying for the Conjuring skill. Spirits you summon do their best to misinterpret your orders, executing them precisely as worded rather than as intended (gamemaster's discretion). To close loopholes, you must sit down before conjuring and perform a Conjuring + Intuition (threshold 8, 5-minute interval) Extended test to think your instructions through first.",
  },
  {
    id: "possession-tradition",
    name: "Possession Tradition",
    category: "negative",
    karma: 10,
    summary: "The conjurer has never learned to summon spirits in a way that allows them to manifest in the physical realm, or consciously abstains from doing so.",
    effect:
      "Requires qualifying for the Conjuring skill. Spirits you summon have their Materialization power replaced with the Possession power.",
  },
  {
    id: "representation-i",
    name: "Representation I",
    category: "negative",
    karma: 5,
    summary: "Some arcane teachers offer their students auxiliary techniques, called representations, to support their learning - a clearly visible or audible act, or special garb, that must accompany the use of arcane powers.",
    effect:
      "Define a clearly visible or audible act (gestures, spoken words, chants) or a special garb/outfit that must be performed or worn whenever you use arcane powers; it can't be casual or easily misinterpreted, and it raises suspicion that something magical is going on. In this simple form, you can abstain from using your representation, but take a -4 dice pool penalty on Astral, Conjuring, Enchanting, and Sorcery rolls when not using it. Being visibly Awakened this way can also make you a priority target for enemies who go by 'kill the mage first.' Once per day, using your representation while using arcane powers grants one point of situational Edge usable only on that test. Not available to adepts.",
  },
  {
    id: "representation-ii",
    name: "Representation II",
    category: "negative",
    karma: 8,
    summary: "The more pronounced form of Representation: without your defining act or garb, you can't work magic at all.",
    effect:
      "As Representation I - define a clearly visible or audible act, or special garb/outfit, that must accompany any use of arcane powers, at the risk of marking you as a priority target for enemies. In this more severe form, if you're unable to use your representation (gagged, hands tied, garb removed, etc.), you're completely unable to perform magic and cannot use the Astral, Conjuring, Enchanting, or Sorcery skills. Once per day, using your representation while using arcane powers grants one point of situational Edge usable only on that test. Not available to adepts.",
  },

  // --- Firing Squad, "The Ugly Consequences" (book pp. 129-130) ---
  {
    id: "always-late",
    name: "Always Late",
    category: "negative",
    karma: 2,
    summary: "It doesn't matter how many alarms you set or how many times your teammates call to remind you; whether you're constantly distracted or can't drag yourself out of bed, you cannot show up anywhere on time to save your life.",
    effect:
      "You always arrive at least fifteen minutes late for any scheduled event. When the event includes a meeting with a prospective employer, your entire team suffers a -1 penalty to social tests against Mr. Johnson due to your unprofessional behavior.",
  },
  {
    id: "bad-memories",
    name: "Bad Memories",
    category: "negative",
    karma: 3,
    requiresParam: "custom",
    summary: "You can't enjoy all those trids where the main character 'faces their inner demons,' because they hit a little too close to home. Something nasty happened in the past, and it's lurking around even today, popping up when you least expect it.",
    effect:
      "Choose a subject for your Bad Memories when you take this quality. Whenever you're required to be in the presence of that subject, you may only gain a maximum of one point of Edge per combat round, instead of the usual two.",
  },
  {
    id: "compulsion",
    name: "Compulsion (Behavior, 1 to 5)",
    category: "negative",
    karma: 2,
    levels: { min: 1, max: 5 },
    requiresParam: "custom",
    summary: "Some people alleviate their suffering by stuffing themselves with illicit substances. You've chosen another way: a behavior you can't help but indulge in, that's less poisonous but equally toxic.",
    effect:
      "Choose a behavior (gambling, Matrix gaming, obsessive-compulsive routines, etc.). You must indulge in it for a specified amount of time per day depending on the level of this quality (5 minutes at level 1, up to 4 hours at level 5). Failing to do so causes withdrawal: a -2 dice pool penalty on all tests, increasing by 1 with each further withdrawal period that elapses; as with Addiction, you cannot earn or spend Edge in any form while suffering withdrawal. Unlike Addiction, you don't suffer Anxiety, Depression, or Paranoia while actively indulging your compulsion.",
  },
  {
    id: "flashbacks",
    name: "Flashbacks",
    category: "negative",
    karma: 6,
    requiresParam: "custom",
    summary: "You haven't been able to leave behind the effects of a trauma you experienced, to the point where certain triggers make you relive the whole experience.",
    effect:
      "Choose a specific event that is the subject of your flashbacks, along with at least one specific multi-sensory trigger. When subjected to the trigger, make a Composure (4) test or enter a flashback lasting three minutes. When the flashback starts, roll Composure (3): on success, you recognize you're in a flashback and can endure it, taking a -4 dice pool penalty to any test involving Physical attributes for the duration; on failure, you can do nothing but react to the flashback.",
  },
  {
    id: "maybe-you-missed-something",
    name: "Maybe You Missed Something",
    category: "negative",
    karma: 2,
    summary: "You can never take anyone's word for granted - people make mistakes, or even intentionally 'miss' things if they're trying to set you up for failure. With threats lurking everywhere, the only person you trust to spot danger is yourself, even if you're not always the best person for the job.",
    effect:
      "Whenever you're in a potentially dangerous situation, you must take any feasible steps to search out potential threats yourself. If another team member has already done so, you spend at least as much time redoing the same task, with all the exasperation that entails.",
  },
  {
    id: "phobia-common",
    name: "Phobia (Object) - Common",
    category: "negative",
    karma: 12,
    requiresParam: "custom",
    summary: "You have an immediate negative reaction to a certain object, thing, or phenomenon, to the point that you will do whatever is in your power to avoid the thing in question. Common examples: ants, cats, dogs, heights, metatypes, the number 13.",
    effect:
      "Choose the object, thing, or phenomenon of your phobia. You will never willingly go near it, and if compelled to be near it, you cannot gain or spend Edge and take a -2 dice pool modifier to any test besides Damage Resistance tests while the phobia is in effect. You must also make a Composure (3) test every five minutes or shut down entirely, curling into a ball until the subject of your phobia is gone.",
  },
  {
    id: "phobia-uncommon",
    name: "Phobia (Object) - Uncommon",
    category: "negative",
    karma: 9,
    requiresParam: "custom",
    summary: "You have an immediate negative reaction to a certain object, thing, or phenomenon, to the point that you will do whatever is in your power to avoid the thing in question. Uncommon examples: Awakened people, confined spaces, snakes, specific gangs.",
    effect:
      "Choose the object, thing, or phenomenon of your phobia. You will never willingly go near it, and if compelled to be near it, you cannot gain or spend Edge and take a -2 dice pool modifier to any test besides Damage Resistance tests while the phobia is in effect. You must also make a Composure (3) test every five minutes or shut down entirely, curling into a ball until the subject of your phobia is gone.",
  },
  {
    id: "phobia-rare",
    name: "Phobia (Object) - Rare",
    category: "negative",
    karma: 6,
    requiresParam: "custom",
    summary: "You have an immediate negative reaction to a certain object, thing, or phenomenon, to the point that you will do whatever is in your power to avoid the thing in question. Rare examples: Awakened critters, Dissonance, the Infected, spirits, technocritters, technomancers, types of telesma.",
    effect:
      "Choose the object, thing, or phenomenon of your phobia. You will never willingly go near it, and if compelled to be near it, you cannot gain or spend Edge and take a -2 dice pool modifier to any test besides Damage Resistance tests while the phobia is in effect. You must also make a Composure (3) test every five minutes or shut down entirely, curling into a ball until the subject of your phobia is gone.",
  },
  {
    id: "phobia-very-rare",
    name: "Phobia (Object) - Very Rare",
    category: "negative",
    karma: 3,
    requiresParam: "custom",
    summary: "You have an immediate negative reaction to a certain object, thing, or phenomenon, to the point that you will do whatever is in your power to avoid the thing in question. Very rare examples: dragon scales, vampire fangs.",
    effect:
      "Choose the object, thing, or phenomenon of your phobia. You will never willingly go near it, and if compelled to be near it, you cannot gain or spend Edge and take a -2 dice pool modifier to any test besides Damage Resistance tests while the phobia is in effect. You must also make a Composure (3) test every five minutes or shut down entirely, curling into a ball until the subject of your phobia is gone.",
  },

  // --- Body Shop, "Atavism/Transgenics" (book pp. 104-105) ---
  {
    id: "conspicuous-alterations-1",
    name: "Conspicuous Alterations (Degree 1)",
    category: "negative",
    karma: 6,
    summary: "Your alterations have taken you away from what is generally accepted as a human or metahuman appearance, and you pay the price for this.",
    effect:
      "Increases the cost of Edge Boosts and Actions by 1 on social interactions with non-transgenic metahumans. Others get a +2 dice pool bonus on Memory tests to recall having seen you before. Cannot be combined with Human-Looking. (Likely the same quality informally referred to as \"Inhuman\" elsewhere in this book's transgenic-modification sidebars.)",
  },
  {
    id: "conspicuous-alterations-2",
    name: "Conspicuous Alterations (Degree 2)",
    category: "negative",
    karma: 8,
    summary: "Your alterations have taken you away from what is generally accepted as a human or metahuman appearance, and you pay the price for this - to a greater degree than most.",
    effect:
      "Increases the cost of Edge Boosts and Actions by 2 on social interactions with non-transgenic metahumans. Others get a +2 dice pool bonus on Memory tests to recall having seen you before. Cannot be combined with Human-Looking. (Likely the same quality informally referred to as \"Inhuman\" elsewhere in this book's transgenic-modification sidebars.)",
  },
  {
    id: "misaligned-souls",
    name: "Misaligned Souls",
    category: "negative",
    karma: 10,
    summary: "This was a bad decision. You can feel it in your bones, in your soul. You were never meant to be changed like this. Whatever transgenic infusion you chose, it's making you feel wrong on the inside.",
    effect:
      "Lose 1 point of Essence permanently when you receive your transgenic infusion. Spirits (particularly animal or nature spirits) dislike being around you: no one can spend Edge on social interactions with a spirit, and if you assist a social test against a spirit with a Teamwork test, the opposing spirit also gains 1 point of situational Edge. Cannot be taken with Chimeric Soul. May only be selected immediately before receiving a transgenic infusion, and you must go through with it.",
  },
  {
    id: "a-lifetime-of-rejection",
    name: "A Lifetime of Rejection (1 to 2)",
    category: "negative",
    karma: 4,
    levels: { min: 1, max: 2 },
    summary: "The transgenic treatments did not go well. Your body is rejecting the new RNA code and you are now stuck with a lifetime of non-rejection medication.",
    effect: "Pay (quality level x 500 nuyen) per month in medication. Failing to pay risks cancer, organ failure, or death.",
  },
  {
    id: "fine-young-cannibal",
    name: "Fine Young Cannibal",
    category: "negative",
    karma: 4,
    summary: "You have acquired a taste for metahuman flesh due to your transgenic infusion. You're not an Essence eater like a vampire, or even an obligate cannibal like a ghoul - you're just in it for the meaty bits.",
    effect:
      "In hand-to-hand combat, make a Willpower (2) test to resist trying to eat your opponent during or after combat. Take a -2 dice pool penalty on this roll if blood has been shed in the fight (reduced to -1 if you've fed on metahuman flesh in the last 24 hours).",
  },
  {
    id: "doesnt-quite-fit",
    name: "Doesn't Quite Fit",
    category: "negative",
    karma: 2,
    summary: "Your transgenic alteration makes it difficult for you to use or wear certain unmodified items.",
    effect:
      "Add 25% to the cost of clothing and equipment used in the affected area (pants for altered legs or tail-holes, helmets for horned heads, gloves for clawed hands, etc.).",
  },
  {
    id: "sensitive-nose",
    name: "Sensitive Nose",
    category: "negative",
    karma: 4,
    summary: "People with this quality are particularly vulnerable due to their acute senses of smell.",
    effect:
      "When exposed to an inhalation vector drug, toxin, or gas, take a -2 dice pool modifier to any test involving a physical attribute, in addition to any penalties from the toxin itself. You also cannot gain Edge on Perception tests involving scent.",
  },

  // --- Body Shop, "Edge of Essence" (book pp. 169-171) ---
  {
    id: "chronic-dissociation-syndrome",
    name: "Chronic Dissociation Syndrome (CDS)",
    category: "negative",
    karma: 10,
    summary: "CDS is the most common psychological ailment affecting those with excessive augmentation. The primary symptom is a sense of indifference and detachment toward one's surroundings, relations, and interests.",
    effect: "Requires Essence less than 3. Suffer a -3 penalty on any Willpower tests other than Spellcasting and Damage Resistance tests.",
  },
  {
    id: "delusion",
    name: "Delusion",
    category: "negative",
    karma: 10,
    requiresParam: "custom",
    summary: "The character has a firmly held belief that has no basis in fact. No amount of logical argument or persuasive charm will dissuade the character from this belief.",
    effect:
      "Choose your delusion (e.g. an imaginary friend or foe, belief in a lucky charm's power, or a global conspiracy). You gain the Confused 2 status in most social situations or shadowruns when encountering its subject, and must come up with an explanation whenever confronted with contradicting reality. If the delusion is forcibly broken, make a Composure (4) test or suffer a mental breakdown, possibly gaining a new delusion or equivalent negative quality in its place.",
  },
  {
    id: "emotional-flatline",
    name: "Emotional Flatline",
    category: "negative",
    karma: 5,
    summary: "All these implants have made you more machine-like. You have become cold and calculating in social situations, so much so that it's off-putting to others you interact with. This can be an advantage for scaring people.",
    effect:
      "When attempting any opposed Con or Influence test (except Intimidation), your opponent always generates a point of Edge due to your inability to appeal to them. When attempting to Intimidate, you generate a point of Edge instead, for your callous disregard for your subject.",
  },
  {
    id: "emotion-leak",
    name: "Emotion Leak",
    category: "negative",
    karma: 10,
    summary: "Sometimes those with large amounts of cyberware have a difficult time containing their emotions; other metahumans know instinctively how these characters feel. This is disadvantageous during negotiations, cons, gambling, and any other face-to-face interactions where deception is important.",
    effect: "You cannot use Edge on Con tests or Influence tests.",
  },
  {
    id: "hallucinations",
    name: "Hallucinations",
    category: "negative",
    karma: 10,
    summary: "The mind can be a fragile thing, and one stressed to the limit can create visions of things that aren't there.",
    effect:
      "In stressful situations, make a Willpower + Logic (3) test or be subjected to hallucinatory visions (from past experiences, nightmares, media, or reflecting something you failed to notice). These visions feel completely real, have no astral or Matrix component, and persist until you pass another Willpower + Logic (3) test (gamemaster determines when). Another character can assist you out of it with an Influence (Leadership) + Charisma teamwork test.",
  },
  {
    id: "meat-surrogacy",
    name: "Meat Surrogacy (1 to 3)",
    category: "negative",
    karma: 2,
    levels: { min: 1, max: 3 },
    summary: "Not all bioware can be grown in a vat. Some of the most cultured bioware must be grown inside a living host, and you volunteered for such a procedure - a mysterious piece of inert bioware growing within your body that's worth some decent money once removed.",
    effect:
      "Each level taken costs 1 point of Essence, occupied until this quality is removed. Six months later, if the bioware is still in you, report to the doc who implanted it to have it removed and receive 20,000 nuyen per point of Essence used this way, then this quality is removed (leaving an Essence hole equal to the levels taken). If you take more than 6 boxes of Physical damage from a single attack, make a Body test (threshold = level of this quality) or the payout is reduced by 10% per such instance; if the bioware is forcibly removed, you receive no payment. If you instead sell the bioware to another bidder, or buy off this quality with Karma, you gain the Hunted negative quality (at the same level as this quality) instead, and this quality is removed.",
  },
  {
    id: "superhuman-ego",
    name: "Superhuman Ego",
    category: "negative",
    karma: 12,
    summary: "When you can be faster, stronger, and tougher than pretty much everyone else, who's to say you aren't actually a superhero? Runners with superhuman abilities can start to feel as if they are above other mere metahumans.",
    effect:
      "You see normal metahumans as beneath you and have no qualms about killing them. You're not too concerned about being attacked, feeling indestructible - but you do not gain Edge on Defense tests. May not be taken alongside any quality that would prevent you from killing another metahuman or that requires you to see others as more than lesser beings, such as Hooder or Honorbound.",
  },
  {
    id: "tle-x",
    name: "TLE-X",
    category: "negative",
    karma: 10,
    summary: "TLE-X stands for temporal lobe epilepsy with complications. Once thought to be related to the implantation of move-by-wire systems, it has since been found to occur in anyone with invasive implants.",
    effect:
      "Requires at least 3 Essence worth of augmentations. In a sufficiently stressful situation, make a Body + Willpower (4) test or fall into epileptic seizures for (5 - hits) minutes. The biomedical drug AEXD grants +3 dice on the resistance test to prevent an onset. The condition persists even if the implant that caused it is later removed; it can be fully cured with brain surgery or gene therapy, but removing the quality itself still requires Karma expenditure.",
  },
  {
    id: "uncontrolled-metastasis",
    name: "Uncontrolled Metastasis (1 to 2)",
    category: "negative",
    karma: 10,
    levels: { min: 1, max: 2 },
    summary: "The drugs that keep a heavily cybered individual from rejecting the massive amounts of implants they have can keep tumors alive too, not just their subject.",
    effect:
      "At level 1 (10 Karma), tumors grow at a steady but slow rate; you must undergo regular surgery or nanotech treatment every month to remove cancerous growths or become violently ill (incapacitated), adding 1,000 nuyen per month to your lifestyle costs. At level 2 (20 Karma), the metastasis becomes impossible to eradicate entirely even with the required monthly surgeries; the resulting deformities give you a permanent -2 dice pool modifier on tests involving in-the-flesh social interactions, and increase your lifestyle costs by 2,000 nuyen.",
  },
  {
    id: "will-to-die",
    name: "Will to Die",
    category: "negative",
    karma: 10,
    summary: "An individual with very low Essence is continually walking the line between life and death, as their spirit's hold on their body has become tenuous.",
    effect: "Requires Essence lower than 2. You have two fewer Damage Overflow boxes.",
  },

  // --- Power Plays, Aztechnology "New Qualities" (book p. 56) ---
  {
    id: "aztechnology-death-warrant",
    name: "Aztechnology Death Warrant",
    category: "negative",
    karma: 10,
    summary: "At some point, you did something bad enough that the Big A is now actively hunting you. Your biometrics are on file and red-flagged with the highest priority. If an Aztechnology (or affiliate) agent/employee discovers your true identity, they will act to have you either detained - or eliminated.",
    effect:
      "Anyone affiliated with Aztechnology attempting to identify you via biometrics gains a +2 dice pool bonus for all associated tests and +1 Edge. Unless you're successfully disguised or have hidden your identity, you cannot gain any Edge on social tests with Aztechnology-affiliated individuals.",
  },

  // --- Power Plays, Renraku "Game Information" (book p. 113) ---
  {
    id: "honorbound-corporate-bushido",
    name: "Honorbound: Corporate Bushido",
    category: "negative",
    karma: 10,
    summary: "A variant of Honorbound: Bushido common among Renraku corporate culture. Holders honor the basic values of righteousness, courage, compassion, respect, honesty, honor, and self-control, but filter all those values through the needs of their parent corporation - their loyalty is defined as loyalty to the corp above all else.",
    effect:
      "You cannot spend or earn Edge for twenty-four hours after you break a tenet of your code. If the same tenet is broken again during that 24-hour period, each infraction adds another 48 hours onto the initial 24; if a different tenet is broken, add 24 hours for that one to any current infractions (with the same escalation rules for further violations).",
  },

  // --- No Future, "New Qualities" (book p. 178) ---
  {
    id: "stolen-gear",
    name: "Stolen Gear (1 to 20)",
    category: "negative",
    karma: 1,
    levels: { min: 1, max: 20 },
    summary: "A mentor of yours once said, 'You are a shadowrunner. Why buy what you can steal?' Taking their words to heart, you went out and took what you wanted, and damn the consequences. Might not have been the best of ideas, chummer, because someone wants their stuff back.",
    effect:
      "For each point of Karma (up to 20) spent, gain 10,000 nuyen to spend on gear, cyberware, and/or bioware during character creation (spent instead of the normal Karma-to-cash conversion, not in addition to it; extends the possible additional funds to 150,000 nuyen). This nuyen must be spent on gear, cyberware, or bioware - leftover nuyen doesn't convert to cash you keep. The people you stole from will hunt you, put a bounty on your head (worth at least 25,000 nuyen), and send other runners after you - the more you stole, the more they'll want you found. You can buy this quality down in increments as your pursuers give up (having spent more hunting you than the stolen gear was worth); buying it off entirely means the hunters have given up for good.",
  },
];
