import type {GameEvent,GameState,WorldCharacter,LegalCharge} from '@/types/game';
import {chance,clamp,pick} from './random';
import {pushFeed} from './gameState';
import {C} from '@/theme/theme';
export function hearingCharges(s:GameState):LegalCharge[]{
 const l=s.world.characters[s.playerCharacterId].legalState;
 return (l?.charges??[]).filter(c=>!c.resolved&&(!l?.hearing||l.hearing.resolved||l.hearing.chargeIds.includes(c.id)));
}
export function offenceKind(offence:string):string {
 if(/forg|counterfeit|false.*(?:seal|certificate|document)|alter.*(?:document|agreement)|perjury/i.test(offence))return 'forgery';
 if(/treason|royal|crown|political|conspira/i.test(offence))return 'political accusation';
 if(/assault|harm|attack|violence|robbery|malpractice/i.test(offence))return 'harm to a person';
 if(/theft|steal|stolen|poach|taking.*game|smuggl/i.test(offence))return 'theft';
 if(/fraud|selling|false|conceal|brib|dishonest/i.test(offence))return 'fraud';return 'other offence';
}
const CASE_OPENINGS:Record<string,string>={
 theft:'The missing property is described in loving detail. Its owner has considerably less affection for the proposed explanation.',
 fraud:'The promises are repeated in front of the people who paid for them. They sound rather smaller without the salesmanship.',
 forgery:'The disputed words are read aloud. The person who wrote them is offered an unusually quiet opportunity to explain.',
 'harm to a person':'The injured household gives its account. The court hears the injury before hearing anybody’s excuse for it.',
 'political accusation':'The accusation concerns the Crown. The benches are full of people watching one another rather than the speaker.',
 'other offence':'The court hears the particular complaint. The reeve asks the spectators to reserve their certainty until somebody has supplied evidence.',
};
export function hearingText(s:GameState):string {
 const charges=hearingCharges(s),l=s.world.characters[s.playerCharacterId].legalState;
 if(!charges.length)return 'No unresolved charge remains in this sitting. Earlier findings stay on record; there is no new offence to punish.';
 const first=charges[0],witnesses=[...new Set(charges.flatMap(c=>c.witnessIds))].map(id=>s.world.characters[id]).filter(Boolean);
 const victims=[...new Set(charges.flatMap(c=>c.victimIds))].map(id=>s.world.characters[id]?.name).filter(Boolean);
 return `${CASE_OPENINGS[offenceKind(first.offence)]} The sitting covers ${charges.map(c=>c.offence).join('; ')}. Evidence: ${Math.max(...charges.map(c=>c.evidence))}/100.${victims.length?` Injured households: ${victims.join(', ')}.`:''}${witnesses.length?` Witnesses: ${witnesses.map(c=>`${c.name}${c.alive?'':' (recorded testimony)'}`).join(', ')}.`:' No named witness is recorded.'} ${l?.charges.filter(c=>c.verdict==='convicted').length??0} prior convictions are on record. Each charge will receive a finding; this sitting imposes one combined sentence.`;
}
export function hearingProspects(s:GameState):number {
 const charges=hearingCharges(s);if(!charges.length)return 1;
 const witnessPressure=charges.flatMap(c=>c.witnessIds).some(id=>Object.values(s.world.relationships).some(r=>(r.aId===s.playerCharacterId&&r.bId===id||r.bId===s.playerCharacterId&&r.aId===id)&&r.flags.includes('feud')))?0.04:0;
 return Math.max(.12,Math.min(.88,.45+s.stats.wits/250+s.reputation/400-Math.max(...charges.map(c=>c.evidence))/180-witnessPressure));
}
export const LEGAL_SYSTEM_EVENTS:GameEvent[]=[{
 id:'system_legal_trial',category:'arc',arc:'legal_trial',arcNodeOnly:true,domain:'crime',title:'JUDGMENT BEFORE SWINEFORD',text:hearingText,cooldownYears:0,repetitionGroup:'mandatory_trial',editorialScore:5,
 choices:[
  {id:'defend',label:'Answer every charge',successChance:hearingProspects,success:{text:'The reeve dismisses the charges and reminds the spectators that their certainty is not evidence. Several look annoyed at having been so certain for nothing.',effects:{legalVerdict:'acquit'},tone:'good'},failure:{text:'The reeve gives sentence. The spectators stop offering advice now that none of them has to serve it.',effects:{legalVerdict:'convict'},tone:'bad'}},
  {id:'confess',label:'Confess and seek mercy (restitution up to 12g)',outcome:{text:'You admit the acts without the grand explanation. The reeve reduces the sentence; the neighbours look disappointed to have come so far for such a short performance.',effects:{legalVerdict:'confess'},tone:'plain'}},
  {id:'buy_favour',label:'Purchase favourable testimony (20g; bribery risk)',costGold:20,successChance:.62,success:{text:'The purchased testimony changes the finding. The witness leaves before gratitude can become another negotiation.',effects:{legalVerdict:'bribed'},tone:'plain'},failure:{text:'The witness repeats your offer instead. For once, everyone in court agrees on exactly what you said.',effects:{legalVerdict:'exposed'},tone:'bad'}},
 ],
}];
function normalizeLegal(character: WorldCharacter) {
  character.legalState ??= { status: 'free', suspicion: 0, notoriety: 0, charges: [], sentenceYearsRemaining: 0 };
  return character.legalState;
}

export function tickLegalSystem(state: GameState): GameState {
  for (const character of Object.values(state.world.characters)) {
    if (!character.alive) continue;
    const legal = normalizeLegal(character);
    legal.suspicion = clamp(legal.suspicion - 2);
    if (legal.status === 'imprisoned') {
      legal.sentenceYearsRemaining = Math.max(0, legal.sentenceYearsRemaining - 1);
      if (character.id === state.playerCharacterId) {
        if (legal.sentenceYearsRemaining === 0) {
          legal.status = 'free';
          state.tags = state.tags.filter((tag) => tag !== 'imprisoned');
          pushFeed(state, 'RELEASED', C.good, 'The sentence ends. Swineford opens its gates, though not every door.', 'good');
        }
      }
    }
    if (character.id !== state.playerCharacterId && character.importance !== 'background' && legal.status === 'free' && chance(Math.max(0, (legal.notoriety + (character.factionId === 'outlaws' ? 15 : 0)) / 1200))) {
      legal.suspicion = clamp(legal.suspicion + 12);
      const others = Object.values(state.world.characters).filter((candidate) => candidate.alive && candidate.id !== character.id);
      const victim = others.length ? pick(others) : undefined;
      const witnesses = others.filter((candidate) => candidate.id !== victim?.id);
      legal.charges.push({ id: `charge_${state.nextId++}`, offence: `theft from ${victim?.name ?? 'a neighbour'}`, severity: 25, evidence: 35, victimIds: victim ? [victim.id] : [], witnessIds: witnesses.length ? [pick(witnesses).id] : [], year: state.world.currentYear, resolved: false });
    }
  }
  return state;
}


export function dueLegalEvent(s:GameState):GameEvent|null {
 const l=s.world.characters[s.playerCharacterId].legalState;
 if(!l||l.status==='imprisoned')return null;
 if(l.hearing&&!l.hearing.resolved)return LEGAL_SYSTEM_EVENTS[0];
 return l.suspicion>=35&&l.charges.some(c=>!c.resolved)?LEGAL_SYSTEM_EVENTS[0]:null;
}
export function beginLegalTrial(s:GameState):void {
 const l=s.world.characters[s.playerCharacterId].legalState;if(!l)return;
 if(l.hearing&&!l.hearing.resolved)return;
 const ids=l.charges.filter(c=>!c.resolved).map(c=>c.id);if(!ids.length)return;
 l.hearing={id:`hearing_${s.nextId++}`,chargeIds:ids,openedYear:s.world.currentYear,resolved:false};l.status='awaiting_trial';
}
export function resolveLegalHearing(s:GameState,verdict:NonNullable<import('@/types/game').Effects['legalVerdict']>):void {
 const l=s.world.characters[s.playerCharacterId].legalState;if(!l)return;
 // Legacy visible trials have no hearing record. Never repunish a charge the old save already closed.
 if(!l.hearing)beginLegalTrial(s);
 if(l.hearing?.resolved)return;
 const charges=hearingCharges(s);if(!charges.length){l.status='free';return;}
 const guilty=!['acquit','bribed'].includes(verdict);
 for(const c of charges){c.resolved=true;c.verdict=guilty?'convicted':'acquitted';}
 l.hearing!.resolved=true;l.hearing!.verdict=verdict;
 if(verdict==='bribed'||verdict==='exposed')s.gold=Math.max(0,s.gold-20);
 if(verdict==='confess'){s.gold=Math.max(0,s.gold-12);l.suspicion=Math.max(0,l.suspicion-10);}
 if(verdict==='bribed'){s.stats.faith=clamp(s.stats.faith-4);l.notoriety=clamp(l.notoriety+3);}
 if(verdict==='exposed')l.suspicion=clamp(l.suspicion+20);
 if(verdict==='exposed')l.charges.push({id:`charge_${s.nextId++}`,offence:'Attempted witness bribery during the hearing',severity:30,evidence:90,victimIds:[],witnessIds:[...new Set(charges.flatMap(c=>c.witnessIds))],year:s.world.currentYear,resolved:true,verdict:'convicted'});
 if(guilty){const ordinary=Math.min(8,Math.max(1,Math.ceil(Math.max(...charges.map(c=>c.severity))/15))+charges.length-1);l.sentenceYearsRemaining=verdict==='confess'?Math.max(1,Math.floor(ordinary/2)):verdict==='exposed'?Math.min(10,ordinary+1):ordinary;l.status='imprisoned';l.notoriety=clamp(l.notoriety+(verdict==='confess'?5:verdict==='exposed'?15:8));s.tags=[...new Set([...s.tags,'imprisoned'])];}
 else{l.status='free';l.sentenceYearsRemaining=0;l.suspicion=Math.max(0,l.suspicion-(verdict==='bribed'?12:20));s.tags=s.tags.filter(t=>t!=='imprisoned');}
 pushFeed(s,'COURT FINDING',guilty?C.bad:C.good,`${charges.map(c=>c.offence).join('; ')}: ${guilty?'convicted':'acquitted'}.${guilty?` Combined sentence: ${l.sentenceYearsRemaining} ${l.sentenceYearsRemaining===1?'year':'years'}.`:''}` ,guilty?'bad':'good');
}

/** v9 consumed a charge when opening its popup. Restore that documented charge,
 * only for a still-visible, unanswered hearing; completed findings stay closed. */
export function recoverLegacyLegalHearing(s:GameState):void {
 if(s.world.contentVersion>9||s.pendingEvent?.eventId!=='system_legal_trial')return;
 const l=s.world.characters[s.playerCharacterId].legalState;
 if(!l||l.hearing||l.status!=='awaiting_trial')return;
 const answered=s.world.history.some(h=>h.eventId==='system_legal_trial'&&h.year===s.world.currentYear&&h.resolvedChoiceId);
 if(answered)return;
 const consumed=l.charges.filter(c=>c.resolved&&!c.verdict).at(-1);
 if(consumed)consumed.resolved=false;
 beginLegalTrial(s);
}
