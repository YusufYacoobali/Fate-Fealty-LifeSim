import {makeState} from './helpers';
import {createLife} from '@/engine/gameState';
import {selectProgressionHint,selectRankPath} from '@/state/viewModel';
import {BARONY} from '@/engine/progressionRequirements';
import {addRoyalClaim,recogniseRuler} from '@/engine/royalSuccessionEngine';
it('gives a commoner or merchant a concise landed-nobility route and responds to actual eligibility',()=>{
 const s=makeState({age:30});s.occupation.careerId='trader';expect(selectProgressionHint(s)).toMatch(/influence 15\+.*Crown support 5\+.*Court/);expect(selectProgressionHint(s)).not.toMatch(/Squire|Knight/);
 s.world.characters[s.playerCharacterId].factionInfluence=15;s.world.factions.crown.playerStanding=5;expect(selectProgressionHint(s)).toMatch(/ready to petition.*may refuse/);
 s.age=10;expect(selectProgressionHint(s)).toContain('age 18');s.age=30;s.world.characters[s.world.court!.rulerId].alive=false;expect(selectProgressionHint(s)).toContain('capable living ruler');
});
it('uses actual martial requirements for a Squire, but directs a Knight towards Court nobility',()=>{
 const s=makeState({age:20,rankIdx:1,rankProgress:100,stats:{health:70,charm:80,wits:80,faith:50}});
 expect(selectProgressionHint(s)).toMatch(/^Squire:.*martial training/);s.world.characters[s.playerCharacterId].education!.qualifications.push('martial_training');expect(selectProgressionHint(s)).toContain('martial occupation');s.occupation.careerId='levy';expect(selectProgressionHint(s)).toContain('yearly service review');s.rankProgress=0;expect(selectProgressionHint(s)).toContain('service standing 100');
 const knight=makeState({age:20,rankIdx:2});expect(selectProgressionHint(knight)).toMatch(/^Knight:.*nobility at Court/);
});
it('summarises one real barony blocker, and distinguishes reserve, payment and Pro when ready',()=>{
 const s=makeState({age:37,rankIdx:3,gold:350,lifetimeUnlocked:true,stats:{health:70,charm:84,wits:76,faith:50}});
 expect(selectProgressionHint(s)).toContain(`${BARONY.minAge}`);s.age=38;s.gold=349;expect(selectProgressionHint(s)).toMatch(/350g.*349g/);s.gold=350;s.stats.charm=72;expect(selectProgressionHint(s)).toMatch(/Charm 84.*72/);s.stats.charm=84;expect(selectProgressionHint(s)).toContain(`patent costs ${BARONY.price}g`);s.lifetimeUnlocked=false;expect(selectProgressionHint(s)).toContain('Pro');
});
it('does not give Barons an automatic path to monarch',()=>{const s=makeState({age:40,rankIdx:4,lifetimeUnlocked:true});expect(selectProgressionHint(s)).toMatch(/^Baron:.*recognised claim.*Court/);});
it('uses actual royal order, heir priority, disinheritance and access without inventing a claim',()=>{
 const s=createLife({worldSeed:950119,birthOrigin:'royal',lifetimeUnlocked:true}),p=s.world.characters[s.playerCharacterId],court=s.world.court!;
 court.heirId=p.id;expect(selectProgressionHint(s)).toContain('1st in succession');court.heirId=undefined;court.claims.find(c=>c.characterId===p.id)!.strength=1;expect(selectProgressionHint(s)).not.toContain('1st in succession');
 s.lifetimeUnlocked=false;expect(selectProgressionHint(s)).toContain('Pro');s.lifetimeUnlocked=true;court.claims.find(c=>c.characterId===p.id)!.disinherited=true;expect(selectProgressionHint(s)).toContain('disinherited');
 p.parentIds=[];court.claims=[];expect(selectProgressionHint(s)).toMatch(/^Royal Kin: no eligible claim/);expect(selectRankPath(s).map(r=>r.name)).toContain('ROYAL KIN');
});
it('uses actual ruler authority for monarch guidance',()=>{const s=makeState({age:40,lifetimeUnlocked:true});addRoyalClaim(s,s.playerCharacterId,s.world.court!.rulerId,'recognition',90);recogniseRuler(s,s.playerCharacterId,'A test coronation');expect(selectProgressionHint(s)).toMatch(/^Monarch:.*legitimacy.*succession/);});
it('keeps hints pure and short for representative profiles',()=>{
 for(const rankIdx of [0,1,2,3,4,5]){const s=makeState({age:30,rankIdx,lifetimeUnlocked:true}),before=JSON.stringify(s);expect(selectProgressionHint(s).length).toBeLessThanOrEqual(110);selectRankPath(s);expect(JSON.stringify(s)).toBe(before);}
});
