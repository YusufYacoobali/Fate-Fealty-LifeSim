/**
 * RNG toolkit with an injectable source (Dependency Inversion).
 *
 * Every engine module draws randomness from these helpers rather than calling
 * `Math.random` directly, and the helpers in turn delegate to a swappable
 * `RandomSource`. Production binds it to `Math.random`; tests and the headless
 * simulators can inject a seeded PRNG for deterministic, reproducible runs —
 * without changing a single call site.
 */

import { PersistedRngState, WorldState } from '@/types/game';

export interface RandomSource {
  /** Returns a float in [0, 1). */
  next(): number;
}

const mathRandomSource: RandomSource = { next: () => Math.random() };

let source: RandomSource = mathRandomSource;

export function setRandomSource(s: RandomSource): void {
  source = s;
}

export function resetRandomSource(): void {
  source = mathRandomSource;
}

/** A small, fast, seedable PRNG (mulberry32) for deterministic runs. */
export function seededSource(seed: number): RandomSource {
  let a = seed >>> 0;
  return {
    next() {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
  };
}

export const RNG_ALGORITHM = 'mulberry32-v1' as const;

export function initialRngState(seed: number): PersistedRngState {
  return { algorithm: RNG_ALGORITHM, state: seed >>> 0, draws: 0 };
}

export interface StatefulRandomSource extends RandomSource {
  snapshot(): PersistedRngState;
}

export function runWithPersistedRng<T>(saved: PersistedRngState, operation: () => T): { value: T; rngState: PersistedRngState } {
  const previous = source;
  const scoped = persistedSource(saved);
  source = scoped;
  try {
    return { value: operation(), rngState: scoped.snapshot() };
  } finally {
    source = previous;
  }
}

/** Stateful mulberry32 whose exact continuation can be persisted in a save. */
export function persistedSource(saved: PersistedRngState): StatefulRandomSource {
  let state = saved.state >>> 0;
  let draws = Math.max(0, Math.floor(saved.draws));
  return {
    next() {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), 1 | t);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      draws += 1;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    snapshot() {
      return { algorithm: RNG_ALGORITHM, state, draws };
    },
  };
}

/**
 * Bind all existing random helpers to a world's persisted stream for one
 * synchronous engine transaction, then write the continuation back.
 */
export function runWithWorldRng<T>(world: WorldState, operation: () => T): T {
  const previous = source;
  const scoped = persistedSource(world.rngState);
  source = scoped;
  try {
    return operation();
  } finally {
    world.rngState = scoped.snapshot();
    source = previous;
  }
}

/** Stable, non-stream-consuming hash used only for update recovery/substitution. */
export function stableHash(seed: number, ...parts: string[]): number {
  let hash = (2166136261 ^ (seed >>> 0)) >>> 0;
  for (const part of parts) {
    for (let i = 0; i < part.length; i++) {
      hash ^= part.charCodeAt(i);
      hash = Math.imul(hash, 16777619) >>> 0;
    }
  }
  return hash >>> 0;
}

export function rnd(a: number, b: number): number {
  return Math.floor(source.next() * (b - a + 1)) + a;
}

export function chance(p: number): boolean {
  return source.next() < p;
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(source.next() * arr.length)];
}

/** Weighted pick. Items with higher weight are more likely. */
export function pickWeighted<T>(items: readonly T[], weightOf: (t: T) => number): T | null {
  const weights = items.map((it) => Math.max(0, weightOf(it)));
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return null;
  let roll = source.next() * total;
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i];
    if (roll < 0) return items[i];
  }
  return items[items.length - 1];
}

export function clamp(v: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, Math.round(v)));
}
