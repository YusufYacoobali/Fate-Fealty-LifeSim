/** Retired compatibility API. Current circumstances select standalone events. */
import type {GameEvent,GameState,WorldHistoryEntry} from '@/types/game';
export function callbackSource(_s:GameState,_e:GameEvent):WorldHistoryEntry|undefined{return undefined;}
export function callbackBindings(_s:GameState,_e:GameEvent):Record<string,string>|undefined{return undefined;}
