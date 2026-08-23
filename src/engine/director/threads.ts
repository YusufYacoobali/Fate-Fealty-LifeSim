import { GameEvent, GameState } from '@/types/game';
import { EVENTS_BY_ID } from '@/content';
import { rnd } from '../random';

/**
 * A narrative thread the player has opened and not yet closed.
 *
 * Before this existed there were two ways for content to continue and only one
 * of them worked. A persistent story carried a `nextEligibleYear` and was
 * *served* when due. An ambient chain carried nothing: its next beat sat in the
 * same 216-event lottery as everything else and had to be drawn by luck, five
 * years apart, six times running. Measured over sixty lives, chains reached an
 * average depth of 2.4 and the seven-beat ones never finished once.
 *
 * A thread is the promise the game made when it opened a story. Threads are
 * scheduled, not drawn, so the promise gets kept.
 */
export interface Thread {
  /** Chain id, e.g. `stolen_chalice`. */
  id: string;
  /** Index of the beat that has already been shown, 0-based. */
  beatIndex: number;
  /** How many beats the thread has in total. */
  total: number;
  /** Earliest year the next beat may be served. */
  nextDueYear: number;
  /** Year the thread opened, for escalation and for the closing sweep. */
  openedYear: number;
  /** Actor bound at the opening beat, so a thread keeps its cast. */
  bindings?: Record<string, string>;
}

/** Beats sit this far apart: long enough to breathe, short enough to finish. */
export const MIN_BEAT_GAP = 3;
export const MAX_BEAT_GAP = 6;

/**
 * How many threads may be open at once.
 *
 * Uncapped, the director opens a new thread every time one is not due and the
 * player ends up with nine half-told stories and no sense that any of them is
 * about them. Three is enough to feel like a life and few enough to track.
 */
export const MAX_OPEN_THREADS = 3;

export function openThreads(state: GameState): Thread[] {
  return state.world.threads ?? [];
}

function setThreads(state: GameState, threads: Thread[]): void {
  state.world.threads = threads;
}

/**
 * Record that a chain beat was resolved: open the thread if this was its first
 * beat, advance it otherwise, and close it once the last beat is told.
 */
export function noteChainBeatResolved(state: GameState, event: GameEvent): void {
  const chain = event.chain;
  if (!chain) return;
  const threads = openThreads(state).filter((thread) => thread.id !== chain.id);
  const finished = chain.index + 1 >= chain.total;
  if (!finished) {
    threads.push({
      id: chain.id,
      beatIndex: chain.index,
      total: chain.total,
      nextDueYear: state.world.currentYear + rnd(MIN_BEAT_GAP, MAX_BEAT_GAP),
      openedYear: openThreads(state).find((thread) => thread.id === chain.id)?.openedYear ?? state.world.currentYear,
      bindings: state.pendingEvent?.bindings ?? undefined,
    });
  }
  setThreads(state, threads);
}

/** The event that continues `thread`, if it still exists in the registry. */
export function nextBeatOf(thread: Thread): GameEvent | null {
  return EVENTS_BY_ID[`quality_${thread.id}_${thread.beatIndex + 2}`] ?? null;
}

/**
 * Threads whose next beat is due, oldest promise first.
 *
 * Serving the longest-waiting thread rather than a random one keeps a player
 * from watching two threads leapfrog while a third never moves.
 */
export function dueThreads(state: GameState): Thread[] {
  return openThreads(state)
    .filter((thread) => thread.nextDueYear <= state.world.currentYear && nextBeatOf(thread))
    .sort((a, b) => a.nextDueYear - b.nextDueYear || a.openedYear - b.openedYear);
}

/**
 * Pull every remaining beat forward. Used when a life is near its end: an
 * unfinished thread is a broken promise, and the player is about to lose the
 * character it was about.
 */
export function hastenThreads(state: GameState): void {
  setThreads(state, openThreads(state).map((thread) => ({ ...thread, nextDueYear: Math.min(thread.nextDueYear, state.world.currentYear) })));
}

/** Threads are per-life; a new character inherits a world, not a plot. */
export function clearThreads(state: GameState): void {
  setThreads(state, []);
}
