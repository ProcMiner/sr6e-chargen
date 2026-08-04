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
}

export interface CharacterData {
  metatype: string;
  attributes: Attributes;
  skills: Record<string, number>;
  knowledgeSkills: string[];
  qualities: string[];
  contacts: { name: string; connection: number; loyalty: number }[];
  gear: { name: string; qty: number; notes?: string }[];
  nuyen: number;
  karma: number;
  notes?: string;
  // System-specific bookkeeping, kept loose so each flow can store its own
  // in-progress selections (priorities chosen, modules chosen, etc.)
  systemState: Record<string, unknown>;
}
