export type ChargenSystem = "priority" | "lifepath";

export interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
}

export interface CharacterRow {
  id: number;
  user_id: number;
  name: string;
  system: ChargenSystem;
  data: string;
  created_at: string;
  updated_at: string;
}

export interface Attributes {
  body: number;
  agility: number;
  reaction: number;
  strength: number;
  willpower: number;
  logic: number;
  intuition: number;
  charisma: number;
  edge: number;
  magic?: number;
  resonance?: number;
}

export interface DerivedStats {
  physicalMonitor: number;
  stunMonitor: number;
  initiative: number;
  initiativeDice: number;
  /** Bonus Defense Rating from bioware/cyberware/adept powers - see rules/deriveModifiers.ts. Does NOT include worn armor gear, which keeps displaying per-item as it always has. */
  armor: number;
}

export interface SelectedQuality {
  id: string;
  /** Chosen level, for catalog entries with a `levels` range (e.g. Built Tough). */
  rating?: number;
  /** Chosen skill/attribute/custom target, for catalog entries with `requiresParam`. */
  param?: string;
}

export interface StatusEffect {
  id: string;
  name: string;
  roundsRemaining?: number;
  notes?: string;
}

export interface CharacterPlayStateRow {
  character_id: number;
  physical_damage: number;
  stun_damage: number;
  edge_available: number;
  status_effects: string;
  updated_at: string;
}

export interface PlaySessionRow {
  id: number;
  gm_user_id: number;
  name: string;
  join_code: string;
  created_at: string;
}

export interface SessionCharacterRow {
  session_id: number;
  character_id: number;
}

export interface CharacterData {
  metatype: string;
  attributes: Attributes;
  skills: Record<string, number>;
  knowledgeSkills: string[];
  qualities: SelectedQuality[];
  contacts: { name: string; connection: number; loyalty: number }[];
  gear: { name: string; qty: number; notes?: string }[];
  nuyen: number;
  karma: number;
  notes?: string;
  // System-specific bookkeeping, kept loose so each flow can store its own
  // in-progress selections (priorities chosen, modules chosen, etc.)
  systemState: Record<string, unknown>;
}
