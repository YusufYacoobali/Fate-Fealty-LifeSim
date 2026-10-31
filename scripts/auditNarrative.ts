import {sharedNarrativeTheme} from '../src/content/sharedNarrativeThemes';
import {CAREERS} from '../src/data/careers';
import {normalizeGameState} from '../src/state/persistence';
/** Reproducible narrative cohorts. Run with tsx; no UI, network, clock or unseeded RNG. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { ALL_EVENTS } from '../src/content';
import { ANNUAL_MESSAGES } from '../src/content/annualMessages';
import { createLife, syncPlayerToWorld } from '../src/engine/gameState';
import { gameReducer } from '../src/state/gameReducer';
import { eventById, isChoiceEnabled, isEventEligible } from '../src/engine/eventPicker';
import { resolveRpgEncounter } from '../src/__tests__/rpgSoakHelpers';
import { worldIntegrityIssues } from '../src/engine/worldIntegrity';
import { addRoyalClaim, recogniseRuler } from '../src/engine/royalSuccessionEngine';
import { PERSISTENT_STORY_TEMPLATES } from '../src/content/persistentStories';
import type { GameState, LifeRole } from '../src/types/game';

const args=Object.fromEntries(process.argv.slice(2).map(s=>s.replace(/^--/,'').split('=')));
const cohortOffset=Number(args.offset??0);
const lives=Number(args.lives??2100),startSeed=Number(args.seed??840000),output=args.output??'docs/validation/narrative/after.json';
const roles:LifeRole[]=['commoner','artisan_merchant','clergy','martial','outlaw','landed_noble','monarch'];
const origins=['peasant','merchant','church','military','peasant','noble','royal'] as const;
const jobs=['tenant_farmer','trader','cleric','guard','poacher_job',null,null];
const artisanJobs=['apprentice','trader','barber_surgeon','copyist','minstrel'];
const hash=(text:string)=>{let n=2166136261;for(const c of text)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;};
const mean=(a:number[])=>a.length?a.reduce((n,x)=>n+x,0)/a.length:0;
const counts=(values:string[])=>values.reduce((out,v)=>{out[v]=(out[v]??0)+1;return out;},{} as Record<string,number>);
function thematic(id:string,text:string,group?:string):string {return sharedNarrativeTheme(id,text)??group??id;}

function configure(s:GameState,index:number,paid:boolean,job:string|null) {
 const p=s.world.characters[s.playerCharacterId];
 if(job&&!CAREERS.some(c=>c.id===job))throw Error('Unknown cohort career '+job);
 if(job)s.occupation={careerId:job,experience:20,performance:60,workedThisYear:0,guildStanding:15};
 if(index===5){s.rankIdx=p.rankIdx=3;p.socialStatus!.estate='noble';}
 if(index===6&&paid){const c=s.world.court!;addRoyalClaim(s,p.id,c.rulerId,'recognition',90);recogniseRuler(s,p.id,'Narrative audit cohort: recognised adult royal claimant');}
 syncPlayerToWorld(s);
}
const rows:any[]=[],samples:any[]=[],eventUses:Record<string,number>={},annualUses:Record<string,number>={},availability:Record<string,{n:number;total:number;min:number;max:number;ids:Set<string>}>={};
let totalChoices=0,seriousChoices=0,callbacks=0,shortCallbacks=0,delayedCallbacks=0,exactAnnualRepeats=0,annualThemeRepeats=0,eventThemeRepeats=0,stalls=0,reloadChecks=0,reloadInconsistencies=0;
for(let i=0;i<lives;i++){
 const cohort=i+cohortOffset,roleIndex=cohort%7,role=roles[roleIndex],paid=Math.floor(cohort/7)%4!==0,seed=startSeed+cohort;
 const cohortCareer=roleIndex===1?artisanJobs[Math.floor(cohort/7)%artisanJobs.length]:jobs[roleIndex];
 let s=createLife({worldSeed:seed,birthOrigin:origins[roleIndex],lifetimeUnlocked:paid,settings:{difficulty:'Normal',autoScroll:true,liveForever:false,haptics:false,soundEffects:false}});
 let chainStartedCount=0,chainCompletedCount=0,authoredMax=0;const authoredSchedules=new Set<string>(),yearlyPopups:Record<number,number>={};
 const storyStarts=new Set<string>(),storyCompletes=new Set<string>(),storyCancelled=new Set<string>();
 let configured=false,quietRun=0,quietMax=0,choiceCount=0,serious=0,echoes=0,annualRepeat=0,themeRepeat=0,guard=0;
 const independentSeen=new Set<string>(),seen=new Set<string>(),annualSeen=new Map<string,number>(),annualThemes=new Map<string,number>(),eventThemes=new Map<string,number>(),chainStarts=new Set<string>(),chainEnds=new Set<string>(),feedIds=new Set<number>(),history:any[]=[];
 const collect=()=>{
 const active=s.world.activeStories.filter(story=>['active','paused'].includes(story.status));
 const futureMatters=Object.values(s.world.characters).flatMap(c=>Object.values(c.professionalHistory??{}).flatMap(r=>r.matters.filter(m=>!m.resolved&&m.stage===1&&(m.openedYear??s.world.currentYear)<s.world.currentYear)));
 const authored=active.length+(s.world.threads?.length??0)+s.activeArcs.length+futureMatters.length;
 authoredMax=Math.max(authoredMax,authored);
 for(const story of active)authoredSchedules.add('story:'+story.id);
 for(const t of s.world.threads??[])authoredSchedules.add('chain:'+t.id+':'+t.openedYear);
 for(const arc of s.activeArcs)authoredSchedules.add('arc:'+arc.arc+':'+arc.startedAge);
 if(s.world.contentVersion>=9&&authored)throw Error('Authored future chapter in seed '+seed);

 for(const story of s.world.activeStories){storyStarts.add(story.id);if(story.status==='completed')storyCompletes.add(story.id);if(story.status==='cancelled'||story.status==='failed')storyCancelled.add(story.id);}
 for(const entry of s.world.history){if(entry.storyInstanceId&&entry.type==='story_completed')storyCompletes.add(entry.storyInstanceId);if(entry.storyInstanceId&&entry.type==='story_cancelled')storyCancelled.add(entry.storyInstanceId);}
 if(i<14)for(const entry of s.feed){if(!feedIds.has(entry.id)){history.push({age:entry.age,year:s.bornYear+entry.age,tag:entry.tag,text:entry.text});feedIds.add(entry.id);}}};
 const settle=()=>{
  for(let pending=0;pending<20&&!s.dead&&(s.pendingEvent||s.duel||s.rpg.mission);pending++){
   resolveRpgEncounter(s);if(!s.pendingEvent||s.dead)continue;
   const e=eventById(s.pendingEvent.eventId);if(!e)throw Error(`Missing event ${s.pendingEvent.eventId}`);
   const choices=e.choices.filter(c=>isChoiceEnabled(s,c));if(!choices.length)throw Error(`No choice in ${e.id}, seed ${seed}`);
   const choice=choices[hash(`${seed}:${s.world.currentYear}:${e.id}:${choiceCount}`)%choices.length];
   if(!e.arcNodeOnly&&!e.callback&&(!e.chain||e.chain.index===0))independentSeen.add(e.id);
   seen.add(e.id);eventUses[e.id]=(eventUses[e.id]??0)+1;
   if(e.chain){if(e.chain.index===0){chainStarts.add(e.chain.id);chainStartedCount++;}if(e.chain.index+1===e.chain.total){chainEnds.add(e.chain.id);chainCompletedCount++;}}
   if(!e.arcNodeOnly&&!e.chain&&!e.callback){const theme=thematic(e.id,typeof e.text==='string'?e.text:'',e.repetitionGroup);const prior=eventThemes.get(theme);if(prior!==undefined&&s.world.currentYear-prior<5)eventThemeRepeats++;eventThemes.set(theme,s.world.currentYear);}
   const before={health:s.stats.health,gold:s.gold,reputation:s.reputation,ruler:s.world.court?.rulerId,feuds:s.world.families[s.world.characters[s.playerCharacterId].birthFamilyId??'']?.enemyFamilyIds.length??0,wealth:s.world.households.find(h=>h.id===s.world.characters[s.playerCharacterId].householdId)?.wealth??0,debt:s.debts.reduce((n,d)=>n+d.principal,0),spouse:s.world.characters[s.playerCharacterId].spouseId,job:s.occupation.careerId,status:s.world.characters[s.playerCharacterId].legalState?.status,alive:Object.values(s.world.characters).filter(c=>c.alive).length,disabilities:s.world.characters[s.playerCharacterId].healthConditions?.filter(c=>c.kind==='disability').length??0};
   const source=e.callback?s.world.history.slice().reverse().find(h=>h.eventId===e.callback!.eventId):undefined;
   s=gameReducer(s,{type:'CHOOSE',choice});choiceCount++;totalChoices++;yearlyPopups[s.world.currentYear]=(yearlyPopups[s.world.currentYear]??0)+1;
   if(e.callback){callbacks++;echoes++;const delay=source?s.world.currentYear-source.year:0;if(delay<=3)shortCallbacks++;else delayedCallbacks++;}
   const p=s.world.characters[s.playerCharacterId];
   const major=s.dead||s.gold<=before.gold-20||s.reputation<=before.reputation-15||(before.ruler===s.playerCharacterId&&s.world.court?.rulerId!==s.playerCharacterId)||(s.world.families[p.birthFamilyId??'']?.enemyFamilyIds.length??0)>before.feuds||s.stats.health<=before.health-15||Object.values(s.world.characters).filter(c=>c.alive).length<before.alive||((p.healthConditions?.filter(c=>c.kind==='disability').length??0)>before.disabilities)||s.debts.reduce((n,d)=>n+d.principal,0)>=before.debt+20||(before.job&&!s.occupation.careerId)||(before.spouse&&!p.spouseId)||(p.legalState?.status==='imprisoned'&&before.status!=='imprisoned')||(s.world.households.find(h=>h.id===p.householdId)?.wealth??0)<=before.wealth-20;
   if(major){seriousChoices++;serious++;}
   collect();
  }
  if(!s.dead&&(s.pendingEvent||s.duel||s.rpg.mission))throw Error(`Encounter stalled in seed ${seed}`);
 };
 while(!s.dead&&s.age<130&&guard++<140){
  settle();if(s.dead)break;
  if(!configured&&s.age>=18){configure(s,roleIndex,paid,cohortCareer);configured=true;}
  if([2,6,12,18,30,50,70].includes(s.age)){
   const eligible=ALL_EVENTS.filter(e=>isEventEligible(s,e));
   for(const key of [`${role}/${paid?'premium':'free'}/${s.age}`,`profession:${s.occupation.careerId??'none'}/${paid?'premium':'free'}/${s.age}`]){
    const a=availability[key]??={n:0,total:0,min:Infinity,max:0,ids:new Set()};a.n++;a.total+=eligible.length;a.min=Math.min(a.min,eligible.length);a.max=Math.max(a.max,eligible.length);for(const e of eligible)a.ids.add(e.id);
   }
  }
  if([12,30,50].includes(s.age)){
   const loaded=normalizeGameState(JSON.parse(JSON.stringify(s)));
   const core=(v:GameState)=>JSON.stringify({rng:v.world.rngState,gold:v.gold,stats:v.stats,debts:v.debts,history:v.world.history,stories:v.world.activeStories,threads:v.world.threads??[],arcs:v.activeArcs,player:v.playerCharacterId});
   reloadChecks++;if(core(s)!==core(loaded)){reloadInconsistencies++;throw Error('Reload inconsistency in seed '+seed+' age '+s.age);}
   if(cohort%2===0)s=loaded;
  }
  // Same modest policy in both revisions: work twice, rest once when health is low.
  if(s.age>=16&&s.occupation.careerId)for(let w=0;w<2&&!s.dead&&!s.pendingEvent;w++)s=gameReducer(s,{type:'CAREER_ACTION',action:'work'});
  if(s.age>=4&&s.stats.health<75&&!s.pendingEvent)s=gameReducer(s,{type:'DO_ACTIVITY',id:'rest'});
  settle();if(s.dead)break;
  const prior={...s.world.characters[s.playerCharacterId].annualNarrativeYears},beforeAge=s.age;
  s=gameReducer(s,{type:'AGE_UP'});
  if(s.age===beforeAge&&!s.dead){stalls++;throw Error(`Age-up stalled in seed ${seed}`);}
  const annual=s.world.characters[s.playerCharacterId].annualNarrativeYears??{};
  for(const[id,year]of Object.entries(annual))if(year!==prior[id]){
   const previous=annualSeen.get(id);if(previous!==undefined&&year-previous<12){exactAnnualRepeats++;annualRepeat++;}annualSeen.set(id,year);annualUses[id]=(annualUses[id]??0)+1;
   const m=ANNUAL_MESSAGES.find(a=>a.id===id),theme=thematic(id,m?.text??'',(m as any)?.theme),last=annualThemes.get(theme);
   if(last!==undefined&&year-last<2){annualThemeRepeats++;themeRepeat++;}annualThemes.set(theme,year);
  }
  if(s.pendingEvent){quietRun=0;}else{quietRun++;quietMax=Math.max(quietMax,quietRun);}
  collect();
 }
 settle();
 const issues=worldIntegrityIssues(s);if(issues.length){ writeFileSync('/tmp/fate-narrative-integrity-failure.json',JSON.stringify({seed,s},null,2)); throw Error(`Integrity seed ${seed}: ${issues.join(', ')}`); }
 rows.push({seed,role,cohortCareer,access:paid?'premium':'free',deathAge:s.age,died:s.dead,eventIds:seen.size,independentIds:independentSeen.size,annualIds:annualSeen.size,choices:choiceCount,serious,callbacks:echoes,annualRepeat,themeRepeat,quietMax,authoredSchedulesCreated:authoredSchedules.size,authoredMax,authoredOpenAtDeath:s.world.activeStories.filter(x=>['active','paused'].includes(x.status)).length+(s.world.threads?.length??0)+s.activeArcs.length,popupYears:Object.keys(yearlyPopups).length,maxYearlyPopups:Math.max(0,...Object.values(yearlyPopups)),chainsStarted:chainStartedCount,chainsCompleted:chainCompletedCount,distinctChainsOpened:chainStarts.size,distinctChainsCompleted:chainEnds.size,storiesStarted:storyStarts.size,storiesCompleted:storyCompletes.size,storiesCancelled:storyCancelled.size,storiesAbandoned:s.world.activeStories.filter(x=>x.status==='active'||x.status==='paused').length});
 if(i<14)samples.push({seed,role,access:paid?'premium':'free',deathAge:s.age,cause:s.deathCause,history});
 if((i+1)%100===0)console.log(`${args.label??'narrative'}: ${i+1}/${lives}`);
}
const byRole=Object.fromEntries(roles.map(role=>{const r=rows.filter(x=>x.role===role);return[role,{lives:r.length,meanDeathAge:mean(r.map(x=>x.deathAge)),meanEventIds:mean(r.map(x=>x.eventIds)),meanAnnualIds:mean(r.map(x=>x.annualIds)),callbacks:r.reduce((n,x)=>n+x.callbacks,0),longestQuietRun:Math.max(...r.map(x=>x.quietMax)),chainsStarted:r.reduce((n,x)=>n+x.chainsStarted,0),chainsCompleted:r.reduce((n,x)=>n+x.chainsCompleted,0)}];}));
const byCareer=Object.fromEntries([...new Set(rows.map(r=>r.cohortCareer??r.role))].map(career=>{const r=rows.filter(x=>(x.cohortCareer??x.role)===career);return[career,{lives:r.length,meanEventIds:mean(r.map(x=>x.eventIds)),meanDeathAge:mean(r.map(x=>x.deathAge))}];}));
const report={label:args.label??'after',controllerVersion:4,seed:startSeed,lives,policy:'Seven origin cohorts; adult occupational/royal role assigned once at eighteen; artisan professions rotate across craft, trade, medicine, law and entertainment. One quarter free, three quarters Premium. Canonical career IDs validated, including poacher_job. Reload checkpoints at twelve, thirty and fifty. Two work actions, rest below 75 health, deterministic hash choice policy, peaceful RPG resolution. Actual mortality; no invulnerability. Availability sampled only when a cohort survives to the stated age.',counts:{events:ALL_EVENTS.length,liveEvents:ALL_EVENTS.filter(e=>!e.legacyNarrative).length,legacyPassages:ALL_EVENTS.filter(e=>e.legacyNarrative).length,converted:ALL_EVENTS.filter(e=>!e.legacyNarrative&&e.convertedFrom).length,childhood:ALL_EVENTS.filter(e=>e.id.startsWith('young_')).length,independent:ALL_EVENTS.filter(e=>!e.legacyNarrative&&!e.arcNodeOnly&&(!e.chain||e.chain.index===0)&&!e.callback).length,callbacks:ALL_EVENTS.filter(e=>!e.legacyNarrative&&!!e.callback).length,chainContinuations:ALL_EVENTS.filter(e=>!e.legacyNarrative&&e.chain&&e.chain.index>0).length,persistentBeats:ALL_EVENTS.filter(e=>!e.legacyNarrative&&e.id.startsWith('story_')).length,annual:ANNUAL_MESSAGES.length,categories:counts(ALL_EVENTS.map(e=>e.category)),access:counts(ALL_EVENTS.map(e=>e.premium?'premium':'free')),storyTemplates:PERSISTENT_STORY_TEMPLATES.length},summary:{independentEncountersRange:[Math.min(...rows.map(r=>r.independentIds)),Math.max(...rows.map(r=>r.independentIds))],independentEncountersStdDev:Math.sqrt(mean(rows.map(r=>(r.independentIds-mean(rows.map(x=>x.independentIds)))**2))),meanIndependentEncounters:mean(rows.map(r=>r.independentIds)),repeatedInteractiveResolutions:rows.reduce((n,r)=>n+r.choices-r.eventIds,0),reloadChecks,reloadInconsistencies,authoredSchedulesCreated:rows.reduce((n,r)=>n+r.authoredSchedulesCreated,0),maxAuthoredOpen:Math.max(0,...rows.map(r=>r.authoredMax)),authoredOpenAtDeath:rows.reduce((n,r)=>n+r.authoredOpenAtDeath,0),popupsPerLifeYear:totalChoices/rows.reduce((n,r)=>n+r.deathAge,0),meanPopupYears:mean(rows.map(r=>r.popupYears)),maxYearlyPopups:Math.max(0,...rows.map(r=>r.maxYearlyPopups)),meanDeathAge:mean(rows.map(r=>r.deathAge)),meanEventIds:mean(rows.map(r=>r.eventIds)),meanAnnualIds:mean(rows.map(r=>r.annualIds)),uniqueEvents:Object.keys(eventUses).length,uniqueAnnual:Object.keys(annualUses).length,totalChoices,seriousChoices,seriousRate:seriousChoices/totalChoices,callbacks,shortCallbacks,delayedCallbacks,exactAnnualRepeats,annualThemeRepeats,eventThemeRepeats,stalls,storyInstancesStarted:rows.reduce((n,r)=>n+r.storiesStarted,0),storyInstancesCompleted:rows.reduce((n,r)=>n+r.storiesCompleted,0),storyInstancesCancelled:rows.reduce((n,r)=>n+r.storiesCancelled,0),storyInstancesOpenAtDeath:rows.reduce((n,r)=>n+r.storiesAbandoned,0),chainInstancesStarted:rows.reduce((n,r)=>n+r.chainsStarted,0),chainInstancesCompleted:rows.reduce((n,r)=>n+r.chainsCompleted,0),unfinishedLives:rows.filter(r=>!r.died).length},byRole,byCareer,availability:Object.fromEntries(Object.entries(availability).map(([k,a])=>[k,{samples:a.n,mean:a.total/a.n,min:a.min,max:a.max,distinctEligibleIds:a.ids.size}])),eventUses,annualUses,rows,samples};
mkdirSync(dirname(output),{recursive:true});writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report.summary,null,2));
