import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyRewardProgress, DEFAULT_DAILY_REWARD } from '@/services/dailyRewards';

/**
 * App-level metadata that lives ACROSS individual lives (the per-life save is
 * separate). This is where we keep the cumulative entry counter that drives
 * engagement prompts and the flags that stop us nagging or double-scheduling.
 */
/** Lifetime aggregates accumulated across every life played. */
export interface LifetimeStats {
  livesLived: number;
  oldestAge: number;
  highestRankIdx: number;
  mostGold: number;
  totalChildren: number;
  bestLegacy: number;
  totalGoldEarned: number;
}

/** One entry in the Hall of Legends — a life that has run its course. */
export interface DynastyRecord {
  lifeNo: number;
  name: string;
  rank: string;
  age: number;
  cause: string;
  legacy: number;
  bornYear: number;
}

export const DEFAULT_STATS: LifetimeStats = {
  livesLived: 0,
  oldestAge: 0,
  highestRankIdx: 0,
  mostGold: 0,
  totalChildren: 0,
  bestLegacy: 0,
  totalGoldEarned: 0,
};

/** How many past lives to keep in the Hall of Legends. */
export const DYNASTY_CAP = 30;

export interface AppMeta {
  /** Cumulative life-feed entries the player has seen, across all lives. */
  totalEntries: number;
  /** Legacy one-shot flag; superseded by reviewPromptCount and kept for migration. */
  reviewPrompted: boolean;
  /** How many times the "are you enjoying it?" prompt has been shown. */
  reviewPromptCount: number;
  /** Cumulative entry position where the review prompt was last shown. */
  reviewLastEntry: number;
  /** Cumulative entry position where the recurring shop promo was last shown. */
  shopPromoLastEntry: number;
  /** Number of shop promos shown, used to rotate the playful message. */
  shopPromoCount: number;
  /** True once we've successfully scheduled the rolling reminder rotation. */
  notificationsScheduled: boolean;
  /** True if the user declined notification permission (don't keep asking). */
  notificationsDenied: boolean;
  /** True once the player has been through character creation at least once. */
  onboarded: boolean;
  /** True once the first-play guide has been dismissed. */
  tutorialSeen: boolean;
  /** Last confirmed RevenueCat entitlement, used only while the store is unavailable. */
  lifetimeUnlocked: boolean;
  /** lifeNo of the first life started on this install; null until it begins. */
  firstLifeNo: number | null;
  /** True once the free first-life Pro sample has been spent. */
  proTrialUsed: boolean;
  /** True once the "thy sample has ended" notice has been shown. */
  proTrialNoticeSeen: boolean;
  /** Lifetime statistics across all lives. */
  stats: LifetimeStats;
  /** Unlocked achievement ids. */
  achievements: string[];
  /** Hall of Legends — most-recent lives first. */
  dynasty: DynastyRecord[];
  /** Calendar-day reward state, stored outside any individual life. */
  dailyReward: DailyRewardProgress;
  /** Wall-clock activity markers for the contextual return hook. */
  lastActiveAt: number | null;
  lastRumourAt: number | null;
}

export const DEFAULT_META: AppMeta = {
  totalEntries: 0,
  reviewPrompted: false,
  reviewPromptCount: 0,
  reviewLastEntry: 0,
  shopPromoLastEntry: 0,
  shopPromoCount: 0,
  notificationsScheduled: false,
  notificationsDenied: false,
  onboarded: false,
  tutorialSeen: false,
  lifetimeUnlocked: false,
  firstLifeNo: null,
  proTrialUsed: false,
  proTrialNoticeSeen: false,
  stats: DEFAULT_STATS,
  achievements: [],
  dynasty: [],
  dailyReward: DEFAULT_DAILY_REWARD,
  lastActiveAt: null,
  lastRumourAt: null,
};

const META_KEY = 'mls:meta:v1';

/**
 * Fold a persisted record into the current shape. Pure, so the migrations below
 * can be tested without touching AsyncStorage.
 */
export function migrateMeta(parsed: Partial<AppMeta>): AppMeta {
  // The review ask used to be a single boolean. Carry it over as one shown ask
  // so upgrading players are not immediately asked again.
  const reviewPromptCount = parsed.reviewPromptCount ?? (parsed.reviewPrompted ? 1 : 0);

  // The free first-life sample is for FRESH installs. Anyone already playing
  // when it shipped has had their first life; mark the sample spent.
  const proTrialUsed = parsed.proTrialUsed ?? Boolean(parsed.onboarded);

  return {
    ...DEFAULT_META,
    ...parsed,
    lifetimeUnlocked: parsed.lifetimeUnlocked ?? false,
    reviewPromptCount,
    reviewLastEntry: parsed.reviewLastEntry ?? (reviewPromptCount > 0 ? parsed.totalEntries ?? 0 : 0),
    proTrialUsed,
    proTrialNoticeSeen: parsed.proTrialNoticeSeen ?? proTrialUsed,
    stats: { ...DEFAULT_STATS, ...(parsed.stats ?? {}) },
    dailyReward: { ...DEFAULT_DAILY_REWARD, ...(parsed.dailyReward ?? {}) },
    achievements: parsed.achievements ?? [],
    dynasty: parsed.dynasty ?? [],
  };
}

export async function loadMeta(): Promise<AppMeta> {
  try {
    const raw = await AsyncStorage.getItem(META_KEY);
    if (!raw) return { ...DEFAULT_META };
    return migrateMeta(JSON.parse(raw) as Partial<AppMeta>);
  } catch {
    return { ...DEFAULT_META };
  }
}

export async function saveMeta(meta: AppMeta): Promise<void> {
  try {
    await AsyncStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {
    // best-effort
  }
}
