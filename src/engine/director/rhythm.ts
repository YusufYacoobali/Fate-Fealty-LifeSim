import { GameState } from '@/types/game';
import { chance, rnd } from '../random';

/**
 * What kind of year this is going to be.
 *
 * The old director asked one question — "is a story beat due, and if not, roll
 * 0.34 for a random event" — which produced a flat, memoryless sequence. A year
 * felt the same at eighteen as at sixty, nothing built, and nothing was ever
 * owed to the player. This decides the *shape* of the year first and only then
 * looks for content to fill it.
 */
export type BeatKind =
  /** Continue something already open. The spine of the whole thing. */
  | 'thread'
  /** Open something new. */
  | 'opening'
  /** A one-off with no strings. Texture, and a rest from consequence. */
  | 'standalone'
  /** A deliberate good year: the payout on the variable-ratio schedule. */
  | 'reward'
  /** Nothing happens. Rare, and never twice running. */
  | 'quiet';

/**
 * Engagement rules, stated as numbers so they can be tested rather than argued
 * about. Each exists because the unshaped version of it measurably hurt.
 */
export const RHYTHM = {
  /** Never two dead years in a row. Boredom is the only unrecoverable state. */
  MAX_QUIET_RUN: 1,
  /** Never more than this many thread beats back to back, or it reads as a queue. */
  MAX_THREAD_RUN: 2,
  /** A reward lands on average this often, but never on a fixed count. */
  REWARD_MEAN_GAP: 4,
  /** The window the reward actually falls in — the variance is the point. */
  REWARD_MIN_GAP: 2,
  REWARD_MAX_GAP: 7,
  /** Below this age the world is still small; keep it gentle. */
  CHILDHOOD_UNTIL: 12,
  /** Inside this many years of the expected end, close every open thread. */
  CLOSING_WINDOW: 8,
} as const;

export interface RhythmState {
  quietRun: number;
  threadRun: number;
  yearsSinceReward: number;
  nextRewardAt: number;
}

export function readRhythm(state: GameState): RhythmState {
  const pacing = state.world.pacing;
  return {
    quietRun: pacing.quietRun ?? 0,
    threadRun: pacing.storyBeatsInARow ?? 0,
    yearsSinceReward: pacing.yearsSinceReward ?? 0,
    nextRewardAt: pacing.nextRewardAt ?? rnd(RHYTHM.REWARD_MIN_GAP, RHYTHM.REWARD_MAX_GAP),
  };
}

/**
 * Roll the next reward interval.
 *
 * Deliberately variable rather than every-N. A fixed schedule is learnable, and
 * a learnable reward stops being a reward — the player starts counting instead
 * of playing. The mean is what balance is tuned against; the spread is what
 * keeps the next year worth seeing.
 */
export function rollNextRewardGap(): number {
  const a = rnd(RHYTHM.REWARD_MIN_GAP, RHYTHM.REWARD_MAX_GAP);
  const b = rnd(RHYTHM.REWARD_MIN_GAP, RHYTHM.REWARD_MAX_GAP);
  // Two dice rather than one: clusters toward the mean, keeps the long tail.
  return Math.round((a + b) / 2);
}

/**
 * How urgently the player is owed something good.
 *
 * Runs at 0 for a while and then climbs hard. This is what stops a genuinely
 * bad run of luck from becoming the reason somebody puts the game down.
 */
export function rewardPressure(rhythm: RhythmState): number {
  const overdue = rhythm.yearsSinceReward - rhythm.nextRewardAt;
  if (overdue < 0) return 0;
  return Math.min(1, 0.35 + overdue * 0.25);
}

/**
 * Choose the shape of this year.
 *
 * Order matters: hard guarantees first, then the reward schedule, then the
 * ordinary preference for continuing over starting, and only then the fallback.
 */
export function chooseBeatKind(
  state: GameState,
  options: { hasDueThread: boolean; canOpen: boolean; nearingEnd: boolean },
): BeatKind {
  const rhythm = readRhythm(state);

  // A life closing out owes the player its endings before anything else.
  if (options.nearingEnd && options.hasDueThread) return 'thread';

  // Guarantee: never two silent years running.
  const mustAct = rhythm.quietRun >= RHYTHM.MAX_QUIET_RUN;

  // The dopamine beat. Fires on a variable schedule, and the longer it is
  // overdue the harder it pulls, so a cold streak self-corrects.
  if (chance(rewardPressure(rhythm))) return 'reward';

  // Hard release valve, and it has to come before every other thread branch.
  // With the slots full there is nearly always a beat due, so an unguarded
  // "serve a thread if one is waiting" fallback further down turned whole lives
  // into an unbroken queue of chapters — measured at fifty-six in a row.
  if (rhythm.threadRun >= RHYTHM.MAX_THREAD_RUN) {
    return options.canOpen && state.age >= RHYTHM.CHILDHOOD_UNTIL && chance(0.4) ? 'opening' : 'standalone';
  }

  // Continuing beats starting, but only up to the cap above.
  if (options.hasDueThread) return 'thread';

  if (options.canOpen && state.age >= RHYTHM.CHILDHOOD_UNTIL) {
    // Opening is likelier when little is in flight, so the board refills.
    if (chance(mustAct ? 0.75 : 0.45)) return 'opening';
  }

  if (mustAct) return 'standalone';
  return chance(0.62) ? 'standalone' : 'quiet';
}

/** Fold this year's outcome back into the rhythm counters. */
export function recordBeat(state: GameState, kind: BeatKind): void {
  const pacing = state.world.pacing;
  pacing.quietRun = kind === 'quiet' ? (pacing.quietRun ?? 0) + 1 : 0;
  pacing.storyBeatsInARow = kind === 'thread' ? (pacing.storyBeatsInARow ?? 0) + 1 : 0;
  if (kind === 'reward') {
    pacing.yearsSinceReward = 0;
    pacing.nextRewardAt = rollNextRewardGap();
  } else {
    pacing.yearsSinceReward = (pacing.yearsSinceReward ?? 0) + 1;
  }
}
