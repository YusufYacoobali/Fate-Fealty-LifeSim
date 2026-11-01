/** Deterministic QA scenes, using real transition handlers rather than fabricated notices. */
import {writeFileSync,mkdirSync} from 'node:fs';
import {createLife,syncPlayerToWorld} from '../src/engine/gameState';
import {spawnKin,killKin} from '../src/engine/kinFactory';
import {tickFamilyFormation} from '../src/engine/familyFormationEngine';
import {gameReducer} from '../src/state/gameReducer';
import {bindEventActors,eventById} from '../src/engine/eventPicker';
import {runWithWorldRng} from '../src/engine/random';
import {perspectives,relationshipWith,performSystemicRelationshipAction} from '../src/engine/relationshipEngine';
import {tickRelationshipEndings} from '../src/engine/relationshipEndings';
import {syncActionLimit} from '../src/engine/actionClock';
import {worldIntegrityIssues} from '../src/engine/worldIntegrity';
const dir='docs/validation/milestones';mkdirSync(dir,{recursive:true});
const kinds=['spouse_tender','spouse_bitter','spouse_illness','child_loss','parent_loss','guardian_loss','divorce','npc_breakup','courtship_breakup','affair','elope','priority','former_deceased'];
const fixtures=kinds.map(kind=>{
 let s=createLife({worldSeed:880043,gender:'man',attraction:'women',firstName:'Edmund',birthOrigin:'peasant',settings:{autoScroll:true,difficulty:'Normal',liveForever:false,reducedMotion:true,haptics:false,soundEffects:false}});
 s.age=35;s.world.currentYear=s.bornYear+s.age;for(const c of Object.values(s.world.characters))if(c.id!==s.playerCharacterId)c.age+=35;syncPlayerToWorld(s);
 const withRng=<T>(fn:()=>T)=>runWithWorldRng(s.world,fn);
 const spouse=withRng(()=>spawnKin(s,{kind:kind==='courtship_breakup'?'friend':'spouse',age:kind==='priority'?35:54,gender:'woman',name:'Alys'}));
 const player=s.world.characters[s.playerCharacterId];const r=relationshipWith(s,spouse.id);
 Object.assign(r.aToB,{affinity:85,trust:85});Object.assign(r.bToA,{affinity:85,trust:85});
 let targetId=spouse.id;let children:string[]=[];
 if(kind==='spouse_tender')killKin(s,spouse.id,'Old age');
 if(kind==='spouse_illness')killKin(s,spouse.id,'Plague');
 if(kind==='spouse_bitter'){Object.assign(r.aToB,{affinity:5,trust:5});Object.assign(r.bToA,{affinity:5,trust:5});r.flags.push('feud');r.mistreatmentCount=4;killKin(s,spouse.id,'Declining health');}
 if(kind==='child_loss'){const child=withRng(()=>spawnKin(s,{kind:'child',age:11,name:'Edith'}));s.childNaming!.pendingIds=[];targetId=child.id;killKin(s,child.id,'Fever');}
 if(kind==='parent_loss'){targetId=player.parentIds![0];killKin(s,targetId,'Old age');}
 if(kind==='guardian_loss'){const guardian=withRng(()=>spawnKin(s,{kind:'friend',age:64,name:'Rowan'}));targetId=guardian.id;player.guardianIds=[guardian.id];killKin(s,guardian.id,'Declining health');}
 if(kind==='divorce'||kind==='former_deceased'){s=gameReducer(s,{type:'KIN_INTERACT',id:spouse.id,action:'divorce'});if(kind==='former_deceased')killKin(s,spouse.id,'Old age');}
 if(kind==='npc_breakup'||kind==='courtship_breakup'){
  let partner=spouse,relation=r;
  if(kind==='courtship_breakup'){
   partner=withRng(()=>spawnKin(s,{kind:'friend',age:30,gender:'woman',attraction:'men',name:'Isolde'}));relation=relationshipWith(s,partner.id);Object.assign(perspectives(s,relation).other,{affinity:60,trust:60,attraction:50});withRng(()=>performSystemicRelationshipAction(s,partner,'court'));if(!relation.flags.includes('courtship'))throw Error('Courtship did not begin');targetId=partner.id;
  }
  Object.assign(perspectives(s,relation).other,{affinity:5,trust:5});relation.mistreatmentCount=4;
  for(let attempt=0;attempt<50&&!s.lifeEvents!.notices.length;attempt++){if(attempt){s.age++;s.world.currentYear++;syncPlayerToWorld(s);partner.age++;}withRng(()=>tickRelationshipEndings(s));}
  if(!s.lifeEvents!.notices.length)throw Error('No confirmed NPC ending');
 }
 if(kind==='affair'||kind==='elope'){
  const lover=withRng(()=>spawnKin(s,{kind:'friend',age:30,gender:'woman',attraction:'men',name:'Isolde'})),affair=relationshipWith(s,lover.id);targetId=lover.id;affair.flags.push('affair');Object.assign(perspectives(s,affair).other,{affinity:95,trust:95,attraction:95});
  if(kind==='elope')withRng(()=>performSystemicRelationshipAction(s,lover,'elope'));
  else for(let attempt=0;attempt<200&&!s.lifeEvents!.notices.length;attempt++)withRng(()=>performSystemicRelationshipAction(s,lover,'secret_meeting'));
  if(!s.lifeEvents!.notices.length)throw Error('No confirmed scandal');
 }
 if(kind==='priority'){
  for(const route of ['pregnancy','adoption'] as const)s.world.expectedChildren.push({id:'fixture_'+route,route,parentIds:[player.id,spouse.id],dueYear:s.world.currentYear,householdId:player.householdId!,familyId:player.birthFamilyId!,status:'expected'});
  withRng(()=>tickFamilyFormation(s));children=s.childNaming!.pendingIds.slice();killKin(s,spouse.id,'Plague');killKin(s,player.parentIds![0],'Old age');
  const e=eventById('life_boat_fare')!;s.pendingEvent={eventId:e.id,bindings:withRng(()=>bindEventActors(s,e))};
 }
 syncActionLimit(s);s.gold=0;s.actionClock.used=s.actionClock.cap;syncPlayerToWorld(s);
 const issues=worldIntegrityIssues(s);if(issues.length)throw Error(kind+': '+issues.join('; '));
 return {kind,targetId,children,envelope:{schemaVersion:7,savedAt:Date.now(),game:s}};
});
writeFileSync('/tmp/milestone-ui-fixtures.json',JSON.stringify(fixtures));
writeFileSync(dir+'/notice-examples.json',JSON.stringify(fixtures.flatMap(f=>f.envelope.game.lifeEvents!.notices.map(n=>({scenario:f.kind,...n}))),null,2)+'\n');
console.log('Created',fixtures.length,'transition-based UI fixtures');
