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

/**
 * Outcomes often arrive in a small batch: a success can be followed by a
 * neutral economy line or an unrelated world update. Looking only at the final
 * row made those genuine successes invisible to the review gate.
 */
export const REVIEW_OUTCOME_LOOKBACK = 6;

export function hasRecentGoodOutcome(state: GameState): boolean {
  const recent = state.feed.slice(-REVIEW_OUTCOME_LOOKBACK);

  // Old saves predate source attribution, so an absent source is a player beat.
  // Neutral lines and autonomous NPC/world news do not overwrite the player's
  // latest meaningful result. A later bad player result does.
  for (let i = recent.length - 1; i >= 0; i -= 1) {
    const entry = recent[i];
    if (entry.source === 'npc' || entry.source === 'world') continue;
    if (entry.tone === 'plain') continue;
    return entry.tone === 'good';
  }

  return false;
}

export function shouldPromptReview(meta: AppMeta, state: GameState): boolean {
  if (meta.reviewPrompted) return false;
  if (meta.totalEntries < REVIEW_ENTRY_THRESHOLD) return false;

  // Never interrupt another overlay or a sombre moment.
  if (state.dead || state.event || state.settingsOpen) return false;

  return hasRecentGoodOutcome(state);
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
