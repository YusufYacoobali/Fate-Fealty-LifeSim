import {routineActivityAvailable} from '../src/engine/activityVariety';
/** Uses the existing reducer, requirements, decision policy and encounter helper. No rank/stat/gold injection. */
import {writeFileSync,mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {createLife,syncPlayerToWorld} from '../src/engine/gameState';
import {gameReducer} from '../src/state/gameReducer';
import {normalizeGameState} from '../src/state/persistence';
import {eventById,isChoiceEnabled} from '../src/engine/eventPicker';
import {careerActionAvailability} from '../src/engine/careerEngine';
import {activityAvailability} from '../src/engine/activityEngine';
import {holdingActionAvailability} from '../src/engine/holdingEngine';
import {resolveRpgEncounter} from '../src/__tests__/rpgSoakHelpers';
import {policyChoice} from './narrativeRiskAudit';
import {worldIntegrityIssues} from '../src/engine/worldIntegrity';
import {RANKS} from '../src/data/ranks';
import type {GameState,Difficulty} from '../src/types/game';
const args=Object.fromEntries(process.argv.slice(2).map(x=>x.replace(/^--/,'').split('='))),reps=Number(args.reps??1),output=args.output??'/tmp/natural-ranks-cohort.json';
const jobs=['tenant_farmer','trader','cleric','copyist','guard','barber_surgeon'];const difficulties:Difficulty[]=['Merciful','Normal','Brutal'];const styles=[{name:'casual',actions:2},{name:'balanced',actions:6},{name:'focused',actions:10}];
const rows:any[]=[];let checks=0;
for(const difficulty of difficulties)for(const job of jobs)for(const style of styles)for(let rep=0;rep<reps;rep++){
 const index=rows.length,seed=965000+index,pro=index%4!==0;
 let s=createLife({worldSeed:seed,birthOrigin:'peasant',lifetimeUnlocked:pro,settings:{difficulty,autoScroll:true,liveForever:false,haptics:false,soundEffects:false,reducedMotion:true}}),employed=false,guard=0,lastYear=-1,used=0;
 const ages:(number|null)[]=[0,null,null,null,null,null];
 function record(){if(ages[s.rankIdx]===null)ages[s.rankIdx]=s.age;}
 function action(a:Parameters<typeof gameReducer>[1]){s=gameReducer(s,a);record();}
 while(!s.dead&&guard++<2500){s=resolveRpgEncounter(s);record();if(s.pendingEvent){const e=eventById(s.pendingEvent.eventId)!;const enabled=e.choices.filter(c=>isChoiceEnabled(s,c));if(!enabled.length)throw Error('No choice '+e.id);action({type:'CHOOSE',choice:policyChoice(s,enabled,'balanced',seed+s.age)});continue;}
  if(lastYear!==s.world.currentYear){lastYear=s.world.currentYear;used=0;if([12,30,50].includes(s.age)){syncPlayerToWorld(s);const rng=JSON.stringify(s.world.rngState),rank=s.rankIdx,progress=s.rankProgress;s=normalizeGameState(JSON.parse(JSON.stringify(s)));s=gameReducer(s,{type:'SET_LIFETIME_UNLOCKED',unlocked:pro});if(JSON.stringify(s.world.rngState)!==rng||s.rankIdx!==rank||s.rankProgress!==progress)throw Error('Reload rank/RNG mismatch');checks++;}}
  // Employment is a controlled cohort assignment at adulthood; all subsequent gains use actual actions.
  if(s.age>=18&&!employed){s.occupation={careerId:job,experience:0,performance:50,workedThisYear:0,guildStanding:0};syncPlayerToWorld(s);employed=true;}
  if(used++>=style.actions||s.actionClock.used>=s.actionClock.cap){action({type:'AGE_UP'});continue;}
  if(style.name!=='casual'&&s.age>=6&&s.holding.lastActionAge!==s.age){const id=s.holding.stores<55?'work_land':s.holding.security<55?'secure_bounds':s.holding.loyalty<55?'open_stores':s.holding.stores>=80&&s.rankIdx>=1?'sell_surplus':'work_land';if(holdingActionAvailability(s,id).available){action({type:'MANAGE_HOLDING',id});continue;}}
  const next=RANKS[s.rankIdx+1]?.promote,canDo=(id:string)=>activityAvailability(s,id).available&&routineActivityAvailable(s,id);
  if(s.stats.health<65&&canDo('rest')){action({type:'DO_ACTIVITY',id:'rest'});continue;}
  if(employed&&s.occupation.workedThisYear<2&&careerActionAvailability(s,'work').available){action({type:'CAREER_ACTION',action:'work'});continue;}
  if(next?.stats?.charm&&s.stats.charm<next.stats.charm&&s.gold>=4&&canDo('bathhouse')){action({type:'DO_ACTIVITY',id:'bathhouse'});continue;}
  if(employed&&careerActionAvailability(s,'train').available&&routineActivityAvailable(s,'career_train')&&s.stats.wits<(next?.stats?.wits??80)){action({type:'CAREER_ACTION',action:'train'});continue;}
  const candidates=s.age>=18?['study_trade','village_service','fair','bathhouse','church','rest']:['train','village_service','church','rest'];const id=candidates.find(canDo);if(id)action({type:'DO_ACTIVITY',id});else action({type:'AGE_UP'});
 }
 if(!s.dead)throw Error('Unfinished life '+seed);const issues=worldIntegrityIssues(s);if(issues.length)throw Error(issues.join(';'));
 rows.push({seed,difficulty,job,style:style.name,pro,deathAge:s.age,ages,highest:Math.max(...ages.map((a,i)=>a===null?0:i))});
}
function summarize(group:typeof rows){return {lives:group.length,meanDeathAge:group.reduce((n,r)=>n+r.deathAge,0)/group.length,ranks:RANKS.map((rank,i)=>{const reached=group.filter(r=>r.ages[i]!==null);return {rank:i===0?'Commoner':rank.key,reached:reached.length,rate:reached.length/group.length,meanAge:reached.length?reached.reduce((n,r)=>n+r.ages[i],0)/reached.length:null};})};}
const report={seedStart:965000,policy:'Six occupations assigned at eighteen; 2/6/10 actions per year; actual work, study, leisure, care and estate management; balanced existing event policy; no forced ranks, qualifications, money, stats, invulnerability or claims.',reloadChecks:checks,summary:summarize(rows),pro:summarize(rows.filter(r=>r.pro)),free:summarize(rows.filter(r=>!r.pro)),byOccupation:Object.fromEntries(jobs.map(j=>[j,summarize(rows.filter(r=>r.job===j))])),byDifficulty:Object.fromEntries(difficulties.map(d=>[d,summarize(rows.filter(r=>r.difficulty===d))])),byStyle:Object.fromEntries(styles.map(st=>[st.name,summarize(rows.filter(r=>r.style===st.name))])),rows};mkdirSync(dirname(output),{recursive:true});writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report.summary,null,2));
