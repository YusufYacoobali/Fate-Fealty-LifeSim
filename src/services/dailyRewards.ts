export type DailyRewardBonus = 'health' | 'stores' | 'reputation';

export interface DailyRewardDefinition {
  day: number;
  gold: number;
  bonus?: DailyRewardBonus;
  bonusAmount?: number;
  /** A unique, permanent possession awarded by a milestone chest. */
  itemId?: string;
  label: string;
}

export interface DailyRewardProgress {
  lastClaimDate: string | null;
  streak: number;
  longestStreak: number;
  totalClaims: number;
  /** One missed calendar day can be protected; restored after a full cycle. */
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
  { day: 2, gold: 10, label: 'Market coin' },
  { day: 3, gold: 20, bonus: 'health', bonusAmount: 5, label: 'Bread and restorative herbs' },
  { day: 4, gold: 35, label: 'The steward\'s share' },
  { day: 5, gold: 50, bonus: 'stores', bonusAmount: 10, label: 'Coin and household grain' },
  { day: 6, gold: 75, label: 'A well-filled purse' },
  { day: 7, gold: 125, bonus: 'reputation', bonusAmount: 10, itemId: 'stewards_signet', label: 'The village bounty chest' },
  { day: 8, gold: 150, label: 'A weighty purse' },
  { day: 9, gold: 200, label: 'Market-day takings' },
  { day: 10, gold: 275, bonus: 'health', bonusAmount: 20, label: 'A healing allowance' },
  { day: 11, gold: 350, label: 'The reeve\'s reward' },
  { day: 12, gold: 425, bonus: 'stores', bonusAmount: 50, label: 'A prosperous household' },
  { day: 13, gold: 500, label: 'The steward\'s strongbox' },
  { day: 14, gold: 1000, bonus: 'reputation', bonusAmount: 25, itemId: 'kings_charter', label: 'The royal bounty chest' },
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
