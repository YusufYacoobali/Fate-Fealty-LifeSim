import {makeState} from './helpers';
import {selectProgressionHint,selectRankClimb} from '@/state/viewModel';
import {rankPromotionRequirements} from '@/engine/progressionRequirements';
import {addRoyalClaim} from '@/engine/royalSuccessionEngine';
it.each([
 [0,'Squire needs age 12 and Wits 48.'],
 [1,'Knight needs age 15, Wits 64 and Charm 56.'],
 [2,'Noble needs age 20, 120g, Charm 72 and Wits 58.'],
 [3,'Baron needs age 30, 260g, Charm 80, Wits 72 and Pro.'],
 [4,'Monarch needs age 40, 420g, Charm 90, Wits 85, Faith 60, Pro and a recognised route to the Crown.'],
] as const)('lists the actual missing qualifications from level %i', (rankIdx,requirements)=>{
 const s=makeState({age:10,rankIdx,rankProgress:68,gold:0,lifetimeUnlocked:false,stats:{health:80,charm:10,wits:10,faith:10}});
 expect(selectProgressionHint(s)).toBe(`Build standing through work and achievements. ${requirements}`);
 s.rankProgress=100;expect(selectProgressionHint(s)).toBe(`Standing complete. ${requirements}`);
});
it.each([0,1,2,3,4])('explains standing and only the unmet requirements from level %i',rankIdx=>{
 const s=makeState({age:45,rankIdx,rankProgress:68,gold:600,lifetimeUnlocked:true,stats:{health:90,charm:95,wits:95,faith:85}}),before=JSON.stringify(s);expect(selectRankClimb(s)?.progress).toBe(68);const hint=selectProgressionHint(s);expect(hint).toContain('Build standing through work and achievements');expect(hint).not.toMatch(/age 12|age 15|age 20|age 30|age 40|120g|260g|420g|Charm 72|Pro/);expect(JSON.stringify(s)).toBe(before);
});
it('shows missing Noble money and stats before 100 instead of generic advice',()=>{
 const s=makeState({age:20,rankIdx:2,rankProgress:68,gold:100,stats:{health:80,charm:70,wits:57,faith:70}});expect(selectProgressionHint(s)).toBe('Build standing through work and achievements. Noble needs 120g, Charm 72 and Wits 58.');
 s.gold=120;s.stats.wits=58;expect(selectProgressionHint(s)).toBe('Build standing through work and achievements. Noble needs Charm 72.');s.rankProgress=100;expect(selectProgressionHint(s)).toBe('Standing complete. Noble needs Charm 72.');s.stats.charm=72;expect(selectProgressionHint(s)).toBe('Standing complete. Ready to become Noble.');
});
it('shows age and Pro only while they are missing, even before standing is complete',()=>{
 const s=makeState({age:19,rankIdx:2,rankProgress:100,gold:120,stats:{health:90,charm:80,wits:80,faith:80}});expect(selectProgressionHint(s)).toBe('Standing complete. Noble needs age 20.');
 const n=makeState({age:40,rankIdx:3,rankProgress:68,gold:500,stats:{health:80,charm:90,wits:90,faith:80}});expect(selectProgressionHint(n)).toContain('Baron needs Pro');n.rankProgress=100;expect(selectProgressionHint(n)).toBe('Standing complete. Baron needs Pro.');n.lifetimeUnlocked=true;expect(selectProgressionHint(n)).not.toContain('Pro');
});
it('separates missing Pro, missing claims, and an existing claim under a living ruler',()=>{
 const s=makeState({age:50,rankIdx:4,rankProgress:100,gold:600,stats:{health:90,charm:95,wits:95,faith:85}});expect(selectProgressionHint(s)).toBe('Standing complete. Monarch needs Pro and a recognised route to the Crown.');
 s.lifetimeUnlocked=true;expect(selectProgressionHint(s)).toBe('Standing complete. Monarch needs a recognised route to the Crown.');addRoyalClaim(s,s.playerCharacterId,s.world.court!.rulerId,'recognition',100);s.world.court!.heirId=s.playerCharacterId;expect(selectProgressionHint(s)).toBe('Standing complete. Monarch needs succession or political recognition.');
 s.world.characters[s.world.court!.rulerId].alive=false;s.lifetimeUnlocked=false;expect(rankPromotionRequirements(s).find(r=>r.id==='crown')?.met).toBe(true);expect(selectProgressionHint(s)).toBe('Standing complete. Monarch needs Pro.');
});
it('is pure and removes the meter at the top rank',()=>{const s=makeState({rankIdx:5}),before=JSON.stringify(s);expect(selectRankClimb(s)).toBeNull();expect(selectProgressionHint(s)).toContain('succession');expect(JSON.stringify(s)).toBe(before);});
