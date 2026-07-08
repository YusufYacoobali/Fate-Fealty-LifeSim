import { RankKey } from '@/types/game';

export interface RankDef {
  key: RankKey;
  short: string;
  portrait: string;
  /** Lifetime Pass rank; free players stop before this. */
  premium?: boolean;
  /** Hidden requirements for promotion INTO this rank (checked against state). */
  promote: {
    minAge: number;
    minGold?: number;
    stats?: Partial<Record<'health' | 'charm' | 'wits' | 'faith', number>>;
    /** rankProgress needed to be eligible (0..100). */
    progress: number;
  };
}

/**
 * The visible class ladder. Free players climb PEASANT -> SQUIRE -> KNIGHT -> NOBLE.
 * Lifetime Pass owners can keep going to BARON -> MONARCH.
 * Promotion is driven by hidden rankProgress + gating requirements.
 */
export const RANKS: RankDef[] = [
  {
    key: 'Peasant',
    short: 'PEASANT',
    portrait: '🧑‍🌾',
    promote: { minAge: 0, progress: 0 },
  },
  {
    key: 'Squire',
    short: 'SQUIRE',
    portrait: '🧒',
    promote: { minAge: 12, progress: 100, stats: { wits: 40 } },
  },
  {
    key: 'Knight',
    short: 'KNIGHT',
    portrait: '🛡️',
    promote: { minAge: 16, progress: 100, stats: { wits: 52, charm: 46 } },
  },
  {
    key: 'Noble',
    short: 'NOBLE',
    portrait: '👑',
    promote: { minAge: 20, minGold: 60, progress: 100, stats: { charm: 58 } },
  },
  {
    key: 'Baron',
    short: 'BARON',
    portrait: 'B',
    premium: true,
    promote: { minAge: 28, minGold: 140, progress: 100, stats: { charm: 70, wits: 62 } },
  },
  {
    key: 'Monarch',
    short: 'KING',
    portrait: 'M',
    premium: true,
    promote: { minAge: 35, minGold: 240, progress: 100, stats: { charm: 82, wits: 74, faith: 55 } },
  },
];

export function rankByKey(key: RankKey): number {
  return RANKS.findIndex((r) => r.key === key);
}

export function ranksForLifetime(unlocked: boolean): RankDef[] {
  return unlocked ? RANKS : RANKS.filter((r) => !r.premium);
}
