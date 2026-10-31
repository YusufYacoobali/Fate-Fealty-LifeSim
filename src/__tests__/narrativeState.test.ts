import { createLife, cloneState, syncPlayerToWorld } from '@/engine/gameState';
import { applyEffects } from '@/engine/consequenceEngine';
import { gameReducer } from '@/state/gameReducer';
import { bindEventActors, eventById, isEventPlayable } from '@/engine/eventPicker';
import { normalizeGameState } from '@/state/persistence';
import { spawnKin } from '@/engine/kinFactory';
import { runWithWorldRng } from '@/engine/random';
import { CONTENT_MIGRATIONS } from '@/content/contentVersion';
import type { GameEvent } from '@/types/game';

function adult() {
 const s=createLife({worldSeed:8841,lifetimeUnlocked:true}); s.age=s.world.characters[s.playerCharacterId].age=30; s.gold=100;
 return s;
}
it('applies a feud to both real families, removes their alliance and retains inherited memories',()=>{
 const s=adult(),p=s.world.characters[s.playerCharacterId];
 const other=Object.values(s.world.characters).find(c=>c.alive&&c.birthFamilyId!==p.birthFamilyId&&s.world.families[c.birthFamilyId!])!;
 const a=s.world.families[p.birthFamilyId!],b=s.world.families[other.birthFamilyId!];
 a.allyFamilyIds=[b.id];b.allyFamilyIds=[a.id];s.pendingEvent={eventId:'test',bindings:{other:other.id}};
 applyEffects(s,{familyFeud:{role:'other',reason:'A witnessed false accusation'},bond:{role:'other',trust:-20,flag:'feud'}});
 expect(a.enemyFamilyIds).toContain(b.id);expect(b.enemyFamilyIds).toContain(a.id);
 expect(a.allyFamilyIds).not.toContain(b.id);expect(b.allyFamilyIds).not.toContain(a.id);
 expect(b.inheritedMemories.some(m=>m.summary.includes(p.name)&&m.summary.includes(other.name))).toBe(true);
});
it('ends actual marriage links and removes employment while keeping professional history',()=>{
 const s=adult(),p=s.world.characters[s.playerCharacterId],spouse=spawnKin(s,{kind:'spouse',age:30});
 s.occupation.careerId='copyist';p.professionalHistory!.law={experience:4,reputation:25,contactIds:[],matters:[],completedStories:[],activeCaseId:undefined} as any;
 const history=JSON.stringify(p.professionalHistory);
 applyEffects(s,{endMarriage:true,employment:'dismiss'});
 expect(p.spouseId).toBeUndefined();expect(spouse.spouseId).toBeUndefined();expect(s.tags).not.toContain('married');
 expect(s.occupation.careerId).toBeNull();expect(JSON.stringify(p.professionalHistory)).toBe(history);
});
it('kills the bound person and records disabilities as disabilities',()=>{
 const s=adult();s.pendingEvent={eventId:'test',bindings:{victim:'merek'}};
 const target=s.world.characters.merek;expect(target.alive).toBe(true);
 applyEffects(s,{healthCondition:{conditionId:'chronic_pain',severity:30},killKin:'victim'});
 expect(target.alive).toBe(false);
 expect(s.world.characters[s.playerCharacterId].healthConditions!.find(c=>c.conditionId==='chronic_pain')?.kind).toBe('disability');
});
it('solves distinct actor roles and keeps impossible casts out of the lottery without drawing RNG',()=>{
 const s=adult(); const before=JSON.stringify(s.world.rngState);
 const e:GameEvent={id:'cast',title:'CAST',category:'family',text:'',choices:[{label:'Continue',outcome:{text:'Done',effects:{}}}],actorRoles:{a:{characterId:'merek',alive:true,missingActor:'clear_event'},b:{characterId:'merek',alive:true,missingActor:'clear_event'}}};
 expect(isEventPlayable(s,e)).toBe(false);expect(JSON.stringify(s.world.rngState)).toBe(before);
 e.actorRoles!.b.characterId='edwin';
 expect(isEventPlayable(s,e)).toBe(true);
 expect(runWithWorldRng(s.world,()=>bindEventActors(s,e))).toEqual({a:'merek',b:'edwin'});
});
it('reserves the goose for explicitly authored goose roles, even in old worlds',()=>{
 const s=adult();s.world.characters.goose.age=30;
 for(const c of Object.values(s.world.characters))if(c.id!==s.playerCharacterId&&c.id!=='goose')c.alive=false;
 const event:GameEvent={id:'human',title:'HUMAN',category:'family',text:'{{other}} writes a letter.',choices:[{label:'Read',outcome:{text:'Read.',effects:{}}}],actorRoles:{other:{alive:true,minAge:18,missingActor:'clear_event'}}};
 expect(isEventPlayable(s,event)).toBe(false);
 event.actorRoles!.other.characterId='goose';
 expect(isEventPlayable(s,event)).toBe(true);
 expect(bindEventActors(s,event)).toEqual({other:'goose'});
});
it('offers a short callback with the original actor after reload and records its source',()=>{
 let s=adult();const source=eventById('peasant_quack_doctor')!;
 s.pendingEvent={eventId:source.id,bindings:{other:'merek'}};
 s=gameReducer(s,{type:'CHOOSE',choice:source.choices[0]});
 const history=s.world.history.find(h=>h.eventId===source.id)!;
 expect(history.actorBindings).toEqual({other:'merek'});
 s.world.currentYear++;syncPlayerToWorld(s);
 const untouched=cloneState(s);s=normalizeGameState(JSON.parse(JSON.stringify(s)));
 const echo=eventById('echo_cooling_stone')!;
 expect(isEventPlayable(s,echo)).toBe(true);expect(s.world.rngState).toEqual(untouched.world.rngState);
 expect(bindEventActors(s,echo)).toEqual({other:'merek'});
 s.pendingEvent={eventId:echo.id,bindings:bindEventActors(s,echo)};
 s=gameReducer(s,{type:'CHOOSE',choice:echo.choices[0]});
 expect(s.world.history.find(h=>h.eventId===echo.id)?.callbackForHistoryId).toBe(history.id);
 expect(isEventPlayable(s,echo)).toBe(false);
});
it('preserves old history through the only essential title correction and leaves chain titles intact',()=>{
 const s=adult();s.world.history=[{id:'old',year:1320,type:'choice',participantIds:[],familyIds:[],causes:['MAUD TAKES ILL','AT THE CHURCH DOOR'],summary:'An old decision',salience:2}];
 const before=JSON.stringify(s.world.rngState),migrated=CONTENT_MIGRATIONS[7](s.world).world;
 expect(migrated.history[0].causes).toEqual(['A MOTHER TAKES ILL','AT THE CHURCH DOOR']);expect(JSON.stringify(migrated.rngState)).toBe(before);
});
it('spaces separate royal accounting prompts using saved court decisions',()=>{
 const {directYear}=require('@/engine/director');
 const s=adult(),court=s.world.court!;court.rulerId=s.playerCharacterId;s.rankIdx=5;
 court.scandals=[{office:'treasurer',actorId:'edwin',amount:12,exposed:false}];
 expect(directYear(s).event?.id).toBe('royal_creative_accounts');
 court.records.push({year:s.world.currentYear,kind:'scandal_investigate',actorId:s.playerCharacterId,detail:'A prior inquiry'});
 s.world.currentYear++;
 expect(directYear(s).event?.id).not.toBe('royal_creative_accounts');
 syncPlayerToWorld(s);const loaded=normalizeGameState(JSON.parse(JSON.stringify(s)));
 expect(directYear(loaded).event?.id).not.toBe('royal_creative_accounts');
 loaded.world.currentYear+=2;
 expect(directYear(loaded).event?.id).toBe('royal_creative_accounts');
});

it('gives newly formed households the same capacity before and after normalization',()=>{
 const s=adult();const newcomer=spawnKin(s,{kind:'acquaintance',age:28});
 const home=s.world.households.find(h=>h.id===newcomer.householdId)!;
 expect(home.capacity).toBe(4);
 syncPlayerToWorld(s);
 const loaded=normalizeGameState(JSON.parse(JSON.stringify(s)));
 expect(loaded.world.households.find(h=>h.id===home.id)).toEqual(home);
});
it('moves an existing consenting spouse out of the old household immediately',()=>{
 const s=adult(),p=s.world.characters[s.playerCharacterId];
 p.attraction=p.gender==='man'?'women':'men';s.attraction=p.attraction;
 const partner=spawnKin(s,{kind:'friend',age:28,gender:p.gender==='man'?'woman':'man',attraction:p.gender==='man'?'men':'women'});
 const old=s.world.households.find(h=>h.id===partner.householdId)!;
 s.pendingEvent={eventId:'test',bindings:{partner:partner.id}};
 applyEffects(s,{marryRole:'partner'});
 expect(p.spouseId).toBe(partner.id);expect(partner.householdId).toBe(p.householdId);
 expect(old.memberIds).not.toContain(partner.id);
 expect(s.world.households.filter(h=>h.memberIds.includes(partner.id))).toHaveLength(1);
});


it('carries recent legacy event years into shared thematic cooldowns without consuming RNG',()=>{
 const s=adult();s.world.contentLedger.court_bad_portrait={lastYear:s.world.currentYear-1,timesResolved:1,lastChoiceId:'old'};
 const before=JSON.stringify(s.world.rngState),migrated=CONTENT_MIGRATIONS[7](s.world).world;
 expect(migrated.repetitionLedger.public_vanity).toBe(s.world.currentYear-1);expect(JSON.stringify(migrated.rngState)).toBe(before);
});
it('keeps saved due dates while scheduling the next urgent beat within two years',()=>{
 const {noteChainBeatResolved}=require('@/engine/director/threads');
 const s=adult();s.world.threads=[{id:'winter_roof',beatIndex:0,total:5,nextDueYear:s.world.currentYear+6,openedYear:s.world.currentYear}];
 syncPlayerToWorld(s);const loaded=normalizeGameState(JSON.parse(JSON.stringify(s)));
 expect(loaded.world.threads![0].nextDueYear).toBe(s.world.currentYear+6);
 runWithWorldRng(loaded.world,()=>noteChainBeatResolved(loaded,eventById('quality_winter_roof_2')));
 expect(loaded.world.threads![0].nextDueYear-loaded.world.currentYear).toBeGreaterThanOrEqual(1);
 expect(loaded.world.threads![0].nextDueYear-loaded.world.currentYear).toBeLessThanOrEqual(2);
});

it('does not summon a dead Roderick, and real forgiveness clears his personal rivalry',()=>{
 const s=adult(),event=eventById('family_roderick_truce')!;
 s.world.characters.roderick.rel=45;s.world.characters.roderick.alive=false;expect(isEventPlayable(s,event)).toBe(false);
 s.world.characters.roderick.alive=true;s.pendingEvent={eventId:event.id,bindings:{other:'roderick'}};
 const {applyChoice}=require('@/engine/storyGraph');runWithWorldRng(s.world,()=>applyChoice(s,event,event.choices[0]));
 const relation=Object.values(s.world.relationships).find(r=>r.aId==='roderick'||r.bId==='roderick')!;
 expect(relation.flags).not.toContain('rival');expect(relation.flags).toContain('friend');
});
it('creates the narrated newborn sibling at birth age and without an adult job',()=>{
 const s=adult();s.age=5;const e=eventById('family_sibling_born')!;s.pendingEvent={eventId:e.id,bindings:{mother:'mother'}};
 const before=new Set(Object.keys(s.world.characters));const {applyChoice}=require('@/engine/storyGraph');
 runWithWorldRng(s.world,()=>applyChoice(s,e,e.choices[0]));
 const baby=Object.values(s.world.characters).find(c=>!before.has(c.id))!;
 expect(baby.age).toBe(0);expect(baby.occupation.careerId).toBeNull();
});
it('does not serve an old marriage continuation after the spouse dies',()=>{
 const s=adult();const spouse=spawnKin(s,{kind:'spouse',age:30});
 s.activeArcs=[{arc:'marriage',nextNodeId:'arc_marriage_2',startedAge:s.age-1}];spouse.alive=false;
 const {popReadyArc}=require('@/engine/storyGraph');expect(popReadyArc(s)).toBeNull();expect(s.activeArcs).toEqual([]);
});
