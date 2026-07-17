import { createLife, cloneState } from '@/engine/gameState';
import { gameReducer } from '@/state/gameReducer';
import { applyChoice } from '@/engine/storyGraph';
import { isChoiceAvailable } from '@/engine/eventPicker';
import { resetRandomSource, seededSource, setRandomSource } from '@/engine/random';

describe('living-world seeded soak', () => {
  afterEach(resetRandomSource);

  function resolveEvents(state: ReturnType<typeof createLife>) {
    while (state.event && !state.dead) {
      const event = state.event;
      const choice = event.choices.find((candidate) => isChoiceAvailable(state, candidate));
      if (!choice) break;
      state = cloneState(state);
      applyChoice(state, event, choice);
    }
    return state;
  }

  it('holds population, economy, relationship, and action invariants across thousands of annual ticks', () => {
    setRandomSource(seededSource(99173));
    let years = 0;
    for (let life = 0; life < 30; life++) {
      let state = createLife({ settings: { autoScroll: true, difficulty: 'Normal', permadeath: true, haptics: false } });
      for (let guard = 0; guard < 120 && !state.dead; guard++) {
        state = resolveEvents(state);
        if (state.dead || state.event) break;
        if (state.age >= 8 && !state.occupation.careerId) state = gameReducer(state, { type: 'CAREER_ACTION', action: 'apply', careerId: 'farmhand' });
        if (state.occupation.careerId) state = gameReducer(state, { type: 'CAREER_ACTION', action: 'work' });
        state = gameReducer(state, { type: 'DO_ACTIVITY', id: state.age >= 4 ? 'church' : 'herbalist' });
        state = resolveEvents(state);
        if (state.dead || state.event) break;
        const priorAge = state.age;
        state = gameReducer(state, { type: 'AGE_UP' });
        if (state.age !== priorAge + 1) break;
        years += 1;

        expect(state.actionClock.used).toBe(0);
        expect(state.kin.filter((person) => person.alive).length).toBeLessThanOrEqual(30);
        expect(state.gold).toBeGreaterThanOrEqual(0);
        expect(state.debts.every((debt) => debt.principal >= 0)).toBe(true);
        for (const relation of state.world.relationships) {
          for (const perspective of [relation.aToB, relation.bToA]) {
            expect(Object.values(perspective).every((value) => value >= 0 && value <= 100)).toBe(true);
          }
        }
      }
    }
    expect(years).toBeGreaterThan(900);
  }, 20000);
});
