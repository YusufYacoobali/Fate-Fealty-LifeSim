import type {GameState} from '@/types/game';
export const ROUTINE_COURT_GAP=8;
export function identifyCourtScandals(s:GameState):void {
 s.world.court?.scandals.forEach((q,i)=>{q.id??=`legacy_scandal_${i}_${q.actorId}_${q.office}_${q.amount}`;});
}
export function currentCourtScandal(s:GameState){
 const id=s.pendingEvent?.eventId==='royal_creative_accounts'?s.pendingEvent.incidentId:undefined;
 return s.world.court?.scandals.find((q,i)=>!q.resolved&&(!id||(q.id??`legacy_scandal_${i}_${q.actorId}_${q.office}_${q.amount}`)===id));
}
export function routineCourtScandal(s:GameState){
 const c=s.world.court;if(!c||!s.lifetimeUnlocked||c.rulerId!==s.playerCharacterId)return;
 const last=c.lastRoutinePromptYear??c.records.filter(r=>r.kind.startsWith('scandal_')).at(-1)?.year;
 if(last!==undefined&&s.world.currentYear-last<ROUTINE_COURT_GAP)return;
 return c.scandals.find(q=>!q.resolved&&q.promptedYear===undefined&&s.world.characters[q.actorId]?.alive);
}
export function beginCourtScandal(s:GameState):string|undefined {
 identifyCourtScandals(s);const q=routineCourtScandal(s);if(!q)return;
 q.promptedYear=s.world.currentYear;s.world.court!.lastRoutinePromptYear=s.world.currentYear;return q.id;
}
export function scandalText(s:GameState):string {
 const q=currentCourtScandal(s);if(!q)return 'This incident has already received a decision. No second reward or punishment is due.';
 const p=s.world.characters[q.actorId],traits=p?.personalityTraits??[];
 const detail=q.office==='marshal'?'The paid guards turn out to be hunting dogs. They obey the command to sit rather better than the command to hold a bridge.'
  :q.office==='religious_adviser'?'The new vestment needs two servants to carry it. Its owner describes the weight as an instrument of humility.'
  :q.office==='chancellor'?'A private feast has consumed the public money. The councillor’s cousins are still too full to help explain it.'
  :'The missing silver has become a pair of decorative horses. Neither horse has volunteered to repay the treasury.';
 const manner=traits.includes('cunning')?'The explanation changes whenever a different councillor enters.':traits.includes('cruel')?'The official recommends questioning the servants first.':traits.includes('ambitious')?'The official proposes promotion as the best way to avoid this sort of distraction.':'The official arrives with an explanation and a household ally.';
 return `${p?.name??'The recorded official'}${p&&!p.alive?' (now deceased)':''}, ${q.office.replaceAll('_',' ')}, diverted ${q.amount} treasury gold. ${detail} ${manner} This decision concerns this incident alone.`;
}
