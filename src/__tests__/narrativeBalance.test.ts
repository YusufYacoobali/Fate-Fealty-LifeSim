import {ALL_EVENTS,EVENTS_BY_ID} from '@/content';
import {SOCIAL_COMEDY_EVENTS} from '@/content/socialComedyEvents';
import {createLife,cloneState,syncPlayerToWorld} from '@/engine/gameState';
import {singleYearFixture} from './singleYearFixtures';
import {applyChoice} from '@/engine/storyGraph';
import {isEventPlayable,isChoiceEnabled,bindEventActors} from '@/engine/eventPicker';
import {spawnKin} from '@/engine/kinFactory';
import {normalizeGameState} from '@/state/persistence';
import {runWithWorldRng} from '@/engine/random';
import * as random from '@/engine/random';
import {choiceStakes} from '@/engine/choiceFeedback';
import {policyChoice,severeSnapshot,severeChanges,deathCategory} from '../../scripts/narrativeRiskAudit';
import {beginLegalTrial,hearingCharges,hearingText,dueLegalEvent,resolveLegalHearing} from '@/engine/legalEngine';
import {beginCourtScandal,currentCourtScandal,routineCourtScandal,scandalText} from '@/engine/courtIncidents';
import {applyCourtScandal} from '@/engine/courtEngine';
import {beginOfficePetition,resolveOfficePetition} from '@/engine/courtPolitics';
import {checkDeath} from '@/engine/deathEngine';

afterEach(()=>jest.restoreAllMocks());
function legal(){const s=createLife({worldSeed:42});s.age=30;s.gold=100;const l=s.world.characters[s.playerCharacterId].legalState!;l.suspicion=60;l.charges=[{id:'a',offence:'Theft of a saddle',severity:25,evidence:45,victimIds:['merek'],witnessIds:['roderick'],year:s.world.currentYear,resolved:false},{id:'b',offence:'Forging the sale of that saddle',severity:35,evidence:65,victimIds:['merek'],witnessIds:['roderick'],year:s.world.currentYear,resolved:false}];return s;}
it('profiles distinguish a cautious ordinary life from knowingly reckless choices without consuming RNG',()=>{
 const s=createLife({worldSeed:42}),e=EVENTS_BY_ID.life_boat_fare,rng=s.world.rngState;
 expect(policyChoice(s,e.choices,'cautious',0).id).not.toBe('board');expect(policyChoice(s,e.choices,'reckless',0).id).toBe('board');
 expect(policyChoice(s,e.choices,'balanced',1).id).toBe('board');expect(s.world.rngState).toEqual(rng);
});
it('natural annual mortality stays identical across profiles when their choices have no effects',()=>{
 const base=createLife({worldSeed:42});base.age=70;base.world.currentYear=base.bornYear+70;syncPlayerToWorld(base);
 const outcomes=['cautious','balanced','reckless'].map(policy=>{const s=cloneState(base);policyChoice(s,[{label:'Sit quietly',outcome:{text:'An ordinary afternoon.',effects:{}}}],policy as any,0);runWithWorldRng(s.world,()=>checkDeath(s));return {dead:s.dead,cause:s.deathCause,rng:s.world.rngState};});
 expect(outcomes[1]).toEqual(outcomes[0]);expect(outcomes[2]).toEqual(outcomes[0]);
});
it.each(['success','setback','catastrophe'])('resolves a graded hazard as %s now, with no future chapter',branch=>{
 const e=EVENTS_BY_ID.life_boat_fare,c=e.choices.find(c=>c.id==='board')!,s=singleYearFixture(e);s.pendingEvent={eventId:e.id,bindings:{other:'merek'}};
 const roll=jest.spyOn(random,'chance');roll.mockReturnValueOnce(branch==='success');if(branch!=='success')roll.mockReturnValueOnce(branch==='catastrophe');
 const before=severeSnapshot(s);applyChoice(s,e,c);
 expect(s.pendingEvent).toBeNull();expect(s.activeArcs).toEqual([]);expect(s.world.threads??[]).toEqual([]);
 expect(s.dead).toBe(branch==='catastrophe');if(branch==='setback')expect(s.world.characters[s.playerCharacterId].healthConditions?.some(c=>c.conditionId==='deep_cut')).toBe(true);
 if(branch==='catastrophe'){expect(severeChanges(s,before)).toContain('death');expect(deathCategory(s,'encounter',true)).toBe('explicit_event_death');expect(s.world.history.some(h=>h.eventId===e.id&&h.resolvedChoiceId==='board')).toBe(true);}
 const after=JSON.stringify(s);applyChoice(s,e,c);expect(JSON.stringify(s)).toBe(after);
});
it('warns about every retained catastrophic death, including both duel stakes, without rolling',()=>{
 const choices=ALL_EVENTS.filter(e=>!e.legacyNarrative).flatMap(e=>e.choices).filter(c=>c.catastrophe);expect(choices.length).toBe(9);
 for(const c of choices){expect(choiceStakes(c)).toContain('Death');expect(c.failure?.effects?.death).toBeUndefined();expect(c.catastropheChance).toBeGreaterThan(0);expect(c.catastropheChance).toBeLessThan(.25);}
 expect(EVENTS_BY_ID.life_crown_taster.choices.find(c=>c.id==='drink')!.failure?.effects?.death).toBeTruthy();
});
it('keeps every actual charge open until a combined hearing gives its findings, then never punishes twice',()=>{
 const s=legal(),before=s.gold;beginLegalTrial(s);expect(hearingCharges(s)).toHaveLength(2);expect(s.world.characters[s.playerCharacterId].legalState!.charges.every(c=>!c.resolved)).toBe(true);
 expect(hearingText(s)).toContain('Theft of a saddle');expect(hearingText(s)).toContain('Forging the sale');expect(hearingText(s)).toContain(s.world.characters.roderick.name);
 const loaded=normalizeGameState(JSON.parse(JSON.stringify(s)));expect(loaded.world.characters[s.playerCharacterId].legalState!.hearing).toEqual(s.world.characters[s.playerCharacterId].legalState!.hearing);
 resolveLegalHearing(loaded,'confess');const l=loaded.world.characters[s.playerCharacterId].legalState!;expect(l.charges.every(c=>c.resolved&&c.verdict==='convicted')).toBe(true);expect(l.sentenceYearsRemaining).toBe(2);expect(loaded.gold).toBe(before-12);
 const after=JSON.stringify(loaded);resolveLegalHearing(loaded,'exposed');expect(JSON.stringify(loaded)).toBe(after);
});
it('does not consume a new charge that appears after the sitting starts, or repunish a legacy closed charge',()=>{
 const s=legal();beginLegalTrial(s);const l=s.world.characters[s.playerCharacterId].legalState!;l.charges.push({...l.charges[0],id:'later',offence:'A separate later accusation'});resolveLegalHearing(s,'acquit');expect(l.charges.find(c=>c.id==='later')!.resolved).toBe(false);
 const old=legal();old.world.characters[old.playerCharacterId].legalState!.charges.forEach(c=>c.resolved=true);const money=old.gold;resolveLegalHearing(old,'confess');expect(old.gold).toBe(money);
});
it('varies hearings only from actual offences, witnesses and earlier convictions and keeps urgent trials available',()=>{
 const s=legal(),l=s.world.characters[s.playerCharacterId].legalState!;
 const texts=['theft','fraud in a sale','assault','forgery of a deed','treason against the Crown','disturbing the peace'].map(offence=>{l.charges=[{...l.charges[0],offence}];return hearingText(s);});expect(new Set(texts).size).toBe(6);expect(texts.every(t=>t.includes('Witnesses:'))).toBe(true);
 beginLegalTrial(s);l.suspicion=0;expect(dueLegalEvent(s)?.id).toBe('system_legal_trial');
});
it('binds a court response to one incident, keeps routine prompts apart and preserves manual investigation',()=>{
 const s=legal();s.lifetimeUnlocked=true;const c=s.world.court!;c.rulerId=s.playerCharacterId;c.scandals=[{id:'one',actorId:'merek',office:'treasurer',amount:20,exposed:false},{id:'two',actorId:'roderick',office:'marshal',amount:30,exposed:false}];
 const before=JSON.stringify(s);scandalText(s);expect(JSON.stringify(s)).toBe(before);
 const id=beginCourtScandal(s);s.pendingEvent={eventId:'royal_creative_accounts',incidentId:id};expect(currentCourtScandal(s)?.id).toBe('one');applyCourtScandal(s,'investigate');const money=c.treasury;applyCourtScandal(s,'investigate');expect(c.treasury).toBe(money);expect(c.scandals[1].resolved).not.toBe(true);
 s.pendingEvent=null;s.world.currentYear+=3;expect(routineCourtScandal(s)).toBeUndefined();expect(currentCourtScandal(s)?.id).toBe('two');s.world.currentYear+=5;expect(routineCourtScandal(s)?.id).toBe('two');
 expect(normalizeGameState(JSON.parse(JSON.stringify(s))).world.court!.lastRoutinePromptYear).toBe(c.lastRoutinePromptYear);
});
it('cannot overwrite or replay an outstanding petition',()=>{
 const s=legal();beginOfficePetition(s,'treasurer');const first=JSON.stringify(s.world.court!.petition);beginOfficePetition(s,'marshal');expect(JSON.stringify(s.world.court!.petition)).toBe(first);resolveOfficePetition(s,'withdraw');const after=JSON.stringify(s);resolveOfficePetition(s,'withdraw');expect(JSON.stringify(s)).toBe(after);
});
it('all 25 new social scenes have actual casts, distinct complete choices and no authored schedule',()=>{
 expect(SOCIAL_COMEDY_EVENTS).toHaveLength(25);
 for(const raw of SOCIAL_COMEDY_EVENTS){const e=EVENTS_BY_ID[raw.id],s=singleYearFixture(e),p=s.world.characters[s.playerCharacterId];
  if(e.actorRoles?.other?.romanceEligible){p.attraction=p.gender==='man'?'women':'men';runWithWorldRng(s.world,()=>spawnKin(s,{kind:'friend',age:25,gender:p.gender==='man'?'woman':'man',attraction:p.gender==='man'?'men':'women'}));}
  expect({id:e.id,playable:isEventPlayable(s,e)}).toEqual({id:e.id,playable:true});s.pendingEvent={eventId:e.id,bindings:runWithWorldRng(s.world,()=>bindEventActors(s,e))};
  for(const c of e.choices){const copy=cloneState(s);expect(isChoiceEnabled(copy,c)).toBe(true);runWithWorldRng(copy.world,()=>applyChoice(copy,e,c));expect(copy.pendingEvent).toBeNull();expect(copy.activeArcs).toEqual([]);expect(copy.world.threads??[]).toEqual([]);expect(copy.world.history.some(h=>h.eventId===e.id)).toBe(true);}
 }
});

it('restores only an unanswered v9 visible charge and preserves completed findings, kin and RNG',()=>{
 const s=legal();s.world.contentVersion=9;const l=s.world.characters[s.playerCharacterId].legalState!;l.status='awaiting_trial';l.charges[0].resolved=true;l.charges[0].verdict='convicted';l.charges[1].resolved=true;s.pendingEvent={eventId:'system_legal_trial'};const rng=s.world.rngState,history=JSON.stringify(s.world.history),parents=s.world.characters[s.playerCharacterId].parentIds;
 const loaded=normalizeGameState(JSON.parse(JSON.stringify(s))),ll=loaded.world.characters[s.playerCharacterId].legalState!;
 expect(ll.hearing?.chargeIds).toEqual(['b']);expect(ll.charges[0].verdict).toBe('convicted');expect(ll.charges[0].resolved).toBe(true);expect(JSON.stringify(loaded.world.history)).toBe(history);expect(loaded.world.rngState).toEqual(rng);expect(loaded.world.characters[s.playerCharacterId].parentIds).toEqual(parents);
 const again=normalizeGameState(JSON.parse(JSON.stringify(loaded)));expect(again.world.characters[s.playerCharacterId].legalState).toEqual(ll);
});
it('retains the original bribery and confession costs, faith and notoriety consequences',()=>{
 const s=legal(),faith=s.stats.faith;beginLegalTrial(s);resolveLegalHearing(s,'bribed');const l=s.world.characters[s.playerCharacterId].legalState!;
 expect(s.gold).toBe(80);expect(s.stats.faith).toBe(Math.max(0,faith-4));expect(l.notoriety).toBe(3);expect(l.suspicion).toBe(48);
 const f=legal();beginLegalTrial(f);resolveLegalHearing(f,'confess');expect(f.gold).toBe(88);expect(f.world.characters[f.playerCharacterId].legalState!.suspicion).toBe(50);
});
