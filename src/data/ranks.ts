import { RankKey } from '@/types/game';

export interface RankDef {
  key: RankKey;
  short: string;
  portrait: string;
  /** Pro access is required to obtain this station through player routes. */
  premium?: boolean;
  /** Requirements for the next ordinary level; the Crown additionally needs legitimate succession. */
  promote?: {
    minAge: number;
    minGold?: number;
    stats?: Partial<Record<'health' | 'charm' | 'wits' | 'faith', number>>;
    /** rankProgress needed to be eligible (0..100). */
    progress: number;
  };
}

/** Sequential ordinary levels. Royal birth and lawful Crown succession remain exceptional. */
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
    promote: { minAge: 20, minGold: 120, progress: 100, stats: { charm: 72, wits: 58 } },
  },
  {
    key: 'Baron',
    short: 'BARON',
    portrait: '🏰',
    promote: { minAge: 30, minGold: 260, progress: 100, stats: { charm: 80, wits: 72 } },
    premium: true,
  },
  {
    key: 'Monarch',
    short: 'KING',
    portrait: '👑',
    promote: { minAge: 40, minGold: 420, progress: 100, stats: { charm: 90, wits: 85, faith: 60 } },
    premium: true,
  },
];

export function rankByKey(key: RankKey): number {
  return RANKS.findIndex((r) => r.key === key);
}

export function ranksForLifetime(unlocked: boolean): RankDef[] {
  return unlocked ? RANKS : RANKS.filter((r) => !r.premium);
}
