/**
 * Path & rank progression.
 *
 * Two things live here:
 *  1. The visible CLASS LADDER (Peasant -> Squire -> Knight -> Noble), advanced
 *     via hidden `rankProgress` plus gating requirements per rank.
 *  2. The hidden LIFE PATHS (martial/court/church/labour/outlaw) whose dominant
 *     value tells the event picker what kind of life this is becoming.
 */

import { GameState, PathKey } from '@/types/game';
import { RANKS } from '@/data/ranks';
import { addMemory, pushFeed } from './gameState';
import { C } from '@/theme/theme';

/** The dominant hidden path (or 'labour' as the default peasant baseline). */
export function dominantPath(s: GameState): PathKey {
  let best: PathKey = 'labour';
  let bestVal = -1;
  (Object.keys(s.paths) as PathKey[]).forEach((k) => {
    if (s.paths[k] > bestVal) {
      bestVal = s.paths[k];
      best = k;
    }
  });
  return best;
}

/** Check whether the player currently QUALIFIES for the next rank. */
export function canPromote(s: GameState): boolean {
  const next = RANKS[s.rankIdx + 1];
  if (!next) return false;
  const req = next.promote;
  if (s.age < req.minAge) return false;
  if (req.minGold != null && s.gold < req.minGold) return false;
  if (s.rankProgress < req.progress) return false;
  if (req.stats) {
    for (const [k, v] of Object.entries(req.stats)) {
      if ((s.stats as any)[k] < (v as number)) return false;
    }
  }
  return true;
}

/** Promote one rank if possible (or forced). Resets rankProgress. */
export function promote(s: GameState, force = false): boolean {
  const next = RANKS[s.rankIdx + 1];
  if (!next) return false;
  if (!force && !canPromote(s)) return false;
  s.rankIdx += 1;
  s.rankProgress = 0;
  addMemory(s, `promoted_${next.key.toLowerCase()}`, 3);
  pushFeed(
    s,
    `PROMOTED → ${next.short}`,
    C.good,
    `Your station rises! You are now a ${next.key}. The village gasps, and one cousin weeps with envy.`,
    'good',
  );
  return true;
}

export function demote(s: GameState): boolean {
  if (s.rankIdx <= 0) return false;
  const lost = RANKS[s.rankIdx];
  s.rankIdx -= 1;
  s.rankProgress = 40;
  addMemory(s, `demoted_from_${lost.key.toLowerCase()}`, 3);
  pushFeed(
    s,
    `DEMOTED → ${RANKS[s.rankIdx].short}`,
    C.bad,
    `Disgrace! You lose the rank of ${lost.key} and slink back to being a ${RANKS[s.rankIdx].key}.`,
    'bad',
  );
  return true;
}

/**
 * Called every age-up after events resolve: nudge rankProgress from accumulated
 * path momentum, then auto-promote if the player has earned it.
 */
export function tickProgression(s: GameState): GameState {
  // Martial + court paths feed the climb toward knighthood/nobility.
  const climb = dominantPath(s);
  if (climb === 'martial' || climb === 'court') {
    s.rankProgress += 2;
  }
  // Outlaws can't be promoted by society; their progress decays.
  if (climb === 'outlaw' && s.rankProgress > 0) {
    s.rankProgress = Math.max(0, s.rankProgress - 3);
  }
  if (canPromote(s)) promote(s);
  return s;
}
