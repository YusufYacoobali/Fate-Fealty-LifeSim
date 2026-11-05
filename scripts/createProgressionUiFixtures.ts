import {mkdirSync,writeFileSync} from 'node:fs';
import {createLife,syncPlayerToWorld} from '../src/engine/gameState';
import {normalizeGameState} from '../src/state/persistence';
import {legacyStatus} from '../src/engine/lifeDepthState';
import {EVENTS_BY_ID} from '../src/content';
import {bindEventActors} from '../src/engine/eventPicker';
import {renderBoundText} from '../src/content/persistentWorldEvents';
import {performEducationAction} from '../src/engine/educationEngine';
import {runWithWorldRng} from '../src/engine/random';
import {checkDeath} from '../src/engine/deathEngine';
const dir='docs/validation/progression-usability';mkdirSync(dir,{recursive:true});
function base(kind:string){const royal=kind==='royal';const s=createLife({worldSeed:950113,firstName:'Edmund',nickname:'Goosefriend',birthOrigin:royal?'royal':'peasant',lifetimeUnlocked:true,settings:{difficulty:'Normal',autoScroll:true,liveForever:false,reducedMotion:true,haptics:false,soundEffects:false}});s.age=royal?16:kind==='baron'?38:30;s.world.currentYear=s.bornYear+s.age;for(const c of Object.values(s.world.characters))if(c.id!==s.playerCharacterId)c.age+=s.age;s.stats={health:78,charm:87,wits:83,faith:38};s.gold=400;s.goalId='fortune';s.occupation.careerId='trader';s.holding.stores=61;s.holding.security=78;s.holding.loyalty=78;
 const p=s.world.characters[s.playerCharacterId];p.factionInfluence=25;s.world.factions.crown.playerStanding=10;p.education!.qualifications=['court_education'];
 if(kind==='baron'){s.goalId=null;s.rankIdx=p.rankIdx=3;p.socialStatus=legacyStatus(3);}if(kind==='knight'){s.rankIdx=p.rankIdx=2;p.socialStatus=legacyStatus(2);s.occupation.careerId='guard';}
 s.pendingEvent=null;syncPlayerToWorld(s);return s;}
const saves:any[]=['merchant','baron','royal','knight'].map(kind=>({kind,game:base(kind)}));
for(const id of ['comic_lofty_bed','education_parish_0']){const s=base('merchant');s.goalId=null;const e=EVENTS_BY_ID[id];if(id.startsWith('education')){s.age=9;s.world.currentYear=s.bornYear+9;for(const c of Object.values(s.world.characters))if(c.id!==s.playerCharacterId)c.age=Math.max(18,c.age-21);syncPlayerToWorld(s);runWithWorldRng(s.world,()=>performEducationAction(s,'enrol','parish'));const p=s.world.characters[s.playerCharacterId],peer=s.world.characters[p.education!.activeClassmateIds![0]];peer.gender='woman';peer.name='Avice';peer.parentIds=[...p.parentIds!];for(const parent of p.parentIds!)s.world.characters[parent].childIds!.push(peer.id);s.world.characters[p.education!.mentorId!].name='Agnes';}
 s.pendingEvent={eventId:id,bindings:runWithWorldRng(s.world,()=>bindEventActors(s,e))};syncPlayerToWorld(s);saves.push({kind:id,game:s});
 const scene={id,title:e.title,bindings:s.pendingEvent.bindings,introduction:renderBoundText(s,typeof e.text==='function'?e.text(s):e.text),choices:e.choices.map(c=>({id:c.id,label:renderBoundText(s,c.label),outcome:renderBoundText(s,c.outcome!.text),effects:c.outcome!.effects}))};writeFileSync(`${dir}/${id}.json`,JSON.stringify(scene,null,2)+'\n');}
const holdingGoal=base('merchant');holdingGoal.rankIdx=holdingGoal.world.characters[holdingGoal.playerCharacterId].rankIdx=3;holdingGoal.world.characters[holdingGoal.playerCharacterId].socialStatus=legacyStatus(3);holdingGoal.gold=149;holdingGoal.tab='hold';holdingGoal.holding.stores=60;syncPlayerToWorld(holdingGoal);saves.push({kind:'ambition_hold',game:holdingGoal});
const dead=base('merchant');dead.paths.outlaw=100;dead.reputation=-90;dead.stats.health=0;checkDeath(dead);syncPlayerToWorld(dead);saves.push({kind:'death',game:dead});
saves.push({kind:'creator',game:{...base('merchant'),settingsOpen:true}});
writeFileSync('/tmp/progression-ui-fixtures.json',JSON.stringify(saves.map(({kind,game})=>({kind,envelope:{schemaVersion:7,savedAt:Date.now(),game:normalizeGameState(game)}}))));
console.log(`Created ${saves.length} UI fixtures and rendered scenes.`);
