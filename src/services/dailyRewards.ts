export type DailyRewardBonus = 'health' | 'stores' | 'reputation';

export interface DailyRewardDefinition {
  day: number;
  gold: number;
  bonus?: DailyRewardBonus;
  bonusAmount?: number;
  label: string;
}

export interface DailyRewardProgress {
  lastClaimDate: string | null;
  streak: number;
  longestStreak: number;
  totalClaims: number;
  /** One missed calendar day can be protected; restored after day seven. */
  graceAvailable: boolean;
}

export const DEFAULT_DAILY_REWARD: DailyRewardProgress = {
  lastClaimDate: null,
  streak: 0,
  longestStreak: 0,
  totalClaims: 0,
  graceAvailable: true,
};

export const DAILY_REWARDS: DailyRewardDefinition[] = [
  { day: 1, gold: 5, label: 'A purse of pennies' },
  { day: 2, gold: 7, label: 'Market coin' },
  { day: 3, gold: 8, bonus: 'health', bonusAmount: 3, label: 'Bread and restorative herbs' },
  { day: 4, gold: 10, label: 'The steward\'s share' },
  { day: 5, gold: 12, bonus: 'stores', bonusAmount: 5, label: 'Coin and household grain' },
  { day: 6, gold: 14, label: 'A well-filled purse' },
  { day: 7, gold: 20, bonus: 'reputation', bonusAmount: 3, label: 'The village bounty' },
];

export interface DailyRewardStatus {
  eligible: boolean;
  dateKey: string;
  nextStreak: number;
  cycleDay: number;
  usedGrace: boolean;
  reward: DailyRewardDefinition;
}

export function localDateKey(now: Date | number = new Date()): string {
  const date = typeof now === 'number' ? new Date(now) : now;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateOrdinal(key: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const value = Date.UTC(year, month - 1, day) / 86_400_000;
  return Number.isFinite(value) ? value : null;
}

/** Pure eligibility calculation: it never advances gameplay time or RNG. */
export function evaluateDailyReward(progress: DailyRewardProgress, now: Date | number = new Date()): DailyRewardStatus {
  const dateKey = localDateKey(now);
  const today = dateOrdinal(dateKey) ?? 0;
  const previous = progress.lastClaimDate ? dateOrdinal(progress.lastClaimDate) : null;
  const difference = previous == null ? null : today - previous;
  // A clock moving backwards must not create another claim for an earlier day.
  const eligible = previous == null || (difference != null && difference > 0);
  const usedGrace = eligible && difference === 2 && progress.graceAvailable;
  const continues = difference === 1 || usedGrace;
  const nextStreak = eligible ? (continues ? Math.max(0, progress.streak) + 1 : 1) : Math.max(1, progress.streak);
  const cycleDay = ((nextStreak - 1) % DAILY_REWARDS.length) + 1;
  return { eligible, dateKey, nextStreak, cycleDay, usedGrace, reward: DAILY_REWARDS[cycleDay - 1] };
}

export function progressAfterClaim(progress: DailyRewardProgress, status: DailyRewardStatus): DailyRewardProgress {
  if (!status.eligible) return progress;
  return {
    lastClaimDate: status.dateKey,
    streak: status.nextStreak,
    longestStreak: Math.max(progress.longestStreak, status.nextStreak),
    totalClaims: progress.totalClaims + 1,
    graceAvailable: status.cycleDay === DAILY_REWARDS.length ? true : status.usedGrace ? false : progress.graceAvailable,
  };
}
