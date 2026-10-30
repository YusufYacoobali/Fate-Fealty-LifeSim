import { resolveRpgEncounter } from './rpgSoakHelpers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createLife } from '@/engine/gameState';
import { gameReducer } from '@/state/gameReducer';
import { eventById, isChoiceEnabled } from '@/engine/eventPicker';
import { spawnKin } from '@/engine/kinFactory';
import { loadGame, saveGame } from '@/state/persistence';
import { GameState } from '@/types/game';

function resolvePending(state: GameState): GameState {
  resolveRpgEncounter(state);
  let guard = 0;
  while (state.pendingEvent && !state.dead && guard++ < 4) {
    const event = eventById(state.pendingEvent.eventId)!;
    const choice = event.choices.find((candidate) => isChoiceEnabled(state, candidate))!;
    state = gameReducer(state, { type: 'CHOOSE', choice });
  }
  return state;
}

describe('persistent world performance budgets', () => {
  beforeEach(async () => AsyncStorage.clear());

  it('keeps Age Up engine p95 below 100ms on the development benchmark', () => {
    const timings: number[] = [];
    let state = createLife({ worldSeed: 73_001 });
    for (let sample = 0; sample < 75; sample++) {
      state = resolvePending(state);
      if (state.dead) state = createLife({ worldSeed: 73_002 + sample });
      const started = performance.now();
      state = gameReducer(state, { type: 'AGE_UP' });
      timings.push(performance.now() - started);
    }
    timings.sort((a, b) => a - b);
    const p95 = timings[Math.ceil(timings.length * 0.95) - 1];
    expect(p95).toBeLessThan(100);
  });

  it('keeps a three-generation save below 2MB and loads it below 750ms', async () => {
    let state = createLife({ worldSeed: 73_100 });
    for (let generation = 1; generation < 3; generation++) {
      for (let year = 0; year < 12 && !state.dead; year++) {
        state = resolvePending(state);
        if (!state.pendingEvent) state = gameReducer(state, { type: 'AGE_UP' });
      }
      const heir = spawnKin(state, { kind: 'child', age: 18, isHeir: true, name: `Measured Heir ${generation}` });
      state.dead = true;
      state.deathCause = 'Performance benchmark succession.';
      state = gameReducer(state, { type: 'CONTINUE_AS_HEIR', heirId: heir.id });
    }
    await saveGame(state);
    const raw = await AsyncStorage.getItem('mls:world:v5');
    expect(new TextEncoder().encode(raw ?? '').byteLength).toBeLessThan(2 * 1024 * 1024);
    const started = performance.now();
    const loaded = await loadGame();
    const elapsed = performance.now() - started;
    expect(loaded.state).not.toBeNull();
    expect(elapsed).toBeLessThan(750);
  });
});
