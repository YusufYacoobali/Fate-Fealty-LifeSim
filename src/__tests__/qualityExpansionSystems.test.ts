import AsyncStorage from '@react-native-async-storage/async-storage';
import { createLife } from '@/engine/gameState';
import { tickFamilyFormation } from '@/engine/familyFormationEngine';
import { tickStructuredHealth } from '@/engine/healthEngine';
import { dueLegalEvent, tickLegalSystem } from '@/engine/legalEngine';
import { tickFactions } from '@/engine/factionEngine';
import { runWithWorldRng } from '@/engine/random';
import { worldIntegrityIssues } from '@/engine/worldIntegrity';
import { applyChoice } from '@/engine/storyGraph';
import { loadGame } from '@/state/persistence';
import { CURRENT_CONTENT_VERSION } from '@/content/contentVersion';
import { tickPersistentSociety } from '@/engine/npcDirector';

describe('quality expansion simulation slices', () => {
  beforeEach(async () => AsyncStorage.clear());

  it('resolves adoption into reciprocal lineage and household records', () => {
    const state = createLife({ worldSeed: 4101 });
    const player = state.world.characters[state.playerCharacterId];
    state.world.expectedChildren.push({ id: 'expected_adoption', parentIds: [player.id], route: 'adoption', dueYear: state.world.currentYear, householdId: player.householdId!, familyId: player.birthFamilyId!, status: 'expected' });
    runWithWorldRng(state.world, () => tickFamilyFormation(state));
    const adopted = Object.values(state.world.characters).find((character) => character.lineageStatus === 'adopted');
    expect(adopted?.parentIds).toContain(player.id);
    expect(player.childIds).toContain(adopted?.id);
    expect(state.world.households.find((household) => household.id === player.householdId)?.memberIds).toContain(adopted?.id);
    expect(worldIntegrityIssues(state)).toEqual([]);
  });

  it('progresses structured illness and keeps values bounded', () => {
    const state = createLife({ worldSeed: 4102 });
    const player = state.world.characters[state.playerCharacterId];
    player.healthConditions = [{ id: 'condition_test', conditionId: 'consumption', kind: 'illness', severity: 60, diagnosed: true, startedYear: state.world.currentYear - 2, nextReviewYear: state.world.currentYear }];
    runWithWorldRng(state.world, () => tickStructuredHealth(state));
    expect(player.healthConditions[0].nextReviewYear).toBe(state.world.currentYear + 1);
    expect(player.healthConditions[0].severity).toBeGreaterThanOrEqual(0);
    expect(player.healthConditions[0].severity).toBeLessThanOrEqual(100);
    expect(state.stats.health).toBe(player.stats.health);
  });

  it('turns evidence and suspicion into a resolvable trial and sentence', () => {
    const state = createLife({ worldSeed: 4103 });
    const player = state.world.characters[state.playerCharacterId];
    player.legalState = { status: 'accused', suspicion: 70, notoriety: 12, sentenceYearsRemaining: 0, charges: [{ id: 'charge_test', offence: 'stealing a neighbour’s grain', severity: 35, evidence: 65, victimIds: ['beatrice'], witnessIds: ['oswin'], year: state.world.currentYear, resolved: false }] };
    const trial = dueLegalEvent(state)!;
    state.pendingEvent = { eventId: trial.id };
    applyChoice(state, trial, trial.choices.find((choice) => choice.id === 'confess')!);
    expect(player.legalState.status).toBe('imprisoned');
    expect(player.legalState.sentenceYearsRemaining).toBe(1);
    expect(state.tags).toContain('imprisoned');
    tickLegalSystem(state);
    expect(player.legalState.status).toBe('free');
  });

  it('gives every faction one bounded autonomous yearly action', () => {
    const state = createLife({ worldSeed: 4104 });
    runWithWorldRng(state.world, () => tickFactions(state));
    for (const faction of Object.values(state.world.factions)) {
      expect(faction.lastActionYear).toBe(state.world.currentYear);
      expect(faction.influence).toBeGreaterThanOrEqual(0);
      expect(faction.influence).toBeLessThanOrEqual(100);
    }
  });

  it('archives old background people without dangling guardians or households', () => {
    const state = createLife({ worldSeed: 4107 });
    const archived = Object.values(state.world.characters).find((character) => character.importance === 'background' && character.id !== state.playerCharacterId)!;
    const ward = Object.values(state.world.characters).find((character) => character.id !== archived.id && character.id !== state.playerCharacterId)!;
    archived.alive = false;
    archived.deathYear = state.world.currentYear - 26;
    ward.guardianIds = [archived.id];
    const household = state.world.households.find((item) => item.id === archived.householdId)!;
    ward.householdId = household.id;
    household.headId = archived.id;
    household.memberIds = [archived.id];
    runWithWorldRng(state.world, () => tickPersistentSociety(state));
    expect(state.world.characters[archived.id]).toBeUndefined();
    expect(ward.guardianIds).toEqual([]);
    expect(state.world.households.find((item) => item.id === ward.householdId)?.memberIds).toContain(ward.id);
    expect(worldIntegrityIssues(state)).toEqual([]);
  });

  it('migrates a v3 envelope into v4 without deleting or randomising the source save', async () => {
    const state = createLife({ worldSeed: 4105 });
    const savedRng = { ...state.world.rngState };
    (state as unknown as { schemaVersion: number }).schemaVersion = 3;
    state.world.contentVersion = 2;
    (state.world.characters[state.playerCharacterId] as unknown as { gender: string }).gender = 'nonbinary';
    const legacyEnvelope = JSON.stringify({ schemaVersion: 3, savedAt: 1, game: state });
    await AsyncStorage.setItem('mls:world:v3', legacyEnvelope);
    const result = await loadGame();
    expect(result.blockedByFutureVersion).toBe(false);
    expect(result.state?.schemaVersion).toBe(4);
    expect(result.state?.world.contentVersion).toBe(CURRENT_CONTENT_VERSION);
    expect(result.state?.world.rngState).toEqual(savedRng);
    expect(['woman', 'man']).toContain(result.state?.gender);
    expect(await AsyncStorage.getItem('mls:world:v3')).toBe(legacyEnvelope);
    expect(await AsyncStorage.getItem('mls:world:v4')).not.toBeNull();
  });

  it('rejects a future save without overwriting it', async () => {
    const state = createLife({ worldSeed: 4106 });
    const future = JSON.stringify({ schemaVersion: 5, savedAt: 1, game: { ...state, schemaVersion: 5 } });
    await AsyncStorage.setItem('mls:world:v4', future);
    const result = await loadGame();
    expect(result).toEqual({ state: null, blockedByFutureVersion: true });
    expect(await AsyncStorage.getItem('mls:world:v4')).toBe(future);
  });
});
