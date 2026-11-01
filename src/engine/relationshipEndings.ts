import type {GameState,Relationship} from '@/types/game';
import {activeSpouse,unlinkSpouse} from './characterState';
import {enqueueLifeEventNotice,snapshotPerson} from './lifeEventNotices';
import {chance} from './random';
import {pushFeed} from './gameState';
import {C} from '@/theme/theme';
function relationFor(s:GameState,id:string){return Object.values(s.world.relationships).find(r=>r.aId===s.playerCharacterId&&r.bId===id||r.bId===s.playerCharacterId&&r.aId===id);}
/** A confirmed ending, in this year. No custody changes, delayed chapters or extra costs. */
export function endPlayerRomance(s:GameState,id:string,initiator:'player'|'npc',cause:string):boolean {
 const partner=s.world.characters[id],r=relationFor(s,id);if(!partner?.alive||!r||s.dead)return false;
 if(activeSpouse(s)?.id===id){
  unlinkSpouse(s,s.playerCharacterId,'divorce',undefined,{initiator,cause});partner.kind='acquaintance';
  if(!s.tags.includes('divorced'))s.tags.push('divorced');
 }else{
  const romanceKind=r.flags.includes('affair')?'affair':r.flags.includes('courtship')?'courtship':undefined;if(!romanceKind)return false;
  enqueueLifeEventNotice(s,{key:`romance_${id}_${r.romanceEpisode??0}_${s.world.currentYear}`,category:'heartbreak',people:[snapshotPerson(s,id,romanceKind==='affair'?'lover':'romantic partner')],cause,context:{initiator,romanceKind}});
  r.flags=r.flags.filter(f=>f!=='affair'&&f!=='courtship');
 }
 r.sharedMemories.push(`relationship_ended_${s.world.currentYear}`);
 if(initiator==='npc')pushFeed(s,'RELATIONSHIP ENDED',C.bad,`${partner.name} ends the relationship: ${cause}.`,'bad',{},id,'npc');
 return true;
}
export function tickRelationshipEndings(s:GameState):void {
 if(s.dead||s.age<18)return;
 for(const r of Object.values(s.world.relationships)){
  const id=r.aId===s.playerCharacterId?r.bId:r.bId===s.playerCharacterId?r.aId:undefined;
  const partner=id?s.world.characters[id]:undefined;
  if(!id||!partner?.alive||partner.age<18||!(activeSpouse(s)?.id===id||r.flags.includes('courtship')||r.flags.includes('affair'))||r.lastRomanceReviewYear===s.world.currentYear)continue;
  r.lastRomanceReviewYear=s.world.currentYear;
  const other=r.aId===s.playerCharacterId?r.bToA:r.aToB;
  const betrayal=r.sharedMemories.includes('betrayal_unresolved');
  const strained=other.affinity<30&&other.trust<30||betrayal&&other.trust<=15&&other.affinity<65;
  r.strainedYears=strained?Math.min(3,(r.strainedYears??0)+1):0;
  // No roll at all for a healthy relationship, or for a single minor quarrel.
  if(!strained||!((r.mistreatmentCount??0)>=2||betrayal||r.flags.includes('feud')||(r.strainedYears??0)>=2))continue;
  const traits=partner.personalityTraits??[];
  const temperament=(traits.includes('proud') ? 0.1 : 0)+(traits.includes('ambitious')||partner.ambition==='marry_well' ? 0.08 : 0)-(traits.includes('loyal') ? 0.1 : 0)-(traits.includes('patient') ? 0.08 : 0);
  const risk=Math.max(.1,Math.min(.75,.18+Math.max(0,30-other.affinity)/100+Math.max(0,30-other.trust)/130+temperament));
  if(!chance(risk))continue;
  const cause=betrayal?'Trust broken by an exposed affair':(r.mistreatmentCount??0)>=2?'Repeated mistreatment':r.flags.includes('feud')?'An unresolved quarrel':'Sustained loss of affection and trust';
  endPlayerRomance(s,id,'npc',cause);
 }
}
export function affairExposedInCurrentEpisode(r:Relationship):boolean {
 return r.exposedEpisode!==undefined?r.exposedEpisode===(r.romanceEpisode??0):r.romanceEpisode===undefined&&r.sharedMemories.includes('affair_exposed');
}
