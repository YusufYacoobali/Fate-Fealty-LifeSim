import { GameState, TraitDef } from '@/types/game';

/**
 * Trait registry. Birth traits shape who you start as; acquired traits are the
 * reputation you build through a lifetime of choices. Kept as pure data (no
 * engine imports) so new traits are a one-line addition (Open/Closed).
 */

const memCount = (s: GameState, tag: string): number => s.memories.filter((m) => m.tag === tag).length;

const BIRTH_TRAITS: TraitDef[] = [
  { id: 'sickly', name: 'Sickly', emoji: '🤒', kind: 'birth', blurb: 'Frail from the first breath; the years weigh heavy.', startStats: { health: -15 }, agingMultiplier: 1.4 },
  { id: 'hale', name: 'Hale & Hearty', emoji: '💪', kind: 'birth', blurb: 'Built like an ox and ages like fine oak.', startStats: { health: 12 }, agingMultiplier: 0.8 },
  { id: 'silver_tongue', name: 'Silver-Tongued', emoji: '🗣️', kind: 'birth', blurb: 'Could talk a bishop out of his hat.', startStats: { charm: 12 } },
  { id: 'dullard', name: 'Dullard', emoji: '🪨', kind: 'birth', blurb: 'Not the sharpest scythe in the barn, but well-liked.', startStats: { wits: -10, charm: 4 } },
  { id: 'bookish', name: 'Bookish', emoji: '📖', kind: 'birth', blurb: 'Reads, ciphers, and knows what a zero is.', startStats: { wits: 12 } },
  { id: 'pious', name: 'Pious', emoji: '🙏', kind: 'birth', blurb: 'Born with a prayer already on the lips.', startStats: { faith: 12 } },
  { id: 'heathen', name: 'Heathen', emoji: '😈', kind: 'birth', blurb: 'Skips chapel, questions everything, sleeps fine.', startStats: { faith: -12, wits: 5 } },
  { id: 'lucky', name: 'Born Lucky', emoji: '🍀', kind: 'birth', blurb: 'Fortune simply favours you, and it shows.', rollBonus: 0.08 },
  { id: 'ill_starred', name: 'Ill-Starred', emoji: '🌑', kind: 'birth', blurb: 'The stars were wrong the night you were born.', rollBonus: -0.06, startStats: { faith: 4 } },
  { id: 'comely', name: 'Comely', emoji: '🌹', kind: 'birth', blurb: 'Fair of face, if not of fortune.', startStats: { charm: 8, wits: -2 } },
];

const ACQUIRED_TRAITS: TraitDef[] = [
  { id: 'war_hero', name: 'War Hero', emoji: '🎖️', kind: 'acquired', blurb: 'Stood firm when braver folk fled the field.', earnedWhen: (s) => memCount(s, 'war_hero') > 0 },
  { id: 'living_saint', name: 'Living Saint', emoji: '✨', kind: 'acquired', blurb: 'The people whisper of miracles in your wake.', earnedWhen: (s) => memCount(s, 'living_saint') > 0 || memCount(s, 'plague_saint') > 0 },
  { id: 'notorious_outlaw', name: 'Notorious Outlaw', emoji: '🗡️', kind: 'acquired', blurb: 'Your name is spat in three counties.', earnedWhen: (s) => memCount(s, 'bandit') >= 2 || s.reputation <= -30 },
  { id: 'kingmaker', name: 'Kingmaker', emoji: '👑', kind: 'acquired', blurb: 'Thrones have risen and fallen at your word.', earnedWhen: (s) => memCount(s, 'kingmaker') > 0 },
  { id: 'devoted_parent', name: 'Devoted Parent', emoji: '👨‍👧', kind: 'acquired', blurb: 'Your line will remember your name fondly.', earnedWhen: (s) => s.kin.some((k) => k.kind === 'child' && k.alive) },
  { id: 'plague_touched', name: 'Plague-Touched', emoji: '☣️', kind: 'acquired', blurb: 'Looked the Pestilence in the eye and lived.', earnedWhen: (s) => s.tags.includes('plague_survivor') },
];

export const TRAITS: TraitDef[] = [...BIRTH_TRAITS, ...ACQUIRED_TRAITS];

const BY_ID: Record<string, TraitDef> = TRAITS.reduce(
  (acc, t) => {
    acc[t.id] = t;
    return acc;
  },
  {} as Record<string, TraitDef>,
);

export function traitById(id: string): TraitDef | undefined {
  return BY_ID[id];
}

export function birthTraits(): TraitDef[] {
  return BIRTH_TRAITS;
}

export function acquiredTraits(): TraitDef[] {
  return ACQUIRED_TRAITS;
}

// Re-exported so the trait engine can reference the predicate signature.
export type { GameState };
