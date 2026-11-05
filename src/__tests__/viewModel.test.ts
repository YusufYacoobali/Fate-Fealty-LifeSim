import {militaryPromotionRequirements} from '@/engine/progressionRequirements';
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

  it('retires the compulsory rank percentage and shows separate military requirements',()=>{
    const s=martialState({age:17,rankProgress:100,stats:{health:60,charm:50,wits:24,faith:50}});
    expect(selectRankClimb(s)).toBeNull();
    const route=militaryPromotionRequirements(s)!;
    expect(route.honour).toBe('squire');
    expect(route.rows.find(r=>r.id==='service')?.met).toBe(true);
    expect(route.rows.find(r=>r.id==='wits')?.met).toBe(false);
    expect(selectRankClimb(makeState({rankIdx:2}))).toBeNull();
    expect(selectRankClimb(makeState({rankIdx:4}))).toBeNull();
  });
});
