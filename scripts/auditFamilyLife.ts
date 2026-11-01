/** An actual childhood-to-heir run, with scripted family choices and natural mortality. */
import {mkdirSync,writeFileSync} from 'node:fs';
import {createLife} from '../src/engine/gameState';
import {spawnKin} from '../src/engine/kinFactory';
import {gameReducer} from '../src/state/gameReducer';
import {activeSpouse} from '../src/engine/characterState';
import {namingChildId} from '../src/engine/childNaming';
import {eventById,isChoiceEnabled} from '../src/engine/eventPicker';
import {policyChoice} from './narrativeRiskAudit';
import {perspectives,relationshipWith} from '../src/engine/relationshipEngine';
import {normalizeGameState} from '../src/state/persistence';
import {worldIntegrityIssues} from '../src/engine/worldIntegrity';
import {applyEffects} from '../src/engine/consequenceEngine';
import {eligibleHeirs} from '../src/engine/successionEngine';
import {runWithWorldRng} from '../src/engine/random';
import {resolveRpgEncounter} from '../src/__tests__/rpgSoakHelpers';
const seed=Number(process.argv[2]??779023),dir=process.argv[3]??'docs/validation/family';
let s=createLife({worldSeed:seed,birthOrigin:'peasant',settings:{autoScroll:true,liveForever:false,difficulty:'Normal',haptics:false,soundEffects:false}});
const trace:any[]=[],namedIds:string[]=[],names=['Élodie',"O’Neill"];
function check(label:string){const issues=worldIntegrityIssues(s);if(issues.length)throw Error(label+': '+issues.join('; '));trace.push({label,age:s.age,playerId:s.playerCharacterId,spouse:activeSpouse(s)?.id,children:s.world.characters[s.playerCharacterId].childIds?.slice(),rng:{...s.world.rngState}});}
function settle(){
 for(let i=0;i<30&&!s.dead&&(s.pendingEvent||s.duel||s.rpg.mission);i++){
  resolveRpgEncounter(s);if(s.pendingEvent&&!s.dead){const e=eventById(s.pendingEvent.eventId)!;const choices=e.choices.filter(c=>isChoiceEnabled(s,c));s=gameReducer(s,{type:'CHOOSE',choice:policyChoice(s,choices,'cautious',s.age)});}
 }
 for(let id=namingChildId(s);id;id=namingChildId(s)){
  const name=names[namedIds.length]??`Child ${namedIds.length+1}`;const rng=JSON.stringify(s.world.rngState),used=s.actionClock.used,gold=s.gold;
  s=gameReducer(s,{type:'CONFIRM_CHILD_NAME',id,name});if(s.world.characters[id].name!==name||rng!==JSON.stringify(s.world.rngState)||used!==s.actionClock.used||gold!==s.gold)throw Error('Naming changed gameplay');
  namedIds.push(id);check('Named '+name);
 }
}
function year(){settle();if(s.age>=4&&s.stats.health<75)s=gameReducer(s,{type:'DO_ACTIVITY',id:'rest'});s=gameReducer(s,{type:'AGE_UP'});settle();check('Annual checkpoint');}
while(!s.dead&&s.age<18)year();if(s.dead)throw Error('Seed did not reach adulthood');
function marry(){
 const p=runWithWorldRng(s.world,()=>spawnKin(s,{kind:'friend',age:s.age,gender:s.attraction==='women'?'woman':'man',attraction:s.gender==='woman'?'women':'men'}));
 const other=perspectives(s,relationshipWith(s,p.id)).other;Object.assign(other,{affinity:95,trust:95,attraction:95});
 for(let n=0;n<12&&!activeSpouse(s);n++)s=gameReducer(s,{type:'KIN_INTERACT',id:p.id,action:'propose'});
 if(activeSpouse(s)?.id!==p.id)throw Error('Proposal failed');check('Married '+p.name);return p.id;
}
function haveChild(){const count=namedIds.length;for(let n=0;n<8&&namedIds.length===count&&!s.dead;n++){if(!s.world.expectedChildren.some(c=>c.status==='expected'&&c.parentIds.includes(s.playerCharacterId)))s=gameReducer(s,{type:'KIN_INTERACT',id:activeSpouse(s)!.id,action:'try_for_child'});year();}if(namedIds.length===count)throw Error('No child arrived');return namedIds[count];}
const originalPlayer=s.playerCharacterId,first=marry(),child1=haveChild();const oldParents=[...s.world.characters[child1].parentIds!];
// Exercise the same event consequence handler used by authored spouse deaths.
runWithWorldRng(s.world,()=>applyEffects(s,{killKin:first}));check('Widowed after event death');
s=normalizeGameState(JSON.parse(JSON.stringify(s)));check('Reloaded widow');
const second=marry(),child2=haveChild();if(JSON.stringify(s.world.characters[child1].parentIds)!==JSON.stringify(oldParents)||s.world.characters[second].childIds?.includes(child1))throw Error('Step-parent replaced genealogy');
s=gameReducer(s,{type:'OPEN_CHILD_NAMING',id:child1});s=gameReducer(s,{type:'CONFIRM_CHILD_NAME',id:child1,name:'D’Arcy'});check('Renamed first child');
const beforeLoad=JSON.stringify(s.world.rngState);s=normalizeGameState(JSON.parse(JSON.stringify(s)));if(beforeLoad!==JSON.stringify(s.world.rngState))throw Error('Reload drew RNG');
while(!s.dead&&s.age<125)year();if(!s.dead)throw Error('Natural life unfinished');const deathAge=s.age,deathCause=s.deathCause;
const heir=eligibleHeirs(s).find(h=>namedIds.includes(h.id));if(!heir)throw Error('No named heir survived');
s=gameReducer(s,{type:'CONTINUE_AS_HEIR',heirId:heir.id});s=normalizeGameState(JSON.parse(JSON.stringify(s)));check('Continued as named heir');
if(s.playerCharacterId!==heir.id||s.first!==heir.name||s.childNaming!.pendingIds.length||!s.world.characters[first]||!s.world.characters[originalPlayer].marriages?.some(m=>m.spouseId===first))throw Error('Family history lost');
mkdirSync(dir,{recursive:true});writeFileSync(dir+'/whole-life.json',JSON.stringify({seed,deathAge,deathCause,originalPlayer,firstSpouse:first,secondSpouse:second,children:[child1,child2],heirId:heir.id,heirName:s.first,marriages:s.world.characters[originalPlayer].marriages,childrenAfterContinuation:namedIds.map(id=>s.world.characters[id]),trace,history:s.world.history,integrity:worldIntegrityIssues(s)},null,2)+'\n');
writeFileSync(dir+'/heir-ui-save.json',JSON.stringify({schemaVersion:7,savedAt:Date.now(),game:s})+'\n');
console.log('PASS complete family life:',deathAge,deathCause,'→ heir',s.first);
