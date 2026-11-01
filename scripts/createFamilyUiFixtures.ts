import {syncActionLimit} from '../src/engine/actionClock';
import {writeFileSync,readFileSync} from 'node:fs';
import {createLife,syncPlayerToWorld} from '../src/engine/gameState';
import {spawnKin} from '../src/engine/kinFactory';
import {tickFamilyFormation} from '../src/engine/familyFormationEngine';
import {applyEffects,killPlayer} from '../src/engine/consequenceEngine';
import {gameReducer} from '../src/state/gameReducer';
import {bindEventActors,eventById} from '../src/engine/eventPicker';
import {runWithWorldRng} from '../src/engine/random';
const fixtures=['birth','rename','widowed','heir'].map(kind=>{
 let s=createLife({worldSeed:880043,gender:'man',attraction:'women',firstName:'Edmund',birthOrigin:'peasant',settings:{autoScroll:true,difficulty:'Normal',liveForever:false,reducedMotion:true,haptics:false,soundEffects:false}});s.age=25;s.world.currentYear=s.bornYear+s.age;syncPlayerToWorld(s);
 const spouse=runWithWorldRng(s.world,()=>spawnKin(s,{kind:'spouse',age:25,gender:'woman'}));
 const player=s.world.characters[s.playerCharacterId];
 for(const route of ['pregnancy','adoption'] as const)s.world.expectedChildren.push({id:'fixture_'+route,route,parentIds:[player.id,spouse.id],dueYear:s.world.currentYear,householdId:player.householdId!,familyId:player.birthFamilyId!,status:'expected'});
 runWithWorldRng(s.world,()=>tickFamilyFormation(s));const children=s.childNaming!.pendingIds.slice();
 if(kind==='birth'){const e=eventById('life_boat_fare')!;s.pendingEvent={eventId:e.id,bindings:runWithWorldRng(s.world,()=>bindEventActors(s,e))};}
 if(kind!=='birth'){
  for(const[id,name]of children.map((id,i)=>[id,['Élodie',"O’Neill"][i]]))s=gameReducer(s,{type:'CONFIRM_CHILD_NAME',id,name});
  s.tab='kin';s.selectedKinId=children[0];
 }
 let suitorId:string|undefined;
 if(kind==='widowed'){
  runWithWorldRng(s.world,()=>applyEffects(s,{killKin:spouse.id}));s.tags.push('married');delete s.world.characters[player.id].marriages;delete s.world.characters[spouse.id].marriages;
  const suitor=runWithWorldRng(s.world,()=>spawnKin(s,{kind:'friend',age:25,gender:'woman',attraction:'men',name:'Alys'}));suitorId=suitor.id;s.world.proposalFromId=suitorId;s.selectedKinId=suitorId;
 }
 if(kind==='heir'){s=JSON.parse(readFileSync('docs/validation/family/heir-ui-save.json','utf8')).game;s.tab='kin';s.selectedKinId=null;}
 if(kind==='birth'||kind==='rename'){syncActionLimit(s);s.gold=0;s.actionClock.used=s.actionClock.cap;}
 syncPlayerToWorld(s);return {kind,children,spouseId:spouse.id,suitorId,envelope:{schemaVersion:7,savedAt:Date.now(),game:s}};
});
writeFileSync(process.argv[2]??'/tmp/family-ui-fixtures.json',JSON.stringify(fixtures));
