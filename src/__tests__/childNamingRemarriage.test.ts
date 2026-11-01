import {makeState} from './helpers';
import {cloneState,syncPlayerToWorld} from '@/engine/gameState';
import {spawnKin,killKin} from '@/engine/kinFactory';
import {activeSpouse,linkSpouses,reconcileMarriages,unlinkSpouse} from '@/engine/characterState';
import {canProposeTo,contextualActions,courtshipUnavailableReason,maybeCreateNpcProposal,perspectives,relationshipWith} from '@/engine/relationshipEngine';
import {familyPlanningRoute,tickFamilyFormation} from '@/engine/familyFormationEngine';
import {tickKinMortality} from '@/engine/lifecycleEngine';
import {tickStructuredHealth} from '@/engine/healthEngine';
import {applyEffects,killPlayer} from '@/engine/consequenceEngine';
import {gameReducer} from '@/state/gameReducer';
import {normalizeGameState} from '@/state/persistence';
import {canNameChild,childNameError,namingChildId,normalizeChildNaming,queueChildNaming,suggestedChildName} from '@/engine/childNaming';
import {repairWorldIntegrity,worldIntegrityIssues} from '@/engine/worldIntegrity';
import {eligibleHeirs} from '@/engine/successionEngine';
import * as random from '@/engine/random';
import type {GameState} from '@/types/game';

afterEach(()=>jest.restoreAllMocks());
function base(){const s=makeState({age:25,gold:100});syncPlayerToWorld(s);return s;}
function candidate(s:GameState){return spawnKin(s,{kind:'friend',age:25,gender:s.attraction==='women'?'woman':'man',attraction:s.gender==='woman'?'women':'men'});}
function wed(s:GameState,id:string){s.world.proposalFromId=id;const next=gameReducer(s,{type:'KIN_INTERACT',id,action:'accept_proposal'});expect(activeSpouse(next)?.id).toBe(id);return next;}
function arrival(s:GameState,route:'pregnancy'|'adoption'|'wardship'='pregnancy',parentIds=[s.playerCharacterId,activeSpouse(s)!.id]){
 const p=s.world.characters[s.playerCharacterId];s.world.expectedChildren.push({id:'arrival_'+s.nextId++,route,parentIds,dueYear:s.world.currentYear,householdId:p.householdId!,familyId:p.birthFamilyId!,status:'expected'});
 tickFamilyFormation(s);return s.world.characters[namingChildId(s)!];
}
function loss(s:GameState,route:string,id:string){
 if(route==='old age'){s.world.characters[id].age=90;jest.spyOn(random,'chance').mockReturnValue(true);tickKinMortality(s);}
 if(route==='illness'){const spouse=s.world.characters[id];spouse.healthConditions=[{id:'illness',conditionId:'plague',kind:'illness',severity:100,diagnosed:true,startedYear:s.world.currentYear,nextReviewYear:s.world.currentYear}];s.world.conditions.diseasePressure=0;jest.spyOn(random,'chance').mockReturnValue(true);tickStructuredHealth(s);}
 if(route==='event')applyEffects(s,{killKin:id});
 jest.restoreAllMocks();expect(s.world.characters[id].alive).toBe(false);expect(s.tags).toContain('widowed');expect(s.tags).not.toContain('married');expect(activeSpouse(s)).toBeUndefined();
}

it.each(['old age','illness','event'])('supports every ordinary romance route after spouse death through %s',route=>{
 let s=base();const first=candidate(s);s=wed(s,first.id);loss(s,route,first.id);
 const next=candidate(s);expect(courtshipUnavailableReason(s,next)).toBeNull();expect(canProposeTo(s,next)).toBe(true);expect(contextualActions(s,next)).toEqual(expect.arrayContaining(['flirt','court','propose']));
 Object.assign(perspectives(s,relationshipWith(s,next.id)).other,{affinity:95,trust:95,attraction:95});jest.spyOn(random,'chance').mockReturnValue(true);maybeCreateNpcProposal(s);expect(s.world.proposalFromId).toBe(next.id);s=wed(s,next.id);
 expect(s.tags).not.toContain('widowed');expect(s.tags).toContain('married');expect(familyPlanningRoute(s,next.id)).toBe('pregnancy');expect(s.world.characters[s.playerCharacterId].marriages).toEqual(expect.arrayContaining([expect.objectContaining({spouseId:first.id,endReason:'death'})]));
});
it('preserves two bereavements, three marriages and both sets of children across reload and heir continuation',()=>{
 let s=base();const spouses:string[]=[],children:string[]=[];
 for(let n=0;n<3;n++){
  const partner=candidate(s);spouses.push(partner.id);s=wed(s,partner.id);const child=arrival(s);children.push(child.id);s=gameReducer(s,{type:'CONFIRM_CHILD_NAME',id:child.id,name:['Élodie','Jean-Luc',"O’Neill"][n]});
  expect(s.world.characters[child.id].parentIds).toEqual([s.playerCharacterId,partner.id]);
  if(n<2){loss(s,'event',partner.id);s=normalizeGameState(JSON.parse(JSON.stringify(s)));}
 }
 const before=s.world.characters[s.playerCharacterId];for(let n=0;n<3;n++)expect(s.world.characters[children[n]].parentIds).toEqual([before.id,spouses[n]]);
 const heir=s.world.characters[children[0]];heir.age=18;killPlayer(s,'The end of a long life.');s=gameReducer(s,{type:'CONTINUE_AS_HEIR',heirId:heir.id});s=normalizeGameState(JSON.parse(JSON.stringify(s)));
 expect(s.first).toBe('Élodie');expect(s.childNaming!.pendingIds).toEqual([]);expect(s.world.characters[before.id].marriages).toHaveLength(3);expect(s.world.characters[spouses[2]].spouseId).toBeUndefined();expect(worldIntegrityIssues(s)).toEqual([]);
});
it('repairs old cleared-link and dead-link saves without RNG draws, history loss or repeated repair',()=>{
 let s=base();const spouse=candidate(s);s=wed(s,spouse.id);const p=s.world.characters[s.playerCharacterId];spouse.alive=false;s.world.characters[spouse.id].alive=false;delete p.marriages;delete s.world.characters[spouse.id].marriages;
 for(const cleared of [false,true]){
  const broken=cloneState(s);if(cleared){delete broken.world.characters[p.id].spouseId;delete broken.world.characters[spouse.id].spouseId;broken.world.characters[spouse.id].kind='spouse';Object.values(broken.world.relationships).find(r=>[r.aId,r.bId].includes(spouse.id)&&[r.aId,r.bId].includes(p.id))!.flags=['family','former_spouse'];}
  const rng={...broken.world.rngState},history=JSON.stringify(broken.world.history),kids=[...p.childIds!];const loaded=normalizeGameState(JSON.parse(JSON.stringify(broken)));repairWorldIntegrity(loaded);
  expect(loaded.tags).not.toContain('married');expect(loaded.tags).toContain('widowed');expect(loaded.world.rngState).toEqual(rng);expect(JSON.stringify(loaded.world.history)).toBe(history);expect(loaded.world.characters[p.id].childIds).toEqual(kids);
  expect(normalizeGameState(JSON.parse(JSON.stringify(loaded)))).toEqual(loaded);expect(canProposeTo(loaded,candidate(loaded))).toBe(true);
 }
});
it('does not restore broken or deceased spouse links during integrity repair',()=>{
 const s=base(),a=candidate(s),b=candidate(s);s.world.characters[s.playerCharacterId].spouseId=a.id;a.spouseId=b.id;b.spouseId=a.id;
 repairWorldIntegrity(s);expect(activeSpouse(s)).toBeUndefined();expect(activeSpouse(s,a.id)?.id).toBe(b.id);
 a.alive=false;repairWorldIntegrity(s);expect(b.spouseId).toBeUndefined();expect(worldIntegrityIssues(s)).toEqual([]);
});
it('blocks living marriages despite a missing tag, and retains attraction and close-family restrictions',()=>{
 let s=base();s=wed(s,candidate(s).id);s.tags=s.tags.filter(t=>t!=='married');const next=candidate(s);expect(canProposeTo(s,next)).toBe(false);expect(courtshipUnavailableReason(s,next)).toMatch(/already married/);maybeCreateNpcProposal(s);expect(s.world.proposalFromId).toBeNull();
 loss(s,'event',activeSpouse(s)!.id);next.attraction='none';expect(canProposeTo(s,next)).toBe(false);const child=spawnKin(s,{kind:'child',age:18});expect(canProposeTo(s,child)).toBe(false);
});
it('divorce and elopement close marriages without widowhood, including a former spouse dying later',()=>{
 let s=base();s=wed(s,candidate(s).id);const old=activeSpouse(s)!;s=gameReducer(s,{type:'KIN_INTERACT',id:old.id,action:'divorce'});expect(s.tags).not.toContain('widowed');expect(s.world.characters[s.playerCharacterId].marriages![0].endReason).toBe('divorce');
 const next=candidate(s);s=wed(s,next.id);s.world.characters[old.id].age=90;jest.spyOn(random,'chance').mockReturnValue(true);tickKinMortality(s);expect(activeSpouse(s)?.id).toBe(next.id);expect(s.tags).not.toContain('widowed');
 unlinkSpouse(s,s.playerCharacterId,'elopement');expect(s.tags).not.toContain('widowed');expect(s.world.characters[s.playerCharacterId].marriages!.at(-1)!.endReason).toBe('elopement');
});
it('keeps an unborn child linked to a deceased parent after the survivor remarries',()=>{
 let s=base();s=wed(s,candidate(s).id);const late=activeSpouse(s)!.id;loss(s,'event',late);s=wed(s,candidate(s).id);const step=activeSpouse(s)!;const child=arrival(s,'pregnancy',[s.playerCharacterId,late]);expect(child.parentIds).toEqual([s.playerCharacterId,late]);expect(step.childIds).not.toContain(child.id);expect(s.world.characters[late].childIds).toContain(child.id);expect(worldIntegrityIssues(s)).toEqual([]);
});
it.each(['pregnancy','adoption','wardship'] as const)('queues a player %s arrival and updates only its exact announcement',route=>{
 let s=base();s=wed(s,candidate(s).id);const child=arrival(s,route),original=child.name;const prior={...s.world.history.at(-1)!};s.world.history.push({...prior,id:'older_independent_record',summary:`${original} appears in older narration.`});
 const rng={...s.world.rngState},clock={...s.actionClock},gold=s.gold,parents=[...child.parentIds!];s=gameReducer(s,{type:'CONFIRM_CHILD_NAME',id:child.id,name:'  Anaïs-Jane  '});
 expect(s.world.characters[child.id].name).toBe('Anaïs-Jane');expect(s.world.characters[child.id].parentIds).toEqual(parents);expect(s.feed.find(f=>f.actorId===child.id)!.text).toContain('Anaïs-Jane');expect(s.world.history.find(h=>h.id===prior.id)!.summary).toContain('Anaïs-Jane');expect(s.world.history.at(-1)!.summary).toContain(original);
 expect(s.world.rngState).toEqual(rng);expect(s.actionClock).toEqual(clock);expect(s.gold).toBe(gold);expect(s.childNaming!.pendingIds).not.toContain(child.id);
});
it('persists a queue behind events, skips invalid children, and never offers unrelated NPC births',()=>{
 let s=base();const a=spawnKin(s,{kind:'child',age:0}),b=spawnKin(s,{kind:'child',age:0}),npc=spawnKin(s,{kind:'acquaintance',age:0});expect(s.childNaming!.pendingIds).not.toContain(npc.id);
 s.pendingEvent={eventId:'peasant_confession'};s=gameReducer(s,{type:'CONFIRM_CHILD_NAME',id:a.id,name:'Blocked'});expect(s.world.characters[a.id].name).not.toBe('Blocked');s=normalizeGameState(JSON.parse(JSON.stringify(s)));expect(s.childNaming!.pendingIds).toEqual([a.id,b.id]);
 s.pendingEvent=null;s.world.characters[a.id].alive=false;s.childNaming!.pendingIds.push('missing');normalizeChildNaming(s);expect(namingChildId(s)).toBe(b.id);expect(s.childNaming!.pendingIds).toEqual([b.id]);
});
it('renames a child for free with exhausted actions, while preserving every other character field and old history',()=>{
 let s=base();const child=spawnKin(s,{kind:'child',age:10});s=gameReducer(s,{type:'CONFIRM_CHILD_NAME',id:child.id,name:child.name});s=normalizeGameState(JSON.parse(JSON.stringify(s)));s.actionClock.used=s.actionClock.cap;s.gold=0;s.lifetimeUnlocked=false;
 const before=JSON.stringify(s.world.characters[child.id]),history=JSON.stringify(s.world.history),rng={...s.world.rngState};s=gameReducer(s,{type:'OPEN_CHILD_NAMING',id:child.id});s=gameReducer(s,{type:'SUGGEST_CHILD_NAME',id:child.id});const suggestion=suggestedChildName(s,child.id);expect(suggestion).not.toBe(child.name);s=normalizeGameState(JSON.parse(JSON.stringify(s)));expect(suggestedChildName(s,child.id)).toBe(suggestion);s=gameReducer(s,{type:'CONFIRM_CHILD_NAME',id:child.id,name:" D’Arcy Éloi "});
 expect(JSON.parse(JSON.stringify({...s.world.characters[child.id],name:JSON.parse(before).name}))).toEqual(JSON.parse(before));expect(s.world.rngState).toEqual(rng);expect(s.actionClock.used).toBe(s.actionClock.cap);expect(s.gold).toBe(0);expect(JSON.stringify(s.world.history)).toBe(history);expect(eligibleHeirs(s).find(h=>h.id===child.id)!.name).toBe('D’Arcy Éloi');
});
it('only permits own living minors and legally held wards, with no inference from kind alone',()=>{
 const s=base(),child=spawnKin(s,{kind:'child',age:17}),stranger=spawnKin(s,{kind:'friend',age:12});expect(canNameChild(s,child.id)).toBe(true);child.age=18;expect(canNameChild(s,child.id)).toBe(false);stranger.kind='child';expect(canNameChild(s,stranger.id)).toBe(false);stranger.lineageStatus='ward';stranger.guardianIds=[s.playerCharacterId];stranger.householdId=s.world.characters[s.playerCharacterId].householdId;expect(canNameChild(s,stranger.id)).toBe(true);stranger.alive=false;expect(canNameChild(s,stranger.id)).toBe(false);
});
it.each(['','   ','A\nB','A\tB','A\u0000B','A\u202eB','A'.repeat(21)])('rejects invalid names without consuming the request: %p',name=>{
 let s=base();const child=spawnKin(s,{kind:'child',age:0});expect(childNameError(name)).toBeTruthy();const before=s;s=gameReducer(s,{type:'CONFIRM_CHILD_NAME',id:child.id,name});expect(s).toBe(before);expect(namingChildId(s)).toBe(child.id);
});

it('elopes through the ordinary affair actions without marking the abandoned spouse widowed',()=>{
 let s=base();s=wed(s,candidate(s).id);const abandoned=activeSpouse(s)!.id,lover=candidate(s);
 Object.assign(perspectives(s,relationshipWith(s,lover.id)).other,{affinity:100,trust:100,attraction:100});jest.spyOn(random,'chance').mockReturnValue(true);
 s=gameReducer(s,{type:'KIN_INTERACT',id:lover.id,action:'seduce'});expect(contextualActions(s,s.world.characters[lover.id])).toContain('elope');s=gameReducer(s,{type:'KIN_INTERACT',id:lover.id,action:'elope'});
 expect(activeSpouse(s)?.id).toBe(lover.id);expect(s.world.characters[abandoned].alive).toBe(true);expect(s.world.characters[abandoned].spouseId).toBeUndefined();expect(s.tags).not.toContain('widowed');expect(s.world.characters[s.playerCharacterId].marriages![0].endReason).toBe('elopement');
});
it('retains an heir’s own current and previous marriages when control changes',()=>{
 let s=base();const heir=spawnKin(s,{kind:'child',age:24}),late=candidate(s),current=candidate(s);linkSpouses(s,heir.id,late.id);s.world.characters[late.id].alive=false;unlinkSpouse(s,late.id,'death');linkSpouses(s,heir.id,current.id);killPlayer(s,'Natural death.');
 s=gameReducer(s,{type:'CONTINUE_AS_HEIR',heirId:heir.id});s=normalizeGameState(JSON.parse(JSON.stringify(s)));expect(activeSpouse(s)?.id).toBe(current.id);expect(s.tags).toContain('married');expect(s.tags).not.toContain('widowed');expect(s.world.characters[heir.id].marriages).toHaveLength(2);expect(s.childNaming!.pendingIds).toEqual([]);
});
it('does not queue a child born to unrelated NPCs',()=>{
 const s=base(),a=candidate(s),b=candidate(s);linkSpouses(s,a.id,b.id);arrival(s,'pregnancy',[a.id,b.id]);expect(s.childNaming!.pendingIds).toEqual([]);
});

it('clears an impossible old NPC proposal so a widowed character can receive a new one',()=>{
 let s=base();const first=candidate(s);s=wed(s,first.id);loss(s,'event',first.id);s.world.proposalFromId=first.id;const next=candidate(s);Object.assign(perspectives(s,relationshipWith(s,next.id)).other,{affinity:95,trust:95,attraction:95});jest.spyOn(random,'chance').mockReturnValue(true);maybeCreateNpcProposal(s);expect(s.world.proposalFromId).toBe(next.id);
});
