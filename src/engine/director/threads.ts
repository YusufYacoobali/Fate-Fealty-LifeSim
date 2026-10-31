/** Read-only shape retained to import and archive pre-v9 saves. No thread scheduler remains. */
import type {GameEvent,GameState} from '@/types/game';
export interface Thread { id:string;beatIndex:number;total:number;nextDueYear:number;openedYear:number;bindings?:Record<string,string> }
export const MIN_BEAT_GAP=3,MAX_BEAT_GAP=6,MAX_OPEN_THREADS=3;
export function openThreads(s:GameState):Thread[] {return s.world.threads??[];}
export function noteChainBeatResolved(_s:GameState,_e:GameEvent):void {}
export function nextBeatOf(_t:Thread):GameEvent|null {return null;}
export function dueThreads(_s:GameState):Thread[] {return [];}
export function hastenThreads(_s:GameState):void {}
export function clearThreads(s:GameState):void {s.world.threads=[];}
