// Small pure helpers for Sprites (core rulebook "Technomancers" chapter, pp.
// 191-195) - resolving a sprites.ts catalog entry's Level-relative stats,
// mirroring deriveSpirits.ts's pattern exactly (Force -> Level). See
// CompiledSprite (playState.ts) for the compiled-sprite tracking this feeds.
import type { SpriteCatalogEntry, SpriteMatrixMods } from "./rules";

/**
 * Matrix attributes are Level + a flat per-type modifier (p. 193's stat
 * blocks). Unlike spirit attributes, the book states no "can't go below 1"
 * floor for sprites (Data Sprites print Attack as L-1, i.e. 0 at Level 1) -
 * only clamped at 0 here since a negative Matrix attribute isn't meaningful.
 */
export function spriteMatrixAttributes(entry: SpriteCatalogEntry, level: number): Record<keyof SpriteMatrixMods, number> {
  const resolve = (mod: number) => Math.max(0, level + mod);
  return {
    attack: resolve(entry.matrixMods.attack),
    sleaze: resolve(entry.matrixMods.sleaze),
    dataProcessing: resolve(entry.matrixMods.dataProcessing),
    firewall: resolve(entry.matrixMods.firewall),
  };
}

/** "A sprite's Matrix Condition Monitor is (L/2) + 8" (p. 192) - rounded up, same convention as deriveSpirits.ts's default Condition Monitor formula. */
export function spriteConditionMonitor(level: number): number {
  return Math.ceil(level / 2) + 8;
}

/** Substitutes the literal "L" placeholder in a formula string (e.g. initiative) with a chosen Level, e.g. "(L x 2) + 1" at Level 4 -> "(4 x 2) + 1". Word-bounded so it never touches an "L" inside a longer word. */
export function resolveLevelTemplate(template: string, level: number): string {
  return template.replace(/\bL\b/g, String(level));
}

/** "You can have a number of registered sprites equal to your Resonance level, as well as one unregistered sprite" (p. 192). */
export function maxRegisteredSprites(resonance: number): number {
  return resonance;
}
