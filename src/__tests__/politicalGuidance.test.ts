import {createLife} from '@/engine/gameState';
import {makeState} from './helpers';
import {courtActionGains,courtActionBlockers,performCourtAction} from '@/engine/courtEngine';
import {courtCandidatesFor,beginOfficePetition,resolveOfficePetition} from '@/engine/courtPolitics';
import {COURT_ACTION_GAINS,OFFICE_APPOINTMENT_INFLUENCE} from '@/data/politicalOffices';
import {runWithWorldRng} from '@/engine/random';
import {addRoyalClaim} from '@/engine/royalSuccessionEngine';

it.each(['patron','advise','alliance','expose'] as const)('%s previews the actual gains including caps without mutating the world',action=>{
 for(const capped of [false,true]){
  const s=makeState({age:30}),p=s.world.characters[s.playerCharacterId];p.factionInfluence=capped?98:20;s.world.factions.crown.playerStanding=capped?99:10;s.world.conditions.prosperity=capped?99:40;
  const target=['patron','alliance'].includes(action)?courtCandidatesFor(s,action)[0]?.id:undefined;
  expect(courtActionBlockers(s,action,target)).toEqual([]);
  const before=JSON.stringify(s),g=courtActionGains(s,action);expect(JSON.stringify(s)).toBe(before);
  expect(g.influence).toBe(capped?2:COURT_ACTION_GAINS[action]!.influence);
  const old=[p.factionInfluence,s.world.factions.crown.playerStanding,s.world.conditions.prosperity];
  runWithWorldRng(s.world,()=>performCourtAction(s,action,target));
  expect([p.factionInfluence-old[0],s.world.factions.crown.playerStanding-old[1],s.world.conditions.prosperity-old[2]]).toEqual([g.influence,g.support,g.prosperity]);
 }
});
it('reports simultaneous age, time, target, education, influence, support and yearly blockers',()=>{
 const s=makeState({age:15});s.actionClock.used=s.actionClock.cap;s.world.court!.actionsYear=s.world.currentYear;s.world.court!.actionsUsed=3;s.world.court!.lastActionYears={petition:s.world.currentYear};
 const reasons=courtActionBlockers(s,'petition',undefined,'chancellor').join(';');
 for(const phrase of ['age 16','No actions','Three council','Already decided','standing 20','influence 15','Crown support 5'])expect(reasons).toContain(phrase);
 expect(courtActionBlockers(s,'patron').join(';')).toContain('Choose a person');
});
it('does not charge a disinherited claimant for an impossible takeover',()=>{
 const s=makeState({age:30,lifetimeUnlocked:true}),p=s.world.characters[s.playerCharacterId];p.factionInfluence=90;s.world.factions.crown.playerStanding=90;s.world.court!.legitimacy=0;s.world.conditions.publicOrder=0;
 addRoyalClaim(s,p.id,s.world.court!.rulerId,'recognition',70);s.world.court!.claims.find(c=>c.characterId===p.id)!.disinherited=true;
 for(const action of ['takeover','recognise_claim','regency_claim'] as const){const before=JSON.stringify(s);expect(courtActionBlockers(s,action)).toContain('Your documented claim is disinherited');performCourtAction(s,action);expect(JSON.stringify(s)).toBe(before);}
});
it('appointment influence is once only and does not confer an occupation or wage',()=>{
 let wins=0;
 for(let i=0;i<30;i++){
  const s=createLife({worldSeed:(i+1)*104729,birthOrigin:'peasant'});s.age=30;const p=s.world.characters[s.playerCharacterId];p.factionInfluence=70;p.education!.qualifications=['court_education'];s.world.factions.crown.playerStanding=70;
  const job=JSON.stringify(s.occupation);beginOfficePetition(s,'chancellor');runWithWorldRng(s.world,()=>resolveOfficePetition(s,'merit'));
  if(s.world.court!.offices.chancellor===p.id){wins++;expect(p.factionInfluence).toBe(70+OFFICE_APPOINTMENT_INFLUENCE);resolveOfficePetition(s,'merit');expect(p.factionInfluence).toBe(78);}
  expect(JSON.stringify(s.occupation)).toBe(job);
 }expect(wins).toBeGreaterThan(0);
});
