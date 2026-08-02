import { DEFAULT_SETTINGS } from '@/engine/gameState';
import { normalizeGameState } from '@/state/persistence';
import { GameState } from '@/types/game';
import { makeState } from './helpers';

describe('settings persistence', () => {
  it('defaults Live Forever to off', () => {
    expect(DEFAULT_SETTINGS.liveForever).toBe(false);
    expect(DEFAULT_SETTINGS.music).toBe(true);
    expect(DEFAULT_SETTINGS.soundEffects).toBe(true);
  });

  it('migrates the old inverted permadeath setting', () => {
    const legacyState = {
      ...makeState(),
      settings: { autoScroll: false, difficulty: 'Brutal', permadeath: false, haptics: false },
    } as unknown as GameState;

    const migrated = normalizeGameState(legacyState);

    expect(migrated.settings).toEqual({
      autoScroll: false,
      difficulty: 'Brutal',
      liveForever: true,
      haptics: false,
      music: true,
      soundEffects: true,
      reducedMotion: false,
    });
  });

  it('migrates Ill-Starred lives to Golden Child', () => {
    const legacyState = makeState({ traits: ['ill_starred'], tags: ['trait_ill_starred'] });
    legacyState.feed = [{ ...legacyState.feed[0], traitId: 'ill_starred' }];

    const migrated = normalizeGameState(legacyState);

    expect(migrated.traits).toEqual(['golden_child']);
    expect(migrated.tags).toEqual(['trait_golden_child']);
    expect(migrated.feed[0].traitId).toBe('golden_child');
  });
});
