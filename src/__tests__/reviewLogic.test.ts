import {
  entriesDelta,
  hasRecentGoodOutcome,
  REVIEW_ENTRY_THRESHOLD,
  REVIEW_OUTCOME_LOOKBACK,
  shouldPromptReview,
} from '@/services/reviewLogic';
import { DEFAULT_META } from '@/state/appMeta';
import { makeState } from './helpers';

function goodMomentState() {
  const s = makeState();
  s.feed = [{ id: 1, age: 5, tag: 'X', text: 'a fine day', tone: 'good' }];
  return s;
}

describe('reviewLogic.shouldPromptReview', () => {
  const ready = { ...DEFAULT_META, totalEntries: REVIEW_ENTRY_THRESHOLD };

  it('prompts at a good moment once the entry threshold is met', () => {
    expect(shouldPromptReview(ready, goodMomentState())).toBe(true);
  });

  it('does not prompt below the entry threshold', () => {
    expect(shouldPromptReview({ ...DEFAULT_META, totalEntries: 24 }, goodMomentState())).toBe(false);
  });

  it('does not prompt twice', () => {
    expect(shouldPromptReview({ ...ready, reviewPrompted: true }, goodMomentState())).toBe(false);
  });

  it('never interrupts death, an event, or settings', () => {
    const dead = goodMomentState();
    dead.dead = true;
    expect(shouldPromptReview(ready, dead)).toBe(false);

    const ev = goodMomentState();
    ev.pendingEvent = { eventId: 'x' };
    expect(shouldPromptReview(ready, ev)).toBe(false);

    const settings = goodMomentState();
    settings.settingsOpen = true;
    expect(shouldPromptReview(ready, settings)).toBe(false);
  });

  it('does not fire after a negative player outcome', () => {
    const sad = goodMomentState();
    sad.feed = [{ id: 1, age: 5, tag: 'X', text: 'a bad day', tone: 'bad' }];
    expect(shouldPromptReview(ready, sad)).toBe(false);
  });
});

describe('reviewLogic.hasRecentGoodOutcome', () => {
  it('keeps a good player outcome eligible through trailing neutral bookkeeping', () => {
    const s = goodMomentState();
    s.feed.push(
      { id: 2, age: 5, tag: 'HOUSEHOLD', text: 'Annual costs were paid.', tone: 'plain', source: 'player' },
      { id: 3, age: 5, tag: 'WORLD', text: 'A cooper changed jobs.', tone: 'plain', source: 'world' },
    );

    expect(hasRecentGoodOutcome(s)).toBe(true);
  });

  it('ignores unrelated NPC and world outcomes when judging the player moment', () => {
    const s = goodMomentState();
    s.feed.push(
      { id: 2, age: 5, tag: 'WORLD', text: 'Two villagers began a feud.', tone: 'bad', source: 'world' },
      { id: 3, age: 5, tag: 'BEREAVEMENT', text: 'A villager died.', tone: 'bad', source: 'npc' },
    );

    expect(hasRecentGoodOutcome(s)).toBe(true);
  });

  it('lets a later bad player outcome supersede an earlier success', () => {
    const s = goodMomentState();
    s.feed.push({ id: 2, age: 5, tag: 'CAUGHT', text: 'The guards caught you.', tone: 'bad', source: 'player' });

    expect(hasRecentGoodOutcome(s)).toBe(false);
  });

  it('does not reuse a positive outcome after it leaves the recent window', () => {
    const s = goodMomentState();
    for (let i = 0; i < REVIEW_OUTCOME_LOOKBACK; i += 1) {
      s.feed.push({ id: i + 2, age: 5, tag: 'TIME', text: 'Time passes.', tone: 'plain', source: 'player' });
    }

    expect(hasRecentGoodOutcome(s)).toBe(false);
  });

  it('treats source-less entries from old saves as player outcomes', () => {
    expect(hasRecentGoodOutcome(goodMomentState())).toBe(true);
  });
});

describe('reviewLogic.entriesDelta', () => {
  it('counts growth', () => expect(entriesDelta(3, 7)).toBe(4));
  it('counts a life reset as the new opening entries', () => expect(entriesDelta(40, 1)).toBe(1));
  it('counts no change as zero', () => expect(entriesDelta(5, 5)).toBe(0));
});
