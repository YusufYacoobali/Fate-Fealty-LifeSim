import { createLife, cloneState } from '@/engine/gameState';
import { normalizeGameState } from '@/state/persistence';
import { canPromote, promote } from '@/engine/pathProgression';

describe('life depth foundation', () => {
  it('migrates legacy grants without consuming randomness or changing purchases', () => {
    const state = createLife({ worldSeed: 42, lifetimeUnlocked: true });
    state.rankIdx = 4;
    delete state.world.characters[state.playerCharacterId].socialStatus;
    const rng = JSON.stringify(state.world.rngState);
    const normalized = normalizeGameState(state);
    expect(normalized.schemaVersion).toBe(6);
    expect(normalized.rankIdx).toBe(4);
    expect(normalized.world.characters[state.playerCharacterId].socialStatus?.estate).toBe('baronial');
    expect(JSON.stringify(normalized.world.rngState)).toBe(rng);
    expect(normalized.lifetimeUnlocked).toBe(true);
    expect(normalizeGameState(cloneState(normalized))).toEqual(normalized);
  });
  it('clones all new character state without writes reaching the original', () => {
    const state = createLife({ worldSeed: 13 });
    const copy = cloneState(state);
    copy.world.characters[copy.playerCharacterId].education!.qualifications.push('literacy');
    copy.world.characters[copy.playerCharacterId].socialStatus!.titles.push('Fraud');
    expect(state.world.characters[state.playerCharacterId].education!.qualifications).toEqual([]);
    expect(state.world.characters[state.playerCharacterId].socialStatus!.titles).toEqual([]);
  });
  it('does not turn prosperous professionals into knights or force a free crown', () => {
    const state = createLife({ worldSeed: 8 });
    Object.assign(state, { age: 50, gold: 9999, rankProgress: 9999, stats: { health: 100, charm: 100, wits: 100, faith: 100 } });
    state.occupation.careerId = 'trader';
    expect(canPromote(state)).toBe(false);
    state.rankIdx = 3;
    expect(promote(state, true)).toBe(false);
    state.lifetimeUnlocked = true;
    expect(promote(state, true)).toBe(true);
    expect(promote(state, true)).toBe(false);
  });
});
