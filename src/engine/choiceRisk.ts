import type {Choice,Effects} from '@/types/game';
import {HEALTH_CONDITIONS} from '@/content/healthConditions';
import {CAREER_SPECIALIZATIONS} from '@/data/careerSpecializations';

/** Pure preview: inspect every authored branch, never roll or infer effects from prose. */
export function consequenceWarnings(e:Effects={}):string[] {
 const warnings:string[]=[];
 if(e.death)warnings.push('Death');
 if(e.killKin)warnings.push('A named person dies');
 if(e.prison || e.legal?.status==='imprisoned')warnings.push('Imprisonment');
 if(e.healthCondition){
  const condition=HEALTH_CONDITIONS.find(c=>c.id===e.healthCondition!.conditionId);
  warnings.push(condition?.kind==='disability'?'Lasting disability':condition?.kind==='injury'?'Injury':'Illness');
 }
 if((e.health??0)<=-15)warnings.push('Severe health loss');
 if((e.gold??0)<=-20)warnings.push('Large personal expense');
 if(Object.values(e.householdState??{}).some(value=>typeof value==='number'&&value<=-20))warnings.push('Major household loss');
 if((e.debt?.principal??0)>=20)warnings.push('Substantial debt');
 if(e.legal?.charge)warnings.push(e.legal.charge.severity>=20?'Serious legal charge':'Legal charge');
 if(e.endMarriage)warnings.push('The marriage ends');
 if(e.employment==='dismiss')warnings.push('Loss of employment');
 if((e.reputation??0)<=-15 || (e.familyReputation?.delta??0)<=-12)warnings.push('Loss of social standing');
 if(e.familyFeud)warnings.push('A lasting family feud');
 if((e.faction?.playerStanding??0)<=-12 || (e.faction?.influence??0)<=-15 || (e.worldConditions?.publicOrder??0)<=-10 || (e.royalTreasury??0)<=-20)warnings.push('Substantial political damage');
 if(e.royalTransition==='abdicate'||e.royalTransition==='depose')warnings.push('Loss of the crown');
 if(e.exile)warnings.push('Exile');
 if(e.professional && (e.professional.stage==='approach'?e.professional.choice===1:e.professional.choice===0)) {
  warnings.push('Loss of professional standing','A lasting family feud');
  if(['medicine','trade','craft'].includes(e.professional.family))warnings.push('Serious legal charge');
  if(['medicine','martial'].includes(e.professional.family))warnings.push('Severe harm to the client');
 }
 if(e.professionalPractice?.choice===1) {
  const action=CAREER_SPECIALIZATIONS.find(a=>a.id===e.professionalPractice!.id);
  if(action?.family==='medicine'&&action.mechanism==='treat')warnings.push('Risk of client harm or a professional complaint');
  if(action?.family==='martial')warnings.push('Risk of injury to the client');
 }
 return warnings;
}
export function choiceRisk(choice:Choice):NonNullable<Choice['forecast']> {
 const outcomes=[choice.outcome,choice.success,choice.failure,...(choice.challenge?[{effects:choice.challenge.stakes.win},{effects:choice.challenge.stakes.lose}]:[])].filter(Boolean);
 const negative=[...new Set(outcomes.flatMap(o=>consequenceWarnings(o!.effects)))];
 const uncertain=!!(choice.success||choice.failure);
 return {risk:negative.length?'high':uncertain||choice.costGold?'medium':'low',positive:[],negative,
  warnsDelayedConsequence:outcomes.some(o=>!!(o!.effects?.createSecret||o!.effects?.familyFeud||o!.effects?.schedule))};
}
export function completeForecast(choice:Choice):NonNullable<Choice['forecast']> {
 const computed=choiceRisk(choice),authored=choice.forecast;
 return {...computed,...authored,risk:computed.risk==='high'?'high':authored?.risk??computed.risk,
  negative:[...new Set([...(authored?.negative??[]),...computed.negative])],warnsDelayedConsequence:!!(authored?.warnsDelayedConsequence||computed.warnsDelayedConsequence)};
}
