import {makeState} from './helpers';
import {selectProgressionHint,selectRankClimb} from '@/state/viewModel';
it.each([0,1,2,3,4])('shows the real meter towards the next rank from level %i',rankIdx=>{const s=makeState({rankIdx,rankProgress:68});expect(selectRankClimb(s)?.progress).toBe(68);expect(selectProgressionHint(s)).toContain('Work, study');});
it('explains age, money, stats and access blockers using actual requirements',()=>{
 const s=makeState({age:19,rankIdx:2,rankProgress:100,gold:120,stats:{health:90,charm:80,wits:80,faith:80}});expect(selectProgressionHint(s)).toContain('age 20');s.age=20;s.gold=119;expect(selectProgressionHint(s)).toContain('120g');s.gold=120;s.stats.charm=71;expect(selectProgressionHint(s)).toContain('Charm 72');s.stats.charm=80;expect(selectProgressionHint(s)).toContain('ready to become Noble');
 const n=makeState({age:40,rankIdx:3,rankProgress:100,gold:500,stats:{health:80,charm:90,wits:90,faith:80}});expect(selectProgressionHint(n)).toContain('Pro is required');
});
it('explains the political Crown requirement rather than inventing a promotion',()=>{const s=makeState({rankIdx:4,rankProgress:100,lifetimeUnlocked:true});expect(selectProgressionHint(s)).toContain('recognised route to the Crown');expect(selectRankClimb(s)?.to).toBe('MONARCH');});
it('is pure and removes the meter at the top rank',()=>{const s=makeState({rankIdx:5}),before=JSON.stringify(s);expect(selectRankClimb(s)).toBeNull();expect(selectProgressionHint(s)).toContain('succession');expect(JSON.stringify(s)).toBe(before);});
