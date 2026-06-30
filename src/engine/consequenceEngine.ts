/**
 * The consequence engine turns a declarative `Effects` object into mutations on
 * the game state: stats, gold, rank progress, reputation, hidden paths, tags,
 * memories, kin relationships, promotions, and life-ending outcomes.
 *
 * This is the single chokepoint through which ALL event/activity outcomes flow,
 * so balancing (e.g. difficulty scaling on damage) lives in one place.
 */

import { Effects, GameState, PathKey, StatKey } from '@/types/game';
import { addMemory, addMoney, addTag, pushFeed, removeTag } from './gameState';
import { clamp } from './random';
import { promote, demote } from './pathProgression';
import { killKin as killKinMember, spawnKin } from './kinFactory';

const STAT_KEYS: StatKey[] = ['health', 'charm', 'wits', 'faith'];

/**
 * Difficulty multiplier applied to NEGATIVE stat changes only. Tuned (with the
 * death modifier) so reaching Noble is "hard but not impossible" on every mode:
 * the spread is compressed around Normal rather than trivial/impossible at the
 * extremes. See scripts/balance.ts.
 */
function harshness(s: GameState): number {
  switch (s.settings.difficulty) {
    case 'Brutal':
      return 1.3;
    case 'Merciful':
      return 0.8;
    default:
      return 1;
  }
}

export function applyEffects(s: GameState, eff?: Effects): GameState {
  if (!eff) return s;

  const harsh = harshness(s);

  // --- stats ---
  for (const k of STAT_KEYS) {
    const d = eff[k];
    if (d != null) {
      const scaled = d < 0 ? d * harsh : d;
      s.stats[k] = clamp(s.stats[k] + scaled);
    }
  }

  // --- gold ---
  if (eff.gold != null) addMoney(s, eff.gold);

  // --- rank progress (hidden) ---
  if (eff.rankProgress != null) {
    s.rankProgress = Math.max(0, s.rankProgress + eff.rankProgress);
  }

  // --- reputation (hidden, -100..100) ---
  if (eff.reputation != null) {
    s.reputation = clamp(s.reputation + eff.reputation, -100, 100);
  }

  // --- hidden path progress ---
  if (eff.path) {
    for (const key of Object.keys(eff.path) as PathKey[]) {
      const d = eff.path[key];
      if (d != null) s.paths[key] = Math.max(0, s.paths[key] + d);
    }
  }

  // --- tags ---
  if (eff.addTags) for (const t of eff.addTags) addTag(s, t);
  if (eff.removeTags) for (const t of eff.removeTags) removeTag(s, t);

  // --- memory ---
  if (eff.memory) addMemory(s, eff.memory.tag, eff.memory.weight ?? 1, eff.memory.note);

  // --- kin relationship ---
  if (eff.kinRel) {
    const k = s.kin.find((m) => m.id === eff.kinRel!.id);
    if (k) k.rel = clamp(k.rel + eff.kinRel.delta);
  }

  // --- kin roster changes (new spouse/child, or a death) ---
  if (eff.addKin) {
    const specs = Array.isArray(eff.addKin) ? eff.addKin : [eff.addKin];
    for (const spec of specs) spawnKin(s, spec);
  }
  if (eff.killKin) killKinMember(s, eff.killKin);

  // --- promotion / demotion (forced) ---
  if (eff.promote) promote(s);
  if (eff.demote) demote(s);

  // --- prison / exile (lighter than death, recorded as state) ---
  if (eff.prison) {
    addTag(s, 'imprisoned');
    addMemory(s, 'imprisoned', 3);
  }
  if (eff.exile) {
    addTag(s, 'exiled');
    addMemory(s, 'exiled', 3);
  }

  // --- death (handled last so any stat/gold context is already applied) ---
  if (eff.death && s.settings.permadeath) {
    killPlayer(s, eff.death);
  }

  return s;
}

export function killPlayer(s: GameState, cause: string): GameState {
  if (s.dead) return s;
  s.dead = true;
  s.deathCause = cause;
  return s;
}

/** Convenience used by the death screen / legacy summary. */
export function legacyScore(s: GameState): number {
  const statSum = s.stats.health + s.stats.charm + s.stats.wits + s.stats.faith;
  return Math.round(s.rankIdx * 120 + s.gold * 2 + statSum + s.reputation + s.memories.length * 4);
}

export { pushFeed };
