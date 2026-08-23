import { GameState, PathKey, StatKey } from '@/types/game';
import { pushFeed } from './gameState';
import { goalById } from '@/data/goals';
import { C } from '@/theme/theme';

/**
 * Routine activities are useful, but doing the exact same thing all year should
 * not be the strongest way to play. High-risk, social and chance-driven actions
 * are intentionally excluded: their own outcomes already provide the trade-off.
 */
const ROUTINE_ACTIVITIES = new Set([
  'tavern',
  'feast',
  'fair',
  'fields',
  'blacksmith',
  'market',
  'church',
  'pilgrimage',
  'train',
  'leech',
  'bathhouse',
  'herbalist',
  'village_service',
  'gather_fuel',
  'manage_workshop',
  'guild_bargain',
  'copy_manuscript',
  'lead_patrol',
  'drill_levy',
  'hear_petitions',
  'hold_council',
  'royal_audience',
  'teach_child',
  'care_relative',
  'rest',
  'treat_patient',
  'study_trade',
  'seek_patron',
  'repair_household',
  'manage_stores',
]);

export interface ActivityRewardSnapshot {
  gold: number;
  rankProgress: number;
  reputation: number;
  stats: Record<StatKey, number>;
  paths: Record<PathKey, number>;
  holding: { stores: number; security: number; loyalty: number };
  income: number;
  goalId: string | null;
}

export function captureActivityRewards(s: GameState): ActivityRewardSnapshot {
  return {
    gold: s.gold,
    rankProgress: s.rankProgress,
    reputation: s.reputation,
    stats: { ...s.stats },
    paths: { ...s.paths },
    holding: {
      stores: s.holding.stores,
      security: s.holding.security,
      loyalty: s.holding.loyalty,
    },
    income: s.income,
    goalId: s.goalId,
  };
}

function rewardMultiplier(use: number): number {
  if (use <= 2) return 1;
  if (use === 3) return 0.75;
  if (use === 4) return 0.5;
  return 0.25;
}

function trimPositiveGain(before: number, after: number, multiplier: number): number {
  if (after <= before) return after;
  return before + Math.round((after - before) * multiplier);
}

function useKey(s: GameState, id: string): string {
  return `activity-year:${s.age}:${id}`;
}

/** Keep only this year's activity counters so the persistent ledger stays tiny. */
function pruneOldActivityUses(s: GameState): void {
  const currentPrefix = `activity-year:${s.age}:`;
  for (const key of Object.keys(s.world.repetitionLedger)) {
    if (key.startsWith('activity-year:') && !key.startsWith(currentPrefix)) delete s.world.repetitionLedger[key];
  }
}

/**
 * Apply diminishing returns only to positive gains. Costs, wounds and other bad
 * consequences are never softened by repetition.
 */
export function applyActivityDiminishingReturns(
  s: GameState,
  id: string,
  before: ActivityRewardSnapshot,
): GameState {
  if (!ROUTINE_ACTIVITIES.has(id) || s.dead) return s;

  pruneOldActivityUses(s);
  const key = useKey(s, id);
  const use = (s.world.repetitionLedger[key] ?? 0) + 1;
  s.world.repetitionLedger[key] = use;
  const multiplier = rewardMultiplier(use);
  if (multiplier >= 1) return s;

  // doActivity checks ambitions before returning. If this exact action has just
  // fulfilled the ambition that was active when it began, honour the moment in
  // full rather than trimming the state underneath an already-earned reward.
  const activeGoal = before.goalId ? goalById(before.goalId) : undefined;
  if (activeGoal?.done(s)) return s;

  const originalGold = s.gold;
  s.gold = trimPositiveGain(before.gold, s.gold, multiplier);
  const goldTrimmed = Math.max(0, originalGold - s.gold);
  if (goldTrimmed > 0) s.income = Math.max(before.income, s.income - goldTrimmed);

  s.rankProgress = trimPositiveGain(before.rankProgress, s.rankProgress, multiplier);
  s.reputation = trimPositiveGain(before.reputation, s.reputation, multiplier);

  (Object.keys(before.stats) as StatKey[]).forEach((keyName) => {
    s.stats[keyName] = trimPositiveGain(before.stats[keyName], s.stats[keyName], multiplier);
  });
  (Object.keys(before.paths) as PathKey[]).forEach((keyName) => {
    s.paths[keyName] = trimPositiveGain(before.paths[keyName], s.paths[keyName], multiplier);
  });
  s.holding.stores = trimPositiveGain(before.holding.stores, s.holding.stores, multiplier);
  s.holding.security = trimPositiveGain(before.holding.security, s.holding.security, multiplier);
  s.holding.loyalty = trimPositiveGain(before.holding.loyalty, s.holding.loyalty, multiplier);

  if (use === 3) {
    pushFeed(
      s,
      'FAMILIAR GROUND',
      C.amber,
      'The work still serves thee, but repetition has begun charging rent. A different use of the year may teach more.',
      'plain',
    );
  } else if (use === 5) {
    pushFeed(
      s,
      'VERY FAMILIAR GROUND',
      C.amber,
      'Even the village has noticed. Thou art becoming excellent at doing the same thing and less excellent at gaining from it.',
      'plain',
    );
  }

  return s;
}
