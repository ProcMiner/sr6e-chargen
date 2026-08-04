import type { CharacterData } from "./character";

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

  priorityTables: () => request<import("./rules").PriorityRulesResponse>("/rules/priority-tables"),
  lifepathModules: () => request<import("./rules").LifepathRulesResponse>("/rules/lifepath-modules"),
};
