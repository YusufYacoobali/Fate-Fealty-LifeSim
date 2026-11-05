import type {GameState} from '@/types/game';
/** One-time recovery of the old paid-but-ungranted patent bug. Never replay rewards. */
export function recoverLegacyBarony(s:GameState):void {
 const p=s.world.characters[s.playerCharacterId];if(!p||p.titleRecoveryVersion===1)return;
 p.titleRecoveryVersion=1;
 const accepted=s.world.history.some(h=>h.eventId==='baron_land_grant'&&h.resolvedChoiceId==='baron_land_grant_choice_1'&&h.participantIds[0]===p.id&&h.year>=s.playerRun.startedYear);
 const lost=s.memories.some(m=>m.tag==='demoted_from_baron')||p.socialStatus?.grants.some(g=>g.startsWith('baron_patent_'));
 if(!accepted||lost||p.rankIdx>=4||!p.socialStatus||!['noble','royal'].includes(p.socialStatus.estate))return;
 if(p.socialStatus.estate!=='royal')p.socialStatus.estate='baronial';
 p.socialStatus.titles=[...new Set([...p.socialStatus.titles,'Baron'])];
 p.socialStatus.grants=[...new Set([...p.socialStatus.grants,'legacy_paid_barony_recovered'])];
 p.rankIdx=Math.max(p.rankIdx,4);s.rankIdx=Math.max(s.rankIdx,4);
}
