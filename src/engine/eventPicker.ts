/**
 * Event picker. Evaluates conditions and selects the next main event for the
 * year from the content banks, respecting age range, path, rank, tags, stats,
 * reputation, once-per-life flags, and weighting.
 */

import { Choice, Condition, GameEvent, GameState, PathKey, StatKey } from '@/types/game';
import { RANKS } from '@/data/ranks';
import { ALL_EVENTS, EVENTS_BY_ID } from '@/content';
import { dominantPath } from './pathProgression';
import { pickWeighted } from './random';

const STAT_KEYS: StatKey[] = ['health', 'charm', 'wits', 'faith'];

export function meetsCondition(s: GameState, c?: Condition): boolean {
  if (!c) return true;
  if (c.minAge != null && s.age < c.minAge) return false;
  if (c.maxAge != null && s.age > c.maxAge) return false;
  if (c.minGold != null && s.gold < c.minGold) return false;
  if (c.maxGold != null && s.gold > c.maxGold) return false;
  if (c.rankAtLeast != null && s.rankIdx < c.rankAtLeast) return false;
  if (c.rankAtMost != null && s.rankIdx > c.rankAtMost) return false;
  if (c.minReputation != null && s.reputation < c.minReputation) return false;
  if (c.maxReputation != null && s.reputation > c.maxReputation) return false;

  if (c.statAtLeast) {
    for (const k of STAT_KEYS) {
      const v = c.statAtLeast[k];
      if (v != null && s.stats[k] < v) return false;
    }
  }
  if (c.statAtMost) {
    for (const k of STAT_KEYS) {
      const v = c.statAtMost[k];
      if (v != null && s.stats[k] > v) return false;
    }
  }
  if (c.hasTags) {
    for (const t of c.hasTags) if (!s.tags.includes(t)) return false;
  }
  if (c.missingTags) {
    for (const t of c.missingTags) if (s.tags.includes(t)) return false;
  }
  if (c.hasTraits) {
    for (const t of c.hasTraits) if (!s.traits.includes(t)) return false;
  }
  if (c.pathAtLeast) {
    for (const key of Object.keys(c.pathAtLeast) as PathKey[]) {
      const v = c.pathAtLeast[key];
      if (v != null && s.paths[key] < v) return false;
    }
  }
  if (c.custom && !c.custom(s)) return false;
  return true;
}

export function isEventEligible(s: GameState, e: GameEvent): boolean {
  if (e.arcNodeOnly) return false; // only reachable via story graph
  if (e.once && s.firedOnce.includes(e.id)) return false;
  if (e.ageMin != null && s.age < e.ageMin) return false;
  if (e.ageMax != null && s.age > e.ageMax) return false;
  if (e.ranks && !e.ranks.includes(RANKS[s.rankIdx].key)) return false;
  if (e.paths && !e.paths.includes(dominantPath(s))) return false;
  if (!meetsCondition(s, e.requires)) return false;
  // Must have at least one selectable choice.
  return e.choices.some((ch) => isChoiceAvailable(s, ch));
}

export function isChoiceAvailable(s: GameState, ch: Choice): boolean {
  if (ch.requires && !meetsCondition(s, ch.requires)) return false;
  return true;
}

/** Whether a choice is selectable AND affordable (for UI gating). */
export function isChoiceEnabled(s: GameState, ch: Choice): boolean {
  if (!isChoiceAvailable(s, ch)) return false;
  if (ch.costGold != null && s.gold < ch.costGold) return false;
  return true;
}

/**
 * Weight an eligible event: base weight, boosted when it matches the dominant
 * path, slightly boosted when its tags resonate with the player's memories.
 */
function eventWeight(s: GameState, e: GameEvent): number {
  let w = e.weight ?? 1;
  const path = dominantPath(s);
  if (e.paths && e.paths.includes(path)) w *= 2.2;
  return w;
}

export function pickEvent(s: GameState): GameEvent | null {
  const eligible = ALL_EVENTS.filter((e) => isEventEligible(s, e));
  if (eligible.length === 0) return null;
  return pickWeighted(eligible, (e) => eventWeight(s, e));
}

export function eventById(id: string): GameEvent | undefined {
  return EVENTS_BY_ID[id];
}
