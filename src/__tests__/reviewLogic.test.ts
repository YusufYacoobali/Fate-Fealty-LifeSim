import {
  atFirstLifeMilestone,
  endsOnBadOutcome,
  entriesDelta,
  hasRecentGoodOutcome,
  REVIEW_ENTRY_THRESHOLD,
  REVIEW_FIRST_LIFE_AGE,
  REVIEW_MAX_PROMPTS,
  REVIEW_OUTCOME_LOOKBACK,
  REVIEW_PATIENCE_ENTRIES,
  REVIEW_REPROMPT_GAP,
  shouldPromptReview,
} from '@/services/reviewLogic';
import { DEFAULT_META } from '@/state/appMeta';
import { makeState } from './helpers';

function goodMomentState() {
  const s = makeState();
  s.feed = [{ id: 1, age: 5, tag: 'X', text: 'a fine day', tone: 'good' }];
  return s;
}

function badMomentState() {
  const s = goodMomentState();
  s.feed = [{ id: 1, age: 5, tag: 'X', text: 'a bad day', tone: 'bad', source: 'player' }];
  return s;
}

describe('reviewLogic.shouldPromptReview', () => {
  const ready = { ...DEFAULT_META, totalEntries: REVIEW_ENTRY_THRESHOLD };

  it('prompts at a good moment once the entry threshold is met', () => {
    expect(shouldPromptReview(ready, goodMomentState())).toBe(true);
  });

  it('does not prompt below the entry threshold', () => {
    expect(shouldPromptReview({ ...DEFAULT_META, totalEntries: REVIEW_ENTRY_THRESHOLD - 1 }, goodMomentState())).toBe(false);
  });

  it('stops once the lifetime ask limit is reached', () => {
    expect(shouldPromptReview({ ...ready, reviewPromptCount: REVIEW_MAX_PROMPTS }, goodMomentState())).toBe(false);
  });

  it('migrated one-shot saves still allow the second ask after the gap', () => {
    const shown = { ...DEFAULT_META, reviewPrompted: true, reviewPromptCount: 1, reviewLastEntry: 30 };

    expect(shouldPromptReview({ ...shown, totalEntries: 30 + REVIEW_REPROMPT_GAP - 1 }, goodMomentState())).toBe(false);
    expect(shouldPromptReview({ ...shown, totalEntries: 30 + REVIEW_REPROMPT_GAP }, goodMomentState())).toBe(true);
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

  it('waits through a negative player outcome while patience holds', () => {
    expect(shouldPromptReview(ready, badMomentState())).toBe(false);
  });

  it('guarantees the prompt once patience runs out, even after a bad beat', () => {
    const patient = { ...DEFAULT_META, totalEntries: REVIEW_ENTRY_THRESHOLD + REVIEW_PATIENCE_ENTRIES };
    const neutral = makeState();
    neutral.feed = [{ id: 1, age: 30, tag: 'HOUSEHOLD', text: 'Costs were paid.', tone: 'plain', source: 'player' }];

    expect(shouldPromptReview({ ...patient, totalEntries: patient.totalEntries - 1 }, neutral)).toBe(false);
    expect(shouldPromptReview(patient, neutral)).toBe(true);
    expect(shouldPromptReview(patient, badMomentState())).toBe(true);
  });
});

describe('reviewLogic first-life milestone', () => {
  const firstLife = { ...DEFAULT_META, firstLifeNo: 2 };

  function firstLifeState(age: number) {
    const s = makeState({ lifeNo: 2 });
    s.age = age;
    s.feed = [{ id: 1, age, tag: 'HOUSEHOLD', text: 'Costs were paid.', tone: 'plain', source: 'player' }];
    return s;
  }

  it('asks ten years in without waiting for the entry cadence', () => {
    expect(atFirstLifeMilestone(firstLife, firstLifeState(REVIEW_FIRST_LIFE_AGE))).toBe(true);
    expect(shouldPromptReview(firstLife, firstLifeState(REVIEW_FIRST_LIFE_AGE))).toBe(true);
  });

  it('does not ask before the milestone age', () => {
    expect(shouldPromptReview(firstLife, firstLifeState(REVIEW_FIRST_LIFE_AGE - 1))).toBe(false);
  });

  it('only counts the first life of the install', () => {
    const later = makeState({ lifeNo: 5 });
    later.age = 40;
    expect(atFirstLifeMilestone(firstLife, later)).toBe(false);
  });

  it('does not fire before the first life has been bound', () => {
    expect(atFirstLifeMilestone(DEFAULT_META, firstLifeState(40))).toBe(false);
  });

  it('is a first-ask door only, never the second', () => {
    const shown = { ...firstLife, reviewPromptCount: 1, reviewLastEntry: 0 };
    expect(shouldPromptReview(shown, firstLifeState(REVIEW_FIRST_LIFE_AGE))).toBe(false);
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
    expect(endsOnBadOutcome(s)).toBe(true);
  });

  it('does not reuse a positive outcome after it leaves the recent window', () => {
    const s = goodMomentState();
    for (let i = 0; i < REVIEW_OUTCOME_LOOKBACK; i += 1) {
      s.feed.push({ id: i + 2, age: 5, tag: 'TIME', text: 'Time passes.', tone: 'plain', source: 'player' });
    }

    expect(hasRecentGoodOutcome(s)).toBe(false);
    expect(endsOnBadOutcome(s)).toBe(false);
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
