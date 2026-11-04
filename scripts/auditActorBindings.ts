import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {ALL_EVENTS,EVENTS_BY_ID} from '../src/content';
import {validateContent} from '../src/content/contentValidation';
import {singleYearFixture} from '../src/__tests__/singleYearFixtures';
import {performEducationAction} from '../src/engine/educationEngine';
import {educationTrack} from '../src/data/education';
import {syncPlayerToWorld} from '../src/engine/gameState';
import {bindDirectedEvent} from '../src/engine/director';
import {runWithWorldRng} from '../src/engine/random';
import {renderBoundText} from '../src/content/persistentWorldEvents';
import {describeActorForPlayer} from '../src/engine/eventActors';
import {gameReducer} from '../src/state/gameReducer';
import {policyChoice} from './narrativeRiskAudit';
import {eventById,isChoiceEnabled} from '../src/engine/eventPicker';
import {resolveRpgEncounter} from '../src/__tests__/rpgSoakHelpers';
import {createLife} from '../src/engine/gameState';
const dir='docs/validation/holding-writing';mkdirSync(dir,{recursive:true});
const revisions=JSON.parse(readFileSync(dir+'/writing-revisions.json','utf8')) as {id:string}[];
const ids=[...new Set([...revisions.map(r=>r.id),...ALL_EVENTS.filter(e=>e.id.startsWith('education_')).map(e=>e.id)])],scenes=[];
for(const id of ids){
 const event=EVENTS_BY_ID[id],s=singleYearFixture(event),track=event.requires?.educationTracks?.[0];
 if(track){s.age=Math.max(s.age,educationTrack(track).minAge);s.world.currentYear=s.bornYear+s.age;syncPlayerToWorld(s);runWithWorldRng(s.world,()=>performEducationAction(s,'enrol',track));if(s.world.characters[s.playerCharacterId].education?.track!==track)throw Error('Fixture did not enrol '+id);}
 const bindings=runWithWorldRng(s.world,()=>bindDirectedEvent(s,{event,kind:'quiet',isLegal:false}));
 if(Object.keys(event.actorRoles??{}).length&&!bindings)throw Error('Unbound current scene '+id);
 s.pendingEvent={eventId:id,bindings};
 const introduction=renderBoundText(s,typeof event.text==='function'?event.text(s):event.text);
 const choices=event.choices.map(c=>({id:c.id,label:renderBoundText(s,c.label),...Object.fromEntries(['outcome','success','failure'].flatMap(branch=>{const o=c[branch as 'outcome'];return o?[[branch,renderBoundText(s,o.text)]]:[];}))}));
 if(/\{\{|someone once known|an absent participant/.test(JSON.stringify({introduction,choices})))throw Error('Unresolved actor '+id);
 const people=Object.entries(bindings??{}).filter(([role])=>introduction.includes(s.world.characters[bindings![role]]?.name)).map(([role,actorId])=>({role,actorId,name:s.world.characters[actorId].name,age:s.world.characters[actorId].age,description:describeActorForPlayer(s,actorId,{role})}));
 scenes.push({id,introduction,people,choices});
}
// Natural childhood histories, with choices resolved in their own year. No immortal settings.
const histories=[];
for(const[origin,index]of (['peasant','artisan','merchant','church','military','noble','royal'] as const).map((origin,index)=>[origin,index] as const)){
 let s=createLife({worldSeed:843010+index,birthOrigin:origin,lifetimeUnlocked:index%2===1||origin==='royal',settings:{difficulty:'Normal',autoScroll:true,liveForever:false,haptics:false,soundEffects:false}});const choices:any[]=[];
 const settle=()=>{for(let guard=0;guard<25&&!s.dead&&(s.pendingEvent||s.duel||s.rpg.mission);guard++){resolveRpgEncounter(s);if(!s.pendingEvent||s.dead)continue;const e=eventById(s.pendingEvent.eventId)!;const c=policyChoice(s,e.choices.filter(c=>isChoiceEnabled(s,c)),'balanced',s.age);const text=renderBoundText(s,typeof e.text==='function'?e.text(s):e.text);choices.push({age:s.age,eventId:e.id,text,choice:renderBoundText(s,c.label),actors:Object.entries(s.pendingEvent.bindings??{}).filter(([,id])=>s.world.characters[id]&&text.includes(s.world.characters[id].name)).map(([role,id])=>({role,id,description:describeActorForPlayer(s,id,{role})})),people:Object.entries(s.pendingEvent.bindings??{}).filter(([,id])=>s.world.characters[id]&&text.includes(s.world.characters[id].name)).map(([role,id])=>describeActorForPlayer(s,id,{role}))});s=gameReducer(s,{type:'CHOOSE',choice:c});}};
 while(!s.dead&&s.age<19){settle();if(s.age>=4&&s.stats.health<75)s=gameReducer(s,{type:'DO_ACTIVITY',id:'rest'});s=gameReducer(s,{type:'AGE_UP'});}settle();histories.push({seed:843010+index,origin,lastAge:s.age,dead:s.dead,cause:s.deathCause,choices,feed:s.feed.filter(f=>f.age<=18)});
}
const issues=validateContent();if(issues.some(i=>i.level==='error'))throw Error(JSON.stringify(issues));
writeFileSync(dir+'/actor-binding-audit.json',JSON.stringify({staticCurrentEvents:ALL_EVENTS.filter(e=>!e.legacyNarrative).length,renderedScenes:scenes.length,renderedChoices:scenes.reduce((n,s)=>n+s.choices.length,0),validation:issues,scenes},null,2)+'\n');
writeFileSync(dir+'/childhood-histories.json',JSON.stringify(histories,null,2)+'\n');
console.log('PASS',scenes.length,'rendered scenes;',histories.length,'natural childhood histories;',issues.length,'validation findings');
