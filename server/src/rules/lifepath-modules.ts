// Life Path (Life Modules) chargen system, transcribed from the SR6 Companion,
// "Life Path" chapter (pp. 30-48). Flavor text below is paraphrased in our own
// words rather than quoted from the book; all numeric/mechanical values
// (attribute/skill bonuses, resources, contact points, knowledge options) are
// transcribed as printed since they are game rules, not protected expression.
//
// The three mandatory starting modules are complete. The Choices Life
// Modules list (book pp. 33-46) is complete A-Z, and so is the Event Life
// Modules list (book pp. 46-48) - 11 total, not "several dozen" as an
// earlier version of this comment guessed before the section was fully
// read.
//
// A few `Boost.from` entries use placeholder tokens the frontend resolves
// specially rather than as real skill/attribute names:
// - "any-mental-attribute" / "any-physical-attribute": the book says
//   "any mental attribute" / "any physical attribute" for that choice;
//   left for the player to resolve manually, same as the pre-existing
//   "any-attribute"/"any-special-attribute" tokens.
// - "any-skill-or-attribute": the book's phrasing mixes both (e.g.
//   Servant's "+1 to any other skill or attribute").
// - "nuyen": a flat +25,000 nuyen alternative that appears in several
//   modules' choices (e.g. Fixer's "+1 to Edge or +25,000 nuyen") -
//   `recompute()` in LifepathBuilder.tsx special-cases this token and
//   adds the nuyen directly, rather than treating it as a skill name.
//
// Confirmed source gap: Security Guard's Contact Types and Knowledge
// skill options aren't present anywhere in the extractable text, even
// checking both sides of the surrounding page break twice - not
// fabricated, flagged in its own `notes`.

/**
 * A single "choose one: +N to X, Y, or Z" line from a module. `from` entries
 * are attribute names (lowercase, e.g. "body", "magic", "any-attribute") or
 * skill names (as in skills.ts, e.g. "Astral", "Firearms") or "any" for a
 * free pick of any skill. The book occasionally mixes attributes and skills
 * in one choice (e.g. Astral Explorations: "Astral, Logic, or Magic"), so
 * this is intentionally untyped beyond `string` - the frontend/derive layer
 * resolves each entry against the known attribute/skill lists.
 */
export interface Boost {
  amount: number;
  from: string[];
  /** How many separate picks this line grants (e.g. "+1 to four different skills"). */
  count?: number;
}

export interface KnowledgeChoice {
  count: number;
  /** Suggested knowledge/language skills - players may substitute their own. */
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

export const startingModules: LifeModule[] = [
  {
    id: "born-this-way",
    name: "Born This Way",
    category: "starting",
    summary:
      "Establishes your metatype, metavariant, and whether you're Mundane, Awakened, or Emerged.",
    notes: [
      "Choose metatype, metavariant, and any metagenetic qualities; pay/gain their Karma cost.",
      "Choose Mundane, Awakened (Full Magician / Aspected Magician / Mystic Adept / Adept), or Emerged.",
      "Attributes with an increased maximum for your metatype start at 2; all other standard attributes start at 1.",
      "If Emerged, gain Resonance 1.",
      "If a Full Magician, Mystic Adept, or Adept, gain Magic 1. If an Aspected Magician, gain Magic 2.",
      "If Mundane (neither Awakened nor Emerged), add 1 to your Edge attribute.",
      "Choose your nationality of birth.",
      "Choose a language skill at level 4 (Native).",
    ],
    qualitySlots: [
      {
        count: 2,
        polarity: "positive-and-negative",
        note: "1-2 qualities you believe you were born with; if two are taken, one must be positive and one negative.",
      },
    ],
  },
  {
    id: "growing-up",
    name: "Growing Up: Early Childhood and Adolescence",
    category: "starting",
    summary: "Covers the basic skills and quirks picked up during childhood.",
    boosts: [
      {
        amount: 2,
        count: 4,
        from: [
          "Athletics",
          "Close Combat",
          "Con",
          "Electronics",
          "Influence",
          "Outdoors",
          "Perception",
          "Stealth",
        ],
      },
    ],
    qualitySlots: [
      {
        count: 2,
        polarity: "positive-and-negative",
        note: "1-2 qualities from your adolescence; if two are taken, one must be positive and one negative.",
      },
    ],
    knowledgeChoice: {
      count: 1,
      suggestions: ["[Area] Knowledge (the place you grew up)"],
    },
  },
  {
    id: "coming-of-age",
    name: "Coming of Age: Early Adult and the Transition to Adulthood",
    category: "starting",
    summary: "Your first real talent starts to show, and you take your first real steps into adulthood.",
    notes: [
      "Choose one skill representing your strongest talent; gain it at rank 4. If it's one of the four skills chosen in Growing Up, raise it to rank 6 instead.",
      "Define your best attribute (cannot be Edge, Magic, or Resonance) and increase it by 5. If your metatype caps that attribute at 5, set it to 5 instead and raise a different attribute of your choice by 1.",
      "Gain 25,000 nuyen in resources.",
      "Gain one contact of any type (Academic, Corporate, Criminal, Engineering, Government, Magic, Matrix, Media, Medical, or Street). Assign four total points between their Connection and Loyalty ratings, minimum 1 each.",
    ],
    resources: 25_000,
    qualitySlots: [
      {
        count: 2,
        polarity: "positive-and-negative",
        note: "1-2 qualities that define something important about who you are; if two are taken, one must be positive and one negative.",
      },
    ],
  },
];

export const adultModules: LifeModule[] = [
  {
    id: "academy-training",
    name: "Academy Training",
    category: "choice",
    summary: "Time in a military, police, or corporate security academy.",
    boosts: [
      { amount: 1, from: ["agility", "body", "reaction"] },
      { amount: 1, from: ["intuition", "strength", "willpower"] },
      { amount: 1, from: ["Athletics", "Close Combat", "Piloting"] },
      { amount: 1, from: ["Exotic Weapons", "Firearms", "Perception"] },
    ],
    contactPoints: 2,
    contactTypes: ["Corporate", "Government"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Law Enforcement Corps", "Security Systems", "Small Unit Tactics"],
      allowsLanguage: true,
    },
  },
  {
    id: "activist",
    name: "Activist",
    category: "choice",
    summary: "Threw yourself into advancing a social or political cause.",
    boosts: [
      { amount: 1, from: ["charisma", "intuition"] },
      { amount: 1, from: ["willpower", "edge"] },
      { amount: 1, from: ["Con", "Influence"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Media", "Street"],
    languageChoice: { level: 1 },
    notes: ["Choose an Alignment: Political, Social, Corporate, Environmental, or Magic/Metatype."],
  },
  {
    id: "adept-training",
    name: "Adept Training",
    category: "choice",
    restriction: "Adepts only",
    summary: "Disciplined training to better understand your innate adept powers.",
    boosts: [
      { amount: 1, from: ["edge", "magic"] },
      { amount: 1, from: ["body", "agility", "reaction", "strength"] },
      { amount: 1, from: ["charisma", "intuition", "logic", "willpower"] },
      { amount: 1, from: ["any"] },
    ],
    contactPoints: 2,
    contactTypes: ["Magic"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Arcana", "Magical Societies", "Magical Traditions", "[Sprawl] Streets"],
      allowsLanguage: true,
    },
  },
  {
    id: "agent",
    name: "Agent",
    category: "choice",
    summary: "Worked as a special operative for a government or megacorp.",
    boosts: [
      { amount: 1, from: ["body", "charisma", "logic"] },
      { amount: 1, from: ["agility", "intuition", "willpower"] },
      { amount: 1, from: ["Con", "Influence", "Perception", "Stealth"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Corporate", "Government"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Espionage Techniques", "[Nation] Politics", "[Megacorp] Politics"],
      allowsLanguage: true,
    },
  },
  {
    id: "alchemist",
    name: "Alchemist",
    category: "choice",
    restriction: "Awakened only",
    summary: "Became consumed by the study of alchemy and enchanting.",
    boosts: [
      { amount: 1, from: ["edge", "magic", "willpower"] },
      { amount: 2, from: ["Astral", "Enchanting"] },
    ],
    resources: 25_000,
    knowledgeChoice: {
      count: 2,
      suggestions: ["Arcana", "Magical Societies", "Magical Traditions"],
      allowsLanguage: true,
    },
    notes: ["The attribute bonus may instead apply to your other drain-resisting attribute."],
  },
  {
    id: "artifact-hunter",
    name: "Artifact Hunter",
    category: "choice",
    summary: "Chased down ancient and mysterious magical artifacts.",
    boosts: [
      { amount: 1, from: ["intuition", "logic", "willpower"] },
      { amount: 1, from: ["edge", "magic"] },
      { amount: 1, from: ["Astral", "Enchanting", "Influence", "Perception"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Magic", "Street"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Arcana", "Magical Societies", "Sixth World History"],
      allowsLanguage: true,
    },
    notes: ["The Edge/Magic bonus option requires Awakened status."],
  },
  {
    id: "athlete",
    name: "Athlete",
    category: "choice",
    summary: "Trained hard for a shot at a career in sports.",
    boosts: [
      { amount: 1, from: ["body", "strength", "willpower"] },
      { amount: 1, from: ["agility", "reaction", "edge"] },
      { amount: 1, from: ["Athletics", "Close Combat", "Piloting"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Academic", "Criminal", "Media"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Combat Biker", "Urban Brawl", "any other sport"],
      allowsLanguage: true,
    },
  },
  {
    id: "artist",
    name: "Artist",
    category: "choice",
    summary: "Found a natural talent for an art form and pursued it.",
    boosts: [
      { amount: 1, from: ["charisma", "willpower", "edge"] },
      { amount: 1, from: ["intuition", "logic", "edge"] },
      { amount: 1, from: ["Con", "Engineering"] },
      { amount: 1, from: ["Influence", "Perception"] },
    ],
    contactPoints: 2,
    contactTypes: ["Academic", "Corporate", "Media", "Street"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["[Form of Art] Expert", "Current Events"],
      allowsLanguage: true,
    },
  },
  {
    id: "astral-explorations",
    name: "Astral Explorations",
    category: "choice",
    restriction: "Awakened only",
    summary: "Spent your time observing astral space and chasing metaplanar mysteries.",
    boosts: [
      { amount: 1, from: ["charisma", "willpower", "magic"] },
      { amount: 1, from: ["Astral", "Conjuring", "Perception"] },
      { amount: 1, from: ["Astral", "logic", "magic"] },
      { amount: 1, from: ["edge", "Sorcery", "Enchanting"] },
    ],
    knowledgeChoice: {
      count: 2,
      suggestions: ["Arcana", "Metaplanes", "Spirit Types"],
    },
  },
  {
    id: "barista-bartender",
    name: "Barista/Bartender",
    category: "choice",
    summary: "Made decent nuyen mixing drinks and making conversation with customers.",
    boosts: [
      { amount: 1, from: ["charisma", "intuition", "edge"] },
      { amount: 1, from: ["Con", "Influence", "Perception"] },
    ],
    resources: 50_000,
    contactPoints: 2,
    contactTypes: ["Any"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Cocktails", "Coffee and Soykaf", "Current Events"],
      allowsLanguage: true,
    },
  },
  {
    id: "black-star-neo-anarchist",
    name: "Black Star Neo-Anarchist",
    category: "choice",
    summary: "Got actively involved with the neo-anarchist movement.",
    boosts: [
      { amount: 1, from: ["agility", "charisma", "logic"] },
      { amount: 1, from: ["body", "strength", "willpower"] },
      { amount: 1, from: ["Con", "Engineering", "Perception", "Stealth"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Criminal", "Street"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Espionage Techniques", "Hacker Groups", "Sixth World History", "Philosophy"],
      allowsLanguage: true,
    },
  },
  {
    id: "blue-collar-laborer",
    name: "Blue-Collar Laborer",
    category: "choice",
    summary: "Long hours and hazardous conditions doing physical labor for the megacorps.",
    boosts: [
      { amount: 1, from: ["body", "strength", "willpower"] },
      { amount: 1, from: ["agility", "intuition", "reaction"] },
      { amount: 1, from: ["Electronics", "Engineering", "Outdoors", "Perception"] },
    ],
    contactPoints: 2,
    contactTypes: ["Corporate", "Engineering", "Government"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["[Area] Knowledge", "[Sprawl] Streets", "Trideo Series", "[Industry] Expert"],
      allowsLanguage: true,
    },
  },
  {
    id: "bodyguard",
    name: "Bodyguard",
    category: "choice",
    summary: "Learned to spot trouble and keep your clients out of it.",
    boosts: [
      { amount: 1, from: ["body", "agility", "strength"] },
      { amount: 1, from: ["edge", "intuition", "reaction"] },
      { amount: 1, from: ["Close Combat", "Firearms", "Perception"] },
    ],
    resources: 25_000,
    contactPoints: 4,
    contactTypes: ["Corporate", "Criminal", "Government", "Street"],
  },
  {
    id: "bounty-hunter",
    name: "Bounty Hunter",
    category: "choice",
    summary: "Made a living hunting down metahuman prey for whoever paid best.",
    boosts: [
      { amount: 1, from: ["agility", "reaction", "intuition"] },
      { amount: 1, from: ["Outdoors", "Perception", "Stealth"] },
      { amount: 1, from: ["Athletics", "Close Combat", "Firearms", "edge"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Criminal", "Street"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["[Area] Gangs", "Law Enforcement Corps", "Wanted Criminals"],
      allowsLanguage: true,
    },
  },
  {
    id: "celebrity",
    name: "Celebrity",
    category: "choice",
    summary: "Lived life in the spotlight, for better and worse.",
    boosts: [
      { amount: 1, from: ["charisma", "intuition", "edge"] },
      { amount: 1, from: ["Con", "Influence", "Perception"] },
    ],
    resources: 50_000,
    contactPoints: 4,
    contactTypes: ["Corporate", "Media"],
  },
  {
    id: "charlatan",
    name: "Charlatan",
    category: "choice",
    summary: "Exploited people's beliefs about magic, real or fabricated.",
    boosts: [
      { amount: 1, from: ["edge", "magic", "charisma"] },
      { amount: 1, from: ["Con", "Influence", "Stealth"] },
    ],
    resources: 50_000,
    contactPoints: 2,
    contactTypes: ["Criminal", "Magic"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Arcana", "Espionage Techniques", "Magical Societies"],
      allowsLanguage: true,
    },
    notes: ["The Magic bonus option requires Awakened status."],
  },
  {
    id: "clairvoyant",
    name: "Clairvoyant",
    category: "choice",
    restriction: "Awakened only",
    summary: "Found that magic's greatest use to you was revealing mysteries and uncovering hidden information.",
    boosts: [
      { amount: 1, from: ["intuition", "logic", "willpower"] },
      { amount: 1, from: ["edge", "magic", "reaction"] },
      { amount: 1, from: ["Astral", "Outdoors", "Perception"] },
      { amount: 1, from: ["Conjuring", "Enchanting", "Sorcery"] },
    ],
    contactPoints: 2,
    contactTypes: ["Magic"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Arcana", "Magical Traditions", "Metaplanes"],
      allowsLanguage: true,
    },
  },
  {
    id: "coach-trainer",
    name: "Coach/Trainer",
    category: "choice",
    summary: "Made a living working with people and bringing out their best athletic performance, while staying in peak condition yourself.",
    boosts: [
      { amount: 1, from: ["body", "agility", "strength"] },
      { amount: 1, from: ["reaction", "intuition", "charisma"] },
      { amount: 1, from: ["Athletics", "Con", "Influence"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Corporate", "Criminal", "Government"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Educational Theory", "Fitness", "Combat Biker", "Urban Brawl"],
      allowsLanguage: true,
    },
  },
  {
    id: "college-university",
    name: "College/University",
    category: "choice",
    summary: "Attended a school of academic study, gaining knowledge and career options at the cost of lots of student loan debt.",
    boosts: [
      { amount: 1, from: ["charisma", "intuition", "logic", "willpower"] },
      { amount: 2, count: 2, from: ["Biotech", "Con", "Electronics", "Influence"] },
      { amount: 1, from: ["Biotech", "Con", "Electronics", "Influence"] },
    ],
    knowledgeChoice: {
      count: 2,
      suggestions: ["Biology", "Economics", "Law", "Mathematics"],
      allowsLanguage: true,
    },
  },
  {
    id: "cook-chef",
    name: "Cook/Chef",
    category: "choice",
    summary: "Steady, if unglamorous, money as a cook - you can microwave a soyrito, but with your skills you can make something actually worth eating.",
    boosts: [
      { amount: 1, from: ["body", "agility", "intuition"] },
      { amount: 1, from: ["charisma", "edge", "logic"] },
      { amount: 1, from: ["Close Combat", "Con", "Outdoors", "Perception"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Academic", "Corporate", "Street"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Cuisine", "[Area] Nightclubs"],
      allowsLanguage: true,
    },
  },
  {
    id: "counter-hacker",
    name: "Counter-Hacker",
    category: "choice",
    summary: "Proactively anticipated and countered active Matrix threats, but eventually identified more with the people you opposed than the ones you worked for.",
    boosts: [
      { amount: 1, from: ["intuition", "reaction", "willpower"] },
      { amount: 1, from: ["edge", "resonance", "nuyen"] },
      { amount: 1, from: ["Electronics", "Cracking", "Tasking"] },
      { amount: 1, from: ["Engineering", "Perception", "Stealth"] },
    ],
    contactPoints: 2,
    contactTypes: ["Corporate", "Government", "Matrix"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Matrix Host Design", "Notorious Hackers", "Security Systems"],
      allowsLanguage: true,
    },
  },
  {
    id: "courier",
    name: "Courier",
    category: "choice",
    summary: "Delivered things too illegal, sensitive, or important to risk over the Matrix or a shipping company - no questions asked or answered.",
    boosts: [
      { amount: 1, from: ["agility", "edge", "intuition", "reaction"] },
      { amount: 1, from: ["Con", "Close Combat", "Firearms", "Stealth"] },
      { amount: 1, from: ["Athletics", "Electronics", "Influence", "Piloting"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Corporate", "Criminal", "Government"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Espionage Techniques", "Smuggling Routes", "[Sprawl] Streets"],
      allowsLanguage: true,
    },
  },
  {
    id: "covert-ops",
    name: "Covert Ops",
    category: "choice",
    summary: "Conducted delicate and discreet operations for megacorps, governments, or crime syndicates, and learned an even more valuable lesson than your skills: never trust an employer.",
    boosts: [
      { amount: 1, from: ["agility", "charisma", "perception"] },
      { amount: 1, from: ["reaction", "intuition", "Athletics"] },
      { amount: 1, from: ["Con", "Perception", "Stealth"] },
      { amount: 1, from: ["Athletics", "edge", "nuyen"] },
    ],
    contactPoints: 2,
    contactTypes: ["Corporate", "Government", "Street"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Espionage Techniques", "Security Systems", "Small Unit Tactics"],
      allowsLanguage: true,
    },
  },
  {
    id: "data-liberator",
    name: "Data Liberator",
    category: "choice",
    summary: "Learned all the ways files can be hidden and protected on the Matrix, with the intention of learning how to root them out.",
    boosts: [
      { amount: 1, from: ["intuition", "logic", "willpower"] },
      { amount: 1, from: ["edge", "resonance"] },
      { amount: 1, from: ["Electronics", "Cracking", "Tasking"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Academic", "Matrix", "Street"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Data Havens", "Espionage Techniques", "Hacker Groups"],
      allowsLanguage: true,
    },
  },
  {
    id: "demolitions-expert",
    name: "Demolitions Expert",
    category: "choice",
    summary: "Spent part of your life studying explosives, and got to set off quite a few pretty big ones.",
    boosts: [
      { amount: 1, from: ["agility", "reaction", "logic"] },
      { amount: 1, from: ["Electronics", "Engineering", "Stealth"] },
    ],
    resources: 50_000,
    contactPoints: 2,
    contactTypes: ["Criminal", "Government"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Bomb Design", "Structural Architecture"],
      allowsLanguage: true,
    },
  },
  {
    id: "detective",
    name: "Detective",
    category: "choice",
    summary: "Employed by a law enforcement corporation to investigate crimes that threatened the profit margins of megacorporations.",
    boosts: [
      { amount: 1, from: ["intuition", "logic", "willpower"] },
      { amount: 1, from: ["agility", "charisma", "edge"] },
      { amount: 1, from: ["Outdoors", "Perception", "Stealth"] },
      { amount: 1, from: ["Biotech", "Close Combat", "Firearms", "Influence"] },
    ],
    contactPoints: 2,
    contactTypes: ["Academic", "Corporate", "Criminal", "Government"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Forensics", "Law Enforcement Corps", "[Sprawl] Streets"],
      allowsLanguage: true,
    },
  },
  {
    id: "drone-technician",
    name: "Drone Technician",
    category: "choice",
    summary: "Learned a lot about maintaining, repairing, upgrading, and designing drones, and made a fair bit of nuyen too.",
    boosts: [
      { amount: 1, from: ["agility", "logic", "willpower"] },
      { amount: 1, from: ["Electronics", "Engineering", "Piloting"] },
    ],
    resources: 50_000,
    contactPoints: 2,
    contactTypes: ["Corporate", "Engineering", "Matrix"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Drone Models", "Security Systems", "Weapons Manufacturers"],
      allowsLanguage: true,
    },
  },
  {
    id: "engineer",
    name: "Engineer",
    category: "choice",
    summary: "Put your technical skills to use for a time as an engineer, expanding your talents and skills dramatically.",
    boosts: [
      { amount: 1, from: ["agility", "intuition", "logic"] },
      { amount: 1, from: ["body", "strength", "willpower"] },
      { amount: 1, count: 2, from: ["Biotech", "Cracking", "Electronics", "Engineering", "Tasking"] },
    ],
    contactPoints: 2,
    contactTypes: ["Engineering"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Aerospace Technology", "Security Systems", "Tech Companies"],
      allowsLanguage: true,
    },
    notes: [
      "Should be preceded by the College/University or Technical School module.",
      "The Tasking option in the third choice requires Emerged.",
    ],
  },
  {
    id: "entertainer",
    name: "Entertainer",
    category: "choice",
    summary: "Made a living as a musician, comedian, actor, MC, or trid show host - opportunities came easily for a while, but nothing lasts forever.",
    boosts: [
      { amount: 1, from: ["agility", "charisma", "willpower"] },
      { amount: 1, from: ["body", "reaction", "strength"] },
      { amount: 1, from: ["Con", "Influence", "Perception"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Media"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Corporate Personalities", "[Entertainment Form or Music Genre] Expert", "[Area] Nightclubs"],
      allowsLanguage: true,
    },
  },
  {
    id: "entrepreneur",
    name: "Entrepreneur",
    category: "choice",
    summary: "Had business opportunities and the means to take advantage of them. Never struck it rich, but made a fair bit of nuyen.",
    boosts: [
      { amount: 1, from: ["charisma", "edge", "willpower"] },
      { amount: 1, from: ["Con", "Influence", "Logic"] },
    ],
    resources: 50_000,
    contactPoints: 4,
    contactTypes: ["Corporate", "Criminal"],
  },
  {
    id: "farmer",
    name: "Farmer",
    category: "choice",
    summary: "Employed by an agricorp operating and maintaining large-scale agricultural machinery, becoming familiar with rural areas close to wilderness.",
    boosts: [
      { amount: 1, from: ["body", "intuition", "strength", "willpower"] },
      { amount: 1, count: 2, from: ["Engineering", "Outdoors", "Perception"] },
      { amount: 1, from: ["Athletics", "Firearms", "Influence"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Academic", "Engineering"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Agriculture", "[Area] Knowledge", "Critters"],
      allowsLanguage: true,
    },
  },
  {
    id: "financial-services-broker",
    name: "Financial Services Broker",
    category: "choice",
    summary: "Employed for your talents and expertise understanding economics - made your employer a lot of nuyen and managed to acquire a lot for yourself as well.",
    boosts: [{ amount: 1, from: ["charisma", "edge", "intuition", "logic"] }],
    resources: 75_000,
    contactPoints: 2,
    contactTypes: ["Corporate", "Criminal"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Current Events", "Economics", "[Megacorp] Politics"],
      allowsLanguage: true,
    },
    notes: ["Should be preceded by a College/University module."],
  },
  {
    id: "fixer",
    name: "Fixer",
    category: "choice",
    summary: "Became known for making the right connections to solve people's problems, until one deal in particular went very wrong.",
    boosts: [
      { amount: 1, from: ["charisma", "intuition", "willpower"] },
      { amount: 1, from: ["Con", "Influence", "Perception"] },
      { amount: 1, from: ["edge", "nuyen"] },
    ],
    resources: 25_000,
    contactPoints: 4,
    contactTypes: ["Any"],
  },
  {
    id: "ganger",
    name: "Ganger",
    category: "choice",
    summary: "Joined a gang for mutual survival, profit through crime, or just the thrill of it, and got chummers who were supposed to watch your back.",
    boosts: [
      { amount: 1, from: ["body", "agility", "reaction", "strength"] },
      { amount: 1, from: ["Athletics", "Close Combat", "Firearms", "Perception"] },
      { amount: 1, from: ["Con", "Influence", "Outdoors", "Stealth"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Criminal", "Street"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["[Area] Gangs", "Black Market", "[Sprawl] Streets"],
      allowsLanguage: true,
    },
  },
  {
    id: "guide",
    name: "Guide",
    category: "choice",
    summary: "Became known as an expert on an urban, rural, or wilderness area, making a fair bit of nuyen helping clients get around and find what they needed.",
    boosts: [
      { amount: 1, from: ["agility", "intuition", "charisma"] },
      { amount: 1, from: ["Athletics", "Con", "Influence"] },
      { amount: 1, from: ["Outdoors", "Piloting", "Stealth"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Street"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["[Area] Knowledge", "[Nation] Politics", "[Sprawl] Streets"],
      allowsLanguage: true,
    },
  },
  {
    id: "hacker",
    name: "Hacker",
    category: "choice",
    summary: "Used a cyberdeck or your connection to the resonance to bypass Matrix security, more for the challenge and exploration than the nuyen.",
    boosts: [
      { amount: 1, from: ["intuition", "logic", "willpower"] },
      { amount: 2, from: ["Cracking", "Electronics", "edge", "resonance"] },
      { amount: 1, from: ["Cracking", "Electronics", "nuyen"] },
    ],
    contactPoints: 2,
    contactTypes: ["Academic", "Criminal", "Matrix"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Espionage Techniques", "Hacker Groups", "Tech Companies"],
      allowsLanguage: true,
    },
    notes: ["The Resonance option in the second choice requires Emerged."],
  },
  {
    id: "hunter",
    name: "Hunter",
    category: "choice",
    summary: "Made a living hunting and killing animals in the wild, whether providing game for elite clients or hunting critters dangerous to metahumans.",
    boosts: [
      { amount: 1, from: ["body", "agility", "willpower"] },
      { amount: 1, from: ["edge", "intuition", "reaction"] },
      { amount: 1, from: ["Close Combat", "Exotic Weapons", "Firearms"] },
      { amount: 1, from: ["Outdoors", "Perception", "Stealth"] },
    ],
    contactPoints: 2,
    contactTypes: ["Street"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["[Area] Knowledge", "Critters", "[Region] History"],
      allowsLanguage: true,
    },
  },
  {
    id: "intern",
    name: "Intern",
    category: "choice",
    summary: "Hoped to learn the ropes and improve your job opportunities interning for a business or government. Worked hard, but the promised wealth and prosperity didn't pan out.",
    boosts: [
      { amount: 1, from: ["agility", "charisma", "intuition"] },
      { amount: 1, from: ["body", "willpower", "edge"] },
      { amount: 1, from: ["Con", "Influence", "Perception"] },
      { amount: 1, from: ["Biotech", "Electronics", "Piloting"] },
    ],
    contactPoints: 2,
    contactTypes: ["Corporate", "Government", "Media"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Corporate Personalities", "[Nation] Politics", "[Megacorp] Politics"],
      allowsLanguage: true,
    },
  },
  {
    id: "investigator",
    name: "Investigator",
    category: "choice",
    summary: "Developed the skills to find answers to difficult questions, uncover hidden clues, and unravel mysteries, whether in private practice or for a law enforcement/security corp.",
    boosts: [
      { amount: 1, from: ["intuition", "charisma", "edge"] },
      { amount: 1, from: ["Perception", "Con", "Influence"] },
      { amount: 1, from: ["Outdoors", "Perception", "Stealth"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Academic", "Criminal", "Street"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["[Area] Gangs", "[City] Underworld", "[Sprawl] Streets"],
      allowsLanguage: true,
    },
  },
  {
    id: "it-support",
    name: "IT Support",
    category: "choice",
    summary: "Resolved technical difficulties for megacorps, developing your Matrix expertise and making good nuyen doing so.",
    boosts: [
      { amount: 1, from: ["intuition", "logic", "willpower"] },
      { amount: 1, from: ["Cracking", "Electronics", "Engineering", "Tasking"] },
      { amount: 1, from: ["edge", "resonance", "nuyen"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Academic", "Corporate", "Matrix"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Maintenance Procedures", "Security Systems", "Tech Companies"],
      allowsLanguage: true,
    },
    notes: [
      "Should be preceded by the Technical School module.",
      "The Tasking option in the second choice requires Emerged.",
    ],
  },
  {
    id: "janitor",
    name: "Janitor",
    category: "choice",
    summary: "Worked long hours for poor pay cleaning and maintaining places drones don't manage well - but now you know how to get around most places without rousing suspicion.",
    boosts: [
      { amount: 1, from: ["body", "agility", "intuition", "logic"] },
      { amount: 1, from: ["edge", "Perception", "willpower"] },
      { amount: 1, from: ["Electronics", "Engineering", "Stealth"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Engineering"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Current Events", "Maintenance Procedures", "Security Systems"],
      allowsLanguage: true,
    },
  },
  {
    id: "journalist",
    name: "Journalist",
    category: "choice",
    summary: "Cultivated sources, interviews, and leaks, working to know things before anyone else - and then writing about it.",
    boosts: [
      { amount: 1, from: ["charisma", "willpower", "edge"] },
      { amount: 1, count: 2, from: ["Con", "Influence", "Perception", "Stealth"] },
    ],
    resources: 25_000,
    contactPoints: 4,
    contactTypes: ["Any"],
  },
  {
    id: "lawyer",
    name: "Lawyer",
    category: "choice",
    summary: "Made a comfortable living as a legal consultant, after accruing insurmountable student loan debt or signing a long-term megacorp employment agreement.",
    boosts: [
      { amount: 1, from: ["charisma", "intuition", "logic"] },
      { amount: 1, from: ["Con", "Influence", "Perception"] },
      { amount: 1, from: ["edge", "nuyen"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Criminal", "Government"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Current Events", "Law", "[Nation] Politics"],
      allowsLanguage: true,
    },
    notes: ["Should be preceded by the College/University module."],
  },
  {
    id: "magical-studies",
    name: "Magical Studies",
    category: "choice",
    restriction: "Awakened only",
    summary: "Focused all of your efforts on learning everything you could about Magic, growing your knowledge and power.",
    boosts: [
      { amount: 1, from: ["edge", "magic", "nuyen"] },
      { amount: 2, from: ["Astral", "Conjuring", "Enchanting", "Sorcery"] },
      { amount: 1, from: ["Astral", "Conjuring", "Enchanting", "Sorcery"] },
    ],
    contactPoints: 2,
    contactTypes: ["Academic", "Magic"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Magical Traditions", "Metaplanes", "Spirit Types"],
      allowsLanguage: true,
    },
  },
  {
    id: "martial-arts-training",
    name: "Martial Arts Training",
    category: "choice",
    summary: "Joined a martial arts gym or dojo, which became the focus of your life for some time.",
    boosts: [
      { amount: 1, from: ["body", "agility", "reaction", "strength"] },
      { amount: 1, from: ["edge", "magic", "nuyen"] },
      { amount: 1, count: 2, from: ["Athletics", "Close Combat", "Exotic Weapons", "Firearms"] },
    ],
    contactPoints: 4,
    contactTypes: ["Academic", "Street"],
    notes: [
      "Optionally spend Karma to acquire a martial arts style and techniques.",
      "The Magic option in the second choice requires Awakened.",
    ],
  },
  {
    id: "matrix-security",
    name: "Matrix Security",
    category: "choice",
    summary: "Successfully applied your technical skills and Matrix expertise defending against the threat of hackers.",
    boosts: [
      { amount: 1, from: ["intuition", "logic", "willpower"] },
      { amount: 1, from: ["Cracking", "Electronics", "Engineering", "Tasking"] },
      { amount: 1, from: ["Cracking", "Electronics", "edge"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Corporate", "Matrix"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Espionage Techniques", "Matrix Host Design", "Security Systems"],
      allowsLanguage: true,
    },
    notes: [
      "Should be preceded by the Technical School module.",
      "The Tasking option in the second choice requires Emerged.",
    ],
  },
  {
    id: "matrix-vandal",
    name: "Matrix Vandal",
    category: "choice",
    summary: "Used your hacking abilities to recklessly vandalize the Matrix - mostly for the thrill and finding out how far you could go without getting caught.",
    boosts: [
      { amount: 1, from: ["charisma", "intuition", "logic"] },
      { amount: 1, from: ["edge", "resonance", "nuyen"] },
      { amount: 1, from: ["Electronics", "Cracking", "Tasking"] },
      { amount: 1, from: ["Engineering", "Perception", "Stealth"] },
    ],
    contactPoints: 2,
    contactTypes: ["Matrix", "Street"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Current Events", "Hacker Groups", "Tech Companies"],
      allowsLanguage: true,
    },
    notes: ["The Resonance and Tasking options require Emerged."],
  },
  {
    id: "mechanic",
    name: "Mechanic",
    category: "choice",
    summary: "Worked for some time as a mechanic, repairing and maintaining vehicles.",
    boosts: [
      { amount: 1, from: ["intuition", "logic", "edge"] },
      { amount: 2, from: ["Engineering", "Electronics"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Engineering", "Street"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Aerospace Technology", "Drone and Vehicle Models", "Tech Companies"],
      allowsLanguage: true,
    },
    notes: ["Should be preceded by the Technical School module."],
  },
  {
    id: "medical-doctor",
    name: "Medical Doctor",
    category: "choice",
    summary: "Not many medical doctors become shadowrunners - something big must have happened to cause that sort of career change.",
    boosts: [
      { amount: 1, from: ["intuition", "logic", "edge"] },
      { amount: 2, from: ["Biotech", "Electronics", "Perception"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Academic", "Medical"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Biotechnology", "Bureaucracy", "Cybertechnology"],
      allowsLanguage: true,
    },
    notes: ["Should be preceded by the College/University module."],
  },
  {
    id: "mentor",
    name: "Mentor",
    category: "choice",
    summary: "Found that some people looked up to you, and that you had something to offer them.",
    boosts: [
      { amount: 1, from: ["charisma", "intuition", "willpower"] },
      { amount: 1, from: ["Con", "Electronics", "Influence"] },
    ],
    resources: 50_000,
    contactPoints: 2,
    contactTypes: ["Corporate"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Current Events", "[Megacorp] Politics", "Tech Companies"],
      allowsLanguage: true,
    },
  },
  {
    id: "military",
    name: "Military",
    category: "choice",
    summary: "Joined a professional government, corporate, or mercenary military force.",
    boosts: [
      { amount: 1, from: ["Athletics", "body", "willpower", "edge"] },
      { amount: 1, from: ["agility", "reaction", "strength"] },
      { amount: 1, from: ["Close Combat", "Exotic Weapons", "Firearms"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Corporate", "Government"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["[Military] Expert", "Small Unit Tactics", "Weapons Manufacturers"],
      allowsLanguage: true,
    },
    notes: ["Should be preceded by the Academy Training module."],
  },
  {
    id: "nurse",
    name: "Nurse",
    category: "choice",
    summary: "Doctors got most of the credit and much higher pay, but you were one of the people who actually did most of the work caring for patients.",
    boosts: [
      { amount: 1, from: ["charisma", "intuition", "logic"] },
      { amount: 1, from: ["agility", "edge", "willpower"] },
      { amount: 1, from: ["Biotech", "Influence", "Perception"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Medical", "Street"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Biotechnology", "Cybertechnology", "[Area] Medical Facilities"],
      allowsLanguage: true,
    },
    notes: ["Should be preceded by the College/University module."],
  },
  {
    id: "office-manager",
    name: "Office Manager",
    category: "choice",
    summary: "Made a lot of nuyen as a corporate office manager, but didn't have much of a life outside of work.",
    boosts: [
      { amount: 1, from: ["charisma", "edge", "willpower"] },
      { amount: 1, from: ["Con", "Influence", "Stealth"] },
      { amount: 1, from: ["edge", "logic", "Perception"] },
    ],
    resources: 25_000,
    contactPoints: 4,
    contactTypes: ["Corporate", "Criminal", "Government"],
  },
  {
    id: "organized-crime",
    name: "Organized Crime",
    category: "choice",
    summary: "Worked directly for an organized crime syndicate (Mafia, Seoulpa Rings, Vory, Yakuza) - useful skills, great stories, and a certain moral shakiness.",
    boosts: [
      { amount: 1, from: ["body", "Close Combat", "strength", "willpower"] },
      { amount: 1, from: ["agility", "charisma", "Firearms", "intuition"] },
      { amount: 1, from: ["Athletics", "Con", "Perception", "Stealth"] },
      { amount: 1, from: ["edge", "nuyen"] },
    ],
    contactPoints: 2,
    contactTypes: ["Criminal", "Street"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["[Area] Gangs", "[Area] Underworld", "[Sprawl] Streets"],
      allowsLanguage: true,
    },
  },
  {
    id: "patrol-cop",
    name: "Patrol Cop",
    category: "choice",
    summary: "Worked for a law enforcement corporation, patrolling the streets to protect the assets of the wealthy at all costs.",
    boosts: [
      { amount: 1, from: ["body", "agility", "strength"] },
      { amount: 1, from: ["edge", "intuition", "reaction"] },
      { amount: 1, from: ["Close Combat", "Firearms", "Perception", "Piloting"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Government", "Street"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Law Enforcement Corps", "Police Procedures", "Small Unit Tactics"],
      allowsLanguage: true,
    },
    notes: ["Should be preceded by the Academy Training module."],
  },
  {
    id: "politician",
    name: "Politician",
    category: "choice",
    summary: "One of the rare few whose internship actually went somewhere, ending up directly involved in politics beyond just running for coffee.",
    boosts: [
      { amount: 1, from: ["charisma", "intuition", "willpower"] },
      { amount: 1, from: ["Con", "Influence", "Stealth"] },
      { amount: 1, from: ["edge", "logic", "Perception"] },
    ],
    resources: 25_000,
    contactPoints: 4,
    contactTypes: ["Corporate", "Criminal", "Government"],
    notes: ["Should be preceded by the Intern module."],
  },
  {
    id: "professor",
    name: "Professor",
    category: "choice",
    summary: "Found work as a college or university professor after completing your degree, teaching the subject you spent so much time and effort learning.",
    boosts: [
      { amount: 1, from: ["charisma", "intuition", "logic"] },
      { amount: 1, from: ["Con", "Influence", "Perception"] },
      { amount: 1, from: ["any"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Academic"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["any academic knowledge skill"],
      allowsLanguage: true,
    },
    notes: ["Should be preceded by the College/University module."],
  },
  {
    id: "public-transit-operator",
    name: "Public Transit Operator",
    category: "choice",
    summary: "Employed to maintain, oversee, and sometimes operate public transportation systems - buses, subways, trams, or drone-piloted vehicles.",
    boosts: [
      { amount: 1, from: ["edge", "intuition", "reaction"] },
      { amount: 1, from: ["Electronics", "Engineering", "Piloting"] },
    ],
    resources: 50_000,
    contactPoints: 2,
    contactTypes: ["Engineering", "Street"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Current Events", "[Area] Knowledge", "[Sprawl] Streets"],
      allowsLanguage: true,
    },
  },
  {
    id: "research-scientist",
    name: "Research Scientist",
    category: "choice",
    summary: "Employed by megacorporations to develop new products, understand markets, and build theories and groundwork for future corporate efforts.",
    boosts: [
      { amount: 1, from: ["intuition", "logic", "edge"] },
      { amount: 1, from: ["Biotech", "Engineering", "Outdoors"] },
      { amount: 1, from: ["Electronics", "Perception", "willpower"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Academic", "Corporate", "Engineering", "Matrix", "Medical"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Corporate Personalities", "[Field of Research] Expert", "Tech Companies"],
      allowsLanguage: true,
    },
    notes: ["Should be preceded by the College/University module."],
  },
  {
    id: "rigger",
    name: "Rigger",
    category: "choice",
    summary: "Found work as an elite driver - usually pretty boring, but you got paid to jack in, and the pay was very good.",
    boosts: [
      { amount: 1, from: ["any-mental-attribute"] },
      { amount: 1, from: ["edge", "Engineering", "Piloting"] },
      { amount: 1, from: ["Piloting", "nuyen"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Engineering"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Drone and Vehicle Models", "Security Systems", "[Sprawl] Streets"],
      allowsLanguage: true,
    },
  },
  {
    id: "salesperson",
    name: "Salesperson",
    category: "choice",
    summary: "Worked in sales, learning how to move products for an employer. You were good at it, and made a lot of money.",
    boosts: [
      { amount: 1, from: ["charisma", "edge", "intuition", "willpower"] },
      { amount: 1, from: ["Con", "Influence", "Perception"] },
    ],
    resources: 50_000,
    contactPoints: 2,
    contactTypes: ["Corporate"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Corporate Personalities", "[Megacorp] Politics", "Psychology"],
      allowsLanguage: true,
    },
  },
  {
    id: "security-guard",
    name: "Security Guard",
    category: "choice",
    summary: "Worked as a security guard - not something you'd advertise to fellow shadowrunners, but the skills you picked up help the team make some cheddar.",
    boosts: [
      { amount: 1, from: ["body", "strength", "willpower"] },
      { amount: 1, from: ["agility", "reaction", "intuition"] },
      { amount: 1, from: ["Close Combat", "Firearms", "Perception"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    notes: [
      "Source text has a confirmed gap here: this module's Contact Types and Knowledge skill options aren't present anywhere in the extractable text, even across the surrounding page break - not fabricated.",
    ],
  },
  {
    id: "security-mage",
    name: "Security Mage",
    category: "choice",
    restriction: "Awakened only",
    summary: "It takes a mage to stop a mage - employed to use your magical abilities to counter magical security threats.",
    boosts: [
      { amount: 1, from: ["edge", "magic", "willpower"] },
      { amount: 1, from: ["Astral", "Conjuring", "Enchanting", "Sorcery"] },
      { amount: 1, from: ["Close Combat", "Firearms", "Perception"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Corporate", "Government", "Magic"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Security Systems", "Spirit Types", "Small Unit Tactics"],
      allowsLanguage: true,
    },
  },
  {
    id: "servant",
    name: "Servant",
    category: "choice",
    summary: "Represents a wide range of service positions - made a living performing services for clients or an employer.",
    boosts: [
      { amount: 1, from: ["charisma", "edge", "willpower"] },
      { amount: 1, from: ["Con", "Influence", "Perception", "Stealth"] },
      { amount: 1, from: ["any-skill-or-attribute"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Any"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Corporate Personalities", "Cuisine", "Current Events"],
      allowsLanguage: true,
    },
  },
  {
    id: "shadowrunner",
    name: "Shadowrunner",
    category: "choice",
    summary: "You've already done a few shadowruns. Some of them actually went okay. Maybe you'll end up being good at this.",
    boosts: [
      { amount: 1, from: ["any-mental-attribute"] },
      { amount: 1, from: ["any-physical-attribute"] },
      { amount: 1, from: ["edge", "Influence", "Perception", "Stealth"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Criminal", "Street"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Law Enforcement Corps", "Shadowrunner Reputations", "[Sprawl] Streets"],
      allowsLanguage: true,
    },
  },
  {
    id: "small-business-owner",
    name: "Small Business Owner",
    category: "choice",
    summary: "If only for a short time, you owned and ran your own business.",
    boosts: [
      { amount: 1, from: ["charisma", "intuition", "logic"] },
      { amount: 1, from: ["Con", "Electronics", "Influence", "Perception"] },
      { amount: 1, from: ["edge", "nuyen"] },
    ],
    resources: 25_000,
    contactPoints: 4,
    contactTypes: ["Corporate", "Criminal", "Street"],
  },
  {
    id: "smuggler",
    name: "Smuggler",
    category: "choice",
    summary: "Learned how to smuggle people and contraband across borders and past checkpoints.",
    boosts: [
      { amount: 1, from: ["agility", "intuition", "reaction"] },
      { amount: 1, from: ["Con", "Engineering", "Stealth"] },
      { amount: 1, from: ["Athletics", "Electronics", "Piloting"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Criminal", "Street"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Security Systems", "Smuggling Routes", "[Sprawl] Streets"],
      allowsLanguage: true,
    },
  },
  {
    id: "street-shaman",
    name: "Street Shaman",
    category: "choice",
    restriction: "Awakened only",
    summary: "Used your magical abilities to help out people in your neighborhood, earning a reputation as a helpful street shaman.",
    boosts: [
      { amount: 1, from: ["edge", "magic", "charisma"] },
      { amount: 1, from: ["Astral", "Conjuring", "Sorcery"] },
      { amount: 1, from: ["Con", "Influence", "Stealth"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Magic", "Street"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Arcana", "Metaplanes", "Spirit Types"],
      allowsLanguage: true,
    },
  },
  {
    id: "stuffer-shack-clerk",
    name: "Stuffer Shack Clerk",
    category: "choice",
    summary: "There's nothing more ubiquitous than Stuffer Shacks, and getting a job working for one is easy as long as you have a SIN.",
    boosts: [
      { amount: 1, from: ["agility", "charisma", "intuition", "edge"] },
      { amount: 1, from: ["Con", "Electronics", "Influence", "Perception"] },
      { amount: 1, from: ["willpower", "nuyen"] },
    ],
    resources: 25_000,
    contactPoints: 4,
    contactTypes: ["Any"],
  },
  {
    id: "talismonger",
    name: "Talismonger",
    category: "choice",
    restriction: "Awakened only",
    summary: "Supplied magical goods, whether through a shop of your own, black market deals, or supplying other talismongers.",
    boosts: [
      { amount: 1, from: ["charisma", "magic", "willpower"] },
      { amount: 1, from: ["Astral", "Conjuring", "Enchanting", "Sorcery"] },
      { amount: 1, from: ["Influence", "Outdoors", "Perception"] },
      { amount: 1, from: ["agility", "body", "edge"] },
    ],
    contactPoints: 2,
    contactTypes: ["Magic"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Arcana", "Magical Societies", "Magical Traditions"],
      allowsLanguage: true,
    },
  },
  {
    id: "technical-school",
    name: "Technical School",
    category: "choice",
    summary: "Attended a technical school or undertook a trade apprenticeship to learn valuable skills - sometimes things don't turn out the way you expected.",
    boosts: [
      { amount: 1, from: ["charisma", "intuition", "logic"] },
      { amount: 1, from: ["agility", "willpower", "edge"] },
      { amount: 2, from: ["Biotech", "Cracking", "Electronics", "Engineering"] },
    ],
    contactPoints: 2,
    contactTypes: ["Engineering", "Matrix", "Medical"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Vehicle/Drone Models", "Tech Companies", "Weapons Manufacturers"],
      allowsLanguage: true,
    },
  },
  {
    id: "technomancer",
    name: "Technomancer",
    category: "choice",
    restriction: "Emerged only",
    summary: "Focused on understanding and improving your connection to the Resonance.",
    boosts: [
      { amount: 1, from: ["charisma", "intuition", "logic", "willpower"] },
      { amount: 1, from: ["edge", "resonance"] },
      { amount: 1, from: ["Electronics", "Cracking", "Tasking"] },
      { amount: 1, from: ["Perception", "Stealth", "Tasking"] },
    ],
    contactPoints: 2,
    contactTypes: ["Matrix", "Street"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Hacker Groups", "Resonance Lore", "Virtual Hangouts"],
      allowsLanguage: true,
    },
  },
  {
    id: "think-tank",
    name: "Think Tank",
    category: "choice",
    summary: "Manufactured facts that your employer could use to influence people or justify their actions.",
    boosts: [
      { amount: 1, from: ["intuition", "logic", "willpower"] },
      { amount: 1, from: ["any"] },
    ],
    resources: 50_000,
    knowledgeChoice: {
      count: 2,
      suggestions: ["Conspiracy Theories", "Psychology", "[Nation] Politics", "[Megacorp] Politics"],
      allowsLanguage: true,
    },
  },
  {
    id: "traveler",
    name: "Traveler",
    category: "choice",
    summary: "Spent some time traveling to various different places around the world.",
    boosts: [
      { amount: 1, from: ["any-physical-attribute"] },
      { amount: 1, from: ["any-mental-attribute"] },
      { amount: 1, from: ["edge", "nuyen"] },
      { amount: 1, from: ["any"] },
    ],
    contactPoints: 2,
    contactTypes: ["Street"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["[Region] History", "[Area] Knowledge", "[Sprawl] Streets"],
      allowsLanguage: true,
    },
  },
  {
    id: "veterinarian",
    name: "Veterinarian",
    category: "choice",
    summary: "Turned your medical training toward helping all kinds of critters, possibly including some Awakened ones, be as healthy as possible.",
    boosts: [
      { amount: 1, from: ["charisma", "intuition", "logic"] },
      { amount: 1, from: ["body", "strength", "willpower"] },
      { amount: 1, from: ["Biotech", "Influence", "Perception"] },
    ],
    resources: 25_000,
    contactPoints: 2,
    contactTypes: ["Academic", "Medical"],
    knowledgeChoice: {
      count: 1,
      suggestions: ["Biotechnology", "Critters", "Cybertechnology"],
      allowsLanguage: true,
    },
  },
  {
    id: "event-harsh-truth",
    name: "Event: You Learned a Harsh Truth About the World",
    category: "event",
    summary: "Someone or something you counted on turned out to be very different than you believed.",
    boosts: [
      { amount: 1, from: ["any-attribute", "any-special-attribute"] },
      { amount: 1, from: ["any"] },
    ],
    resources: 50_000,
    contactPoints: 4,
    qualitySlots: [
      { count: 1, polarity: "either", note: "Represents the lasting trauma, or something gained despite the hardship." },
    ],
  },
  {
    id: "event-tough-times",
    name: "Event: You Struggled Through Some Tough Times",
    category: "event",
    summary: "Money and luck both ran out at once, and you had to fight through it.",
    boosts: [
      { amount: 1, from: ["agility", "body", "reaction", "strength"] },
      { amount: 1, from: ["charisma", "intuition", "logic", "willpower"] },
      { amount: 1, from: ["edge", "magic", "resonance"] },
      { amount: 1, from: ["any"] },
    ],
    contactPoints: 4,
    qualitySlots: [{ count: 1, polarity: "either", note: "Trauma, or tenacity/resilience/resourcefulness gained." }],
  },
  {
    id: "event-hard-work-paid-off",
    name: "Event: Your Hard Work Paid Off",
    category: "event",
    summary: "A long, uncertain effort finally worked out better than you'd hoped.",
    boosts: [
      { amount: 1, from: ["agility", "body", "reaction", "strength"] },
      { amount: 1, from: ["charisma", "intuition", "logic", "willpower"] },
      { amount: 1, from: ["edge", "magic", "resonance"] },
    ],
    resources: 25_000,
    contactPoints: 4,
    notes: ["May begin the Obsession quality path."],
  },
  {
    id: "event-pushed-to-limits",
    name: "Event: Your Body Was Pushed to Its Limits",
    category: "event",
    summary: "Athletics, training, or desperation pushed your body past what you thought possible.",
    boosts: [
      { amount: 2, from: ["agility", "body", "reaction", "strength"] },
      { amount: 1, from: ["charisma", "intuition", "logic", "willpower"] },
      { amount: 1, from: ["edge", "magic", "resonance"] },
    ],
    contactPoints: 4,
    qualitySlots: [{ count: 1, polarity: "positive", note: "Represents the physical improvements you achieved." }],
  },
  {
    id: "event-overwhelmed",
    name: "Event: You Were Overwhelmed, But Things Worked Out",
    category: "event",
    summary: "Circumstances forced you to stretch your mental or social skills to escape a bad situation.",
    boosts: [
      { amount: 1, from: ["agility", "body", "reaction", "strength"] },
      { amount: 2, from: ["charisma", "intuition", "logic", "willpower"] },
      { amount: 1, from: ["edge", "magic", "resonance"] },
    ],
    contactPoints: 4,
    qualitySlots: [{ count: 1, polarity: "either" }],
  },
  {
    id: "event-mentor",
    name: "Event: You Benefited from the Influence of a Mentor",
    category: "event",
    summary: "Someone recognized your talent and took the time to show you the ropes.",
    boosts: [
      { amount: 2, from: ["edge", "magic", "resonance"] },
      { amount: 1, from: ["any"] },
    ],
    resources: 25_000,
    contactPoints: 4,
    qualitySlots: [
      { count: 1, polarity: "either", note: "Picked up from your mentor. Your mentor may become one of your contacts." },
    ],
  },
  {
    id: "event-could-have-averted",
    name: "Event: You Could Have Averted Something Bad, If Only You'd Known How",
    category: "event",
    summary: "A shocking revelation showed you how little you knew, so you crammed to catch up.",
    boosts: [{ amount: 1, from: ["any"], count: 4 }],
    knowledgeChoice: { count: 2, suggestions: [], allowsLanguage: true },
    qualitySlots: [{ count: 1, polarity: "negative", note: "Caused by the trauma of this event." }],
  },
  {
    id: "event-mysterious-topics",
    name: "Event: You Became Extremely Interested in Unusual or Mysterious Topics",
    category: "event",
    summary: "You went deep into researching the Sixth World's stranger mysteries.",
    boosts: [
      { amount: 1, from: ["any-attribute", "any-special-attribute"] },
      { amount: 1, from: ["any"], count: 3 },
    ],
    knowledgeChoice: {
      count: 2,
      suggestions: ["Arcana", "Metaplanes", "[Region/Era] History"],
      allowsLanguage: true,
    },
    notes: [
      "Gain the Consumed quality (doesn't count toward the six-quality max at chargen; define its goal). No bonus Karma for it at chargen.",
    ],
  },
  {
    id: "event-windfall",
    name: "Event: You Came Into a Large Sum of Money",
    category: "event",
    summary: "An inheritance, a lucky find, or a cash prize landed in your lap.",
    resources: 100_000,
    contactPoints: 4,
    qualitySlots: [
      { count: 1, polarity: "negative", note: "A complication caused by the windfall (e.g. All Business, Distinctive Style)." },
    ],
  },
  {
    id: "event-lucrative-theft",
    name: "Event: You Got Away With a Lucrative Theft",
    category: "event",
    summary: "You got a tip that something very valuable would be vulnerable to theft, and took advantage of it - crime doesn't pay, but you know that's a lie.",
    boosts: [{ amount: 1, from: ["any-attribute", "any-special-attribute"] }],
    resources: 75_000,
    contactPoints: 4,
    qualitySlots: [
      { count: 1, polarity: "negative", note: "A complication caused by the crime you committed, such as Hunted." },
    ],
  },
  {
    id: "event-right-gear",
    name: "Event: You Survived a Life-Threatening Event, But Only Because You Happened to Have Just the Right Piece of Gear",
    category: "event",
    summary: "Learned the hard way that your life depends on your gear - someone close to you didn't survive to learn that lesson. Since then, you've been careful to keep well-maintained, high-quality equipment.",
    boosts: [{ amount: 1, from: ["any"] }],
    resources: 75_000,
    contactPoints: 4,
    qualitySlots: [
      { count: 1, polarity: "either", note: "Either the result of the traumatic loss you experienced, or shows how you've grown since." },
    ],
  },
];
