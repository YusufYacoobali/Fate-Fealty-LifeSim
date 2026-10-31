import { ALL_EVENTS, EVENTS_BY_ID } from '@/content';
import { CAREERS } from '@/data/careers';
import { createLife, cloneState, syncPlayerToWorld } from '@/engine/gameState';
import { spawnKin } from '@/engine/kinFactory';
import { applyEffects } from '@/engine/consequenceEngine';
import { applyChoice } from '@/engine/storyGraph';
import { bindEventActors, isChoiceEnabled, isEventPlayable } from '@/engine/eventPicker';
import { addRoyalClaim, recogniseRuler } from '@/engine/royalSuccessionEngine';
import { runWithWorldRng } from '@/engine/random';
import type { GameEvent, GameState } from '@/types/game';

function fixture(e:GameEvent):GameState {
 const s=createLife({worldSeed:17071,birthOrigin:'peasant',lifetimeUnlocked:true});
 for(const c of Object.values(s.world.characters))c.age+=30;
 s.age=30;s.world.currentYear=s.bornYear+30;s.gold=500;s.rankIdx=3;s.stats={health:80,wits:80,charm:80,faith:80};
 const p=s.world.characters[s.playerCharacterId];p.rankIdx=3;p.attraction=p.gender==='man'?'women':'men';p.factionInfluence=60;
 for(const id of p.parentIds??[])s.world.characters[id].alive=true;
 s.world.households.find(h=>h.id===p.householdId)!.wealth=100;
 if(e.requires?.careerFamilies)s.occupation.careerId=CAREERS.find(c=>c.family===e.requires!.careerFamilies![0])!.id;
 if(e.actorRoles?.spouse)spawnKin(s,{kind:'spouse',age:30});
 if(e.actorRoles?.child)spawnKin(s,{kind:'child',age:Math.max(e.actorRoles.child.minAge??4,Math.min(8,e.actorRoles.child.maxAge??17))});
 if(e.actorRoles?.sibling)spawnKin(s,{kind:'sibling',age:32});
 if(e.actorRoles?.other?.romanceEligible)spawnKin(s,{kind:'friend',age:28,gender:p.gender==='man'?'woman':'man',attraction:p.gender==='man'?'men':'women'});
 for(const id of e.requires?.hasHealthCondition??[])applyEffects(s,{healthCondition:{conditionId:id,severity:20}});
 if(e.requires?.statAtMost?.health)s.stats.health=e.requires.statAtMost.health;
 if(e.requires?.legalStatuses){p.legalState!.status=e.requires.legalStatuses[0];if(p.legalState!.status==='imprisoned')s.tags.push('imprisoned');}
 if(e.requires?.maxReputation!==undefined)s.reputation=e.requires.maxReputation;
 if(e.id.startsWith('life_crown_')){addRoyalClaim(s,p.id,s.world.court!.rulerId,'recognition',90);recogniseRuler(s,p.id,'A test coronation');}
 if(e.id==='life_regency_signature'){s.world.characters[s.world.court!.rulerId].age=10;s.world.court!.regentId='edwin';}
 syncPlayerToWorld(s);return s;
}
const newEncounters=ALL_EVENTS.filter(e=>e.id.startsWith('life_'));
it('every new encounter has a reachable cast and a free response under its actual circumstances',()=>{
 for(const e of newEncounters){
  const s=fixture(e),before=JSON.stringify(s.world.rngState);
  expect({id:e.id,playable:isEventPlayable(s,e)}).toEqual({id:e.id,playable:true});
  expect(JSON.stringify(s.world.rngState)).toBe(before);
  s.pendingEvent={eventId:e.id,bindings:runWithWorldRng(s.world,()=>bindEventActors(s,e))};
  expect(e.choices.some(c=>!c.costGold&&isChoiceEnabled(s,c))).toBe(true);
  expect(new Set(Object.values(s.pendingEvent.bindings??{})).size).toBe(Object.keys(s.pendingEvent.bindings??{}).length);
 }
});
it('all authored branches execute, and every declared major scenario can change actual life or world state',()=>{
 for(const e of newEncounters){
  const base=fixture(e);base.pendingEvent={eventId:e.id,bindings:runWithWorldRng(base.world,()=>bindEventActors(base,e))};
  let major=false;
  for(const c of e.choices)for(const roll of c.outcome?[1]:[0,1]){
   const s=cloneState(base);if(!isChoiceEnabled(s,c))continue;
   const p=s.world.characters[s.playerCharacterId],spouse=p.spouseId,job=s.occupation.careerId,status=p.legalState!.status,sentence=p.legalState!.sentenceYearsRemaining,alive=Object.values(s.world.characters).filter(x=>x.alive).length;
   const chosen={...c,successChance:roll};
   runWithWorldRng(s.world,()=>applyChoice(s,e,chosen));
   const effects=(c.outcome??(roll?c.success:c.failure))!.effects!;
   if(effects.killKin){const id=base.pendingEvent!.bindings?.[effects.killKin]??effects.killKin;expect({id:e.id,alive:s.world.characters[id]?.alive}).toEqual({id:e.id,alive:false});}
   if(effects.endMarriage)expect(p.spouseId).toBeUndefined();
   if(effects.employment==='dismiss')expect(s.occupation.careerId).toBeNull();
   if(effects.healthCondition){const id=base.pendingEvent!.bindings?.[effects.healthCondition.targetId??'']??effects.healthCondition.targetId??s.playerCharacterId;expect(s.world.characters[id].healthConditions!.some(h=>h.conditionId===effects.healthCondition!.conditionId)).toBe(true);}
   if(effects.death)expect(s.dead).toBe(true);
   major ||= p.legalState!.status!==status||p.legalState!.sentenceYearsRemaining!==sentence||s.dead||Object.values(s.world.characters).filter(x=>x.alive).length<alive||!!(spouse&&!p.spouseId)||!!(job&&!s.occupation.careerId)||!!effects.healthCondition||!!effects.prison||!!effects.royalTransition||(effects.debt?.principal??0)>=20||(effects.householdState?.wealth??0)<=-20||!!effects.legal?.charge;
  }
  if(e.stakes==='major')expect({id:e.id,major}).toEqual({id:e.id,major:true});
 }
});
it('every callback names a real source choice; expired or deceased actors cannot be substituted',()=>{
 for(const e of ALL_EVENTS.filter(e=>e.callback)){
  const spec=e.callback!,source=EVENTS_BY_ID[spec.eventId];expect(source).toBeDefined();
  for(const choiceId of spec.choiceIds)expect(source.choices.some(c=>c.id===choiceId)).toBe(true);
  const s=fixture(e);s.world.history.push({id:'past',year:s.world.currentYear-1,type:'choice',eventId:source.id,resolvedChoiceId:spec.choiceIds[0],actorBindings:{[spec.roleMap?.other??'other']:'merek'},participantIds:[s.playerCharacterId,'merek'],familyIds:[s.world.characters[s.playerCharacterId].birthFamilyId!],causes:[source.title],summary:'A specific past choice',salience:3});
  const bindings=bindEventActors(s,e);expect(bindings).toEqual({other:'merek'});
  s.world.characters.merek.alive=false;expect(isEventPlayable(s,e)).toBe(false);
  s.world.characters.merek.alive=true;s.world.currentYear+=20;expect(isEventPlayable(s,e)).toBe(false);
 }
});
it('retains Premium gates in both new royal scenes and their callbacks',()=>{
 for(const e of ALL_EVENTS.filter(e=>e.premium&&(e.id.startsWith('life_')||e.callback))){const s=fixture(e);s.lifetimeUnlocked=false;expect(isEventPlayable(s,e)).toBe(false);}
});
it('allows adult petitioners in monarch scenes without requiring a second noble',()=>{
 for(const e of newEncounters.filter(e=>e.id.startsWith('life_crown_'))){
  const s=fixture(e);
  for(const c of Object.values(s.world.characters))if(c.id!==s.playerCharacterId)c.rankIdx=0;
  expect({id:e.id,playable:isEventPlayable(s,e)}).toEqual({id:e.id,playable:true});
 }
});
