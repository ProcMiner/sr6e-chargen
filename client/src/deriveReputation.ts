// Reputation & Heat - core rulebook "Running the Game," pp. 235-237. Same
// treatment as deriveAstral.ts/deriveMatrix.ts: this app has no dice-rolling
// engine anywhere, so the GM's end-of-session Heat roll and every
// Reputation/Heat change are the player/GM's own judgment call, self-applied
// via a plain +/- adjuster. Only the small amount that's a real lookup (Heat
// Effects by tier) is computed; everything else here is reference text.
import type { CharacterData } from "./character";

export function currentReputation(data: CharacterData): number {
  return data.reputation ?? 0;
}

/** Heat never printed as negative in the book - floored at 0. */
export function currentHeat(data: CharacterData): number {
  return Math.max(0, data.heat ?? 0);
}

/** >= this: Edge vs law enforcement/community/other runners (but hardened criminals gain Edge against you). */
export const REPUTATION_HIGH_THRESHOLD = 10;
/** <= this: law enforcement/community/runners gain Edge against you (but you gain Edge vs hardened criminals). */
export const REPUTATION_LOW_THRESHOLD = -10;

export interface HeatEffectTier {
  min: number;
  max: number;
  effect: string;
}

export const HEAT_EFFECTS: HeatEffectTier[] = [
  { min: 0, max: 3, effect: "No effect." },
  { min: 4, max: 6, effect: "Law enforcement response times are cut by 25%." },
  { min: 7, max: 9, effect: "Law enforcement response times are cut by 50%." },
  {
    min: 10,
    max: 10,
    effect: "The team's lowest-rated SIN is burned - marked as criminal, sets off alerts when used.",
  },
  { min: 11, max: 13, effect: "Two extra law enforcement officers respond to any call involving the runners." },
  {
    min: 14,
    max: 16,
    effect:
      "The runners are on a Most Wanted list (law enforcement, one of the Big Ten, or a major nation) - they regularly have to avoid pursuit, possibly across national/corporate borders.",
  },
  {
    min: 17,
    max: Infinity,
    effect: "Elite troops (Red Samurai, Sioux Wildcats, etc.) pursue as deniable assets, across any border.",
  },
];

export function heatEffectFor(heat: number): HeatEffectTier {
  return HEAT_EFFECTS.find((t) => heat >= t.min && heat <= t.max) ?? HEAT_EFFECTS[HEAT_EFFECTS.length - 1];
}

/** Reference only - the book calls this table "more a guideline than a definitive listing," entirely GM discretion. */
export const REPUTATION_CHANGES: { action: string; change: string }[] = [
  { action: "Engaged in public violence that kills a bystander", change: "-1" },
  { action: "Engaged in public violence that kills multiple bystanders", change: "-3" },
  { action: "Seen killing a law enforcement officer", change: "-2" },
  { action: "Known to have harmed people in need", change: "-1" },
  { action: "Kidnapped or tortured an innocent person to further their ends", change: "-1" },
  { action: "Reneged on a deal with Mr. Johnson", change: "-1" },
  { action: "Seen giving medical aid to injured bystanders", change: "+1" },
  { action: "Shared some of their wealth with downtrodden citizens", change: "+1" },
  { action: "Discounted their services when working for people not in power", change: "+1" },
  { action: "Kept a long-standing promise without payment", change: "+1" },
  { action: "Defused a potentially violent situation", change: "+1" },
  { action: "Rescued a popular, famous person from peril", change: "+2" },
];

/** The GM's end-of-session Heat roll modifiers (2D6, adjusted by these) - reference only, not simulated. */
export const HEAT_ROLL_MODIFIERS: { circumstance: string; modifier: string }[] = [
  { circumstance: "Session involved intense violence", modifier: "+1" },
  { circumstance: "Session involved murder", modifier: "+1" },
  { circumstance: "Session involved hostile contact with a wealthy and/or prominent individual", modifier: "+1" },
  { circumstance: "Session involved direct contact with a lesser dragon", modifier: "+1" },
  { circumstance: "Session involved direct contact with a great dragon", modifier: "+2" },
  { circumstance: "Session involved media coverage (including Matrix streams) of the runners' actions", modifier: "+1" },
  { circumstance: "Team has one or more runners with Reputation above 10 or below -10", modifier: "+1" },
  { circumstance: "The runners performed illegal actions without attracting notice", modifier: "-1" },
  { circumstance: "Mr. Johnson used connections to hush up aspects of the run", modifier: "-1" },
  { circumstance: "The runners provided sufficient bribes to keep things quiet", modifier: "-1" },
  { circumstance: "The runners made or used a law enforcement connection who'll help keep the heat off", modifier: "-1" },
  { circumstance: "The runners have sufficient goodwill to overcome rumors about their involvement in bad events", modifier: "-1" },
  { circumstance: "Team has one or more runners with Reputation under -5 and no runners above 5", modifier: "-1" },
];

/** Ways to lower Heat, book pp. 236-237 - reference text, not enforced (e.g. the Contact's Connection 3+ requirement or Loyalty cost). */
export const HEAT_REDUCTION_METHODS: { name: string; effect: string }[] = [
  {
    name: "Work a Contact",
    effect: "Requires a law enforcement/corporate security Contact with Connection 3+. Reduces Heat by 2, costs that Contact 1 Loyalty.",
  },
  {
    name: "Pay a Bribe",
    effect: "1,000¥ per point of Heat removed, for one person (spend multiples of 1,000¥ to cover the whole team).",
  },
  {
    name: "Lie Low",
    effect: "-1 Heat per in-universe month with no shadowrunning work, capped at -3 per in-game year.",
  },
  {
    name: "Find a Fall Guy",
    effect: "Pin a past crime on someone else (Con/Stealth tests, GM's call) - variable reduction, at least 3.",
  },
];
