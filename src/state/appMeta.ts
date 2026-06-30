import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * App-level metadata that lives ACROSS individual lives (the per-life save is
 * separate). This is where we keep the cumulative entry counter that drives the
 * review prompt and the flags that stop us nagging or double-scheduling.
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
  /** True once we've shown the "are you enjoying it?" prompt (shown at most once). */
  reviewPrompted: boolean;
  /** True once we've scheduled the recurring reminder. */
  notificationsScheduled: boolean;
  /** True if the user declined notification permission (don't keep asking). */
  notificationsDenied: boolean;
  /** True once the player has been through character creation at least once. */
  onboarded: boolean;
  /** True once the first-play guide has been dismissed. */
  tutorialSeen: boolean;
  /** Lifetime statistics across all lives. */
  stats: LifetimeStats;
  /** Unlocked achievement ids. */
  achievements: string[];
  /** Hall of Legends — most-recent lives first. */
  dynasty: DynastyRecord[];
}

export const DEFAULT_META: AppMeta = {
  totalEntries: 0,
  reviewPrompted: false,
  notificationsScheduled: false,
  notificationsDenied: false,
  onboarded: false,
  tutorialSeen: false,
  stats: DEFAULT_STATS,
  achievements: [],
  dynasty: [],
};

const META_KEY = 'mls:meta:v1';

export async function loadMeta(): Promise<AppMeta> {
  try {
    const raw = await AsyncStorage.getItem(META_KEY);
    if (!raw) return { ...DEFAULT_META };
    const parsed = JSON.parse(raw) as Partial<AppMeta>;
    return {
      ...DEFAULT_META,
      ...parsed,
      stats: { ...DEFAULT_STATS, ...(parsed.stats ?? {}) },
      achievements: parsed.achievements ?? [],
      dynasty: parsed.dynasty ?? [],
    };
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
