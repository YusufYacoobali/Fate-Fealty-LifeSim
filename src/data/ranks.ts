import { RankKey } from '@/types/game';

export interface RankDef {
  key: RankKey;
  short: string;
  portrait: string;
  /** Premium rank; free players stop before this. */
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
 * Premium owners can keep going to BARON -> MONARCH.
 * Promotion is driven by hidden rankProgress plus strict gating requirements.
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
    promote: { minAge: 14, progress: 100, stats: { wits: 48 } },
  },
  {
    key: 'Knight',
    short: 'KNIGHT',
    portrait: '🛡️',
    promote: { minAge: 20, progress: 100, stats: { wits: 64, charm: 56 } },
  },
  {
    key: 'Noble',
    short: 'NOBLE',
    portrait: '👑',
    promote: { minAge: 28, minGold: 120, progress: 100, stats: { charm: 72, wits: 58 } },
  },
  {
    key: 'Baron',
    short: 'BARON',
    portrait: '🏰',
    premium: true,
    promote: { minAge: 38, minGold: 260, progress: 100, stats: { charm: 84, wits: 76 } },
  },
  {
    key: 'Monarch',
    short: 'KING',
    portrait: '👑',
    premium: true,
    promote: { minAge: 50, minGold: 420, progress: 100, stats: { charm: 92, wits: 88, faith: 68 } },
  },
];

export function rankByKey(key: RankKey): number {
  return RANKS.findIndex((r) => r.key === key);
}

export function ranksForLifetime(unlocked: boolean): RankDef[] {
  return unlocked ? RANKS : RANKS.filter((r) => !r.premium);
}
