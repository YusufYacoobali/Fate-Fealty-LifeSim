import type {GameState} from '@/types/game';
import {namingChildId} from './childNaming';
import {nextLifeEventNotice} from './lifeEventNotices';
export type FamilyOverlay={kind:'notice'|'naming';id:string}|null;
/** Keep an open input/notice stable; priority applies when choosing the next one. */
export function selectFamilyOverlay(s:GameState,current:FamilyOverlay):FamilyOverlay {
 if(current?.kind==='notice'&&s.lifeEvents?.ownerId===s.playerCharacterId&&s.lifeEvents.notices.some(n=>n.id===current.id&&!n.acknowledged))return current;
 const child=namingChildId(s);
 if(current?.kind==='naming'&&current.id===child)return current;
 const notice=nextLifeEventNotice(s);
 return notice?{kind:'notice',id:notice.id}:child?{kind:'naming',id:child}:null;
}
