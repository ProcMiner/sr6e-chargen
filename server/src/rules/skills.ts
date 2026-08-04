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
