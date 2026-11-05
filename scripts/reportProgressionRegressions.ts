import {writeFileSync} from 'node:fs';
/** Run in each checkout to compare controlled zero-health, annual-hazard and paid-patent regressions. */
import {createLife,syncPlayerToWorld} from '../src/engine/gameState';
import {checkDeath} from '../src/engine/deathEngine';
import {setRandomSource,resetRandomSource} from '../src/engine/random';
import {eventById} from '../src/engine/eventPicker';
import {gameReducer} from '../src/state/gameReducer';
function base(){const s=createLife({worldSeed:950114,birthOrigin:'peasant'});s.age=30;s.reputation=-90;s.paths={outlaw:100,martial:0,church:0,court:0,labour:0};s.stats.health=80;return s;}
const collapse=base();collapse.stats.health=0;setRandomSource({next:()=>0});checkDeath(collapse);resetRandomSource();
const annual=base();setRandomSource({next:()=>0});checkDeath(annual);resetRandomSource();
let barony=createLife({worldSeed:950114,birthOrigin:'noble',lifetimeUnlocked:true});barony.age=38;barony.gold=350;barony.stats.charm=84;barony.stats.wits=76;barony.pendingEvent={eventId:'baron_land_grant',bindings:{}};syncPlayerToWorld(barony);barony=gameReducer(barony,{type:'CHOOSE',choice:eventById('baron_land_grant')!.choices[0]});
if(process.argv[3])writeFileSync(process.argv[3],JSON.stringify(barony));
console.log(JSON.stringify({label:process.argv[2]??'current',healthCollapse:{dead:collapse.dead,cause:collapse.deathCause},annualOutlawWithoutCriminalCase:{dead:annual.dead,cause:annual.deathCause},acceptedBarony:{gold:barony.gold,rank:barony.rankIdx,estate:barony.world.characters[barony.playerCharacterId].socialStatus?.estate,memories:barony.memories.filter(m=>m.tag==='barony_claimed').length}},null,2));
