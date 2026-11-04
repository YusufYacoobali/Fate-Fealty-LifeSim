import {writeFileSync} from 'node:fs';
import {createLife,syncPlayerToWorld} from '../src/engine/gameState';
import {gameReducer} from '../src/state/gameReducer';
import {EVENTS_BY_ID} from '../src/content';
import {bindEventActors} from '../src/engine/eventPicker';
import {runWithWorldRng} from '../src/engine/random';
import {relationshipWith} from '../src/engine/relationshipEngine';
const cases=[['young_spoon_office',2,null],['young_market_math',9,'parish'],['education_guild_1',14,'guild'],['young_rival_nickname',12,'parish'],['legacy_adult',8,'household']] as const;
const fixtures=cases.map(([id,age,track])=>{
 let s=createLife({worldSeed:81290,firstName:'Edmund',birthOrigin:'peasant',settings:{difficulty:'Normal',autoScroll:true,liveForever:false,reducedMotion:true,soundEffects:false,haptics:false}});s.age=age;s.world.currentYear=s.bornYear+age;s.gold=300;for(const c of Object.values(s.world.characters))if(c.id!==s.playerCharacterId)c.age+=age;syncPlayerToWorld(s);
 if(track)s=gameReducer(s,{type:'EDUCATION',action:'enrol',track});
 const education=s.world.characters[s.playerCharacterId].education!;
 if(id==='young_rival_nickname')relationshipWith(s,education.activeClassmateIds![0]).flags.push('rival');
 if(id==='legacy_adult'){const oldPeer=education.activeClassmateIds![0];s.age=35;s.world.currentYear=s.bornYear+35;for(const c of Object.values(s.world.characters))if(c.id!==s.playerCharacterId&&c.id!==oldPeer)c.age+=27;s.pendingEvent={eventId:'education_household_2'};}
 else s.pendingEvent={eventId:id,bindings:runWithWorldRng(s.world,()=>bindEventActors(s,EVENTS_BY_ID[id]))};
 s.tab='life';return {id,course:track,oldClassmates:education.classmateIds.slice(),rng:{...s.world.rngState},envelope:{schemaVersion:7,savedAt:Date.now(),game:s}};
});
writeFileSync('/tmp/writing-ui-fixtures.json',JSON.stringify(fixtures));console.log('Created',fixtures.length,'narrative UI scenes');
