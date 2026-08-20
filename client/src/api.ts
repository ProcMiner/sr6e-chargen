import type { CharacterData } from "./character";
import type { NpcData } from "./npc";
import type { PlayState, PlaySessionSummary, SessionDetail } from "./playState";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: "same-origin",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    ...options,
  });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, body.error ?? `Request failed with ${res.status}`);
  }
  return body as T;
}

export interface User {
  id: number;
  username: string;
}

export interface CharacterSummary {
  id: number;
  name: string;
  system: "priority" | "lifepath";
  data: Partial<CharacterData>;
  createdAt: string;
  updatedAt: string;
}

export interface NpcSummary {
  id: number;
  name: string;
  data: Partial<NpcData>;
  createdAt: string;
  updatedAt: string;
}

export const api = {
  me: () => request<User>("/me"),
  login: (username: string, password: string) =>
    request<User>("/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  register: (username: string, password: string) =>
    request<User>("/register", { method: "POST", body: JSON.stringify({ username, password }) }),
  logout: () => request<void>("/logout", { method: "POST" }),

  listCharacters: () => request<CharacterSummary[]>("/characters"),
  getCharacter: (id: number) => request<CharacterSummary>(`/characters/${id}`),
  createCharacter: (name: string, system: "priority" | "lifepath", data: Partial<CharacterData>) =>
    request<CharacterSummary>("/characters", {
      method: "POST",
      body: JSON.stringify({ name, system, data }),
    }),
  updateCharacter: (id: number, patch: { name?: string; data?: Partial<CharacterData> }) =>
    request<CharacterSummary>(`/characters/${id}`, { method: "PUT", body: JSON.stringify(patch) }),
  deleteCharacter: (id: number) => request<void>(`/characters/${id}`, { method: "DELETE" }),

  getPlayState: (id: number) => request<PlayState>(`/characters/${id}/play-state`),
  updatePlayState: (id: number, patch: Partial<PlayState>) =>
    request<PlayState>(`/characters/${id}/play-state`, { method: "PUT", body: JSON.stringify(patch) }),
  getCharacterSessions: (id: number) => request<PlaySessionSummary[]>(`/characters/${id}/sessions`),

  priorityTables: () => request<import("./rules").PriorityRulesResponse>("/rules/priority-tables"),
  lifepathModules: () => request<import("./rules").LifepathRulesResponse>("/rules/lifepath-modules"),
  qualities: () => request<import("./rules").QualityRulesResponse>("/rules/qualities"),
  gear: () => request<import("./rules").GearRulesResponse>("/rules/gear"),
  packs: () => request<import("./rules").PackRulesResponse>("/rules/packs"),
  spells: () => request<import("./rules").SpellRulesResponse>("/rules/spells"),
  adeptPowers: () => request<import("./rules").AdeptPowerRulesResponse>("/rules/adept-powers"),
  lifestyles: () => request<import("./rules").LifestyleRulesResponse>("/rules/lifestyles"),
  complexForms: () => request<import("./rules").ComplexFormRulesResponse>("/rules/complex-forms"),
  npcTemplates: () => request<import("./rules").NpcTemplateRulesResponse>("/rules/npc-templates"),
  spirits: () => request<import("./rules").SpiritRulesResponse>("/rules/spirits"),
  sprites: () => request<import("./rules").SpriteRulesResponse>("/rules/sprites"),
  metamagics: () => request<import("./rules").MetamagicRulesResponse>("/rules/metamagics"),

  createSession: (name: string) =>
    request<PlaySessionSummary>("/play/sessions", { method: "POST", body: JSON.stringify({ name }) }),
  listSessions: () => request<PlaySessionSummary[]>("/play/sessions"),
  getSession: (id: number) => request<SessionDetail>(`/play/sessions/${id}`),
  deleteSession: (id: number) => request<void>(`/play/sessions/${id}`, { method: "DELETE" }),
  joinSession: (joinCode: string, characterId: number) =>
    request<PlaySessionSummary>("/play/sessions/join", {
      method: "POST",
      body: JSON.stringify({ joinCode, characterId }),
    }),
  leaveSession: (sessionId: number, characterId: number) =>
    request<void>(`/play/sessions/${sessionId}/leave`, { method: "POST", body: JSON.stringify({ characterId }) }),

  listNpcs: () => request<NpcSummary[]>("/npcs"),
  createNpc: (name: string, data: Partial<NpcData>) =>
    request<NpcSummary>("/npcs", { method: "POST", body: JSON.stringify({ name, data }) }),
  updateNpc: (id: number, patch: { name?: string; data?: Partial<NpcData> }) =>
    request<NpcSummary>(`/npcs/${id}`, { method: "PUT", body: JSON.stringify(patch) }),
  deleteNpc: (id: number) => request<void>(`/npcs/${id}`, { method: "DELETE" }),
};
