import type {Choice,GameState,Effects} from '../src/types/game';
import {HEALTH_CONDITIONS} from '../src/content/healthConditions';
export type DecisionPolicy='cautious'|'balanced'|'reckless';
export function riskScore(c:Choice,s:GameState):number {
 const severity=(e:Effects={})=> (e.death?1000:0)+(e.courtScandal==='cover'?60:e.courtScandal==='scapegoat'?90:0)+(e.courtOpposition==='assert'?90:0)+(e.professional?.choice===1?80:0)+(e.legalVerdict&&['convict','confess','exposed'].includes(e.legalVerdict)?90:0)+(e.prison||e.legal?.status==='imprisoned'?90:0)+(e.legal?.charge?45:0)+(e.healthCondition?HEALTH_CONDITIONS.find(h=>h.id===e.healthCondition!.conditionId)?.kind==='disability'?160:45:0)+Math.max(0,-(e.health??0))*(s.stats.health<30?8:2)+(e.endMarriage?100:0)+(e.familyFeud?80:0)+(e.employment==='dismiss'?90:0)+Math.max(0,e.debt?.principal??0)+Math.max(0,-(e.householdState?.wealth??0))+Math.max(0,-(e.reputation??0));
 return Math.max(...[c.outcome,c.success,c.failure,(c as any).catastrophe].filter(Boolean).map(o=>severity(o.effects)),...(c.challenge?[severity(c.challenge.stakes.win),severity(c.challenge.stakes.lose)]:[0]));
}
export function policyChoice(s:GameState,choices:Choice[],policy:DecisionPolicy,tie:number):Choice {
 if(policy==='balanced')return choices[tie%choices.length];
 const ranked=choices.map(c=>({c,score:riskScore(c,s)}));const target=(policy==='cautious'?Math.min:Math.max)(...ranked.map(r=>r.score));const tied=ranked.filter(r=>r.score===target);return tied[tie%tied.length].c;
}
export function severeSnapshot(s:GameState) {
 const p=s.world.characters[s.playerCharacterId],h=s.world.households.find(h=>h.id===p.householdId);
 return {health:s.stats.health,gold:s.gold,wealth:h?.wealth??0,debt:s.debts.reduce((n,d)=>n+d.principal,0),charges:p.legalState?.charges.map(c=>c.id)??[],sentence:p.legalState?.sentenceYearsRemaining??0,status:p.legalState?.status,disability:p.healthConditions?.filter(c=>c.kind==='disability').length??0,feuds:s.world.families[p.birthFamilyId??'']?.enemyFamilyIds.length??0,job:s.occupation.careerId,spouse:p.spouseId,alive:Object.values(s.world.characters).filter(c=>c.alive&&c.id!==s.playerCharacterId).length,reputation:s.reputation,ruler:s.world.court?.rulerId};
}
export function severeChanges(s:GameState,b:ReturnType<typeof severeSnapshot>):string[]{
 const a=severeSnapshot(s),out:string[]=[];
 if(a.debt>=b.debt+20)out.push('debt');if(a.gold<=b.gold-20||a.wealth<=b.wealth-20)out.push('wealth_loss');
 if(a.charges.some(id=>!b.charges.includes(id)))out.push('legal_charge');
 if(a.sentence>b.sentence||a.status==='imprisoned'&&b.status!=='imprisoned')out.push('imprisonment');
 if(a.disability>b.disability)out.push('disability');if(a.feuds>b.feuds)out.push('family_feud');
 if(b.job&&!a.job)out.push('employment_loss');if(b.spouse&&!a.spouse)out.push('relationship_breakdown');
 if(s.dead)out.push('death');if(a.health<=b.health-15)out.push('severe_health_loss');if(a.alive<b.alive)out.push('npc_death');
 if(a.reputation<=b.reputation-15||b.ruler===s.playerCharacterId&&a.ruler!==s.playerCharacterId)out.push('status_loss');return out;
}
export function deathCategory(s:GameState,stage:string,explicit=false):string {
 const cause=s.deathCause.toLowerCase();
 if(explicit)return 'explicit_event_death';
 if(stage==='encounter')return 'accumulated_injury_or_health_loss';
 if(/very.*old|winter chill and a tired heart|full span/.test(cause))return 'old_age';
 if(HEALTH_CONDITIONS.some(c=>cause===c.name.toLowerCase()))return 'illness_and_deterioration';
 if(s.stats.health<=0)return s.world.characters[s.playerCharacterId].healthConditions?.some(c=>c.kind==='injury'||c.kind==='disability')?'accumulated_injury_or_health_loss':'illness_and_deterioration';
 if(/hanged|king.s men|knifed|banditry/.test(cause))return 'outlaw_hazard';
 if(/battle|tourney|leech.doctor|combat|duel/.test(cause))return 'military_or_combat_hazard';
 return 'other_identified';
}
