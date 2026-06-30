import { isChoiceEnabled, meetsCondition, pickEvent } from '@/engine/eventPicker';
import { Choice } from '@/types/game';
import { makeState } from './helpers';

describe('eventPicker.meetsCondition', () => {
  it('checks age, gold, rank, stats, tags, reputation and paths', () => {
    const s = makeState({ age: 18, gold: 30, rankIdx: 1, reputation: 10 });
    s.tags = ['married'];
    s.paths = { martial: 10, court: 0, church: 0, labour: 0, outlaw: 0 };

    expect(meetsCondition(s, { minAge: 16, maxAge: 40 })).toBe(true);
    expect(meetsCondition(s, { minAge: 20 })).toBe(false);
    expect(meetsCondition(s, { minGold: 50 })).toBe(false);
    expect(meetsCondition(s, { rankAtLeast: 1 })).toBe(true);
    expect(meetsCondition(s, { rankAtMost: 0 })).toBe(false);
    expect(meetsCondition(s, { statAtLeast: { charm: 40 } })).toBe(true);
    expect(meetsCondition(s, { statAtMost: { charm: 10 } })).toBe(false);
    expect(meetsCondition(s, { hasTags: ['married'] })).toBe(true);
    expect(meetsCondition(s, { missingTags: ['married'] })).toBe(false);
    expect(meetsCondition(s, { minReputation: 5 })).toBe(true);
    expect(meetsCondition(s, { pathAtLeast: { martial: 5 } })).toBe(true);
    expect(meetsCondition(s, { pathAtLeast: { martial: 50 } })).toBe(false);
  });

  it('an empty/undefined condition always passes', () => {
    expect(meetsCondition(makeState(), undefined)).toBe(true);
    expect(meetsCondition(makeState(), {})).toBe(true);
  });

  it('isChoiceEnabled gates on affordability', () => {
    const s = makeState({ gold: 3 });
    const choice: Choice = { label: 'buy', costGold: 5, outcome: { text: 'x' } };
    expect(isChoiceEnabled(s, choice)).toBe(false);
    s.gold = 10;
    expect(isChoiceEnabled(s, choice)).toBe(true);
  });
});

describe('eventPicker.pickEvent', () => {
  it('returns a non-arc, eligible event for a typical young peasant', () => {
    const s = makeState({ age: 10 });
    // Run several times since selection is random; should never throw or return an arc node.
    for (let i = 0; i < 50; i++) {
      const e = pickEvent(s);
      if (e) {
        expect(e.arcNodeOnly).toBeFalsy();
      }
    }
  });
});
