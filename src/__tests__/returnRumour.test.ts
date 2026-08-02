import { createLife } from '@/engine/gameState';
import { buildReturnRumour } from '@/services/returnRumour';

describe('return rumour', () => {
  it('prioritises an unfinished major story and its recurring actor', () => {
    const state = createLife({ worldSeed: 775 });
    state.world.activeStories = [{
      id: 'story_test', templateId: 'rivals_rise', scale: 'major', status: 'active',
      bindings: { rival: 'roderick' }, variables: {}, currentBeatId: 'beat_1',
      startedYear: state.world.currentYear, nextEligibleYear: state.world.currentYear,
      lastBeatYear: state.world.currentYear, generationStarted: 1,
    }];
    const rumour = buildReturnRumour(state);
    expect(rumour.id).toContain('story:story_test');
    expect(rumour.body).toContain('Sir Roderick');
    expect(rumour.tab).toBe('life');
  });

  it('surfaces unresolved legal trouble when no story is active', () => {
    const state = createLife({ worldSeed: 776 });
    state.world.activeStories = [];
    const player = state.world.characters[state.playerCharacterId];
    player.legalState = {
      status: 'awaiting_trial', suspicion: 60, notoriety: 20, sentenceYearsRemaining: 0,
      charges: [{ id: 'charge_1', offence: 'Poaching', severity: 45, evidence: 50, victimIds: [], witnessIds: [], year: state.world.currentYear, resolved: false }],
    };
    const rumour = buildReturnRumour(state);
    expect(rumour.id).toContain('law:awaiting_trial');
    expect(rumour.body).toContain('poaching');
  });

  it('always provides a deterministic world hook as a safe fallback', () => {
    const state = createLife({ worldSeed: 777 });
    state.world.activeStories = [];
    state.world.conditions.warThreat = 91;
    const first = buildReturnRumour(state);
    const second = buildReturnRumour(state);
    expect(first).toEqual(second);
    expect(first.id).toContain('world:warThreat');
  });
});
