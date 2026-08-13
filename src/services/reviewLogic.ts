import type { AppMeta } from '@/state/appMeta';
import type { GameState } from '@/types/game';

/**
 * PURE decision logic for the review prompt, kept free of any native imports so
 * it can be unit-tested in plain Node.
 *
 * Two doors lead to the ask:
 *  1. Ten years into the very first life — the player has seen enough of the
 *     game to have an opinion, and this is the warmest moment we ever get.
 *  2. A good moment once enough cumulative entries have been seen, with a
 *     hard deadline so a run of bleak luck cannot suppress the ask forever.
 */
/** Earliest cadence point: a positive beat can open the prompt from here. */
export const REVIEW_ENTRY_THRESHOLD = 20;

/**
 * Outcomes often arrive in a small batch: a success can be followed by a
 * neutral economy line or an unrelated world update. Looking only at the final
 * row made those genuine successes invisible to the review gate.
 */
export const REVIEW_OUTCOME_LOOKBACK = 20;

/**
 * How far past a cadence point we keep waiting for a positive beat before the
 * hard deadline opens the gate. Without this the ask could sit closed forever.
 */
/** Hard deadline: the prompt is guaranteed within ten further entries. */
export const REVIEW_PATIENCE_ENTRIES = 10;

/** Age reached in the first life that earns the early ask. */
export const REVIEW_FIRST_LIFE_AGE = 10;

/** Total asks allowed over the lifetime of the install. */
export const REVIEW_MAX_PROMPTS = 2;

/** Cumulative entries that must pass between the first ask and the second. */
export const REVIEW_REPROMPT_GAP = 20;

/** The most recent entry the player can read as "something I did". */
function latestPlayerOutcome(state: GameState) {
  const recent = state.feed.slice(-REVIEW_OUTCOME_LOOKBACK);

  // Old saves predate source attribution, so an absent source is a player beat.
  // Neutral lines and autonomous NPC/world news do not overwrite the player's
  // latest meaningful result.
  for (let i = recent.length - 1; i >= 0; i -= 1) {
    const entry = recent[i];
    if (entry.source === 'npc' || entry.source === 'world') continue;
    if (entry.tone === 'plain') continue;
    return entry;
  }

  return null;
}

export function hasRecentGoodOutcome(state: GameState): boolean {
  return latestPlayerOutcome(state)?.tone === 'good';
}

/** True when the player's most recent meaningful result went badly. */
export function endsOnBadOutcome(state: GameState): boolean {
  return latestPlayerOutcome(state)?.tone === 'bad';
}

/** No overlay, no death screen, no sombre moment to interrupt. */
function screenIsClear(state: GameState): boolean {
  return !state.dead && !state.pendingEvent && !state.settingsOpen;
}

/**
 * The first life is the one moment we know the player is still exploring rather
 * than grinding. Ten years in they have aged up repeatedly and chosen to stay.
 */
export function atFirstLifeMilestone(meta: AppMeta, state: GameState): boolean {
  return meta.firstLifeNo != null && state.lifeNo === meta.firstLifeNo && state.age >= REVIEW_FIRST_LIFE_AGE;
}

/** Cumulative entry count at which the current ask stops waiting for a good beat. */
function patienceLimit(meta: AppMeta): number {
  return meta.reviewPromptCount === 0
    ? REVIEW_ENTRY_THRESHOLD + REVIEW_PATIENCE_ENTRIES
    : meta.reviewLastEntry + REVIEW_REPROMPT_GAP + REVIEW_PATIENCE_ENTRIES;
}

export function shouldPromptReview(meta: AppMeta, state: GameState): boolean {
  if (meta.reviewPromptCount >= REVIEW_MAX_PROMPTS) return false;
  if (!screenIsClear(state)) return false;

  // Door 1: the first-life milestone, which needs no other qualification.
  if (meta.reviewPromptCount === 0 && atFirstLifeMilestone(meta, state)) return true;

  // Door 2: the cumulative cadence. The first ask waits for the entry
  // threshold; later asks wait for a gap since the previous ask.
  const due = meta.reviewPromptCount === 0
    ? meta.totalEntries >= REVIEW_ENTRY_THRESHOLD
    : meta.totalEntries - meta.reviewLastEntry >= REVIEW_REPROMPT_GAP;
  if (!due) return false;

  if (hasRecentGoodOutcome(state)) return true;

  // Patience expired: the clear-screen check is the only remaining gate. A
  // bleak run must not postpone the prompt forever.
  return meta.totalEntries >= patienceLimit(meta);
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
