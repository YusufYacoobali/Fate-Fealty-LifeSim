import { selectRankPath } from '@/state/viewModel';
import { makeState } from './helpers';

describe('viewModel', () => {
  it('shows premium ranks as locked in the free ladder', () => {
    const path = selectRankPath(makeState({ lifetimeUnlocked: false }));

    expect(path.map((r) => r.name)).toEqual(['PEASANT', 'SQUIRE', 'KNIGHT', 'NOBLE', 'BARON', 'KING']);
    expect(path.map((r) => r.locked)).toEqual([false, false, false, false, true, true]);
  });

  it('shows premium ranks unlocked for Lifetime Pass owners', () => {
    const path = selectRankPath(makeState({ lifetimeUnlocked: true }));

    expect(path.map((r) => r.name)).toEqual(['PEASANT', 'SQUIRE', 'KNIGHT', 'NOBLE', 'BARON', 'KING']);
    expect(path.some((r) => r.locked)).toBe(false);
  });
});
