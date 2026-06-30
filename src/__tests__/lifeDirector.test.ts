import { ageUp } from '@/engine/lifeDirector';
import { applyChoice } from '@/engine/storyGraph';
import { isChoiceAvailable } from '@/engine/eventPicker';
import { cloneState } from '@/engine/gameState';
import { makeState } from './helpers';

describe('lifeDirector.ageUp', () => {
  it('advances age by one and ages mortal kin', () => {
    const s = makeState({ age: 5 });
    const motherBefore = s.kin.find((k) => k.id === 'mother')!.age;
    ageUp(s);
    expect(s.age).toBe(6);
    const motherAfter = s.kin.find((k) => k.id === 'mother')!.age;
    expect(motherAfter).toBe(motherBefore + 1);
  });

  it('adds at least one feed entry per year', () => {
    const s = makeState({ age: 5 });
    const before = s.feed.length;
    ageUp(s);
    expect(s.feed.length).toBeGreaterThan(before);
  });

  it('is a no-op while an event popup is open or the player is dead', () => {
    const withEvent = makeState({ age: 5 });
    withEvent.event = { id: 'x', category: 'peasant', title: 't', text: 't', choices: [] };
    ageUp(withEvent);
    expect(withEvent.age).toBe(5);

    const dead = makeState({ age: 5, dead: true });
    ageUp(dead);
    expect(dead.age).toBe(5);
  });

  it('a full played-out life eventually ends in death', () => {
    let s = makeState({ age: 0 });
    let guard = 0;
    while (!s.dead && guard < 500) {
      guard++;
      if (s.event) {
        const ev = s.event;
        const choices = ev.choices.filter((c) => isChoiceAvailable(s, c));
        s = cloneState(s);
        applyChoice(s, ev, choices[0]);
      } else {
        s = cloneState(s);
        ageUp(s);
      }
    }
    expect(s.dead).toBe(true);
    expect(s.age).toBeLessThan(150);
  });
});
