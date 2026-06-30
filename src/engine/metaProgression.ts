/**
 * Pure cross-life progression logic: evaluating achievements and recording a
 * finished life into the lifetime stats + Hall of Legends. No React, no native
 * imports — fully unit-testable.
 */

import { GameState } from '@/types/game';
import { AppMeta, DynastyRecord, DYNASTY_CAP, LifetimeStats } from '@/state/appMeta';
import { ACHIEVEMENTS, AchievementCtx } from '@/data/achievements';
import { RANKS } from '@/data/ranks';
import { legacyScore } from './consequenceEngine';

export interface AchievementResult {
  /** The full unlocked list after evaluation. */
  unlocked: string[];
  /** Ids unlocked by THIS evaluation (for toasts). */
  newly: string[];
}

/**
 * Evaluate all achievements against a context, returning the merged unlocked
 * list plus any newly-earned ids. Pure: does not mutate `meta`.
 */
export function evaluateAchievements(meta: AppMeta, state: GameState, atDeath: boolean): AchievementResult {
  const ctx: AchievementCtx = { state, stats: meta.stats, atDeath };
  const have = new Set(meta.achievements);
  const newly: string[] = [];
  for (const a of ACHIEVEMENTS) {
    if (!have.has(a.id) && a.check(ctx)) {
      have.add(a.id);
      newly.push(a.id);
    }
  }
  return { unlocked: [...have], newly };
}

function livingChildren(s: GameState): number {
  return s.kin.filter((k) => k.kind === 'child' && k.alive).length;
}

/**
 * Fold a completed life into lifetime stats and prepend it to the Hall of
 * Legends (capped). Pure: returns a new AppMeta.
 */
export function recordLifeEnd(meta: AppMeta, state: GameState): AppMeta {
  const rankKey = RANKS[state.rankIdx]?.key ?? 'Peasant';
  const legacy = legacyScore(state);

  const stats: LifetimeStats = {
    livesLived: meta.stats.livesLived + 1,
    oldestAge: Math.max(meta.stats.oldestAge, state.age),
    highestRankIdx: Math.max(meta.stats.highestRankIdx, state.rankIdx),
    mostGold: Math.max(meta.stats.mostGold, state.gold),
    totalChildren: meta.stats.totalChildren + livingChildren(state),
    bestLegacy: Math.max(meta.stats.bestLegacy, legacy),
    totalGoldEarned: meta.stats.totalGoldEarned + state.income,
  };

  const record: DynastyRecord = {
    lifeNo: state.lifeNo,
    name: `${state.first} ${state.epithet}`,
    rank: rankKey,
    age: state.age,
    cause: state.deathCause || 'Unknown causes',
    legacy,
    bornYear: state.bornYear,
  };

  const dynasty = [record, ...meta.dynasty].slice(0, DYNASTY_CAP);

  return { ...meta, stats, dynasty };
}
