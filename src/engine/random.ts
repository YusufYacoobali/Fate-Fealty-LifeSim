/**
 * RNG toolkit with an injectable source (Dependency Inversion).
 *
 * Every engine module draws randomness from these helpers rather than calling
 * `Math.random` directly, and the helpers in turn delegate to a swappable
 * `RandomSource`. Production binds it to `Math.random`; tests and the headless
 * simulators can inject a seeded PRNG for deterministic, reproducible runs —
 * without changing a single call site.
 */

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
