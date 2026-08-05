// Live play-state: damage, Edge, and status effects during an actual
// session. Deliberately separate from CharacterData (character.ts) - it's
// written every few seconds during play and shouldn't touch the builder's
// save path or its validation.

export interface StatusEffect {
  id: string;
  name: string;
  roundsRemaining?: number;
  notes?: string;
}

export interface PlayState {
  physicalDamage: number;
  stunDamage: number;
  edgeAvailable: number;
  statusEffects: StatusEffect[];
}

export interface PlaySessionSummary {
  id: number;
  name: string;
  joinCode: string;
  createdAt: string;
}

export interface SessionCharacterCard {
  id: number;
  name: string;
  owner: string;
  system: "priority" | "lifepath";
  maxPhysical: number;
  maxStun: number;
  maxEdge: number;
  playState: PlayState;
}

export interface SessionDetail extends PlaySessionSummary {
  characters: SessionCharacterCard[];
}
