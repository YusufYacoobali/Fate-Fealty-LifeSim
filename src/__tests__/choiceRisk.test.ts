import {choiceRisk,consequenceWarnings} from '@/engine/choiceRisk';
import {choiceStakes} from '@/engine/choiceFeedback';
import type {Effects} from '@/types/game';

it.each([
 ['death',{death:'Explicitly risked death'},'Death'],
 ['NPC death',{killKin:'other'},'A named person dies'],
 ['prison',{prison:3},'Imprisonment'],
 ['disability',{healthCondition:{conditionId:'chronic_pain',severity:20}},'Lasting disability'],
 ['severe injury',{health:-22},'Severe health loss'],
 ['personal loss',{gold:-30},'Large personal expense'],
 ['household loss',{householdState:{wealth:-30}},'Major household loss'],
 ['debt',{debt:{principal:30,interestRate:0.1}},'Substantial debt'],
 ['legal charge',{legal:{charge:{offence:'Forgery',severity:35,evidence:60,witnessIds:[],victimIds:[]}}},'Serious legal charge'],
 ['divorce',{endMarriage:true},'The marriage ends'],
 ['dismissal',{employment:'dismiss'},'Loss of employment'],
 ['standing',{reputation:-20},'Loss of social standing'],
 ['feud',{familyFeud:{role:'other',reason:'A witnessed betrayal'}},'A lasting family feud'],
 ['politics',{worldConditions:{publicOrder:-18}},'Substantial political damage'],
 ['crown',{royalTransition:'abdicate'},'Loss of the crown'],
 ] as [string,Effects,string][])('warns about %s in the failure branch even when success is harmless',(_label,effect,warning)=>{
  const choice={label:'Take the chance',successChance:0.5,success:{text:'A modest benefit.',effects:{gold:2}},failure:{text:'The cost is paid.',effects:effect},forecast:{risk:'low' as const,positive:[],negative:[]}};
  expect(choiceRisk(choice).risk).toBe('high');expect(choiceStakes(choice)).toContain(warning);
 });
it('checks dangerous success branches without rolling',()=>{
 const choice={label:'Try it',success:{text:'A dangerous success',effects:{householdState:{wealth:-30}}},failure:{text:'No change',effects:{}}};
 expect(choiceStakes(choice)).toContain('Major household loss');
 expect(consequenceWarnings({health:3,gold:2})).toEqual([]);
});
it('includes the price and both duel stakes even when the immediate outcome is harmless',()=>{
 const choice={label:'Pay for the challenge',costGold:30,outcome:{text:'The challenge begins.',effects:{gold:-30}},challenge:{role:'other',stakes:{summary:'A dangerous wager',win:{familyFeud:{role:'other',reason:'Public humiliation'}},lose:{death:'Killed in the duel'}}}};
 expect(choiceStakes(choice)).toEqual(expect.arrayContaining(['Large personal expense','A lasting family feud','Death']));
 expect(choiceRisk(choice).risk).toBe('high');
});
it('does not describe an affordability requirement as money actually spent',()=>{
 expect(choiceStakes({label:'Show that you can cover the bond',costGold:30,outcome:{text:'The sum remains yours.',effects:{}}})).not.toContain('Large personal expense');
});
