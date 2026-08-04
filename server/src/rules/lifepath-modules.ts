// Life Path (Life Modules) chargen system, transcribed from the SR6 Companion,
// "Life Path" chapter (pp. 30-48). Flavor text below is paraphrased in our own
// words rather than quoted from the book; all numeric/mechanical values
// (attribute/skill bonuses, resources, contact points, knowledge options) are
// transcribed as printed since they are game rules, not protected expression.
//
// NOTE: this is a curated starting subset, not the full module catalog (the
// Companion lists several dozen Choices and Event modules across pp. 33-47).
// The three mandatory starting modules are complete. The Adult module list
// currently covers modules A-C (alphabetically) plus a representative set of
// Event modules. Add more entries here as they're transcribed — the schema
// below is meant to make that a pure data-entry exercise.

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
    summary: "Your first real talent starts to show.",
    notes: [
      "Choose one skill representing your strongest talent; gain it at rank 4. If it's one of the four skills chosen in Growing Up, raise it to rank 6 instead.",
      "TODO: verify remaining grants for this module against the sourcebook - extraction of this page was incomplete.",
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
];
