import { DEFAULT_SETTINGS } from '@/engine/gameState';
import { normalizeGameState } from '@/state/persistence';
import { GameState } from '@/types/game';
import { makeState } from './helpers';

describe('settings persistence', () => {
  it('defaults Live Forever to off', () => {
    expect(DEFAULT_SETTINGS.liveForever).toBe(false);
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
    });
  });
});
