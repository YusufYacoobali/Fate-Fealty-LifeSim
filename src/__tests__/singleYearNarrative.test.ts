import {ALL_EVENTS,EVENTS_BY_ID} from '@/content';
import {LEGACY_STORY_TEMPLATES,PERSISTENT_STORY_TEMPLATES} from '@/content/persistentStories';
import {QUALITY_CHAIN_SPECS} from '@/content/qualityAmbientEvents';
import {LEGACY_CALLBACK_EVENTS} from '@/content/legacyCallbackEvents';
import {CHILDHOOD_DEPTH_EVENTS} from '@/content/childhoodDepthEvents';
import {createLife,cloneState,syncPlayerToWorld} from '@/engine/gameState';
import {gameReducer} from '@/state/gameReducer';
import {applyChoice,queueArc,popReadyArc} from '@/engine/storyGraph';
import {bindEventActors,isChoiceEnabled,isEventPlayable,isEventEligible} from '@/engine/eventPicker';
import {BIRTH_ORIGINS} from '@/data/birthOrigins';
import {normalizeGameState} from '@/state/persistence';
import {recoverSavedContent} from '@/engine/contentRecovery';
import {CONTENT_MIGRATIONS} from '@/content/contentVersion';
import {applyEffects,legacyScore} from '@/engine/consequenceEngine';
import {runWithWorldRng} from '@/engine/random';
import {renderBoundText} from '@/content/persistentWorldEvents';
import {singleYearFixture} from './singleYearFixtures';

const converted=ALL_EVENTS.filter(e=>!e.legacyNarrative&&e.convertedFrom);
const fresh=[...converted,...CHILDHOOD_DEPTH_EVENTS];
it('keeps substantial childhood choice pools across natural free and Premium origins',()=>{
 const samples:Record<number,number[]>={6:[],12:[]};
 for(let seed=840000;seed<840014;seed++){
  let s=createLife({worldSeed:seed,birthOrigin:BIRTH_ORIGINS[(seed-840000)%7].id,lifetimeUnlocked:seed%2===0});
  while(!s.dead&&s.age<=12){
   for(let scene=0;s.pendingEvent&&!s.dead&&scene<2;scene++){
    const e=EVENTS_BY_ID[s.pendingEvent.eventId];s=gameReducer(s,{type:'CHOOSE',choice:e.choices.find(c=>isChoiceEnabled(s,c))!});
   }
   if(s.dead)break;
   if(s.age===6||s.age===12)samples[s.age].push(ALL_EVENTS.filter(e=>isEventEligible(s,e)).length);
   if(s.age===12)break;s=gameReducer(s,{type:'AGE_UP'});
  }
 }
 expect(samples[6].length).toBeGreaterThanOrEqual(10);expect(samples[12].length).toBeGreaterThanOrEqual(10);
 expect(Math.min(...samples[6])).toBeGreaterThanOrEqual(15);expect(Math.min(...samples[12])).toBeGreaterThanOrEqual(35);
});
it('uses a different available person for an unrelated generic role and keeps canonical kin',()=>{
 const e=EVENTS_BY_ID.young_errand_receipt,s=singleYearFixture(e);
 const candidates=Object.values(s.world.characters).filter(c=>c.alive&&c.age>=18&&c.id!==s.playerCharacterId&&c.id!=='goose');
 const freshActor=candidates[candidates.length-1];
 s.world.history=candidates.slice(0,-1).map((c,i)=>({id:'recent_'+i,year:s.world.currentYear,type:'event',summary:'An unrelated village role',participantIds:[c.id],familyIds:[],causes:[],salience:1,actorBindings:{other:c.id}}));
 // A single recent encounter can contain several people; all remain valid actors.
 s.world.history=[{...s.world.history[0],actorBindings:Object.fromEntries(candidates.filter(c=>c.id!==freshActor.id).map(c=>[c.id,c.id]))}];
 expect(runWithWorldRng(s.world,()=>bindEventActors(s,e))?.other).toBe(freshActor.id);
 const family=EVENTS_BY_ID.young_pocket_inventory;
 expect(s.world.characters[s.playerCharacterId].parentIds).toContain(runWithWorldRng(s.world,()=>bindEventActors(s,family))?.carer);
});
it('accounts for all 29 templates, 21 chains and 48 callbacks without an active schedule',()=>{
 expect(LEGACY_STORY_TEMPLATES).toHaveLength(29);expect(QUALITY_CHAIN_SPECS).toHaveLength(21);expect(LEGACY_CALLBACK_EVENTS).toHaveLength(48);
 expect(PERSISTENT_STORY_TEMPLATES).toEqual([]);expect(CHILDHOOD_DEPTH_EVENTS).toHaveLength(48);
 for(const source of [...LEGACY_STORY_TEMPLATES.map(t=>t.id),...QUALITY_CHAIN_SPECS.map(c=>'chain:'+c.id),...LEGACY_CALLBACK_EVENTS.map(e=>'callback:'+e.id)])expect(converted.some(e=>e.convertedFrom===source)).toBe(true);
 for(const e of ALL_EVENTS.filter(e=>!e.legacyNarrative)){
  expect(e.chain).toBeUndefined();expect(e.callback).toBeUndefined();
  for(const c of e.choices)for(const o of [c.outcome,c.success,c.failure])expect(o?.nextWhen).not.toBe('nextYear');
 }
});
it('every conversion and childhood scene has an actual living cast and affordable complete response',()=>{
 const unreachable:string[]=[];
 for(const e of fresh){
  const s=singleYearFixture(e),before=JSON.stringify(s.world.rngState);
  if(!isEventPlayable(s,e)){unreachable.push(e.id);continue;}
  expect(JSON.stringify(s.world.rngState)).toBe(before);
  s.pendingEvent={eventId:e.id,bindings:runWithWorldRng(s.world,()=>bindEventActors(s,e))};
  expect(new Set(Object.values(s.pendingEvent.bindings??{})).size).toBe(Object.keys(s.pendingEvent.bindings??{}).length);
  expect(e.choices.some(c=>!c.costGold&&isChoiceEnabled(s,c))).toBe(true);
  const text=renderBoundText(s,typeof e.text==='string'?e.text:e.text(s));expect(text).not.toMatch(/\{\{|someone once known|a familiar face/);
  for(const id of Object.values(s.pendingEvent.bindings??{}))expect(s.world.characters[id].alive).toBe(true);
 }
 expect(unreachable).toEqual([]);
});
it('executes both chance outcomes and every converted choice in its current year, without duplicate rewards',()=>{
 for(const e of fresh){
  const base=singleYearFixture(e);base.pendingEvent={eventId:e.id,bindings:runWithWorldRng(base.world,()=>bindEventActors(base,e))};
  for(const c of e.choices)for(const roll of c.outcome?[1]:[0,1]){
   const s=cloneState(base);if(!isChoiceEnabled(s,c))continue;
   const year=s.world.currentYear;runWithWorldRng(s.world,()=>applyChoice(s,e,{...c,successChance:roll}));
   expect({id:e.id,pending:s.pendingEvent,arcs:s.activeArcs,threads:s.world.threads??[],year:s.world.currentYear}).toEqual({id:e.id,pending:null,arcs:[],threads:[],year});
   expect(s.world.activeStories.some(story=>['active','paused'].includes(story.status))).toBe(false);
   expect(s.world.history.some(h=>h.eventId===e.id)).toBe(true);
   const after=JSON.stringify(s);applyChoice(s,e,c);expect(JSON.stringify(s)).toBe(after);
  }
 }
});
it('archives legacy plots without changing genealogy, RNG, purchases, debts or real scheduled consequences',()=>{
 const s=normalizeGameState(createLife({worldSeed:9091,lifetimeUnlocked:true}));s.world.contentVersion=8;
 s.world.activeStories=[{id:'old_story',templateId:'rivals_rise',scale:'major',status:'active',bindings:{rival:'roderick',patron:'aldric'},variables:{approach:'bold'},currentBeatId:'beat_3',startedYear:s.world.currentYear,nextEligibleYear:s.world.currentYear+3,lastBeatYear:s.world.currentYear,generationStarted:1}];
 s.world.threads=[{id:'winter_roof',beatIndex:1,total:4,openedYear:s.world.currentYear,nextDueYear:s.world.currentYear+5,bindings:{other:'edwin'}}];
 s.activeArcs=[{arc:'marriage',nextNodeId:'arc_marriage_2',startedAge:0}];
 applyEffects(s,{debt:{principal:30,interestRate:0.1},healthCondition:{conditionId:'chronic_pain',severity:20}});
 s.world.scheduledConsequences=[
  {id:'real',dueYear:s.world.currentYear+1,scope:'world',targetIds:[],resolution:{type:'condition',condition:'foodSecurity',delta:5,label:'Seed planted'},explanation:'Real spring planting'},
  {id:'rival',dueYear:s.world.currentYear+2,scope:'family',targetIds:[],resolution:{type:'relationship',aId:s.playerCharacterId,bId:'roderick',affinity:-12},explanation:'An autonomous rival retains evidence'},
  {id:'chapter',dueYear:s.world.currentYear+3,scope:'world',targetIds:[],resolution:{type:'history',historyType:'delayed_story_consequence',summary:'A chapter',salience:2},explanation:'Three years later'},
 ];
 s.pendingEvent={eventId:'quality_winter_roof_2',bindings:{other:'edwin'}};
 syncPlayerToWorld(s);const before=JSON.stringify({rng:s.world.rngState,people:s.world.characters,debts:s.debts,paid:s.lifetimeUnlocked,gold:s.gold});
 const migrated=recoverSavedContent(normalizeGameState(JSON.parse(JSON.stringify(s)))).state;
 expect({rng:migrated.world.rngState,people:migrated.world.characters,debts:migrated.debts,paid:migrated.lifetimeUnlocked,gold:migrated.gold}).toEqual(JSON.parse(before));
 expect(migrated.world.activeStories[0].status).toBe('retired');expect(migrated.world.threads).toEqual([]);expect(migrated.activeArcs).toEqual([]);
 expect(migrated.world.scheduledConsequences.map(c=>c.id)).toEqual(['real','rival']);
 expect(migrated.pendingEvent).toEqual(s.pendingEvent);
 const event=EVENTS_BY_ID[migrated.pendingEvent!.eventId];runWithWorldRng(migrated.world,()=>applyChoice(migrated,event,event.choices[0]));
 expect(migrated.pendingEvent).toBeNull();expect(migrated.world.threads).toEqual([]);
 const again=JSON.stringify(migrated);recoverSavedContent(migrated);expect(JSON.stringify(migrated)).toBe(again);
});
it('cannot enqueue future chapters even through an old API or a visible legacy choice',()=>{
 const s=createLife();queueArc(s,'old','arc_marriage_2');expect(s.activeArcs).toEqual([]);expect(popReadyArc(s)).toBeNull();
 const e={...EVENTS_BY_ID.peasant_marriage_offer,choices:[{label:'Old choice',outcome:{text:'The current choice is resolved.',effects:{gold:1},next:'arc_marriage_2',nextWhen:'nextYear' as const}}]};
 s.pendingEvent={eventId:e.id};applyChoice(s,e,e.choices[0]);expect(s.activeArcs).toEqual([]);expect(s.pendingEvent).toBeNull();
});
it('retiring an unfinished professional commission grants no completion rewards or legacy score',()=>{
 const s=createLife();s.world.contentVersion=8;const p=s.world.characters[s.playerCharacterId];
 p.professionalHistory={trade:{reputation:0,completedActions:[],milestones:[],contactIds:[],actionsYear:-1,actionsUsed:0,lastWorkedYear:-1,matters:[{id:'dyer_debt',actorId:'merek',stage:1,resolved:false}]}};
 const score=legacyScore(s),before=s.gold;const loaded=recoverSavedContent(normalizeGameState(JSON.parse(JSON.stringify(s)))).state;
 expect(loaded.world.characters[p.id].professionalHistory!.trade!.matters[0]).toMatchObject({resolved:true,retired:true});
 expect(loaded.gold).toBe(before);expect(legacyScore(loaded)).toBe(score);expect(loaded.world.characters[p.id].professionalHistory!.trade!.milestones).toEqual([]);
});
it('does not resurrect or replace a missing legacy actor to keep a chapter alive',()=>{
 const s=createLife();s.world.contentVersion=8;s.pendingEvent={eventId:'story_rival_2',bindings:{rival:'missing_person'}};
 const before=JSON.stringify(s.world.rngState),loaded=recoverSavedContent(normalizeGameState(JSON.parse(JSON.stringify(s)))).state;
 expect(loaded.pendingEvent).toBeNull();expect(JSON.stringify(loaded.world.rngState)).toBe(before);expect(loaded.world.history.some(h=>h.type==='narrative_retired')).toBe(true);
});
it.each([true,false])('retires the professional matter too when a visible legacy participant is unavailable (missing: %s)',missing=>{
 const s=createLife({worldSeed:42});s.world.contentVersion=8;const p=s.world.characters[s.playerCharacterId];
 p.professionalHistory={trade:{reputation:0,completedActions:[],milestones:[],contactIds:[],actionsYear:-1,actionsUsed:0,lastWorkedYear:-1,matters:[{id:'dyer_debt',actorId:'merek',stage:1,resolved:false}]}};
 if(!missing)s.world.characters.merek.alive=false;
 s.pendingEvent={eventId:'profession_dyer_debt_verdict',bindings:{client:missing?'missing_person':'merek',rival:'roderick'}};
 const before=s.gold,loaded=normalizeGameState(JSON.parse(JSON.stringify(s)));
 expect(loaded.pendingEvent).toBeNull();expect(loaded.gold).toBe(before);
 expect(loaded.world.characters[p.id].professionalHistory!.trade!.matters[0]).toMatchObject({resolved:true,retired:true});
 expect(loaded.world.characters[p.id].professionalHistory!.trade!.milestones).toEqual([]);
});
it('lets a living, visible legacy professional verdict resolve the choice the player actually makes',()=>{
 const s=createLife({worldSeed:42});s.world.contentVersion=8;s.gold=100;const p=s.world.characters[s.playerCharacterId];
 p.professionalHistory={trade:{reputation:0,completedActions:[],milestones:[],contactIds:[],actionsYear:-1,actionsUsed:0,lastWorkedYear:-1,matters:[{id:'dyer_debt',actorId:'merek',stage:1,decision:'1',resolved:false}]}};
 s.pendingEvent={eventId:'profession_dyer_debt_verdict',bindings:{client:'merek',rival:'roderick'}};
 const loaded=recoverSavedContent(normalizeGameState(JSON.parse(JSON.stringify(s)))).state;
 expect(loaded.pendingEvent).toEqual(s.pendingEvent);
 const e=EVENTS_BY_ID[loaded.pendingEvent!.eventId],resolved=gameReducer(loaded,{type:'CHOOSE',choice:e.choices[1]});
 expect(resolved.pendingEvent).toBeNull();expect(resolved.activeArcs).toEqual([]);
 expect(resolved.world.characters[p.id].professionalHistory!.trade!.milestones).toContain('trading_concern');
 expect(resolved.world.characters[p.id].professionalHistory!.trade!.matters[0]).toMatchObject({resolved:true,stage:2});
});
it.each(['quality_winter_roof_2','echo_cooling_stone','profession_dyer_debt_verdict'])('withdraws %s when the old save has no cast',eventId=>{
 const s=createLife({worldSeed:42});s.world.contentVersion=8;s.pendingEvent={eventId};
 const rng=s.world.rngState,gold=s.gold,loaded=recoverSavedContent(normalizeGameState(JSON.parse(JSON.stringify(s)))).state;
 expect(loaded.pendingEvent).toBeNull();expect(loaded.gold).toBe(gold);expect(loaded.world.rngState).toEqual(rng);
});
it('recovers a visible story cast from its own saved metadata without choosing new actors',()=>{
 const s=createLife({worldSeed:42});s.world.contentVersion=8;
 s.world.activeStories=[{id:'old_story',templateId:'rivals_rise',scale:'major',status:'active',bindings:{rival:'roderick',patron:'aldric'},variables:{},currentBeatId:'beat_1',startedYear:s.world.currentYear,nextEligibleYear:s.world.currentYear,lastBeatYear:s.world.currentYear,generationStarted:1}];
 s.pendingEvent={eventId:'story_rival_1',storyInstanceId:'old_story'};const rng=s.world.rngState;
 const loaded=recoverSavedContent(normalizeGameState(JSON.parse(JSON.stringify(s)))).state;
 expect(loaded.pendingEvent?.bindings).toEqual({rival:'roderick',patron:'aldric'});expect(loaded.world.rngState).toEqual(rng);
});
