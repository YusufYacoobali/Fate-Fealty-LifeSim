import { gameReducer } from '@/state/gameReducer';
import { createLife } from '@/engine/gameState';

describe('career action risk', () => {
  it('odd work can either pay or cost gold', () => {
    const outcomes: number[] = [];
    for (let seed = 1; seed <= 40; seed += 1) {
      const state = createLife({ worldSeed: seed });
      state.age = 18;
      state.gold = 10;
      state.world.characters[state.playerCharacterId].age = 18;
      state.world.characters[state.playerCharacterId].gold = 10;
      outcomes.push(gameReducer(state, { type: 'CAREER_ACTION', action: 'odd_job' }).gold - 10);
    }

    expect(outcomes.some((delta) => delta > 0)).toBe(true);
    expect(outcomes.some((delta) => delta < 0)).toBe(true);
  });
});
