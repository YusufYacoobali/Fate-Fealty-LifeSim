import { RankKey } from '@/types/game';

export interface RankDef {
  key: RankKey;
  short: string;
  portrait: string;
  /** Pro access is required to obtain this station through player routes. */
  premium?: boolean;
  /** Only ordinary military honours use these thresholds. Land and Crown use explicit grants/succession. */
  promote?: {
    minAge: number;
    minGold?: number;
    stats?: Partial<Record<'health' | 'charm' | 'wits' | 'faith', number>>;
    /** rankProgress needed to be eligible (0..100). */
    progress: number;
  };
}

/** Compatibility display order, not a compulsory Commoner-to-Crown ladder. */
export const RANKS: RankDef[] = [
  {
    key: 'Peasant',
    short: 'PEASANT',
    portrait: '🧑‍🌾',
  },
  {
    key: 'Squire',
    short: 'SQUIRE',
    portrait: '🧒',
    promote: { minAge: 12, progress: 100, stats: { wits: 48 } },
  },
  {
    key: 'Knight',
    short: 'KNIGHT',
    portrait: '🛡️',
    promote: { minAge: 15, progress: 100, stats: { wits: 64, charm: 56 } },
  },
  {
    key: 'Noble',
    short: 'NOBLE',
    portrait: '👑',
  },
  {
    key: 'Baron',
    short: 'BARON',
    portrait: '🏰',
    premium: true,
  },
  {
    key: 'Monarch',
    short: 'KING',
    portrait: '👑',
    premium: true,
  },
];

export function rankByKey(key: RankKey): number {
  return RANKS.findIndex((r) => r.key === key);
}

export function ranksForLifetime(unlocked: boolean): RankDef[] {
  return unlocked ? RANKS : RANKS.filter((r) => !r.premium);
}
