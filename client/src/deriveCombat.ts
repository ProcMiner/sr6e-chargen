// Mundane (non-Matrix, non-Astral) combat - core rulebook "Combat" chapter,
// pp. 104-111, plus the Final Calculations summary on p. 67. Same "no
// dice-rolling engine" treatment as deriveAstral.ts/deriveMatrix.ts: the
// Combat Process itself (5 steps, rolling dice, soaking damage) is never
// simulated - only what's directly computable from the character's own
// attributes/gear (Attack Rating, Defense Rating) becomes a real number,
// everything else here is reference text/tables.
import type { CharacterData, GearLine } from "./character";
import type { Attributes, GearCatalogEntry } from "./rules";
import { findGearEntry, gearLineKey, isWeapon, isWeaponAccessory } from "./deriveGear";
import { modifierBonuses } from "./deriveModifiers";

/**
 * Body + worn armor + augmentation armor bonus (core rulebook p. 108).
 * "Most Defense Boosts from pieces of armor are not cumulative" - a base
 * suit (Clothes/Armor subcategory) doesn't stack with a second base suit,
 * but "supplemental armor like helmets, shields, and pads" (Helmets &
 * Shields subcategory) does stack on top. This app has no "currently worn"
 * flag on gear, so the best single Clothes/Armor item you own stands in for
 * "what you're wearing" - a book-accurate approximation since you can only
 * physically wear one base suit at a time anyway.
 */
export function wornArmorTotal(data: CharacterData, catalog: GearCatalogEntry[]): number {
  let bestSuit = 0;
  let helmetsAndShields = 0;

  for (const line of data.gear) {
    const entry = findGearEntry(line.itemId ?? "", catalog);
    if (!entry?.stats?.defenseRating) continue;
    const value = Number(entry.stats.defenseRating.replace("+", ""));
    if (!Number.isFinite(value)) continue;

    if (entry.subcategory === "Clothes" || entry.subcategory === "Armor") {
      bestSuit = Math.max(bestSuit, value);
    } else if (entry.subcategory === "Helmets & Shields") {
      helmetsAndShields += value;
    }
  }

  return bestSuit + helmetsAndShields;
}

/**
 * Body + augmentation armor bonus (see derive.ts's DerivedStats.armor) + worn armor total. `effectiveBody` should
 * already include any Body-boosting cyberware/bioware bonus (see derive.ts's effectiveAttributes) - passed in
 * rather than read from `data` directly since `data.attributes.body` is always the natural, unboosted value.
 */
export function defenseRating(data: CharacterData, catalog: GearCatalogEntry[], augmentationArmor: number, effectiveBody: number): number {
  return effectiveBody + augmentationArmor + wornArmorTotal(data, catalog);
}

/**
 * Unarmed Attack Rating: Strength + Reaction (core rulebook p. 67, "Attack
 * Rating... It's Reaction + Strength at the Close range"). A melee weapon
 * instead adds Strength directly to ITS OWN printed Attack Rating (p. 39) -
 * left as reference text below rather than parsed/added automatically,
 * since weapon Attack Ratings are printed per-range free text
 * (gear.ts's stats.attackRatings), not a single number to add to.
 * Takes the character's *effective* attributes (see derive.ts's
 * effectiveAttributes) so Strength/Reaction-boosting cyberware/bioware
 * (Muscle Augmentation, Wired Reflexes, etc.) is reflected here too.
 */
export function unarmedAttackRating(attributes: Attributes): number {
  return (attributes.strength ?? 0) + (attributes.reaction ?? 0);
}

/**
 * Weapon Accessories whose bonus depends on a temporary state this app
 * doesn't track (deployed or not, which firing mode is used) rather than
 * being always-on once mounted - shown as reference notes per attached
 * weapon instead of folded into weaponAttackRatings()'s computed number,
 * same "no dice-rolling engine" boundary as FIRING_MODES above. Keyed by
 * gear.ts/krimeKatalog.ts catalog id.
 */
const MELEE_SUBCATEGORIES = new Set(["Blades", "Clubs", "Melee (Other)"]);

const FIRING_MODE_ACCESSORY_NOTES: Record<string, string> = {
  "accessory-bipod": "Bipod: +2 Attack Rating once deployed.",
  "accessory-gas-vent-system": "Gas-Vent System: removes the Attack Rating penalty for Semi-Auto fire, reduces Burst Fire's to -2.",
  "accessory-gyro-mount": "Gyro Mount: negates Semi-Auto/Burst Fire penalties; +3 Attack Rating for Full-Auto.",
  "accessory-shock-pad": "Shock Pad: reduces Semi-Auto/Burst Fire Attack Rating penalties by 1.",
  "accessory-tripod": "Tripod: negates Semi-Auto/Burst Fire penalties once deployed; +3 Attack Rating for Full-Auto.",
  "krime-explosive-securing-tripod":
    "Krime Explosive Securing Tripod: functions as a Tripod (negates Semi-Auto/Burst Fire penalties, +3 Attack Rating for Full-Auto) whether or not its pitons are deployed.",
};

export interface WeaponAttackRating {
  line: GearLine;
  entry: GearCatalogEntry;
  /** The catalog's printed Close/Near/Medium/Far/Extreme string, e.g. "10/10/8/—/—". */
  baseAttackRatings: string;
  /** Same shape as baseAttackRatings, with `bonus` added to every populated range band. Equal to baseAttackRatings when bonus is 0. */
  effectiveAttackRatings: string;
  /** Summed always-on Attack Rating bonus: Strength for a melee weapon (core rulebook p. 39) plus any attached accessory's bonus (Smartgun System, Laser Sight - mutually exclusive, only the higher applies). */
  bonus: number;
  /** e.g. ["Strength (+4)", "Smartgun System, Internal (+2)"] - what contributed to `bonus`. */
  bonusSources: string[];
  /** Reference-only notes for attached accessories with a firing-mode/deployed-state-conditional effect - see FIRING_MODE_ACCESSORY_NOTES. */
  modeNotes: string[];
}

function applyAttackRatingBonus(baseAttackRatings: string, bonus: number): string {
  if (!bonus) return baseAttackRatings;
  return baseAttackRatings
    .split("/")
    .map((band) => {
      const value = Number(band.trim());
      return Number.isFinite(value) ? String(value + bonus) : band.trim();
    })
    .join("/");
}

/**
 * Every owned weapon (melee or ranged) with a printed Attack Ratings string,
 * plus its Attack Ratings recomputed with any attached Weapon Accessory's
 * always-on bonus applied - see ModifierTarget's "attackRating" case for why
 * this is a separate resolution path from deriveModifiers.ts's
 * character-wide modifierBonuses(). Mount-slot compatibility (a Smartgun
 * mounted on a melee weapon, multiple accessories sharing one mount) isn't
 * enforced, same "player self-enforces" simplification as everywhere else
 * mount/slot capacity comes up in this app (see vehicleUpgrades.ts's own
 * note on mod-slot budgets).
 */
export function weaponAttackRatings(
  data: CharacterData,
  catalog: GearCatalogEntry[],
  effectiveAttrs: Attributes
): WeaponAttackRating[] {
  const results: WeaponAttackRating[] = [];
  for (const line of data.gear) {
    const entry = line.itemId ? findGearEntry(line.itemId, catalog) : undefined;
    if (!isWeapon(entry) || !entry?.stats?.attackRatings) continue;

    const attached = data.gear.filter((l) => l.attachedTo === gearLineKey(line));
    const accessoryAttached = attached.filter((l) => isWeaponAccessory(l.itemId ? findGearEntry(l.itemId, catalog) : undefined));
    const accessoryBonus = modifierBonuses(accessoryAttached, []).attackRating ?? 0;
    const strengthBonus = entry.subcategory && MELEE_SUBCATEGORIES.has(entry.subcategory) ? effectiveAttrs.strength ?? 0 : 0;
    const bonus = strengthBonus + accessoryBonus;

    const bonusSources: string[] = [];
    if (strengthBonus) bonusSources.push(`Strength (+${strengthBonus})`);
    for (const l of accessoryAttached) {
      const amount = (l.modifiers ?? []).find((m) => m.target === "attackRating")?.amount;
      if (amount) bonusSources.push(`${l.name} (+${amount})`);
    }
    const modeNotes = accessoryAttached
      .map((l) => (l.itemId ? FIRING_MODE_ACCESSORY_NOTES[l.itemId] : undefined))
      .filter((note): note is string => !!note);

    results.push({
      line,
      entry,
      baseAttackRatings: entry.stats.attackRatings,
      effectiveAttackRatings: applyAttackRatingBonus(entry.stats.attackRatings, bonus),
      bonus,
      bonusSources,
      modeNotes,
    });
  }
  return results;
}

export const COMBAT_PROCESS_STEPS: { step: string; summary: string }[] = [
  {
    step: "1. Grab Dice",
    summary:
      "Attacker rolls [weapon skill] + Agility (Engineering + Logic when firing from a vehicle). Defender rolls Reaction + Intuition, modified for Surprise/damage/etc.",
  },
  {
    step: "2. Distribute Edge",
    summary:
      "Compare Attack Rating to Defense Rating - whoever's 4+ higher gets 1 Edge. Then check the situation (weather, light, visibility) and any relevant gear/qualities for more Edge. Max 2 Edge gained per round; Edge banks up to 7.",
  },
  {
    step: "3. Roll Dice & Spend Edge",
    summary:
      "5s and 6s are hits; ties go to the attacker. If the attacker has at least 1 hit and doesn't have fewer hits than the defender, it's a success - add net hits to the weapon's base Damage Value.",
  },
  {
    step: "4. Soak Damage",
    summary: "Defender rolls Body; each 5/6 cancels a point of the modified Damage Value.",
  },
  {
    step: "5. Bring the Pain",
    summary:
      "Remaining damage hits the Condition Monitor, plus any secondary effect (needs at least 1 box of damage to trigger). If damage left after soaking exceeds Body, the target is Knocked Down (Prone).",
  },
];

export const EDGE_IN_COMBAT: { cost: string; uses: string[] }[] = [
  { cost: "1 Edge", uses: ["Reroll one die (Post)", "Add 3 to your Initiative Score (Any)", "Use an Edge Action (Pre)"] },
  {
    cost: "2 Edge",
    uses: ["Add 1 to a single die roll (Any)", "Give an ally 1 Edge (Any)", "Negate 1 Edge of a foe (Pre)", "Use an Edge Action (Pre)"],
  },
  { cost: "3 Edge", uses: ["Buy one automatic hit (Any)", "Heal one box of Stun damage (Any)"] },
  {
    cost: "4 Edge",
    uses: [
      "Add your Edge attribute as a dice pool bonus and make 6s explode (Pre)",
      "Heal 1 box of Physical damage (Any)",
      "Reroll failed dice (Post)",
      "Use an Edge Action (Pre)",
    ],
  },
  { cost: "5 Edge", uses: ["2s count as glitches for the target (Pre)", "Create a special effect (Any)", "Use an Edge Action (Pre)"] },
];

export const RANGE_CATEGORIES: { name: string; distance: string }[] = [
  { name: "Close", distance: "0-3 meters" },
  { name: "Near", distance: "4-50 meters" },
  { name: "Medium", distance: "51-250 meters" },
  { name: "Far", distance: "251-500 meters" },
  { name: "Extreme", distance: "500+ meters" },
];

export const FIRING_MODES: { mode: string; effect: string }[] = [
  { mode: "SS (Single Shot)", effect: "One round, no changes to the weapon's stats." },
  { mode: "SA (Semi-Automatic)", effect: "Two rounds, one trigger pull's worth of actions - Attack Rating -2, Damage +1." },
  {
    mode: "BF (Burst Fire)",
    effect: "Four rounds - narrow burst: Attack Rating -4, Damage +2. Wide burst: split the dice pool between two targets, each counts as an SA shot.",
  },
  {
    mode: "FA (Full Auto)",
    effect:
      "Attacks every valid target in a 1m radius, one roll but each defender rolls separately - Attack Rating -6, consumes 10 rounds. Can expand the radius by 1m increments, -2 Attack Rating each, but never below 0.",
  },
];

export const DAMAGE_TYPES: { type: string; effect: string }[] = [
  { type: "Electricity", effect: "Taking any damage from it inflicts the Zapped status for 2 combat rounds." },
  {
    type: "Chemical",
    effect: "Inflicts the Corrosive status. If modified DV exceeds the target's Armor, that armor's Defense boost permanently drops by 1.",
  },
  {
    type: "Cold",
    effect: "Inflicts the Chilled status for 3 rounds. Same permanent Armor-degradation rule as Chemical if modified DV exceeds Armor.",
  },
  { type: "Fire", effect: "Inflicts the Burning status - keeps burning for several rounds after the hit." },
];

export const COMBAT_OPTIONS: { name: string; summary: string }[] = [
  {
    name: "Off-Hand Attacks",
    summary: "Attacking with your off-hand (without Ambidextrous) means you can neither gain nor spend Edge on that attack.",
  },
  {
    name: "Knockdown",
    summary: "If damage remaining after Damage Resistance exceeds your Body rank, you're knocked down and gain the Prone status.",
  },
  {
    name: "Multiple Attacks",
    summary: "Split your attacking dice pool evenly across targets. Different weapon types split by attack type first, then by target, each rounded down.",
  },
  {
    name: "Grapple",
    summary:
      "Unarmed Close Combat + Agility to grab a target, then Strength + net hits vs. their Strength to restrain them (-4 to their Defense tests). Follow-up Major Actions: Restrain, Damage, or Tackle for the attacker; Break Free for the defender.",
  },
  {
    name: "Cover",
    summary: "Take Cover (Minor Action) to gain a Cover status based on your size, the cover's size, and your posture - makes you harder to hit.",
  },
  {
    name: "Barriers",
    summary: "Hiding completely behind an object subtracts half its Structure rating (rounded up) from incoming unmodified damage.",
  },
];
