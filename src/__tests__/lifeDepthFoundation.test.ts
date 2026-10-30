import AsyncStorage from '@react-native-async-storage/async-storage';
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
    expect(normalized.schemaVersion).toBe(7);
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

it('preserves unreadable and future saves even if an autosave is attempted', async () => {
  const { loadGame, saveGame } = require('@/state/persistence');
  for (const raw of ['{broken', JSON.stringify({ schemaVersion: 99, game: { schemaVersion: 99 } })]) {
    await AsyncStorage.clear();
    await AsyncStorage.setItem('mls:world:v5', raw);
    expect((await loadGame()).blockedByFutureVersion).toBe(true);
    await saveGame(createLife({ worldSeed: 41 }));
    expect(await AsyncStorage.getItem('mls:world:v5')).toBe(raw);
  }
  jest.mocked(AsyncStorage.getItem).mockResolvedValueOnce('');
  expect((await loadGame()).blockedByFutureVersion).toBe(true);
  await AsyncStorage.clear();
});

it('recognises professional legacies without awarding a noble child military honours', () => {
  const { legacyScore } = require('@/engine/consequenceEngine');
  const { evaluateAchievements } = require('@/engine/metaProgression');
  const { buildLifeChronicle } = require('@/engine/deathEngine');
  const { DEFAULT_META } = require('@/state/appMeta');
  const noble = createLife({ worldSeed: 1, birthOrigin: 'noble' });
  expect(evaluateAchievements(DEFAULT_META, noble, false).newly).not.toContain('knighted');
  const commoner = createLife({ worldSeed: 2, birthOrigin: 'peasant' });
  const before = legacyScore(commoner);
  commoner.world.characters[commoner.playerCharacterId].professionalHistory!.medicine = { reputation: 60, completedActions: ['diagnose_patient','treat_household','noble_fever'], milestones: ['recognised_practice'], contactIds: [], matters: [], actionsYear: -1, actionsUsed: 0, lastWorkedYear: 1320 };
  expect(legacyScore(commoner)).toBeGreaterThan(before + 200);
  expect(commoner.rankIdx).toBe(0);
  expect(buildLifeChronicle(commoner)[0]).toContain('medicine legacy');
  expect(evaluateAchievements(DEFAULT_META, commoner, false).newly).toContain('professional_legacy');
});
