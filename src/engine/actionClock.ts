import { GameState } from '@/types/game';
import { pushFeed } from './gameState';
import { C } from '@/theme/theme';
import { actionLimitForAccess } from './actionPolicy';

export { ACTIONS_PER_YEAR, PREMIUM_ACTIONS_PER_YEAR, actionLimitForAccess } from './actionPolicy';

export function syncActionLimit(state: GameState): GameState {
  state.actionClock.cap = actionLimitForAccess(state.lifetimeUnlocked);
  state.actionClock.used = Math.min(state.actionClock.used, state.actionClock.cap);
  return state;
}

export interface ActionAvailability {
  available: boolean;
  reason?: string;
}

export function timedActionBlockers(state:GameState):string[]{
 const reasons:string[]=[];
 if(state.dead)reasons.push('Thy life is ended');
 if(state.duel||state.rpg.mission||state.rpg.forge)reasons.push('Finish the current encounter');
 if(state.pendingEvent)reasons.push('Resolve the current event');
 if(state.tags.includes('imprisoned'))reasons.push('Imprisoned');
 if(state.actionClock.used>=state.actionClock.cap)reasons.push('No actions remain this year');
 return reasons;
}
export function timedActionAvailability(state:GameState):ActionAvailability{
 const reason=timedActionBlockers(state)[0];return reason?{available:false,reason}:{available:true};
}

export function spendAction(state: GameState): GameState {
  state.actionClock.used = Math.min(state.actionClock.cap, state.actionClock.used + 1);
  state.actionClock.lifetimeUsed += 1;
  return state;
}

export function resetActionClock(state: GameState): GameState {
  if (state.actionClock.used >= state.actionClock.cap) state.actionClock.fullYears += 1;
  state.actionClock.used = 0;
  return state;
}

export function rejectTimedAction(state: GameState, reason: string): GameState {
  if (!state.dead) pushFeed(state, 'TIME', C.amber, reason, 'plain');
  return state;
}
