import {makeState} from './helpers';
import {createLife,cloneState,syncPlayerToWorld} from '@/engine/gameState';
import {spawnKin,killKin} from '@/engine/kinFactory';
import {activeSpouse,linkSpouses,unlinkSpouse} from '@/engine/characterState';
import {enqueuePersonalDeath,enqueueLifeEventNotice,nextLifeEventNotice,normalizeLifeEventNotices,snapshotPerson} from '@/engine/lifeEventNotices';
import {LIFE_EVENT_VARIATIONS,writeLifeEventNotice} from '@/content/lifeEventNotices';
import {tickKinMortality} from '@/engine/lifecycleEngine';
import {tickStructuredHealth} from '@/engine/healthEngine';
import {simulateLivingWorld} from '@/engine/worldEngine';
import {applyEffects,killPlayer} from '@/engine/consequenceEngine';
import {gameReducer} from '@/state/gameReducer';
import {normalizeGameState} from '@/state/persistence';
import {worldIntegrityIssues} from '@/engine/worldIntegrity';
import {relationshipWith,perspectives,performSystemicRelationshipAction} from '@/engine/relationshipEngine';
import {tickRelationshipEndings} from '@/engine/relationshipEndings';
import {maritalStatusLabel,playerMarriageLabel} from '@/engine/maritalLabels';
import {selectFamilyOverlay} from '@/engine/familyOverlay';
import * as random from '@/engine/random';
import type {GameState,LifeEventNotice} from '@/types/game';
afterEach(()=>jest.restoreAllMocks());
function base(){const s=makeState({age:25,gold:100});syncPlayerToWorld(s);return s;}
function married(){const s=base(),spouse=spawnKin(s,{kind:'spouse',age:30,gender:'woman',name:'Alys'});return {s,spouse};}
function pending(s:GameState){return s.lifeEvents!.notices.filter(n=>!n.acknowledged);}
it.each(['old age','illness','event','world health'])('captures one actual spouse death through %s before unlinking, with stable snapshots',route=>{
 const {s,spouse}=married();const id=spouse.id;
 if(route==='old age'){spouse.age=90;jest.spyOn(random,'chance').mockReturnValue(true);tickKinMortality(s);}
 if(route==='illness'){spouse.healthConditions=[{id:'plague',conditionId:'plague',kind:'illness',severity:100,diagnosed:true,startedYear:s.world.currentYear,nextReviewYear:s.world.currentYear}];s.world.conditions.diseasePressure=0;jest.spyOn(random,'chance').mockReturnValue(true);tickStructuredHealth(s);}
 if(route==='event')applyEffects(s,{killKin:id});
 if(route==='world health'){spouse.occupation={careerId:'trader',experience:0,performance:60,workedThisYear:0};spouse.stats.health=0;s.world.currentYear++;simulateLivingWorld(s);}
 expect(spouse.alive).toBe(false);const notices=s.lifeEvents!.notices.filter(n=>n.category==='spouse_death'&&n.characterIds.includes(id));expect(notices).toHaveLength(1);const n=notices[0];expect(n.people[0]).toEqual({id,name:'Alys',age:spouse.age,relationship:'spouse'});
 enqueuePersonalDeath(s,id);expect(s.lifeEvents!.notices.filter(n=>n.characterIds.includes(id)&&n.category==='spouse_death')).toHaveLength(1);
 spouse.name='A later edit';spouse.age++;expect(n.text).toContain('Alys');expect(n.people[0].age).toBe(spouse.age-1);expect(activeSpouse(s)).toBeUndefined();expect(s.tags).toContain('widowed');
});
it('notifies child, parent and actual guardian deaths, not unrelated villagers or births',()=>{
 const s=base(),p=s.world.characters[s.playerCharacterId],child=spawnKin(s,{kind:'child',age:11,name:'Edith'}),guardian=spawnKin(s,{kind:'friend',age:45}),stranger=spawnKin(s,{kind:'acquaintance',age:28});p.guardianIds=[guardian.id];
 expect(pending(s)).toHaveLength(0);killKin(s,child.id);killKin(s,p.parentIds![0]);killKin(s,guardian.id);killKin(s,stranger.id);
 expect(pending(s).map(n=>n.category).sort()).toEqual(['child_death','guardian_death','parent_death']);expect(pending(s).find(n=>n.category==='child_death')!.text).toContain('Edith');
});
it('uses wardship accurately and keeps infant/adult child losses sincere',()=>{
 const s=base(),ward=spawnKin(s,{kind:'child',age:0,name:'Robin'});ward.parentIds=[];s.world.characters[s.playerCharacterId].childIds=[];ward.guardianIds=[s.playerCharacterId];ward.lineageStatus='ward';killKin(s,ward.id);
 const n=nextLifeEventNotice(s)!;expect(n.title).toBe('YOUR WARD HAS DIED');expect(n.people[0].relationship).toBe('ward');expect(n.text).not.toContain('your child');expect(n.text).not.toMatch(/goose|tax|joke|turnip/i);
});
it('never recasts a former spouse death as current bereavement after divorce or elopement',()=>{
 for(const reason of ['divorce','elopement'] as const){const {s,spouse}=married();unlinkSpouse(s,s.playerCharacterId,reason);killKin(s,spouse.id);expect(s.lifeEvents!.notices.filter(n=>n.category==='spouse_death')).toHaveLength(0);expect(s.tags).not.toContain('widowed');expect(playerMarriageLabel(s,spouse)).toBe('Former spouse · Deceased');}
});
it('persists exact notification text and acknowledgement, costs nothing and never draws gameplay RNG',()=>{
 let {s,spouse}=married();killKin(s,spouse.id,'Old age');s.actionClock.used=s.actionClock.cap;s.gold=0;s.lifetimeUnlocked=false;
 const snapshot=JSON.stringify({world:s.world,stats:s.stats,clock:s.actionClock,year:s.world.currentYear,gold:s.gold,nextId:s.nextId,feed:s.feed});const n=nextLifeEventNotice(s)!;
 s=normalizeGameState(JSON.parse(JSON.stringify(s)));expect(nextLifeEventNotice(s)).toEqual(n);const rng={...s.world.rngState};s=gameReducer(s,{type:'ACK_LIFE_EVENT',id:n.id});
 expect(nextLifeEventNotice(s)).toBeUndefined();expect(s.world.rngState).toEqual(rng);expect(s.gold).toBe(0);expect(s.actionClock.used).toBe(s.actionClock.cap);expect(s.lifeEvents!.notices[0].acknowledged).toBe(true);
 const state=s;s=gameReducer(s,{type:'ACK_LIFE_EVENT',id:n.id});expect(s).toBe(state);const reload=normalizeGameState(JSON.parse(JSON.stringify(s)));expect(nextLifeEventNotice(reload)).toBeUndefined();expect(snapshot).toContain('Alys');
});
it('acknowledgement changes only notification state and cannot interrupt a required event',()=>{
 let {s,spouse}=married();killKin(s,spouse.id);const n=nextLifeEventNotice(s)!;s.pendingEvent={eventId:'life_boat_fare'};expect(gameReducer(s,{type:'ACK_LIFE_EVENT',id:n.id})).toBe(s);s.pendingEvent=null;
 const before=JSON.stringify({...s,lifeEvents:undefined});s=gameReducer(s,{type:'ACK_LIFE_EVENT',id:n.id});expect(JSON.stringify({...s,lifeEvents:undefined})).toBe(before);
});
it('prioritises personal notices, preserves an existing naming input, then continues the queue sequentially',()=>{
 let {s,spouse}=married();const child=spawnKin(s,{kind:'child',age:0});const input={kind:'naming' as const,id:child.id};killKin(s,spouse.id);
 expect(selectFamilyOverlay(s,null)?.kind).toBe('notice');expect(selectFamilyOverlay(s,input)).toEqual(input);const n=nextLifeEventNotice(s)!;const current={kind:'notice' as const,id:n.id};
 expect(selectFamilyOverlay(s,current)).toEqual(current);s=gameReducer(s,{type:'ACK_LIFE_EVENT',id:n.id});expect(selectFamilyOverlay(s,current)).toEqual(input);
});
it('does not turn historical marriage recovery into new death or divorce notifications',()=>{
 const {s,spouse}=married();delete s.lifeEvents;s.world.characters[spouse.id].alive=false;const loaded=normalizeGameState(JSON.parse(JSON.stringify(s)));expect(loaded.lifeEvents!.notices).toEqual([]);expect(loaded.tags).toContain('widowed');expect(normalizeGameState(JSON.parse(JSON.stringify(loaded)))).toEqual(loaded);
});
it('clears outgoing notifications on heir continuation while preserving family histories',()=>{
 let {s,spouse}=married();const heir=spawnKin(s,{kind:'child',age:20});killKin(s,spouse.id);expect(pending(s)).toHaveLength(1);killPlayer(s,'Natural death.');s=gameReducer(s,{type:'CONTINUE_AS_HEIR',heirId:heir.id});expect(s.lifeEvents!.ownerId).toBe(heir.id);expect(s.lifeEvents!.notices).toEqual([]);expect(s.world.characters[spouse.id].alive).toBe(false);expect(worldIntegrityIssues(s)).toEqual([]);
});
it('keeps happy couples and ordinary friends safe even when all breakup rolls would succeed',()=>{
 const {s,spouse}=married(),friend=spawnKin(s,{kind:'friend',age:25});const r=relationshipWith(s,friend.id);Object.assign(perspectives(s,r).other,{affinity:0,trust:0});r.mistreatmentCount=10;
 const roll=jest.spyOn(random,'chance').mockReturnValue(true);for(let i=0;i<10;i++){s.world.currentYear++;tickRelationshipEndings(s);}expect(roll).not.toHaveBeenCalled();expect(activeSpouse(s)?.id).toBe(spouse.id);expect(pending(s)).toEqual([]);
});
it('ends an abused marriage within the current year, once, without changing any child parentage',()=>{
 const {s,spouse}=married(),child=spawnKin(s,{kind:'child',age:4}),r=relationshipWith(s,spouse.id);Object.assign(perspectives(s,r).other,{affinity:5,trust:5});r.mistreatmentCount=3;const parents=child.parentIds!.slice(),year=s.world.currentYear;
 jest.spyOn(random,'chance').mockReturnValue(true);tickRelationshipEndings(s);tickRelationshipEndings(s);expect(activeSpouse(s)).toBeUndefined();expect(s.tags).not.toContain('widowed');expect(child.parentIds).toEqual(parents);expect(s.world.currentYear).toBe(year);expect(s.world.characters[s.playerCharacterId].marriages!.at(-1)!.endReason).toBe('divorce');expect(pending(s)).toHaveLength(1);expect(pending(s)[0].context.initiator).toBe('npc');expect(worldIntegrityIssues(s)).toEqual([]);
});
it.each(['courtship','affair'] as const)('ends an unhappy nonmarital %s without divorcing the player from their spouse',kind=>{
 const {s,spouse}=married(),lover=spawnKin(s,{kind:'friend',age:25}),r=relationshipWith(s,lover.id);r.flags.push(kind);r.mistreatmentCount=2;Object.assign(perspectives(s,r).other,{affinity:5,trust:5});jest.spyOn(random,'chance').mockReturnValue(true);tickRelationshipEndings(s);expect(activeSpouse(s)?.id).toBe(spouse.id);expect(r.flags).not.toContain(kind);expect(pending(s).map(n=>n.category)).toEqual(['heartbreak']);expect(s.tags).not.toContain('divorced');
});
it('establishes and ends an actual courtship without inventing a divorce',()=>{
 const s=base(),partner=spawnKin(s,{kind:'friend',age:25,gender:'woman',attraction:'men'}),r=relationshipWith(s,partner.id);Object.assign(perspectives(s,r).other,{affinity:60,trust:60,attraction:50});performSystemicRelationshipAction(s,partner,'court');expect(r.flags).toContain('courtship');performSystemicRelationshipAction(s,partner,'end_courtship');expect(r.flags).not.toContain('courtship');expect(nextLifeEventNotice(s)!.category).toBe('heartbreak');expect(s.tags).not.toContain('divorced');
});
it('deduplicates confirmed affair exposure and keeps actual affected identities',()=>{
 const {s,spouse}=married(),lover=spawnKin(s,{kind:'friend',age:25}),r=relationshipWith(s,lover.id);r.flags.push('affair');jest.spyOn(random,'chance').mockReturnValue(true);performSystemicRelationshipAction(s,lover,'secret_meeting');performSystemicRelationshipAction(s,lover,'secret_meeting');
 const notices=pending(s).filter(n=>n.category==='affair_exposed');expect(notices).toHaveLength(1);expect(notices[0].characterIds).toEqual([lover.id,spouse.id]);expect(notices[0].text).toContain(lover.name);expect(notices[0].text).toContain(spouse.name);
});
it('captures the new spouse and abandoned people exactly once on an actual elopement',()=>{
 const {s,spouse}=married(),lover=spawnKin(s,{kind:'friend',age:25}),r=relationshipWith(s,lover.id);r.flags.push('affair');Object.assign(perspectives(s,r).other,{affinity:95,trust:95,attraction:95});performSystemicRelationshipAction(s,lover,'elope');expect(activeSpouse(s)?.id).toBe(lover.id);expect(pending(s).filter(n=>n.category==='elopement')).toHaveLength(1);expect(nextLifeEventNotice(s)!.characterIds).toEqual([lover.id,spouse.id]);expect(s.tags).not.toContain('widowed');
});
it.each(['women','men','none'] as const)('preserves a saved player preference of %s, NPC preferences and RNG through repeated loads',preference=>{
 const s=base(),p=s.world.characters[s.playerCharacterId];s.attraction=preference;p.attraction=preference==='women'?'men':'women';const npc=spawnKin(s,{kind:'friend',age:25,attraction:'none'});const rng={...s.world.rngState};const loaded=normalizeGameState(JSON.parse(JSON.stringify(s)));expect(loaded.attraction).toBe(preference);expect(loaded.world.characters[p.id].attraction).toBe(preference);expect(loaded.world.characters[npc.id].attraction).toBe('none');expect(loaded.world.rngState).toEqual(rng);expect(normalizeGameState(JSON.parse(JSON.stringify(loaded)))).toEqual(loaded);
});
it('uses valid canonical preferences when the controlled snapshot is absent, and defaults only for invalid/missing data',()=>{
 const s=base(),p=s.world.characters[s.playerCharacterId];delete (s as any).attraction;p.attraction='none';expect(normalizeGameState(JSON.parse(JSON.stringify(s))).attraction).toBe('none');(p as any).attraction='invalid';const loaded=normalizeGameState(JSON.parse(JSON.stringify(s)));expect(loaded.attraction).toBe(loaded.gender==='woman'?'men':'women');
});
it('preserves preferences through widowhood, remarriage and heir continuation',()=>{
 let {s,spouse}=married();s.attraction='women';syncPlayerToWorld(s);killKin(s,spouse.id);s=normalizeGameState(JSON.parse(JSON.stringify(s)));const next=spawnKin(s,{kind:'friend',age:25,gender:'woman',attraction:'men'});s.world.proposalFromId=next.id;s=gameReducer(s,{type:'KIN_INTERACT',id:next.id,action:'accept_proposal'});expect(activeSpouse(s)?.id).toBe(next.id);expect(normalizeGameState(JSON.parse(JSON.stringify(s))).attraction).toBe('women');
 const heir=spawnKin(s,{kind:'child',age:20,attraction:'none'});killPlayer(s,'Natural death');s=gameReducer(s,{type:'CONTINUE_AS_HEIR',heirId:heir.id});expect(normalizeGameState(JSON.parse(JSON.stringify(s))).attraction).toBe('none');
});
it('labels current, late, widowed, former and deceased former spouses from actual marriage endings',()=>{
 const {s,spouse}=married();expect(maritalStatusLabel(s,spouse)).toBe('Married to you');killKin(s,spouse.id);expect(maritalStatusLabel(s,spouse)).toBe('Late spouse');expect(maritalStatusLabel(s,s.world.characters[s.playerCharacterId])).toBe('Widowed');
 const other=spawnKin(s,{kind:'spouse',age:30});unlinkSpouse(s,s.playerCharacterId,'divorce');expect(maritalStatusLabel(s,other)).toBe('Former spouse');killKin(s,other.id);expect(maritalStatusLabel(s,other)).toBe('Former spouse · Deceased');expect(maritalStatusLabel(s,spouse)).not.toBe('Unmarried');
});
it('has several original variants in every category, renders all names and ages, and avoids immediate repeated lines',()=>{
 expect(LIFE_EVENT_VARIATIONS.length).toBeGreaterThanOrEqual(30);
 for(const v of LIFE_EVENT_VARIATIONS){const n:LifeEventNotice={id:'example_'+v.id,ownerId:'player',category:v.category,characterIds:['a','b'],people:[{id:'a',name:'Alys',age:54,relationship:v.category==='guardian_death'?'guardian':v.category==='parent_death'?'mother':'spouse'},{id:'b',name:'Edric',age:56,relationship:'spouse'}],year:1340,priority:80,acknowledged:false,title:'EXAMPLE',text:'',variantId:'',context:{affection:70,trust:70,playerAge:30,personality:[],rivalry:false,infidelity:false,initiator:'npc',romanceKind:'courtship'}};expect(v.text(n)).toContain('Alys');expect(v.text(n)).not.toContain('{{');expect(v.text(n).length).toBeGreaterThan(60);}
 const {s,spouse}=married();const ids=[];for(let i=0;i<3;i++){const n=enqueueLifeEventNotice(s,{key:'example'+i,category:'divorce',people:[snapshotPerson(s,spouse.id,'spouse')]})!;ids.push(n.variantId);}expect(new Set(ids).size).toBe(3);
});

it('protects a healthy courtship from random NPC matchmaking, but records a deliberate marriage to someone else',()=>{
 const s=base(),partner=spawnKin(s,{kind:'friend',age:25}),other=spawnKin(s,{kind:'friend',age:26}),r=relationshipWith(s,partner.id);r.flags.push('courtship');partner.stats.health=100;Object.assign(perspectives(s,r).other,{affinity:90,trust:90});jest.spyOn(random,'chance').mockReturnValue(true);simulateLivingWorld(s);expect(partner.spouseId).toBeUndefined();expect(r.flags).toContain('courtship');const chosen=spawnKin(s,{kind:'friend',age:26});expect(linkSpouses(s,partner.id,chosen.id)).toBe(true);expect(r.flags).not.toContain('courtship');expect(pending(s).some(n=>n.category==='heartbreak'&&n.context.initiator==='npc')).toBe(true);
});
it('lets personality change breakup risk only after the relationship is seriously troubled',()=>{
 const {s,spouse}=married(),r=relationshipWith(s,spouse.id);Object.assign(perspectives(s,r).other,{affinity:10,trust:10});r.mistreatmentCount=2;const patient=cloneState(s),proud=cloneState(s);patient.world.characters[spouse.id].personalityTraits=['patient','loyal'];proud.world.characters[spouse.id].personalityTraits=['proud','ambitious'];const roll=jest.spyOn(random,'chance').mockReturnValue(false);tickRelationshipEndings(patient);const low=roll.mock.calls.at(-1)![0];tickRelationshipEndings(proud);expect(roll.mock.calls.at(-1)![0]).toBeGreaterThan(low);
});

it('keeps bereavement already recorded in the birth background silent',()=>{
 let found=false;for(let seed=0;seed<100;seed++){const s=createLife({worldSeed:seed,birthOrigin:'peasant'});expect(s.lifeEvents!.notices).toEqual([]);if(s.world.characters[s.playerCharacterId].parentIds?.some(id=>!s.world.characters[id].alive))found=true;}expect(found).toBe(true);
});
