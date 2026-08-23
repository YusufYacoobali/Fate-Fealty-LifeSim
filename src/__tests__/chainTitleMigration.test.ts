import { CONTENT_MIGRATIONS, CURRENT_CONTENT_VERSION } from '@/content/contentVersion';
import { QUALITY_CHAIN_SPECS } from '@/content/qualityAmbientEvents';
import { EVENTS_BY_ID } from '@/content';
import { WorldState } from '@/types/game';

/**
 * Ambient chain beats gate on the exact title of the beat before them, and that
 * title is persisted in world history. Rewriting the chains changed every one of
 * those titles, so a save taken mid-chain would sit on a beat whose successor
 * can never fire again.
 */
describe('chain title migration', () => {
  const spec = QUALITY_CHAIN_SPECS.find((chain) => chain.id === 'stolen_chalice')!;

  function worldWithLegacyHistory(): WorldState {
    return {
      history: [{
        id: 'history_1',
        year: 1340,
        type: 'choice',
        participantIds: [],
        familyIds: [],
        causes: ['The Stolen Chalice: 1'],
        summary: 'An old save resolved the first beat of the chalice chain.',
        salience: 2,
      }],
    } as unknown as WorldState;
  }

  it('rewrites legacy beat titles to the titles the chains now use', () => {
    const { world, notices } = CONTENT_MIGRATIONS[3](worldWithLegacyHistory());
    expect(world.history[0].causes).toEqual([spec.beats[0].title]);
    expect(notices).toHaveLength(1);
  });

  it('leaves the migrated save able to reach the next beat', () => {
    const { world } = CONTENT_MIGRATIONS[3](worldWithLegacyHistory());
    const gate = EVENTS_BY_ID['quality_stolen_chalice_2'].requires?.hasWorldMemoryType ?? [];
    expect(gate.every((type) => world.history.some((entry) => entry.causes.includes(type)))).toBe(true);
  });

  it('leaves unrelated history untouched and reports nothing', () => {
    const world = { history: [{ causes: ['A RIVAL TAKES NOTICE'] }] } as unknown as WorldState;
    const result = CONTENT_MIGRATIONS[3](world);
    expect(result.world.history[0].causes).toEqual(['A RIVAL TAKES NOTICE']);
    expect(result.notices).toEqual([]);
  });

  it('is registered at the version below the current one', () => {
    expect(CONTENT_MIGRATIONS[CURRENT_CONTENT_VERSION - 1]).toBeDefined();
  });
});
