// SR6e core rulebook skill list (p. 65). Skills run 1-6 at chargen (7 with
// the Aptitude quality), one skill may sit at the max rank.
export const skillList = [
  "Astral",
  "Athletics",
  "Biotech",
  "Close Combat",
  "Con",
  "Conjuring",
  "Cracking",
  "Electronics",
  "Enchanting",
  "Engineering",
  "Exotic Weapons",
  "Firearms",
  "Influence",
  "Outdoors",
  "Perception",
  "Piloting",
  "Sorcery",
  "Stealth",
  "Tasking",
] as const;

export type SkillName = (typeof skillList)[number];

// Each skill's Primary Linked Attribute (core rulebook "Skills" chapter, pp.
// 92-97, one subsection per skill) - used to compute a skill's dice pool
// (rank + linked attribute). Several skills also list a secondary linked
// attribute for specific sub-tests (e.g. Athletics/Strength for
// resistance-flavored tests, Engineering/Agility for lockpicking) - not
// modeled here, this is the primary attribute shown for every skill's
// general-purpose pool.
export const skillLinkedAttribute: Record<SkillName, string> = {
  Astral: "intuition",
  Athletics: "agility",
  Biotech: "logic",
  "Close Combat": "agility",
  Con: "charisma",
  Conjuring: "magic",
  Cracking: "logic",
  Electronics: "logic",
  Enchanting: "magic",
  Engineering: "logic",
  "Exotic Weapons": "agility",
  Firearms: "agility",
  Influence: "charisma",
  Outdoors: "intuition",
  Perception: "intuition",
  Piloting: "reaction",
  Sorcery: "magic",
  Stealth: "agility",
  Tasking: "resonance",
};
