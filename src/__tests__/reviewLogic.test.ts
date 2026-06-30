import { entriesDelta, REVIEW_ENTRY_THRESHOLD, shouldPromptReview } from '@/services/reviewLogic';
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
    ev.event = { id: 'x', category: 'peasant', title: 't', text: 't', choices: [] };
    expect(shouldPromptReview(ready, ev)).toBe(false);

    const settings = goodMomentState();
    settings.settingsOpen = true;
    expect(shouldPromptReview(ready, settings)).toBe(false);
  });

  it('only fires on a positive last entry', () => {
    const sad = goodMomentState();
    sad.feed = [{ id: 1, age: 5, tag: 'X', text: 'a bad day', tone: 'bad' }];
    expect(shouldPromptReview(ready, sad)).toBe(false);
  });
});

describe('reviewLogic.entriesDelta', () => {
  it('counts growth', () => expect(entriesDelta(3, 7)).toBe(4));
  it('counts a life reset as the new opening entries', () => expect(entriesDelta(40, 1)).toBe(1));
  it('counts no change as zero', () => expect(entriesDelta(5, 5)).toBe(0));
});
