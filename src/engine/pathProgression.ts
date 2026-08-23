/**
 * Path & rank progression.
 *
 * Two things live here:
 *  1. The visible CLASS LADDER, advanced
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
  if (next.premium && !s.lifetimeUnlocked) return false;
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

export interface StandingContribution {
  label: string;
  delta: number;
}

/** Yearly standing owed to the life the player is visibly leading. */
const PATH_STANDING: Record<PathKey, number> = {
  martial: 3,
  court: 3,
  church: 3,
  labour: 2,
  outlaw: -4,
};

const PATH_LABEL: Record<PathKey, string> = {
  martial: 'a life under arms',
  court: 'a life at court',
  church: 'a life in the Church',
  labour: 'honest trade and toil',
  outlaw: 'a life outside the law',
};

/**
 * Every yearly pressure on the player's social standing, with a reason attached.
 *
 * Standing used to come almost entirely from swinging a sword: the tick added
 * +1 for a martial or court life and nothing else, so training was the only real
 * ladder. It is now a running account — wealth, reputation, faith, learning,
 * a thriving estate, faction favour and steady work all raise it, and disgrace,
 * debt, notoriety and a collapsing estate all pull it back down.
 */
export function standingContributions(s: GameState): StandingContribution[] {
  const out: StandingContribution[] = [];
  const add = (label: string, delta: number) => {
    if (delta !== 0) out.push({ label, delta });
  };

  // Standing is never free: it must be re-earned every year.
  add('the passing of a year', -2);

  const path = dominantPath(s);
  add(PATH_LABEL[path], PATH_STANDING[path]);

  // Reputation runs -100..100 from a standing start of zero, so a new life is
  // unknown rather than disgraced. It is what most event choices actually move,
  // which is how a choice-led life climbs without ever lifting a sword.
  if (s.reputation >= 60) add('a name known for the right reasons', 3);
  else if (s.reputation >= 30) add('a growing good name', 2);
  else if (s.reputation >= 12) add('a name beginning to travel', 1);
  else if (s.reputation <= -40) add('a name spoken as a warning', -3);
  else if (s.reputation < 0) add('a tarnished name', -1);

  if (s.gold >= 200) add('conspicuous wealth', 3);
  else if (s.gold >= 80) add('a comfortable purse', 2);
  else if (s.gold >= 30) add('a purse that covers appearances', 1);

  const debt = s.debts.reduce((sum, item) => sum + item.principal, 0);
  if (debt >= 60) add('debts everyone has heard about', -3);
  else if (debt > 0) add('outstanding debts', -1);

  if (s.stats.charm >= 70) add('courtly bearing', 1);
  if (s.stats.wits >= 70) add('letters and learning', 1);
  if (s.stats.faith >= 70) add('a reputation for piety', 1);

  // A thriving estate is visible proof of competence; a failing one, of the
  // opposite. This is the Holding's route into the class ladder.
  const holdingFloor = Math.min(s.holding.stores, s.holding.security, s.holding.loyalty);
  if (holdingFloor >= 75) add('a flourishing holding', 3);
  else if (holdingFloor >= 50) add('a well-kept holding', 1);
  else if (holdingFloor < 20) add('a holding falling apart', -3);

  const standings = Object.values(s.world.factions).map((faction) => faction.playerStanding);
  const bestFaction = Math.max(0, ...standings);
  const worstFaction = Math.min(0, ...standings);
  if (bestFaction >= 20) add('powerful friends', 2);
  else if (bestFaction >= 8) add('friends in useful places', 1);
  if (worstFaction <= -20) add('a powerful enemy', -2);

  if (s.occupation.careerId && s.occupation.performance >= 65) add('respected work', 1);

  const legal = s.world.characters[s.playerCharacterId]?.legalState;
  if (s.tags.includes('imprisoned')) add('imprisonment', -6);
  if ((legal?.notoriety ?? 0) >= 30) add('a name known to the law', -3);
  else if ((legal?.suspicion ?? 0) >= 50) add('the suspicion of officials', -1);

  return out;
}

/** Net yearly movement in rankProgress before any promotion is checked. */
export function yearlyStandingDelta(s: GameState): number {
  return standingContributions(s).reduce((sum, item) => sum + item.delta, 0);
}

/**
 * Called every age-up after events resolve: settle the year's standing account,
 * then auto-promote if the player has earned it. Progress can fall as well as
 * rise, and a rank already held is never lost here — only the climb toward the
 * next one is.
 */
export function tickProgression(s: GameState): GameState {
  s.rankProgress = Math.max(0, s.rankProgress + yearlyStandingDelta(s));
  if (canPromote(s)) promote(s);
  return s;
}
