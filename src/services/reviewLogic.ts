import type { AppMeta } from '@/state/appMeta';
import type { GameState } from '@/types/game';

/**
 * PURE decision logic for the review prompt, kept free of any native imports so
 * it can be unit-tested in plain Node.
 *
 * Rule: after the player has seen at least 25 life entries (cumulative), and at
 * a GOOD MOMENT — a positive beat with no other popup, settings, or death
 * screen in the way — ask once whether they're enjoying it.
 */
export const REVIEW_ENTRY_THRESHOLD = 25;

export function shouldPromptReview(meta: AppMeta, state: GameState): boolean {
  if (meta.reviewPrompted) return false;
  if (meta.totalEntries < REVIEW_ENTRY_THRESHOLD) return false;

  // Never interrupt another overlay or a sombre moment.
  if (state.dead || state.event || state.settingsOpen) return false;

  // "A good moment": the most recent entry is a positive one.
  const last = state.feed[state.feed.length - 1];
  return !!last && last.tone === 'good';
}

/**
 * Count how many new feed entries appeared between two feed lengths. On a life
 * reset the feed shrinks; we count the fresh "born" entry so the cumulative
 * total keeps climbing rather than going backwards.
 */
export function entriesDelta(prevLen: number, nextLen: number): number {
  if (nextLen > prevLen) return nextLen - prevLen;
  if (nextLen < prevLen) return nextLen; // reset: count the new life's opening entries
  return 0;
}
