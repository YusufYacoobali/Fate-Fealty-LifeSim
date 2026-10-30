import { selectRankClimb, selectRankPath } from '@/state/viewModel';
import { makeState } from './helpers';

describe('viewModel', () => {
  it('shows premium ranks as locked in the free ladder', () => {
    const path = selectRankPath(makeState({ lifetimeUnlocked: false }));

    expect(path.map((r) => r.name)).toEqual(['COMMONER', 'SQUIRE', 'KNIGHT', 'NOBLE', 'BARON', 'KING']);
    expect(path.map((r) => r.locked)).toEqual([false, false, false, false, true, true]);
  });

  it('shows premium ranks unlocked for Lifetime Pass owners', () => {
    const path = selectRankPath(makeState({ lifetimeUnlocked: true }));

    expect(path.map((r) => r.name)).toEqual(['COMMONER', 'SQUIRE', 'KNIGHT', 'NOBLE', 'BARON', 'KING']);
    expect(path.some((r) => r.locked)).toBe(false);
  });

  const martialState = (overrides: Parameters<typeof makeState>[0]) => { const s = makeState(overrides); s.occupation.careerId = 'levy'; s.world.characters[s.playerCharacterId].education!.qualifications.push('martial_training'); return s; };

  it('shows Peasant progress toward Squire using every promotion requirement', () => {
    const progressLed = selectRankClimb(martialState({
      age: 17,
      rankProgress: 64,
      stats: { health: 60, charm: 50, wits: 60, faith: 50 },
    }));
    expect(progressLed).toMatchObject({ from: 'COMMONER', to: 'SQUIRE', progress: 64, locked: false });

    const witsBlocked = selectRankClimb(martialState({
      age: 17,
      rankProgress: 100,
      stats: { health: 60, charm: 50, wits: 24, faith: 50 },
    }));
    expect(witsBlocked?.progress).toBe(50);
  });
});
